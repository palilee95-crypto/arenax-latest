"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    fullWidth?: boolean;
    size?: "sm" | "md" | "lg";
}

export const Button = ({ children, variant = "primary", fullWidth, size = "md", className, ...props }: ButtonProps) => {
    return (
        <button
            className={`arenax-button ${variant} ${fullWidth ? 'full-width' : ''} ${size} transition-all duration-200 ease-in-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${className || ""}`}
            {...props}
        >
            {children}
        </button>
    );
};
