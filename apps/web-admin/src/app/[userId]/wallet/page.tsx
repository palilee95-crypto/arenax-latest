"use client";

import React from "react";
import { Card, Button } from "@arenax/ui";

export default function WalletPage() {
    return (
        <div className="wallet-page">
            <div className="page-header">
                <h1>System Wallet</h1>
                <p>Monitor platform funds and transaction logs</p>
            </div>

            <div className="wallet-grid">
                {/* Balance Card */}
                <Card variant="glass" className="balance-card">
                    <div className="balance-content">
                        <span className="label">Total Platform Funds</span>
                        <div className="amount">RM 45,250.00</div>
                        <div className="actions">
                            <Button variant="primary">Generate Report</Button>
                        </div>
                    </div>
                </Card>

                {/* Transaction History */}
                <Card variant="glass" className="history-card">
                    <h3>System Transactions</h3>
                    <div className="transactions-list">
                        <div className="transaction-item">
                            <div className="transaction-icon received">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                            </div>
                            <div className="transaction-details">
                                <span className="title">Platform Fee (Booking #1234)</span>
                                <span className="date">Today, 2:00 PM</span>
                            </div>
                            <span className="transaction-amount positive">+ RM 12.00</span>
                        </div>
                        <div className="transaction-item">
                            <div className="transaction-icon received">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                            </div>
                            <div className="transaction-details">
                                <span className="title">Platform Fee (Booking #1233)</span>
                                <span className="date">Yesterday, 8:00 PM</span>
                            </div>
                            <span className="transaction-amount positive">+ RM 12.00</span>
                        </div>
                        <div className="transaction-item">
                            <div className="transaction-icon sent">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                            </div>
                            <div className="transaction-details">
                                <span className="title">Server Costs</span>
                                <span className="date">5 days ago</span>
                            </div>
                            <span className="transaction-amount negative">- RM 150.00</span>
                        </div>
                    </div>
                </Card>
            </div>

            <style jsx>{`
                .wallet-page {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 3rem;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #fff, rgba(255,255,255,0.5));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .page-header p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }

                .wallet-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 2rem;
                }

                @media (max-width: 768px) {
                    .wallet-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .balance-card {
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    height: fit-content;
                }

                .balance-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .balance-content .label {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .balance-content .amount {
                    font-size: 3rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 1rem;
                }

                .balance-content .actions {
                    display: flex;
                    gap: 1rem;
                    width: 100%;
                }

                .history-card {
                    padding: 2rem;
                }

                .history-card h3 {
                    font-size: 1.25rem;
                    color: #fff;
                    margin-bottom: 1.5rem;
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
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.2s ease;
                }

                .transaction-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    transform: translateX(5px);
                }

                .transaction-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .transaction-icon.received {
                    background: rgba(0, 255, 128, 0.1);
                    color: #00ff80;
                }

                .transaction-icon.sent {
                    background: rgba(255, 80, 80, 0.1);
                    color: #ff5050;
                }

                .transaction-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .transaction-details .title {
                    color: #fff;
                    font-weight: 500;
                }

                .transaction-details .date {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }

                .transaction-amount {
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .transaction-amount.positive {
                    color: #00ff80;
                }

                .transaction-amount.negative {
                    color: #ff5050;
                }
            `}</style>
        </div>
    );
}
