import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const ResultCard = ({ module }) => {
  const percentage = Math.round(module.score * 100);

  const getStatusConfig = () => {
    if (module.score >= 0.7) return { icon: <XCircle className="h-5 w-5" />, colorClass: "text-destructive border-destructive/20 bg-destructive/5", label: "CRITICAL" };
    if (module.score >= 0.4) return { icon: <AlertTriangle className="h-5 w-5" />, colorClass: "text-orange-500 border-orange-500/20 bg-orange-500/5", label: "SUSPICIOUS" };
    return { icon: <CheckCircle className="h-5 w-5" />, colorClass: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5", label: "SECURE" };
  };

  const status = getStatusConfig();

  return (
    <div className={`rounded-xl border p-5 ${status.colorClass} animate-fade-in transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-background/50 shadow-sm border border-current/10">
            {module.icon}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">{module.label}</span>
            <span className="text-[10px] font-mono font-bold tracking-tighter opacity-70 uppercase">{status.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-xl">{percentage}%</span>
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-muted/30 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
          style={{ width: `${percentage}%`, backgroundColor: "currentColor" }}
        />
      </div>

      {module.reasons.length > 0 ? (
        <ul className="space-y-2">
          {module.reasons.map((reason, i) => (
            <li key={i} className="text-xs font-mono opacity-90 flex items-start gap-2 bg-background/30 p-1.5 rounded-md border border-current/5">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-current shrink-0" />
              <span className="leading-tight">{reason}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[10px] font-mono italic opacity-60 text-center py-2 px-4 bg-background/20 rounded-md border border-dashed border-current/10">
          No suspicious signals detected
        </p>
      )}

    </div>
  );
};


export default ResultCard;
