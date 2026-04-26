import React from 'react';

interface RiskScoreGaugeProps {
    score: number; // 0 to 1 (e.g. 0.87)
    size?: number;
}

const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score, size = 180 }) => {
    const percentage = Math.round(score * 100);
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score * circumference);

    const getRiskColor = (s: number) => {
        if (s >= 0.7) return '#ef4444'; // Red
        if (s >= 0.4) return '#f97316'; // Orange
        if (s >= 0.25) return '#eab308'; // Yellow
        return '#22c55e'; // Green
    };

    const color = getRiskColor(score);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Track */}
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    radius={radius}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-muted/10"
                />
                {/* Progress Glow */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    radius={radius}
                    r={radius}
                    stroke={color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 6px ${color}44)` }}
                />
            </svg>
            
            {/* Center Text */}
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-mono font-bold tracking-tighter" style={{ color }}>
                    {percentage}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-60">
                    Risk Score
                </span>
            </div>
        </div>
    );
};

export default RiskScoreGauge;
