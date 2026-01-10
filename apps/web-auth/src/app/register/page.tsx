"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@arenax/ui";

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState("player");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const email = formData.get("email");
        const password = formData.get("password");

        const params = new URLSearchParams({
            role,
            firstName: firstName as string,
            lastName: lastName as string,
            email: email as string,
            password: password as string
        });

        router.push(`/onboarding?${params.toString()}`);
    };

    return (
        <main className="auth-container">
            <Card className="auth-card" title="Join ARENAX">
                <p className="auth-subtitle">Create your account to start your journey</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" name="firstName" placeholder="e.g. Fazli" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" name="lastName" placeholder="e.g. Hadir" required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="Enter your email" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">I am a...</label>
                        <select
                            id="role"
                            className="auth-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="player">Player</option>
                            <option value="venue-owner">Venue Owner</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="Create a password" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" placeholder="Confirm your password" required />
                    </div>

                    <div className="auth-actions">
                        <Button variant="primary" type="submit" style={{ width: '100%' }}>
                            Create Account
                        </Button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <a href="/">Login here</a></p>
                </div>
            </Card>
        </main>
    );
}
