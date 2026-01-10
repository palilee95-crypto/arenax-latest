"use client";

import React from "react";
import { Card } from "@arenax/ui";

export default function SettingsPage() {
    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Settings</h1>
                <p>Manage system configurations and preferences.</p>
            </header>
            <Card variant="glass">
                <div className="empty-state">
                    <p>Settings configuration coming soon.</p>
                </div>
            </Card>
            <style jsx>{`
                .page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
                .page-header { margin-bottom: 3rem; }
                .page-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(to right, #fff, rgba(255,255,255,0.5)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .page-header p { color: var(--text-muted); font-size: 1.1rem; }
                .empty-state { padding: 4rem; text-align: center; color: var(--text-muted); }
            `}</style>
        </div>
    );
}
