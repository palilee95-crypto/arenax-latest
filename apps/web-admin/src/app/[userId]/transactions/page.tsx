"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@arenax/ui";
import { supabase } from "@arenax/database";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select(`
                        *,
                        profiles (
                            first_name,
                            last_name,
                            email
                        )
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setTransactions(data || []);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();

        // Set up real-time subscription
        const channel = supabase
            .channel('transactions-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transactions' },
                () => fetchTransactions()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-MY', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Transactions</h1>
                <p>View all system transactions and financial logs.</p>
            </header>

            <Card variant="glass">
                {loading ? (
                    <div className="loading-state">Loading transactions...</div>
                ) : transactions.length > 0 ? (
                    <div className="table-container">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{formatDate(tx.created_at)}</td>
                                        <td>
                                            <div className="user-info">
                                                <span className="user-name">
                                                    {tx.profiles?.first_name} {tx.profiles?.last_name}
                                                </span>
                                                <span className="user-email">{tx.profiles?.email}</span>
                                            </div>
                                        </td>
                                        <td><span className={`badge type-${tx.type}`}>{tx.type}</span></td>
                                        <td className={`amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                                            {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)} MYR
                                        </td>
                                        <td><span className={`badge status-${tx.status}`}>{tx.status}</span></td>
                                        <td>{tx.description || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No transactions found.</p>
                    </div>
                )}
            </Card>

            <style jsx>{`
                .page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
                .page-header { margin-bottom: 3rem; }
                .page-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(to right, #fff, rgba(255,255,255,0.5)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .page-header p { color: var(--text-muted); font-size: 1.1rem; }
                
                .loading-state, .empty-state { padding: 4rem; text-align: center; color: var(--text-muted); }
                
                .table-container { overflow-x: auto; }
                .transactions-table { width: 100%; border-collapse: collapse; text-align: left; }
                .transactions-table th { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); font-weight: 500; }
                .transactions-table td { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
                
                .user-info { display: flex; flex-direction: column; }
                .user-name { font-weight: 500; color: #fff; }
                .user-email { font-size: 0.85rem; color: var(--text-muted); }
                
                .badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; text-transform: capitalize; }
                .type-topup { background: rgba(52, 211, 153, 0.1); color: #34d399; }
                .type-payment { background: rgba(96, 165, 250, 0.1); color: #60a5fa; }
                .status-completed { background: rgba(52, 211, 153, 0.1); color: #34d399; }
                .status-pending { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
                .status-failed { background: rgba(248, 113, 113, 0.1); color: #f87171; }
                
                .amount { font-weight: 600; font-family: 'Outfit', sans-serif; }
                .amount.positive { color: #34d399; }
                .amount.negative { color: #f87171; }
            `}</style>
        </div>
    );
}
