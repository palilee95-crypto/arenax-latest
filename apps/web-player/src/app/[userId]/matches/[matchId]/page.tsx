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
        name: string;
        address: string;
        latitude?: number;
        longitude?: number;
    };
    sport: string;
    status: string;
    price_per_player: number;
}

interface Player {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    position: string;
    skill_level: string;
    checked_in_at?: string | null;
}

export default function MatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;
    const matchId = params.matchId as string;

    const [match, setMatch] = useState<MatchDetails | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
    const [matchStatus, setMatchStatus] = useState<'upcoming' | 'ongoing' | 'finished'>('upcoming');
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [canCheckIn, setCanCheckIn] = useState(false);
    const [distance, setDistance] = useState<number | null>(null);

    useEffect(() => {
        const fetchMatchDetails = async () => {
            try {
                // Fetch match details
                const { data: matchData, error: matchError } = await supabase
                    .from('matches')
                    .select('*, venues(name, address, latitude, longitude)')
                    .eq('id', matchId)
                    .single();

                if (matchError) throw matchError;

                setMatch({
                    ...matchData,
                    venue: matchData.venues
                });

                // Fetch players and their check-in status
                const { data: playersData, error: playersError } = await supabase
                    .from('match_players')
                    .select('player_id, checked_in_at, profiles(id, first_name, last_name, avatar_url, position, skill_level)')
                    .eq('match_id', matchId);

                if (playersError) throw playersError;

                const playersList = playersData.map((p: any) => ({
                    ...p.profiles,
                    checked_in_at: p.checked_in_at
                }));
                setPlayers(playersList);

                // Check if player is already checked in
                const { data: checkInData, error: checkInError } = await supabase
                    .from('match_players')
                    .select('checked_in_at')
                    .eq('match_id', matchId)
                    .eq('player_id', userId)
                    .single();

                if (checkInData?.checked_in_at) {
                    setIsCheckedIn(true);
                    // If match is ongoing or upcoming (within check-in window), redirect to ongoing
                    router.push(`/${userId}/matches/${matchId}/ongoing`);
                }

            } catch (error) {
                console.error("Error fetching match details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatchDetails();
    }, [matchId]);

    useEffect(() => {
        if (!match) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const matchDate = new Date(`${match.date}T${match.start_time}`);
            const diff = matchDate.getTime() - now.getTime();

            if (diff <= 0) {
                // Check if match is finished (assuming 1 hour duration for simplicity or use end_time)
                const matchEndTime = new Date(`${match.date}T${match.end_time}`);
                if (now > matchEndTime) {
                    setMatchStatus('finished');
                } else {
                    setMatchStatus('ongoing');
                }
                setTimeLeft(null);
                return;
            }

            const hours = Math.floor((diff / (1000 * 60 * 60)));
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft({ hours, minutes, seconds });
            setMatchStatus('upcoming');
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [match]);

    // Haversine formula to calculate distance in meters
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    useEffect(() => {
        if (!match || isCheckedIn) return;

        const checkProximity = () => {
            if (!navigator.geolocation) {
                console.log("Geolocation not supported");
                return;
            }
            if (!match.venue.latitude || !match.venue.longitude) {
                console.log("Venue missing GPS coordinates");
                return;
            }

            navigator.geolocation.getCurrentPosition((position) => {
                const dist = calculateDistance(
                    position.coords.latitude,
                    position.coords.longitude,
                    match.venue.latitude!,
                    match.venue.longitude!
                );
                console.log("Current distance to venue:", dist, "meters");
                setDistance(dist);

                // Check if within 15 minutes of start time
                const now = new Date();
                const matchTime = new Date(`${match.date}T${match.start_time}`);
                const diffMinutes = (matchTime.getTime() - now.getTime()) / (1000 * 60);

                console.log("Time difference (minutes):", diffMinutes);

                if (dist <= 200 && diffMinutes <= 15 && diffMinutes >= -60) {
                    console.log("Check-in criteria met!");
                    setCanCheckIn(true);
                    // Auto check-in if very close (e.g. 100m)
                    if (dist <= 100 && !isCheckedIn && !checkingIn) {
                        console.log("Triggering auto check-in...");
                        handleCheckIn();
                    }
                } else {
                    setCanCheckIn(false);
                }
            }, (err) => {
                console.error("Geolocation error in proximity check:", err);
            });
        };

        checkProximity();
        const interval = setInterval(checkProximity, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [match, isCheckedIn]);

    const handleCheckIn = async () => {
        if (!canCheckIn || checkingIn) return;

        setCheckingIn(true);
        try {
            if (!navigator.geolocation) {
                throw new Error("Geolocation is not supported by your browser.");
            }

            // Get current position with a timeout
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            console.log("Position acquired:", position.coords.latitude, position.coords.longitude);

            const { data, error, count } = await supabase
                .from('match_players')
                .update({
                    checked_in_at: new Date().toISOString(),
                    check_in_latitude: position.coords.latitude,
                    check_in_longitude: position.coords.longitude
                })
                .eq('match_id', matchId)
                .eq('player_id', userId)
                .select();

            if (error) throw error;

            // If no rows were updated, it means the player isn't in the match_players table
            if (!data || data.length === 0) {
                throw new Error("You are not registered for this match.");
            }

            setIsCheckedIn(true);
            alert("Check-in successful! Have a great match.");
            router.push(`/${userId}/matches/${matchId}/ongoing`);
        } catch (error: any) {
            console.error("Check-in error:", error);
            let msg = error.message;
            if (error.code === 1) msg = "Location permission denied. Please enable location to check in.";
            if (error.code === 3) msg = "Location request timed out. Please try again.";
            alert("Check-in failed: " + msg);
        } finally {
            setCheckingIn(false);
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
    };

    if (loading) return <div className="loading">Loading match details...</div>;
    if (!match) return <div className="error">Match not found</div>;

    return (
        <div className="match-details-page">
            <header className="page-header">
                <Button variant="secondary" onClick={() => router.back()} className="back-btn">
                    ← Back
                </Button>
                <h1>Match Details</h1>
            </header>

            <div className="content-grid">
                {/* Left Column: Match Info & Timer */}
                <div className="main-info">
                    <Card variant="glass" className="timer-card">
                        <div className="status-badge">
                            {matchStatus === 'upcoming' ? 'UPCOMING MATCH' :
                                matchStatus === 'ongoing' ? 'MATCH IN PROGRESS' : 'MATCH FINISHED'}
                        </div>

                        {matchStatus === 'upcoming' && timeLeft && (
                            <div className="countdown">
                                <div className="time-unit">
                                    <span className="value">{String(timeLeft.hours).padStart(2, '0')}</span>
                                    <span className="label">HOURS</span>
                                </div>
                                <div className="separator">:</div>
                                <div className="time-unit">
                                    <span className="value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                    <span className="label">MINS</span>
                                </div>
                                <div className="separator">:</div>
                                <div className="time-unit">
                                    <span className="value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                    <span className="label">SECS</span>
                                </div>
                            </div>
                        )}

                        <div className="check-in-info">
                            <div className="icon">⚠️</div>
                            <p>
                                Please check in at <strong>{match.venue.name}</strong> 15 minutes before kick-off.
                                Late arrival will affect your <strong>Reliability Rating</strong>.
                            </p>
                        </div>

                        <div className="check-in-actions">
                            {isCheckedIn ? (
                                <div className="checked-in-status">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    CHECKED IN
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    className={`check-in-btn ${canCheckIn ? 'active' : 'disabled'}`}
                                    disabled={!canCheckIn || checkingIn}
                                    onClick={handleCheckIn}
                                >
                                    {checkingIn ? "Checking in..." : "Check In Now"}
                                </Button>
                            )}
                            {!isCheckedIn && distance !== null && distance > 100 && (
                                <span className="distance-hint">You are {Math.round(distance)}m away from venue</span>
                            )}
                            {!isCheckedIn && canCheckIn && (
                                <span className="arrival-hint">You have arrived! Click to check in.</span>
                            )}
                        </div>
                    </Card>

                    <Card variant="glass" className="details-card">
                        <h2>Match Information</h2>
                        <div className="info-row">
                            <div className="label">VENUE</div>
                            <div className="value">{match.venue.name}</div>
                        </div>
                        <div className="info-row">
                            <div className="label">ADDRESS</div>
                            <div className="value">{match.venue.address}</div>
                        </div>
                        <div className="info-row">
                            <div className="label">DATE</div>
                            <div className="value">{new Date(match.date).toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                        <div className="info-row">
                            <div className="label">TIME</div>
                            <div className="value">{match.start_time} - {match.end_time}</div>
                        </div>
                        <div className="info-row">
                            <div className="label">SPORT</div>
                            <div className="value">{match.sport}</div>
                        </div>
                        <div className="info-row">
                            <div className="label">PRICE</div>
                            <div className="value highlight">RM {match.price_per_player.toFixed(2)} / player</div>
                        </div>
                    </Card>

                    {/* Test Controls */}
                    <div className="test-controls">
                        <p>DEV TEST CONTROLS</p>
                        <div className="test-btns">
                            <Button variant="secondary" onClick={() => simulateTime(20)}>
                                Test: 20m Before
                            </Button>
                            <Button variant="secondary" onClick={() => simulateTime(-10)}>
                                Test: Ongoing
                            </Button>
                            <Button variant="secondary" onClick={() => {
                                setIsCheckedIn(true);
                                router.push(`/${userId}/matches/${matchId}/ongoing`);
                            }}>
                                Test: Mock Check-in
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Players & Rating */}
                <div className="players-section">
                    <Card variant="glass" className="players-card">
                        <div className="card-header">
                            <h2>Lineup</h2>
                            <span className="count">{players.length} Players</span>
                        </div>

                        <div className="players-list custom-scrollbar">
                            {players.map(player => (
                                <div key={player.id} className="player-item">
                                    <div className="player-avatar">
                                        <img src={player.avatar_url || `https://ui-avatars.com/api/?name=${player.first_name}+${player.last_name}`} alt={player.first_name} />
                                    </div>
                                    <div className="player-info">
                                        <h3>{player.first_name} {player.last_name}</h3>
                                        <div className="badges">
                                            <span className="badge position">{player.position}</span>
                                            <span className="badge skill">{player.skill_level}</span>
                                            {player.checked_in_at && (
                                                <span className="badge checked-in-badge">Already Checked In</span>
                                            )}
                                        </div>
                                    </div>
                                    {matchStatus === 'finished' && player.id !== userId && (
                                        <Button variant="secondary" className="rate-btn">Rate</Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <style jsx>{`
                .match-details-page {
                    padding: 2rem;
                    max-width: 1200px;
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
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 2rem;
                }

                @media (max-width: 900px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .timer-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 3rem 2rem;
                    margin-bottom: 2rem;
                    background: linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.2) 100%);
                }

                .status-badge {
                    background: rgba(0, 158, 96, 0.1);
                    color: var(--primary);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 0.8rem;
                    letter-spacing: 0.1em;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(0, 158, 96, 0.2);
                }

                .countdown {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 3rem;
                }

                .time-unit {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .time-unit .value {
                    font-size: 4rem;
                    font-weight: 900;
                    line-height: 1;
                    font-family: var(--font-outfit), sans-serif;
                    background: linear-gradient(180deg, #fff 0%, #ccc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .time-unit .label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    font-weight: 700;
                    margin-top: 0.5rem;
                    letter-spacing: 0.1em;
                }

                .separator {
                    font-size: 3rem;
                    font-weight: 300;
                    color: rgba(255, 255, 255, 0.2);
                    margin-top: -1.5rem;
                }

                .check-in-info {
                    background: rgba(255, 200, 0, 0.1);
                    border: 1px solid rgba(255, 200, 0, 0.2);
                    padding: 1rem;
                    border-radius: 12px;
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                    text-align: left;
                }

                .check-in-info .icon {
                    font-size: 1.2rem;
                }

                .check-in-info p {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.5;
                    margin: 0;
                }
                
                .check-in-actions {
                    margin-top: 2rem;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .check-in-btn {
                    width: 100%;
                    max-width: 300px;
                    height: 54px;
                    font-size: 1.1rem !important;
                    font-weight: 800 !important;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    border-radius: 14px !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                .check-in-btn.active {
                    background: var(--primary) !important;
                    color: #000 !important;
                    box-shadow: 0 0 30px rgba(0, 158, 96, 0.4);
                }

                .check-in-btn.disabled {
                    background: rgba(255, 255, 255, 0.05) !important;
                    color: rgba(255, 255, 255, 0.2) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    cursor: not-allowed;
                }

                .checked-in-status {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--primary);
                    font-weight: 900;
                    font-size: 1.2rem;
                    letter-spacing: 0.1em;
                    background: rgba(0, 158, 96, 0.1);
                    padding: 1rem 2rem;
                    border-radius: 14px;
                    border: 1px solid rgba(0, 158, 96, 0.3);
                }

                .distance-hint {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                .arrival-hint {
                    font-size: 0.9rem;
                    color: var(--primary);
                    font-weight: 700;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }

                .details-card {
                    padding: 2rem;
                }

                .details-card h2 {
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    color: #fff;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 1rem 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .info-row:last-child {
                    border-bottom: none;
                }

                .info-row .label {
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }

                .info-row .value {
                    font-weight: 600;
                    text-align: right;
                }

                .info-row .value.highlight {
                    color: var(--primary);
                }

                .players-card {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .players-card .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .players-card h2 {
                    font-size: 1.2rem;
                    margin: 0;
                }

                .players-card .count {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.2rem 0.6rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .players-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    overflow-y: auto;
                    max-height: 600px;
                    padding-right: 0.5rem;
                }

                .player-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    transition: all 0.2s ease;
                }

                .player-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .player-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }

                .player-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .player-info {
                    flex: 1;
                }

                .player-info h3 {
                    font-size: 0.95rem;
                    margin: 0 0 0.25rem 0;
                    font-weight: 600;
                }

                .badges {
                    display: flex;
                    gap: 0.5rem;
                }

                .badge {
                    font-size: 0.65rem;
                    padding: 0.1rem 0.4rem;
                    border-radius: 4px;
                    text-transform: uppercase;
                    font-weight: 700;
                }

                .badge.position {
                    background: rgba(0, 158, 96, 0.1);
                    color: var(--primary);
                }

                .badge.skill {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-muted);
                }

                .badge.checked-in-badge {
                    background: rgba(0, 158, 96, 0.15);
                    color: var(--primary);
                    border: 1px solid rgba(0, 158, 96, 0.3);
                }

                .loading, .error {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 50vh;
                    color: var(--text-muted);
                }

                .test-controls {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    text-align: center;
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
                    .match-details-page {
                        padding: 1rem 0.5rem;
                    }
                    .page-header {
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                    }
                    .page-header h1 {
                        font-size: 1.8rem;
                    }
                    .back-btn {
                        padding: 0.5rem 0.75rem !important;
                        font-size: 0.8rem !important;
                    }
                    .timer-card {
                        padding: 2rem 1rem;
                    }
                    .time-unit .value {
                        font-size: 2.5rem;
                    }
                    .countdown {
                        gap: 0.5rem;
                        margin-bottom: 2rem;
                    }
                    .check-in-info {
                        padding: 0.75rem;
                        gap: 0.75rem;
                    }
                    .check-in-info p {
                        font-size: 0.8rem;
                    }
                    .details-card {
                        padding: 1.5rem;
                    }
                    .info-row {
                        padding: 0.75rem 0;
                    }
                    .info-row .label {
                        font-size: 0.7rem;
                    }
                    .info-row .value {
                        font-size: 0.85rem;
                    }
                }
            `}</style>
        </div>
    );
}
