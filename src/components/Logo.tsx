import React from 'react';

interface LogoProps {
    className?: string;
}

export default function Logo({ className = "h-8 w-8" }: LogoProps) {
    return (
        <svg
            viewBox="0 0 32 32"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Main Circle */}
            <circle
                cx="16"
                cy="16"
                r="15"
                fill="#3B82F6"
                className="drop-shadow-md"
            />
            
            {/* Coin Stack */}
            <path
                d="M12 20h8M11 17h10M10 14h12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Flow Arrow */}
            <path
                d="M16 8v4M16 12l3-3M16 12l-3-3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
