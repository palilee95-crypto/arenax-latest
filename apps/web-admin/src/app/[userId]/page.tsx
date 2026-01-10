"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@arenax/ui";
import { supabase } from "@arenax/database";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AdminDashboard() {
  const params = useParams();
  const userId = params.userId;
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalVenues: 0,
    pendingVerifications: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch total profiles (Active Users)
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total venues
      const { count: venueCount, error: venueError } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true });

      // Fetch pending verifications
      const { count: pendingCount, error: pendingError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (userError || venueError || pendingError) throw userError || venueError || pendingError;

      setStats({
        activeUsers: userCount || 0,
        totalVenues: venueCount || 0,
        pendingVerifications: pendingCount || 0
      });

      // Fetch recent transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (txError) throw txError;
      setRecentTransactions(txData || []);

    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Superadmin Dashboard</h1>
        <p>Monitor system health, verify users, and oversee transactions.</p>
      </header>

      <div className="dashboard-grid">
        <Card title="System Health" variant="glass">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Active Users</div>
              <div className="stat-value">{loading ? "..." : stats.activeUsers}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Venues</div>
              <div className="stat-value">{loading ? "..." : stats.totalVenues}</div>
            </div>
          </div>
        </Card>

        <Card title="Pending Verifications" variant="glass">
          <div className="verification-info">
            <div className="pending-count">{loading ? "..." : stats.pendingVerifications} Users</div>
            <p>Awaiting document approval</p>
            <Link href={`/${userId}/verification`}>
              <Button variant="primary" style={{ marginTop: '1rem', width: '100%' }} disabled={stats.pendingVerifications === 0}>
                Review All
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Recent Transactions" variant="glass" className="span-2">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : recentTransactions.length > 0 ? (
            <div className="recent-tx-list">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="tx-item">
                  <div className="tx-main">
                    <span className="tx-user">{tx.profiles?.first_name} {tx.profiles?.last_name}</span>
                    <span className="tx-desc">{tx.description || tx.type}</span>
                  </div>
                  <div className="tx-meta">
                    <span className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                      {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)}
                    </span>
                    <span className="tx-date">{new Date(tx.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              <Link href={`/${userId}/transactions`} className="view-all-link">
                View All Transactions
              </Link>
            </div>
          ) : (
            <div className="empty-state">
              <p>No transactions recorded yet.</p>
            </div>
          )}
        </Card>
      </div>

      <style jsx>{`
        .dashboard-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
        .dashboard-header { margin-bottom: 3rem; }
        .dashboard-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(to right, #fff, rgba(255,255,255,0.5)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .dashboard-header p { color: var(--text-muted); font-size: 1.1rem; }

        .dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .span-2 { grid-column: span 2; }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem 0; }
        .stat-item { text-align: center; }
        .stat-label { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem; }
        .stat-value { font-size: 2rem; font-weight: 700; color: #fff; }

        .verification-info { text-align: center; padding: 1rem 0; }
        .pending-count { font-size: 1.8rem; font-weight: 700; color: #fbbf24; margin-bottom: 0.25rem; }
        
        .recent-tx-list { display: flex; flex-direction: column; gap: 1rem; }
        .tx-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 8px; }
        .tx-main { display: flex; flex-direction: column; }
        .tx-user { font-weight: 500; color: #fff; }
        .tx-desc { font-size: 0.85rem; color: var(--text-muted); }
        .tx-meta { display: flex; flex-direction: column; align-items: flex-end; }
        .tx-amount { font-weight: 600; }
        .tx-amount.positive { color: #34d399; }
        .tx-amount.negative { color: #f87171; }
        .tx-date { font-size: 0.75rem; color: var(--text-muted); }
        
        .view-all-link { display: block; text-align: center; margin-top: 1rem; color: var(--primary); font-size: 0.9rem; text-decoration: none; }
        .view-all-link:hover { text-decoration: underline; }

        .loading-state, .empty-state { padding: 2rem; text-align: center; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
