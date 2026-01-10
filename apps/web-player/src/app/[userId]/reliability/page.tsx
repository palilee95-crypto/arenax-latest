"use client";

import React from "react";
import { Card } from "@arenax/ui";

export default function ReliabilityPage() {
    return (
        <div className="reliability-page">
            <header className="page-header">
                <h1>Reliability Score</h1>
                <p>Understand and manage your player reputation.</p>
            </header>

            <div className="content-grid">
                {/* Score Overview */}
                <div className="score-section">
                    <Card variant="glass" className="score-card futuristic-card">
                        <div className="score-circle-container">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#009e60" />
                                        <stop offset="100%" stopColor="#007042" />
                                    </linearGradient>
                                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <path className="circle-bg"
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path className="circle"
                                    strokeDasharray="100, 100"
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <text x="18" y="20.35" className="percentage">100%</text>
                            </svg>
                        </div>
                        <div className="score-label">EXCELLENT</div>
                        <div className="score-details">
                            <h3>Your Reliability Score</h3>
                            <p>A high score unlocks premium matches and trusted status.</p>
                        </div>
                    </Card>
                </div>

                {/* Rules & Management */}
                <div className="rules-section">
                    <Card variant="glass" className="rules-card futuristic-card">
                        <h2>How It Works</h2>
                        <div className="rules-list">
                            <div className="rule-item">
                                <div className="icon-wrapper warning">
                                    <div className="icon">⚠️</div>
                                </div>
                                <div className="content">
                                    <h3>Check-in Required</h3>
                                    <p>You must check in at the venue <strong>15 minutes</strong> before the match starts.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <div className="icon-wrapper danger">
                                    <div className="icon">🚫</div>
                                </div>
                                <div className="content">
                                    <h3>Late Arrival Penalty</h3>
                                    <p>Arriving late or failing to check in will significantly lower your reliability score.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <div className="icon-wrapper star">
                                    <div className="icon">⭐</div>
                                </div>
                                <div className="content">
                                    <h3>Peer Ratings</h3>
                                    <p>After each match, other players will rate you. Consistently low ratings will impact your score.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <div className="icon-wrapper info">
                                    <div className="icon">ℹ️</div>
                                </div>
                                <div className="content">
                                    <h3>Consequences</h3>
                                    <p>A low reliability score may restrict you from joining certain competitive matches or leagues.</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <style jsx>{`
                .reliability-page {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 3rem;
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
                    font-size: 1.1rem;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 2rem;
                }

                @media (max-width: 900px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .futuristic-card {
                    background: rgba(10, 10, 10, 0.6) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                    border-radius: 24px;
                    overflow: hidden;
                    position: relative;
                }
                
                .futuristic-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                }

                .score-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 4rem 2rem;
                    height: 100%;
                    justify-content: center;
                }

                .score-circle-container {
                    width: 220px;
                    height: 220px;
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .circular-chart {
                    display: block;
                    margin: 0 auto;
                    max-width: 100%;
                    max-height: 250px;
                    overflow: visible;
                }

                .circle-bg {
                    fill: none;
                    stroke: rgba(255, 255, 255, 0.05);
                    stroke-width: 2;
                }

                .circle {
                    fill: none;
                    stroke: url(#gradient);
                    stroke-width: 2.5;
                    stroke-linecap: round;
                    animation: progress 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    filter: url(#glow);
                }

                @keyframes progress {
                    0% { stroke-dasharray: 0 100; }
                }

                .percentage {
                    fill: #fff;
                    font-family: var(--font-outfit), sans-serif;
                    font-weight: 900;
                    font-size: 0.55em;
                    text-anchor: middle;
                    filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
                }

                .score-label {
                    color: #009e60;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    font-size: 1rem;
                    text-shadow: 0 0 15px rgba(0, 158, 96, 0.6);
                    margin-bottom: 2rem;
                }

                .score-details h3 {
                    font-size: 1.8rem;
                    margin-bottom: 0.75rem;
                    color: #fff;
                    font-family: var(--font-outfit), sans-serif;
                    font-weight: 800;
                }

                .score-details p {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 1rem;
                    line-height: 1.6;
                    max-width: 300px;
                    margin: 0 auto;
                }

                .rules-card {
                    padding: 3rem;
                    height: 100%;
                }

                .rules-card h2 {
                    font-size: 1.5rem;
                    margin-bottom: 2.5rem;
                    color: rgba(255, 255, 255, 0.9);
                    font-family: var(--font-outfit), sans-serif;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                }

                .rules-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .rule-item {
                    display: flex;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .rule-item:hover {
                    background: rgba(255, 255, 255, 0.04);
                    transform: translateX(8px);
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .icon-wrapper {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    position: relative;
                    overflow: hidden;
                }
                
                .icon-wrapper::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    opacity: 0.2;
                }

                .icon-wrapper.warning::before { background: #ffcc00; }
                .icon-wrapper.danger::before { background: #ff5050; }
                .icon-wrapper.star::before { background: #009e60; }
                .icon-wrapper.info::before { background: #fff; }

                .icon {
                    font-size: 1.5rem;
                    position: relative;
                    z-index: 1;
                }

                .content h3 {
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                    color: #fff;
                    font-weight: 700;
                    font-family: var(--font-outfit), sans-serif;
                }

                .content p {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}
