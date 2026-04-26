import { useState, useEffect } from "react";
import { Shield, Mail, Link as LinkIcon, CreditCard, MessageSquare, ShoppingCart, Activity, AlertCircle, CheckCircle2, ChevronRight, Zap, Database, Cpu, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const StatCard = ({ title, value, subValue, icon: Icon, color, trend }: any) => (
    <div className="glass glass-hover p-6 rounded-[2rem] relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-500`}>
            <Icon className="h-20 w-20" />
        </div>
        <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-${color}-500/10 border border-${color}-500/10`}>
                    <Icon className={`h-5 w-5 text-${color}-400/80`} />
                </div>
                {trend && (
                    <span className="text-[9px] font-bold tracking-widest text-emerald-400/80 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold tracking-tight text-slate-100">{value}</h3>
                    {subValue && <span className="text-[10px] font-medium text-slate-500">{subValue}</span>}
                </div>
            </div>
        </div>
    </div>
);

const SecurityModule = ({ icon: Icon, label, description, color, path }: any) => (
    <Link to={path} className="group">
        <div className="glass glass-hover p-5 rounded-3xl flex items-center gap-4 relative overflow-hidden">
            <div className={`p-3.5 rounded-xl bg-${color}-500/10 border border-${color}-500/10 transition-all duration-300`}>
                <Icon className={`h-6 w-6 text-${color}-400/80`} />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-base tracking-tight text-slate-200 group-hover:text-primary transition-colors">{label}</h3>
                <p className="text-[10px] text-slate-500 font-medium">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-primary transition-all group-hover:translate-x-1" />
        </div>
    </Link>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze/history`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                setRecentLogs(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch logs", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    const stats = [
        { title: "Threats Neutralized", value: "12,842", trend: "+12.5% THIS WEEK", icon: Shield, color: "primary" },
        { title: "Critical Anomalies", value: "0", subValue: "HIGH SEVERITY", icon: AlertCircle, color: "orange" },
        { title: "Detection Velocity", value: "1.2s", subValue: "AGGREGATED HIT RATE", icon: Zap, color: "yellow" },
        { title: "Intelligence Scans", value: "482", subValue: "CUMULATIVE ANALYSIS", icon: Activity, color: "indigo" },
    ];

    const modules = [
        { icon: Mail, label: "Email & Comms", description: "Phishing & Spoofing Detection", color: "blue", path: "/analyze/email" },
        { icon: LinkIcon, label: "URL Intel", description: "Malicious Domain Investigation", color: "emerald", path: "/analyze/url" },
        { icon: MessageSquare, label: "Messaging", description: "SMS & Smishing Threats", color: "orange", path: "/analyze/sms" },
        { icon: CreditCard, label: "Financial", description: "Transaction Fraud Patterns", color: "yellow", path: "/analyze/transaction" },
        { icon: ShoppingCart, label: "E-Commerce", description: "Scam Storefront Analysis", color: "purple", path: "/analyze/ecommerce" },
    ];

    return (
        <div className="container px-4 py-12 max-w-7xl mx-auto space-y-16 animate-fade-in">
            {/* System Status Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shadow-[0_0_8px_#22d3ee44]" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/70">Network Security Node Active</span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-slate-100">System <span className="text-slate-500 font-medium">overseeing</span></h1>
                </div>
                
                <div className="glass px-6 py-4 rounded-2xl flex items-center gap-6 border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                            <Activity className="h-4 w-4 text-emerald-400/70" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Core Uptime</p>
                            <p className="text-sm font-bold text-slate-200">99.98% <span className="text-emerald-500/60 font-mono ml-2">LIVE</span></p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/5" />
                    <Button variant="ghost" className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-200 hover:bg-white/5 h-9 px-4 rounded-xl">
                        Network Map
                    </Button>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {modules.map((m) => (
                    <SecurityModule key={m.label} {...m} />
                ))}
            </div>

            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s) => (
                    <StatCard key={s.title} {...s} />
                ))}
            </div>

            {/* Intelligence Timeline & Health */}
            <div className="grid lg:grid-cols-12 gap-10">
                {/* Timeline */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-white uppercase italic">Recent Intelligence Timeline</h2>
                        </div>
                        <Link to="/history" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                            View Full Archive
                        </Link>
                    </div>
                    
                    <div className="glass rounded-[3rem] p-4 min-h-[400px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            </div>
                        ) : recentLogs.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {recentLogs.slice(0, 5).map((log) => (
                                    <div key={log.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className={`p-3 rounded-2xl ${log.risk_level === 'FRAUD' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                                                {log.fraud_type === 'email' ? <Mail className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{log.message || log.url || "System Analysis"}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${log.risk_level === 'FRAUD' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {log.risk_level}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black tracking-tighter text-white">{Math.round(log.final_score * 100)}%</div>
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Risk Confidence</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-30">
                                <Database className="h-12 w-12" />
                                <p className="text-xs font-black uppercase tracking-widest">No Intelligence Records Found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Health */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <Zap className="h-4 w-4 text-orange-400" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-white uppercase italic">System Health</h2>
                    </div>

                    <div className="glass rounded-[3rem] p-8 space-y-10 border-orange-500/10">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Cpu className="h-5 w-5 text-slate-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Node Alpha</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-slate-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Edge Gateway</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Stable</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Zap className="h-5 w-5 text-slate-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Latency</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">14ms</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 text-center">Threat Detection Engine Status</p>
                            <div className="flex justify-between items-end h-16 gap-1">
                                {[40, 70, 45, 90, 65, 80, 50, 60, 40, 85, 95, 75].map((h, i) => (
                                    <div 
                                        key={i} 
                                        className="w-full bg-primary/20 rounded-t-sm hover:bg-primary transition-all cursor-help relative group"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 border border-white/10 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                                            Peak Activity: {h}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Loader2 = ({ className }: { className?: string }) => (
    <Activity className={`animate-spin ${className}`} />
);
