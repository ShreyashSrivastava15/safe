import { useMemo } from "react";

const RiskMeter = ({ score, size = "lg" }) => {
  const percentage = Math.round(score * 100);

  const { label, colorClass, glowClass } = useMemo(() => {
    if (score >= 0.7) return { label: "FRAUD", colorClass: "text-destructive", glowClass: "glow-destructive" };
    if (score >= 0.4) return { label: "SUSPICIOUS", colorClass: "text-warning", glowClass: "glow-accent" };
    return { label: "SAFE", colorClass: "text-success", glowClass: "glow-success" };
  }, [score]);

  const radius = size === "lg" ? 80 : 45;
  const stroke = size === "lg" ? 8 : 5;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score * circumference);
  const viewBox = size === "lg" ? 200 : 110;
  const center = viewBox / 2;

  return (
    <div className={`flex flex-col items-center gap-3 ${glowClass} rounded-full p-1`}>
      <svg width={viewBox} height={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`} className="transform -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx={center} cy={center} r={radius} fill="none" stroke="currentColor"
          strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round" className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-mono font-bold ${colorClass} ${size === "lg" ? "text-4xl" : "text-xl"}`}>
          {percentage}%
        </span>
        <span className={`font-mono text-xs tracking-widest ${colorClass}`}>{label}</span>
      </div>
    </div>
  );
};

export default RiskMeter;
