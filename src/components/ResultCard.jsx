import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const ResultCard = ({ module }) => {
  const percentage = Math.round(module.score * 100);

  const getStatusConfig = () => {
    if (module.score >= 0.7) return { icon: <XCircle className="h-5 w-5" />, colorClass: "text-destructive border-destructive/30 bg-destructive/5" };
    if (module.score >= 0.4) return { icon: <AlertTriangle className="h-5 w-5" />, colorClass: "text-warning border-warning/30 bg-warning/5" };
    return { icon: <CheckCircle className="h-5 w-5" />, colorClass: "text-success border-success/30 bg-success/5" };
  };

  const status = getStatusConfig();

  return (
    <div className={`rounded-lg border p-4 ${status.colorClass} animate-fade-in`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {module.icon}
          <span className="font-semibold text-sm">{module.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {status.icon}
          <span className="font-mono font-bold text-lg">{percentage}%</span>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted mb-3">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: "currentColor" }}
        />
      </div>

      {module.reasons.length > 0 && (
        <ul className="space-y-1">
          {module.reasons.map((reason, i) => (
            <li key={i} className="text-xs font-mono opacity-80 flex items-start gap-1.5">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-current shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResultCard;
