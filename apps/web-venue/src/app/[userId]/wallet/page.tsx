"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@arenax/ui";
import { supabase } from "@arenax/database";
import { useParams } from "next/navigation";

export default function WalletPage() {
    const params = useParams();
    const userId = params.userId as string;
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchWalletData = async () => {
            setLoading(true);
            try {
                // 1. Get Venue ID
                const { data: venueData } = await supabase
                    .from('venues')
                    .select('id')
                    .eq('owner_id', userId)
                    .single();

                if (!venueData) return;

                // 2. Get Confirmed Bookings for Earnings
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select(`
                        id,
                        date,
                        start_time,
                        court:courts(name, price_per_hour)
                    `)
                    .eq('venue_id', venueData.id)
                    .eq('status', 'confirmed')
                    .order('date', { ascending: false });

                if (bookingsError) throw bookingsError;

                // Calculate Balance
                const totalBalance = bookingsData?.reduce((sum: number, b: any) => {
                    return sum + (Number(b.court?.price_per_hour) || 0);
                }, 0) || 0;

                setBalance(totalBalance);
                setTransactions(bookingsData || []);

            } catch (error) {
                console.error("Error fetching wallet data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, [userId]);

    return (
        <div className="wallet-page">
            <header className="page-header">
                <h1>My Wallet</h1>
                <p>Manage your earnings and payouts</p>
            </header>

            <div className="wallet-grid">
                <Card variant="glass" className="balance-card">
                    <div className="balance-content">
                        <div className="balance-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                        </div>
                        <span className="label">Available Balance</span>
                        <div className="amount">
                            {loading ? "..." : `RM ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </div>
                        <div className="actions">
                            <Button variant="primary" className="withdraw-btn">Withdraw Funds</Button>
                        </div>
                    </div>
                </Card>

                <Card variant="glass" className="history-card">
                    <div className="card-header">
                        <h3>Recent Transactions</h3>
                        <Button variant="secondary" className="view-all-btn">View All</Button>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading transactions...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="empty-state">
                            <p>No transactions found.</p>
                        </div>
                    ) : (
                        <div className="transactions-list">
                            {transactions.map((tx, index) => (
                                <div className="transaction-item" key={index}>
                                    <div className="transaction-icon received">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                                    </div>
                                    <div className="transaction-details">
                                        <span className="title">Booking Payment - {tx.court?.name}</span>
                                        <span className="date">{new Date(tx.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <span className="transaction-amount positive">
                                        + RM {Number(tx.court?.price_per_hour).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <style jsx>{`
                .wallet-page {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    padding-bottom: 3rem;
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
                .wallet-grid {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    gap: 2rem;
                    align-items: start;
                }
                .balance-card {
                    padding: 3rem 2rem;
                    text-align: center;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
                }
                .balance-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }
                .balance-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    background: rgba(0, 158, 96, 0.1);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                }
                .balance-content .label {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .balance-content .amount {
                    font-size: 3rem;
                    font-weight: 900;
                    color: #fff;
                    margin-bottom: 1.5rem;
                    text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
                }
                .withdraw-btn {
                    width: 100%;
                    padding: 1rem 2rem;
                    font-weight: 700;
                }
                .history-card {
                    padding: 2rem;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .card-header h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #fff;
                }
                .view-all-btn {
                    padding: 6px 16px;
                    font-size: 0.8rem;
                }
                .transactions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .transaction-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s ease;
                }
                .transaction-item:hover {
                    background: rgba(255, 255, 255, 0.04);
                    transform: translateX(5px);
                }
                .transaction-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .transaction-icon.received {
                    background: rgba(0, 158, 96, 0.1);
                    color: var(--primary);
                }
                .transaction-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .transaction-details .title {
                    color: #fff;
                    font-weight: 600;
                    font-size: 1rem;
                }
                .transaction-details .date {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                .transaction-amount {
                    font-weight: 700;
                    font-size: 1.1rem;
                }
                .transaction-amount.positive {
                    color: var(--primary);
                }
                
                .loading-state {
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
                .empty-state {
                    padding: 3rem;
                    text-align: center;
                    color: var(--text-muted);
                }

                @media (max-width: 1024px) {
                    .wallet-grid {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 768px) {
                    .balance-content .amount {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
