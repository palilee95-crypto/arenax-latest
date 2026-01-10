"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@arenax/ui";
import { supabase } from "@arenax/database";
import { useParams } from "next/navigation";

interface Booking {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    court: { name: string };
    profile: { first_name: string; last_name: string; email: string };
}

export default function BookingsPage() {
    const params = useParams();
    const userId = params.userId as string;
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                // 1. Get Venue ID
                const { data: venueData } = await supabase
                    .from('venues')
                    .select('id')
                    .eq('owner_id', userId)
                    .single();

                if (!venueData) return;

                // 2. Get Bookings
                const { data, error } = await supabase
                    .from('bookings')
                    .select(`
                        id,
                        date,
                        start_time,
                        end_time,
                        status,
                        court:courts(name),
                        profile:profiles(first_name, last_name, email)
                    `)
                    .eq('venue_id', venueData.id)
                    .order('date', { ascending: false })
                    .order('start_time', { ascending: true });

                if (error) throw error;

                // Transform data to match interface
                const formattedBookings = data?.map((b: any) => ({
                    id: b.id,
                    date: b.date,
                    start_time: b.start_time,
                    end_time: b.end_time,
                    status: b.status,
                    court: b.court,
                    profile: b.profile || { first_name: 'Unknown', last_name: 'User', email: '-' }
                })) || [];

                setBookings(formattedBookings);

            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [userId]);

    return (
        <div className="bookings-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>Bookings</h1>
                    <p>View and manage all bookings for your venue.</p>
                </div>
                <div className="header-actions">
                    <Button variant="secondary" onClick={() => window.print()}>Export List</Button>
                </div>
            </header>

            <Card className="bookings-card" variant="glass">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                        <p>No bookings found for your venue.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Date & Time</th>
                                    <th>Court</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td>
                                            <div className="customer-cell">
                                                <div className="avatar-mini">
                                                    {booking.profile.first_name.charAt(0)}
                                                </div>
                                                <div className="info">
                                                    <span className="name">{booking.profile.first_name} {booking.profile.last_name}</span>
                                                    <span className="email">{booking.profile.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="time-cell">
                                                <span className="date">{new Date(booking.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                <span className="time">{booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="court-badge">{booking.court?.name}</span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${booking.status}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Button variant="secondary" className="action-btn">Details</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <style jsx>{`
                .bookings-page {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    padding-bottom: 3rem;
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .page-header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .page-header p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }
                .bookings-card {
                    padding: 0;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .table-wrapper {
                    overflow-x: auto;
                }
                .premium-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .premium-table th {
                    text-align: left;
                    padding: 1.25rem 1.5rem;
                    background: rgba(255, 255, 255, 0.02);
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 700;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .premium-table td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                    vertical-align: middle;
                }
                .premium-table tr:hover td {
                    background: rgba(255, 255, 255, 0.01);
                }
                .customer-cell {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .avatar-mini {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    color: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.9rem;
                }
                .customer-cell .info {
                    display: flex;
                    flex-direction: column;
                }
                .customer-cell .name {
                    font-weight: 600;
                    color: #fff;
                }
                .customer-cell .email {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }
                .time-cell {
                    display: flex;
                    flex-direction: column;
                }
                .time-cell .date {
                    font-weight: 600;
                    color: #fff;
                }
                .time-cell .time {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                .court-badge {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .status-pill {
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .status-pill.confirmed {
                    background: rgba(0, 158, 96, 0.1);
                    color: var(--primary);
                    border: 1px solid rgba(0, 158, 96, 0.2);
                }
                .status-pill.pending {
                    background: rgba(245, 158, 11, 0.1);
                    color: #f59e0b;
                    border: 1px solid rgba(245, 158, 11, 0.2);
                }
                .status-pill.cancelled {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                .action-btn {
                    padding: 6px 16px;
                    font-size: 0.8rem;
                }
                .loading-state, .empty-state {
                    padding: 5rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    color: var(--text-muted);
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .empty-icon {
                    color: rgba(255, 255, 255, 0.1);
                }

                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .header-actions {
                        width: 100%;
                    }
                    .header-actions :global(button) {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
