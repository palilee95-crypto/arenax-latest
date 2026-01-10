"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@arenax/database";
import { Card, Button } from "@arenax/ui";

interface MatchDetails {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    venue: {
        id: string;
        name: string;
        address: string;
    };
    sport: string;
    status: string;
}

interface Player {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    checked_in_at: string | null;
}

export default function OngoingGamePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;
    const matchId = params.matchId as string;

    const [match, setMatch] = useState<MatchDetails | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
    const [isMatchFinished, setIsMatchFinished] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratings, setRatings] = useState({ venue: 0, team: 0, system: 0 });
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch match details
                const { data: matchData, error: matchError } = await supabase
                    .from('matches')
                    .select('*, venues(id, name, address)')
                    .eq('id', matchId)
                    .single();

                if (matchError) throw matchError;
                setMatch({ ...matchData, venue: matchData.venues });

                // Fetch players and check-in status
                const { data: playersData, error: playersError } = await supabase
                    .from('match_players')
                    .select('player_id, checked_in_at, profiles(id, first_name, last_name, avatar_url)')
                    .eq('match_id', matchId);

                if (playersError) throw playersError;
                setPlayers(playersData.map((p: any) => ({
                    ...p.profiles,
                    checked_in_at: p.checked_in_at
                })));

            } catch (error) {
                console.error("Error fetching ongoing match data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, [matchId]);

    useEffect(() => {
        if (!match) return;

        const updateTimer = () => {
            const now = new Date();
            const startTime = new Date(`${match.date}T${match.start_time}`);
            const endTime = new Date(`${match.date}T${match.end_time}`);

            if (now < startTime) {
                setElapsedTime("00:00:00");
                return;
            }

            if (now >= endTime) {
                setIsMatchFinished(true);
                const diff = endTime.getTime() - startTime.getTime();
                setElapsedTime(formatDiff(diff));
                return;
            }

            const diff = now.getTime() - startTime.getTime();
            setElapsedTime(formatDiff(diff));
        };

        const formatDiff = (diff: number) => {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [match]);

    const handleRatingSubmit = async () => {
        if (ratings.venue === 0 || ratings.team === 0 || ratings.system === 0) {
            alert("Please provide all ratings");
            return;
        }

        setSubmittingRating(true);
        try {
            const { error } = await supabase
                .from('match_ratings')
                .insert({
                    match_id: matchId,
                    user_id: userId,
                    venue_rating: ratings.venue,
                    team_rating: ratings.team,
                    system_rating: ratings.system
                });

            if (error) throw error;
            alert("Thank you for your feedback!");
            router.push(`/${userId}/matches`);
        } catch (error: any) {
            console.error("Error submitting rating:", error);
            alert("Failed to submit rating: " + error.message);
        } finally {
            setSubmittingRating(false);
        }
    };

    const simulateTime = (minutesFromNow: number, durationMinutes: number = 60) => {
        if (!match) return;
        const now = new Date();
        const startTime = new Date(now.getTime() + minutesFromNow * 60000);
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        setMatch({
            ...match,
            date: startTime.toISOString().split('T')[0],
            start_time: startTime.toTimeString().split(' ')[0],
            end_time: endTime.toTimeString().split(' ')[0]
        });
        setIsMatchFinished(false);
        setShowRatingModal(false);
    };

    if (loading) return <div className="loading">Loading ongoing match...</div>;
    if (!match) return <div className="error">Match not found</div>;

    const checkedInCount = players.filter(p => p.checked_in_at).length;
    const progress = (checkedInCount / players.length) * 100;

    return (
        <div className="ongoing-game-page">
            <header className="page-header">
                <Button variant="secondary" onClick={() => router.push(`/${userId}/matches`)} className="back-btn">
                    ← Back
                </Button>
                <h1>Ongoing Match</h1>
            </header>

            <div className="main-content">
                <Card variant="glass" className="live-card">
                    <div className="live-indicator">
                        <span className="dot"></span>
                        LIVE
                    </div>

                    <div className="timer-display">
                        <span className="time">{elapsedTime}</span>
                        <span className="label">ELAPSED TIME</span>
                    </div>

                    <div className="match-info-bar">
                        <div className="info-item">
                            <span className="label">VENUE</span>
                            <span className="value">{match.venue.name}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">SPORT</span>
                            <span className="value">{match.sport}</span>
                        </div>
                    </div>

                    <div className="checkin-bar-container">
                        <div className="bar-header">
                            <span>Check-in Status</span>
                            <span>{checkedInCount} / {players.length} Players</span>
                        </div>
                        <div className="progress-bar">
                            <div className="fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    {isMatchFinished && !showRatingModal && (
                        <Button
                            variant="primary"
                            className="finish-btn"
                            onClick={() => setShowRatingModal(true)}
                        >
                            FINISH & RATE MATCH
                        </Button>
                    )}

                    {/* Test Controls */}
                    <div className="test-controls">
                        <p>DEV TEST CONTROLS</p>
                        <div className="test-btns">
                            <Button variant="secondary" onClick={() => simulateTime(-10)}>
                                Test: Match Ongoing
                            </Button>
                            <Button variant="secondary" onClick={() => {
                                setIsMatchFinished(true);
                                setShowRatingModal(true);
                            }}>
                                Test: End Match
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="players-grid">
                    <h2>Players on Court</h2>
                    <div className="players-list">
                        {players.map(player => (
                            <div key={player.id} className={`player-card ${player.checked_in_at ? 'checked-in' : ''}`}>
                                <div className="avatar">
                                    <img src={player.avatar_url || `https://ui-avatars.com/api/?name=${player.first_name}+${player.last_name}`} alt={player.first_name} />
                                    {player.checked_in_at && <div className="check-icon">✓</div>}
                                </div>
                                <div className="info">
                                    <h3>{player.first_name} {player.last_name}</h3>
                                    <span className="status">{player.checked_in_at ? 'ON COURT' : 'PENDING'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showRatingModal && (
                <div className="modal-overlay">
                    <Card variant="glass" className="rating-modal">
                        <h2>Rate Your Experience</h2>
                        <p>How was your match at {match.venue.name}?</p>

                        <div className="rating-sections">
                            <div className="rating-group">
                                <label>Venue Quality</label>
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            className={ratings.venue >= star ? 'active' : ''}
                                            onClick={() => setRatings(prev => ({ ...prev, venue: star }))}
                                        >★</button>
                                    ))}
                                </div>
                            </div>

                            <div className="rating-group">
                                <label>Team/Players Behavior</label>
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            className={ratings.team >= star ? 'active' : ''}
                                            onClick={() => setRatings(prev => ({ ...prev, team: star }))}
                                        >★</button>
                                    ))}
                                </div>
                            </div>

                            <div className="rating-group">
                                <label>System Smoothness</label>
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            className={ratings.system >= star ? 'active' : ''}
                                            onClick={() => setRatings(prev => ({ ...prev, system: star }))}
                                        >★</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <Button variant="secondary" onClick={() => setShowRatingModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleRatingSubmit} disabled={submittingRating}>
                                {submittingRating ? "Submitting..." : "Submit Feedback"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            <style jsx>{`
                .ongoing-game-page {
                    padding: 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                    min-height: 100vh;
                }

                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .page-header h1 {
                    font-family: var(--font-outfit), sans-serif;
                    font-size: 2.5rem;
                    font-weight: 900;
                    margin: 0;
                    background: linear-gradient(180deg, #ffffff 20%, #888888 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .live-card {
                    padding: 3rem;
                    text-align: center;
                    background: linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%);
                    margin-bottom: 3rem;
                    position: relative;
                    overflow: hidden;
                }

                .live-indicator {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #ff4b4b;
                    font-weight: 900;
                    font-size: 0.8rem;
                    letter-spacing: 0.1em;
                }

                .live-indicator .dot {
                    width: 8px;
                    height: 8px;
                    background: #ff4b4b;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #ff4b4b;
                    animation: blink 1s infinite;
                }

                @keyframes blink {
                    0% { opacity: 1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 1; }
                }

                .timer-display {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }

                .timer-display .time {
                    font-size: 6rem;
                    font-weight: 900;
                    font-family: var(--font-outfit), sans-serif;
                    background: linear-gradient(180deg, #fff 0%, #aaa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    line-height: 1;
                }

                .timer-display .label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 700;
                    letter-spacing: 0.2em;
                    margin-top: 1rem;
                }

                .match-info-bar {
                    display: flex;
                    justify-content: center;
                    gap: 4rem;
                    margin-bottom: 2.5rem;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 20px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .info-item .label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    font-weight: 700;
                }

                .info-item .value {
                    font-weight: 800;
                    font-size: 1.1rem;
                }

                .checkin-bar-container {
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .bar-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-bottom: 0.75rem;
                    color: var(--text-muted);
                }

                .progress-bar {
                    height: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .progress-bar .fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary) 0%, #00ff9d 100%);
                    box-shadow: 0 0 15px var(--primary-glow);
                    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .finish-btn {
                    margin-top: 2.5rem;
                    height: 54px;
                    padding: 0 3rem !important;
                    font-size: 1.1rem !important;
                    font-weight: 900 !important;
                    border-radius: 14px !important;
                }

                .players-grid h2 {
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                    font-weight: 800;
                }

                .players-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 1rem;
                }

                .player-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s ease;
                }

                .player-card.checked-in {
                    background: rgba(0, 158, 96, 0.05);
                    border-color: rgba(0, 158, 96, 0.2);
                }

                .avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    position: relative;
                }

                .avatar img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }

                .check-icon {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    background: var(--primary);
                    color: #000;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 900;
                    border: 2px solid #000;
                }

                .info h3 {
                    font-size: 0.95rem;
                    margin: 0;
                    font-weight: 700;
                }

                .status {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--text-muted);
                    letter-spacing: 0.05em;
                }

                .checked-in .status {
                    color: var(--primary);
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 2rem;
                }

                .rating-modal {
                    width: 100%;
                    max-width: 500px;
                    padding: 2.5rem;
                    text-align: center;
                }

                .rating-modal h2 {
                    font-size: 1.8rem;
                    font-weight: 900;
                    margin-bottom: 0.5rem;
                }

                .rating-modal p {
                    color: var(--text-muted);
                    margin-bottom: 2.5rem;
                }

                .rating-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    margin-bottom: 3rem;
                }

                .rating-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .rating-group label {
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .stars {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .stars button {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    color: rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .stars button:hover, .stars button.active {
                    color: var(--primary);
                    transform: scale(1.2);
                    text-shadow: 0 0 15px var(--primary-glow);
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                }

                .modal-actions :global(button) {
                    flex: 1;
                }

                .test-controls {
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px dashed rgba(255, 255, 255, 0.1);
                }

                .test-controls p {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--text-muted);
                    margin-bottom: 1rem;
                    letter-spacing: 0.1em;
                }

                .test-btns {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }

                @media (max-width: 768px) {
                    .ongoing-game-page {
                        padding: 1rem;
                    }
                    .timer-display .time {
                        font-size: 4rem;
                    }
                    .match-info-bar {
                        flex-direction: column;
                        gap: 1.5rem;
                        align-items: center;
                    }
                    .live-card {
                        padding: 2rem 1rem;
                    }
                }
            `}</style>
        </div>
    );
}
