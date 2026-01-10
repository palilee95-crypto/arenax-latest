"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@arenax/ui";
import { supabase } from "@arenax/database";
import { useParams, useRouter } from "next/navigation";

export default function VenuesPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId;
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const { data, error } = await supabase
                    .from('venues')
                    .select('*')
                    .order('name', { ascending: true });

                if (error) throw error;
                setVenues(data || []);
            } catch (error) {
                console.error("Error fetching venues:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, []);

    const filteredVenues = venues.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.state?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="venues-container">
            <header className="page-header">
                <div className="header-content">
                    <h1>Explore Venues</h1>
                    <p>Find the perfect arena for your next match.</p>
                </div>
                <div className="search-bar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="loading-state">
                    <div className="loader"></div>
                    <p>Loading venues...</p>
                </div>
            ) : filteredVenues.length > 0 ? (
                <div className="venues-grid">
                    {filteredVenues.map((venue) => (
                        <Card key={venue.id} variant="glass" className="venue-card">
                            <div className="venue-image">
                                <img
                                    src={venue.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800"}
                                    alt={venue.name}
                                />
                                <div className="venue-overlay">
                                    <span className="venue-badge">ACTIVE</span>
                                </div>
                            </div>
                            <div className="venue-info">
                                <h3 className="venue-name">{venue.name}</h3>
                                <div className="venue-location">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    {venue.district}, {venue.state}
                                </div>
                                <div className="venue-facilities">
                                    {venue.facilities?.slice(0, 3).map((facility: string, idx: number) => (
                                        <span key={idx} className="facility-tag">{facility}</span>
                                    ))}
                                    {venue.facilities?.length > 3 && (
                                        <span className="facility-tag">+{venue.facilities.length - 3} more</span>
                                    )}
                                </div>
                                <div className="venue-actions">
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={() => router.push(`/${userId}/matches/create?venueId=${venue.id}`)}
                                    >
                                        Book Now
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h2>No venues found</h2>
                    <p>Try adjusting your search query or filters.</p>
                    <Button variant="secondary" onClick={() => setSearchQuery("")}>Clear Search</Button>
                </div>
            )}

            <style jsx>{`
                .venues-container {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                    padding-bottom: 4rem;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 2rem;
                }

                .header-content h1 {
                    font-family: var(--font-outfit), sans-serif;
                    font-size: 4rem;
                    font-weight: 900;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.04em;
                    background: linear-gradient(180deg, #ffffff 20%, #888888 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                }

                .header-content p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }

                .search-bar {
                    position: relative;
                    width: 100%;
                    max-width: 400px;
                }

                .search-bar svg {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .search-bar input {
                    width: 100%;
                    padding: 0.8rem 1rem 0.8rem 3rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .search-bar input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--primary);
                    box-shadow: 0 0 15px var(--primary-glow);
                }

                .venues-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .venue-card {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    padding: 0 !important;
                    overflow: hidden;
                    transition: transform 0.3s ease;
                }

                .venue-card:hover {
                    transform: translateY(-8px);
                }

                .venue-image {
                    position: relative;
                    height: 200px;
                    width: 100%;
                }

                .venue-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .venue-overlay {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                }

                .venue-badge {
                    background: var(--primary);
                    color: #000;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    letter-spacing: 0.05em;
                }

                .venue-info {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    flex: 1;
                }

                .venue-name {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #fff;
                    margin: 0;
                }

                .venue-location {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .venue-facilities {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .facility-tag {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .venue-actions {
                    margin-top: auto;
                    padding-top: 1rem;
                }

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 5rem;
                    gap: 1.5rem;
                    color: var(--text-muted);
                }

                .loader {
                    width: 48px;
                    height: 48px;
                    border: 3px solid rgba(0, 255, 157, 0.1);
                    border-radius: 50%;
                    border-top-color: var(--primary);
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .empty-state {
                    text-align: center;
                    padding: 5rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 32px;
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .empty-state h2 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #fff;
                    margin: 0;
                }

                .empty-state p {
                    color: var(--text-muted);
                    margin-bottom: 1rem;
                }

                @media (max-width: 1024px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .search-bar {
                        max-width: 100%;
                    }
                }

                @media (max-width: 768px) {
                    .header-content h1 {
                        font-size: 2.5rem;
                    }
                    .venues-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
