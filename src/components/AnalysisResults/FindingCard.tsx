import React from 'react';
import { ShieldAlert, ShieldCheck, ShieldQuestion, Info } from 'lucide-react';

interface Finding {
    id: string;
    label: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: string;
}

const FindingCard: React.FC<{ finding: Finding }> = ({ finding }) => {
    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'CRITICAL': return 'text-destructive border-destructive/20 bg-destructive/5';
            case 'HIGH': return 'text-orange-500 border-orange-500/20 bg-orange-500/5';
            case 'MEDIUM': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
            default: return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
        }
    };

    return (
        <div className={`p-4 rounded-xl border flex gap-4 transition-all hover:shadow-sm ${getSeverityColor(finding.severity)}`}>
            <div className="mt-1">
                {finding.severity === 'CRITICAL' || finding.severity === 'HIGH' ? (
                    <ShieldAlert className="h-5 w-5" />
                ) : (
                    <ShieldInfo className="h-5 w-5 opacity-70" />
                )}
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold uppercase tracking-tight">{finding.label}</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 uppercase">{finding.severity}</span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">{finding.description}</p>
            </div>
        </div>
    );
};

const ShieldInfo = Info;

export default FindingCard;
