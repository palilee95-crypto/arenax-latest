"use client";

import React, { useState, useEffect } from "react";
import { Button, Card } from "@arenax/ui";
import { supabase } from "@arenax/database";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabaseUrl = (supabase as any).supabaseUrl;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  console.log("Supabase URL initialized with:", supabaseUrl);
  console.log("Direct Env URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt started...");
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = (formData.get("email") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();
    console.log("Email (trimmed):", email);

    try {
      console.log("Querying profiles for:", email);
      // Query profiles table for the user
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      console.log("Query result:", { data, fetchError });

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);
        throw new Error(fetchError.message || "Invalid email or password");
      }

      if (!data) {
        throw new Error("User not found or incorrect password");
      }

      console.log("Login successful, redirecting to:", data.role);
      // Redirect based on role
      const roleRedirects: Record<string, string> = {
        'player': `${process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001'}/${data.id}`,
        'venue-owner': `${process.env.NEXT_PUBLIC_VENUE_URL || 'http://localhost:3002'}/${data.id}`,
        'admin': `${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003'}/${data.id}`
      };

      const redirectUrl = roleRedirects[data.role] || `http://localhost:3001/${data.id}`;
      console.log("Redirect URL:", redirectUrl);

      // Set cookie for session persistence across ports
      const cookieName = data.role === 'player' ? 'arenax_player_id' :
        data.role === 'venue-owner' ? 'arenax_venue_id' :
          'arenax_admin_id';

      console.log("Setting cookie:", cookieName);
      // Omit domain=localhost as it can cause issues on some browsers
      document.cookie = `${cookieName}=${data.id}; path=/; max-age=86400; SameSite=Lax`;

      window.location.href = redirectUrl;

    } catch (err: any) {
      console.error("Login error details:", err);
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <Card className="auth-card" variant="glass">
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.8 }}>Welcome to</h2>
          <img src="/logo-white.png" alt="ARENAX" style={{ height: '45px', width: 'auto', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px var(--primary-glow))' }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Centralized Sports Community Hub</p>
        </div>


        <form className="auth-form" onSubmit={handleSubmit}>
          {isPlaceholder && (
            <div style={{
              background: 'rgba(255, 77, 77, 0.1)',
              border: '1px solid #ff4d4d',
              padding: '0.8rem',
              borderRadius: '8px',
              color: '#ff4d4d',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <strong>WARNING:</strong> Supabase is not configured correctly.
            </div>
          )}
          {error && <div className="error-message" style={{ color: '#ff4d4d', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center', padding: '0.8rem', background: 'rgba(255,77,77,0.1)', borderRadius: '8px', border: '1px solid rgba(255,77,77,0.2)' }}>{error}</div>}

          <div className="form-group">
            <label htmlFor="email" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Email Address</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required style={{ padding: '1rem', fontSize: '0.95rem' }} />
          </div>

          <div className="form-group">
            <label htmlFor="password" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required style={{ padding: '1rem', fontSize: '0.95rem' }} />
          </div>

          <div className="auth-actions" style={{ marginTop: '1rem' }}>
            <Button variant="primary" type="submit" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? "Authenticating..." : "Login to Arena"}
            </Button>
          </div>
        </form>

        <div className="auth-footer" style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Don't have an account? <a href="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>Register here</a></p>
        </div>
      </Card>
    </main>
  );
}
