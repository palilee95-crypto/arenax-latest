"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@arenax/ui";
import { supabase } from "@arenax/database";
import { useParams } from "next/navigation";

export default function EarningsPage() {
    const params = useParams();
    const userId = params.userId as string;
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [thisMonthRevenue, setThisMonthRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchEarnings = async () => {
            setLoading(true);
            try {
                // 1. Get Venue ID
                const { data: venueData } = await supabase
                    .from('venues')
                    .select('id')
                    .eq('owner_id', userId)
                    .single();

                if (!venueData) return;

                // 2. Get Confirmed Bookings with Details
                const { data, error } = await supabase
                    .from('bookings')
                    .select(`
                        id,
                        date,
                        start_time,
                        end_time,
                        status,
                        court:courts(name, price_per_hour),
                        user:profiles(first_name, last_name)
                    `)
                    .eq('venue_id', venueData.id)
                    .eq('status', 'confirmed')
                    .order('date', { ascending: false })
                    .order('start_time', { ascending: false });

                if (error) throw error;

                // Calculate Total
                const total = data?.reduce((sum: number, booking: any) => {
                    return sum + (Number(booking.court?.price_per_hour) || 0);
                }, 0) || 0;

                // Calculate This Month
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const thisMonth = data?.filter((booking: any) => {
                    const bookingDate = new Date(booking.date);
                    return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
                }).reduce((sum: number, booking: any) => {
                    return sum + (Number(booking.court?.price_per_hour) || 0);
                }, 0) || 0;

                setTotalRevenue(total);
                setThisMonthRevenue(thisMonth);
                setRecentTransactions(data || []);

            } catch (error) {
                console.error("Error fetching earnings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, [userId]);

    return (
        <div className="earnings-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>Revenue Analytics</h1>
                    <p>Track your venue's financial performance and booking history.</p>
                </div>
                <div className="header-stats">
                    <div className="mini-stat">
                        <span className="label">Total Bookings</span>
                        <span className="value">{recentTransactions.length}</span>
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                <Card className="stat-card main-revenue" variant="glass">
                    <div className="card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <h3>Total Revenue</h3>
                    <div className="stat-value">
                        {loading ? "..." : `RM ${totalRevenue.toFixed(2)}`}
                    </div>
                    <p className="stat-desc">All time earnings from confirmed bookings</p>
                </Card>

                <Card className="stat-card" variant="glass">
                    <div className="card-icon secondary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <h3>This Month</h3>
                    <div className="stat-value">
                        {loading ? "..." : `RM ${thisMonthRevenue.toFixed(2)}`}
                    </div>
                    <p className="stat-desc">Revenue for current month</p>
                </Card>
            </div>

            <Card title="Transaction History" variant="glass" className="history-card">
                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>User</th>
                                <th>Court</th>
                                <th>Time</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((tx, index) => (
                                    <tr key={index}>
                                        <td>{tx.date}</td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="avatar-sm">{tx.user?.first_name?.charAt(0)}</div>
                                                {tx.user?.first_name} {tx.user?.last_name || 'Anonymous'}
                                            </div>
                                        </td>
                                        <td>{tx.court?.name}</td>
                                        <td>{tx.start_time} - {tx.end_time}</td>
                                        <td className="amount-cell">RM {Number(tx.court?.price_per_hour).toFixed(2)}</td>
                                        <td><span className="status-badge success">Paid</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="empty-row">No transactions found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <style jsx>{`
                .earnings-page {
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
                .mini-stat {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .mini-stat .label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .mini-stat .value {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--primary);
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 1.5rem;
                }
                .stat-card {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .card-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 15px;
                    background: rgba(0, 158, 96, 0.1);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }
                .card-icon.secondary {
                    background: rgba(240, 147, 251, 0.1);
                    color: #f093fb;
                }
                .stat-card h3 {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: 600;
                }
                .stat-value {
                    font-size: 3.5rem;
                    font-weight: 900;
                    color: #fff;
                    margin-bottom: 0.75rem;
                    text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
                }
                .stat-desc {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .history-card {
                    margin-top: 1rem;
                }
                .table-container {
                    overflow-x: auto;
                    margin: 0 -1rem;
                    padding: 0 1rem;
                }
                .premium-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 0.5rem;
                    text-align: left;
                }
                .premium-table th {
                    padding: 1rem;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 600;
                }
                .premium-table td {
                    padding: 1.25rem 1rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .premium-table td:first-child {
                    border-left: 1px solid rgba(255, 255, 255, 0.05);
                    border-top-left-radius: 12px;
                    border-bottom-left-radius: 12px;
                }
                .premium-table td:last-child {
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    border-top-right-radius: 12px;
                    border-bottom-right-radius: 12px;
                }
                .user-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    color: #fff;
                }
                .avatar-sm {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    font-weight: 800;
                }
                .amount-cell {
                    font-weight: 700;
                    color: var(--primary);
                }
                .status-badge {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                }
                .status-badge.success {
                    background: rgba(0, 158, 96, 0.1);
                    color: var(--primary);
                }
                .empty-row {
                    text-align: center;
                    padding: 4rem !important;
                    color: var(--text-muted);
                }

                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .header-stats {
                        width: 100%;
                    }
                    .mini-stat {
                        align-items: flex-start;
                    }
                    .stat-value {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
