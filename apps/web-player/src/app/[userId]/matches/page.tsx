"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@arenax/ui";
import { supabase, Match } from "@arenax/database";
import { useRouter, useParams } from "next/navigation";

export default function MyMatchesPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.userId as string;
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"OPEN" | "FRIENDLY">("OPEN");

    useEffect(() => {
        const fetchMyMatches = async () => {
            setLoading(true);
            try {
                console.log("[MyMatches] Fetching for user:", userId);

                // 1. Fetch match_players to get joined match IDs
                const { data: participations, error: partError } = await supabase
                    .from('match_players')
                    .select('match_id')
                    .eq('player_id', userId);

                if (partError) {
                    console.error("[MyMatches] Error fetching participations:", partError);
                    throw partError;
                }

                const joinedMatchIds = (participations || [])
                    .map((p: any) => p.match_id)
                    .filter(id => id && typeof id === 'string');

                console.log("[MyMatches] Joined match IDs:", joinedMatchIds);

                // 2. Fetch matches (created by user OR joined)
                let matchesData: any[] = [];

                if (joinedMatchIds.length > 0) {
                    const { data, error } = await supabase
                        .from('matches')
                        .select('*, venues(name)')
                        .or(`creator_id.eq.${userId},id.in.(${joinedMatchIds.join(',')})`);

                    if (error) throw error;
                    matchesData = data || [];
                } else {
                    const { data, error } = await supabase
                        .from('matches')
                        .select('*, venues(name)')
                        .eq('creator_id', userId);

                    if (error) throw error;
                    matchesData = data || [];
                }

                console.log("[MyMatches] Raw matches fetched:", matchesData.length);

                // Transform to match the Match interface
                const formattedMatches = matchesData.map((m: any) => ({
                    ...m,
                    venue_name: m.venues?.name || "Unknown Venue"
                }));

                // Remove duplicates
                const uniqueMatches = Array.from(new Map(formattedMatches.map((m: any) => [m.id, m])).values());

                setMatches(uniqueMatches as Match[]);
                console.log("[MyMatches] Final matches set:", uniqueMatches.length);

            } catch (error: any) {
                console.error("[MyMatches] Critical error in fetchMyMatches:", error);
            } finally {
                setLoading(false);
                console.log("[MyMatches] Loading finished");
            }
        };

        if (userId) {
            fetchMyMatches();
        }
    }, [userId, supabase]);

    const categorizedMatches = React.useMemo(() => {
        const now = new Date();
        const filteredMatches = matches.filter(match => {
            if (activeTab === "FRIENDLY") {
                return match.match_type === "Friendlies";
            } else {
                return match.match_type !== "Friendlies";
            }
        });

        const ongoing: Match[] = [];
        const upcoming: Match[] = [];
        const completed: Match[] = [];

        filteredMatches.forEach(match => {
            const matchStart = new Date(`${match.date}T${match.start_time}`);
            const matchEnd = new Date(`${match.date}T${match.end_time}`);

            if (match.status === 'completed' || now > matchEnd) {
                completed.push(match);
            } else if (now >= matchStart && now <= matchEnd) {
                ongoing.push(match);
            } else {
                upcoming.push(match);
            }
        });

        const sortByDate = (a: Match, b: Match) => new Date(b.date).getTime() - new Date(a.date).getTime();
        const sortByDateAsc = (a: Match, b: Match) => new Date(a.date).getTime() - new Date(b.date).getTime();

        return {
            ongoing: ongoing.sort(sortByDate),
            upcoming: upcoming.sort(sortByDateAsc),
            completed: completed.sort(sortByDate)
        };
    }, [matches, activeTab]);

    const renderMatchCard = (match: Match) => (
        <Card
            key={match.id}
            className="match-card clickable"
            variant="glass"
            onClick={() => router.push(`/${userId}/matches/${match.id}`)}
        >
            <div className="match-card-header">
                <div className={`sport-tag ${match.sport.toLowerCase()}`}>
                    {match.sport}
                </div>
                <div className="match-status">
                    {match.status}
                </div>
            </div>

            <div className="match-card-body">
                <h3 className="venue-name">{match.venue_name}</h3>
                <div className="match-info">
                    <div className="info-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {new Date(match.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="info-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {match.start_time} - {match.end_time}
                    </div>
                </div>

                <div className="player-count">
                    <div className="count-bar">
                        <div
                            className="count-progress"
                            style={{ width: `${(match.current_players / match.max_players) * 100}%` }}
                        ></div>
                    </div>
                    <div className="count-text">
                        {match.current_players} / {match.max_players} Players Joined
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="matches-container">
            <header className="page-header">
                <div className="header-content">
                    <h1>My Matches</h1>
                    <p>View and manage your upcoming and past matches.</p>
                </div>
                <div className="header-actions">
                    <Button variant="primary" onClick={() => router.push(`/${userId}/matches/create`)}>Create Match</Button>
                    <Button variant="secondary" onClick={() => router.push(`/${userId}/find-match`)}>Find Match</Button>
                </div>
            </header>

            <div className="match-type-tabs">
                <button
                    className={`tab-btn ${activeTab === "OPEN" ? "active" : ""}`}
                    onClick={() => setActiveTab("OPEN")}
                >
                    OPEN MATCH
                </button>
                <button
                    className={`tab-btn ${activeTab === "FRIENDLY" ? "active" : ""}`}
                    onClick={() => setActiveTab("FRIENDLY")}
                >
                    FRIENDLY MATCH
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Loading matches...</div>
            ) : (
                <div className="sections-container">
                    {/* Create Match Quick Action */}
                    {matches.length === 0 && (
                        <Card variant="glass" className="create-match-card">
                            <div className="create-content">
                                <h2>Ready to play?</h2>
                                <p>Create your first match and invite your friends!</p>
                                <Button variant="primary" onClick={() => router.push(`/${userId}/matches/create`)}>
                                    Create Match Now
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Ongoing Matches */}
                    {categorizedMatches.ongoing.length > 0 && (
                        <section className="match-section">
                            <div className="section-header">
                                <span className="live-dot"></span>
                                <h2>Ongoing Matches</h2>
                            </div>
                            <div className="matches-grid">
                                {categorizedMatches.ongoing.map(renderMatchCard)}
                            </div>
                        </section>
                    )}

                    {/* Upcoming Matches */}
                    <section className="match-section">
                        <div className="section-header">
                            <h2>Upcoming Matches</h2>
                        </div>
                        {categorizedMatches.upcoming.length > 0 ? (
                            <div className="matches-grid">
                                {categorizedMatches.upcoming.map(renderMatchCard)}
                            </div>
                        ) : (
                            <div className="empty-section">
                                <p>No upcoming matches scheduled.</p>
                                <Button variant="secondary" onClick={() => router.push(`/${userId}/find-match`)}>Find a Match</Button>
                            </div>
                        )}
                    </section>

                    {/* Completed Matches */}
                    {categorizedMatches.completed.length > 0 && (
                        <section className="match-section">
                            <div className="section-header">
                                <h2>Match History</h2>
                            </div>
                            <div className="matches-grid">
                                {categorizedMatches.completed.map(renderMatchCard)}
                            </div>
                        </section>
                    )}
                </div>
            )}

            <style jsx>{`
                .matches-container {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-lg);
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .page-header h1 {
                    font-family: var(--font-outfit), sans-serif;
                    font-size: 3.5rem;
                    font-weight: 900;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.04em;
                    background: linear-gradient(180deg, #ffffff 20%, #888888 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                }
                .page-header p {
                    color: var(--text-muted);
                }
                .header-actions {
                    display: flex;
                    gap: 1rem;
                }
                .match-type-tabs {
                    display: flex;
                    gap: 2.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                }
                .tab-btn {
                    background: none;
                    border: none;
                    color: #666;
                    font-size: 1.1rem;
                    font-weight: 800;
                    padding: 0.5rem 0;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    letter-spacing: 0.02em;
                }
                .tab-btn:hover {
                    color: #999;
                }
                .tab-btn.active {
                    color: #00ff9d;
                }
                .tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -0.5rem;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: #00ff9d;
                    border-radius: 2px;
                    box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
                }
                .sections-container {
                    display: flex;
                    flex-direction: column;
                    gap: 3rem;
                }
                .match-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .section-header h2 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin: 0;
                    color: rgba(255, 255, 255, 0.9);
                }
                .live-dot {
                    width: 10px;
                    height: 10px;
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
                .create-match-card {
                    padding: 3rem;
                    text-align: center;
                    background: linear-gradient(145deg, rgba(0, 158, 96, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
                    border: 1px dashed rgba(0, 158, 96, 0.3);
                }
                .create-content h2 {
                    font-size: 2rem;
                    font-weight: 900;
                    margin-bottom: 0.5rem;
                }
                .create-content p {
                    color: var(--text-muted);
                    margin-bottom: 2rem;
                }
                .empty-section {
                    padding: 3rem;
                    text-align: center;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .empty-section p {
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                }
                .matches-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--space-md);
                }
                .match-card {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .match-card.clickable {
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .match-card.clickable:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }
                .match-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .sport-tag {
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .sport-tag.futsal { background: rgba(0, 158, 96, 0.1); color: var(--primary); }
                .sport-tag.football { background: rgba(0, 112, 66, 0.1); color: var(--secondary); }
                
                .match-status {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    text-transform: capitalize;
                }
                .venue-name {
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                    color: #fff;
                }
                .match-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .player-count {
                    margin-top: auto;
                }
                .count-bar {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }
                .count-progress {
                    height: 100%;
                    background: linear-gradient(to right, var(--primary), var(--secondary));
                    border-radius: 3px;
                }
                .count-text {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    text-align: right;
                }

                @media (max-width: 768px) {
                    .matches-container {
                        padding: 1rem 0.5rem;
                        gap: 1.5rem;
                    }
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .page-header h1 {
                        font-size: 2.2rem;
                    }
                    .header-actions {
                        width: 100%;
                        flex-direction: column;
                    }
                    .header-actions :global(button) {
                        width: 100%;
                    }
                    .matches-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    .create-match-card {
                        padding: 2rem 1rem;
                    }
                }
            `}</style>
        </div>
    );
}
