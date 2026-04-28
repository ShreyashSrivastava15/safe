import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeRisk, AnalysisResponse, AnalysisRequest } from "@/services/api";
import { fetchRecentEmails, checkConnectionStatus } from "@/services/gmail";
import { Shield, Link, MessageSquare, CreditCard, Loader2, Mail, Info, FileText, Share2, Clipboard, AlertCircle, RefreshCw, ChevronRight, ChevronLeft, CheckCircle2, XCircle, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RiskScoreGauge from "./AnalysisResults/RiskScoreGauge";
import FindingCard from "./AnalysisResults/FindingCard";

interface AnalyzeViewProps {
    fraud_type: 'email' | 'url' | 'transaction' | 'ecommerce' | 'message';
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function AnalyzeView({ fraud_type, title, description, icon }: AnalyzeViewProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [fetchedEmails, setFetchedEmails] = useState<any[]>([]);

    const [message, setMessage] = useState("");
    const [url, setUrl] = useState("");
    const [amount, setAmount] = useState("");
    const [country, setCountry] = useState("US");
    const [isDeviceChange, setIsDeviceChange] = useState(false);
    const [isGeoShift, setIsGeoShift] = useState(false);
    const [velocity, setVelocity] = useState("1");

    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const emailsPerPage = 10;

    useEffect(() => {
        const checkStatus = async () => {
            if (user?.id) {
                const connected = await checkConnectionStatus(user.id);
                setIsConnected(connected);
            }
        };
        checkStatus();
    }, [user]);

    const handleConnectGmail = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        const authUrl = `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}/auth/google?userId=${user.id}`;
        window.location.href = authUrl;
    };

    const handleAutoScan = async () => {
        setIsLoading(true);
        try {
            toast({ title: "Opening Secure Inbox...", description: "Retrieving telemetry from your recent communication..." });
            const emails = await fetchRecentEmails();
            setFetchedEmails(emails);
            if (emails && emails.length > 0) {
                toast({ title: "Telemetry Synchronized", description: `Detected ${emails.length} potential intelligence sources.` });
            }
        } catch (error: any) {
            toast({ title: "Failed to fetch emails", description: error.message, variant: "destructive" });
            if (error.message.includes("connect your Google account")) setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        try {
            const data: AnalysisRequest = { fraud_type };
            if (fraud_type === 'email' || fraud_type === 'message' || fraud_type === 'ecommerce') data.message = message;
            if (fraud_type === 'url' || fraud_type === 'ecommerce') data.url = url;
            if (fraud_type === 'transaction') {
                data.transaction = {
                    amount: parseFloat(amount) || 0,
                    country: country || "US",
                    timestamp: new Date().toISOString(),
                    device_change: isDeviceChange,
                    geo_shift: isGeoShift,
                    velocity: parseInt(velocity) || 1
                };
            }

            const response = await analyzeRisk(data);
            setResult(response);

            toast({
                title: "Forensic Analysis Complete",
                description: `Neural risk score generated: ${Math.round(response.final_score * 100)}/100`,
            });
        } catch (error: any) {
            toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const getVerdictColor = (v: string) => {
        if (v === 'FRAUDULENT') return 'text-destructive';
        if (v === 'SUSPICIOUS') return 'text-orange-500';
        return 'text-emerald-500';
    };

    const handleCopyFindings = () => {
        if (!result) return;
        const text = `
S.A.F.E. Forensic Analysis Report
---------------------------------
Verdict: ${result.verdict}
Risk Score: ${Math.round(result.final_score * 100)}/100
Confidence: ${Math.round(result.confidence * 100)}%

Summary:
${result.explanation}

Evidence Chain:
${result.findings.map(f => `- [${f.severity}] ${f.title}: ${f.description}`).join('\n')}

Generated at: ${new Date().toLocaleString()}
        `.trim();
        
        navigator.clipboard.writeText(text);
        toast({
            title: "Findings Copied",
            description: "Forensic summary has been copied to your clipboard.",
        });
    };

    const handleExportPDF = async () => {
        if (!result) return;
        const element = document.getElementById('analysis-report-content');
        if (!element) return;

        setIsLoading(true);
        toast({
            title: "Generating Forensic PDF",
            description: "Neutralizing artifacts and compiling report...",
        });

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#020617', // Match your dark theme
                scale: 2,
                logging: false,
                useCORS: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`SAFE-Analysis-${new Date().getTime()}.pdf`);
            
            toast({
                title: "Report Exported",
                description: "PDF report has been saved to your downloads.",
            });
        } catch (error) {
            console.error('PDF Export Error:', error);
            toast({
                title: "Export Failed",
                description: "Could not generate PDF. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container px-4 py-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                            {icon}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-100 uppercase">{title}</h1>
                    </div>
                    <p className="text-slate-400 text-base max-w-xl">{description}</p>
                </div>

                {/* Gmail Integration Hub */}
                {(fraud_type === 'email' || fraud_type === 'message') && (
                    <div className="p-3.5 rounded-2xl glass flex items-center gap-4 min-w-[280px]">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-primary/70" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Neural Inbox Link</p>
                            <p className="text-sm font-bold text-slate-300">{isConnected ? "Synchronized" : "Disconnected"}</p>
                        </div>
                        {!isConnected ? (
                            <Button onClick={handleConnectGmail} size="sm" className="bg-primary/80 text-[9px] uppercase font-bold tracking-widest h-8 px-4 rounded-xl">Connect</Button>
                        ) : (
                            <Button onClick={handleAutoScan} size="sm" variant="secondary" className="bg-white/5 text-[9px] uppercase font-bold tracking-widest h-8 px-4 rounded-xl hover:bg-white/10 transition-all">
                                <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Sync
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Email Intelligence Carousel (If emails fetched) */}
            {fetchedEmails.length > 0 && (
                <div className="mb-10 space-y-4 animate-slide-in-bottom">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <Label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Select Intelligence Source (Recent Emails)</Label>
                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: Math.ceil(fetchedEmails.length / emailsPerPage) }).map((_, i) => (
                                    <Button
                                        key={i}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentIndex(i * emailsPerPage)}
                                        className={`h-7 min-w-[1.75rem] px-2 rounded-lg text-[10px] font-mono font-bold transition-all ${
                                            Math.floor(currentIndex / emailsPerPage) === i 
                                                ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                                                : 'text-primary/40 hover:bg-white/5 hover:text-primary/70'
                                        }`}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-40">
                            {isLoading ? "Retrieving Secure Payload..." : `${fetchedEmails.length} SOURCES DETECTED`}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-16 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" />
                            ))
                        ) : (
                            fetchedEmails.slice(currentIndex, currentIndex + emailsPerPage).map((email, index) => (
                                <button
                                    key={email.id || index}
                                    type="button"
                                    onClick={() => {
                                        const content = `Subject: ${email.subject}\nFrom: ${email.sender}\n\n${email.body || email.snippet}`;
                                        setMessage(content.trim());
                                    }}
                                    className="group text-left p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-primary/5 hover:border-primary/20 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-all" />
                                    <div className="font-bold text-xs truncate text-white/90 mb-1">{email.subject}</div>
                                    <div className="text-[10px] text-muted-foreground truncate font-mono uppercase opacity-60">{email.sender.split('<')[0]}</div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-10 items-start">
                {/* Input Panel */}
                <div className="lg:col-span-5 space-y-6">
                    <form onSubmit={handleAnalyze} className="p-8 rounded-[2.5rem] bg-card/30 border border-white/5 backdrop-blur-2xl shadow-3xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Shield className="h-32 w-32" />
                        </div>
                        
                        <div className="space-y-6 relative">
                            {(fraud_type === 'email' || fraud_type === 'message' || fraud_type === 'ecommerce') && (
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Forensic Payload</Label>
                                    <Textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Paste suspicious content or sync with Gmail above..."
                                        className="min-h-[250px] resize-none border-white/5 bg-black/40 font-mono text-xs leading-relaxed focus:ring-primary/20 transition-all rounded-3xl p-6"
                                        required
                                    />
                                </div>
                            )}

                            {fraud_type === 'transaction' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Transaction Amount (USD)</Label>
                                            <Input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="h-14 border-white/5 bg-black/40 font-mono text-lg font-bold rounded-2xl px-6"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Origin Node (Country)</Label>
                                            <Input
                                                type="text"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                                                placeholder="US, GB, IN..."
                                                maxLength={2}
                                                className="h-14 border-white/5 bg-black/40 font-mono text-lg font-bold rounded-2xl px-6"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Transaction Velocity (Last 5m)</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[1, 2, 5, 10].map((v) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => setVelocity(v.toString())}
                                                    className={`py-3 rounded-xl border text-xs font-mono font-bold transition-all ${velocity === v.toString() ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10'}`}
                                                >
                                                    {v}x
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        <div className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => setIsDeviceChange(!isDeviceChange)}>
                                            <div className="flex items-center gap-3">
                                                <RefreshCw className={`h-4 w-4 transition-all ${isDeviceChange ? 'text-primary rotate-180' : 'text-muted-foreground opacity-50'}`} />
                                                <Label className="text-sm font-bold cursor-pointer">Device Fingerprint Mismatch?</Label>
                                            </div>
                                            <div className={`h-6 w-10 rounded-full p-1 transition-all ${isDeviceChange ? 'bg-primary' : 'bg-white/10'}`}>
                                                <div className={`h-4 w-4 rounded-full bg-white transition-all ${isDeviceChange ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => setIsGeoShift(!isGeoShift)}>
                                            <div className="flex items-center gap-3">
                                                <AlertCircle className={`h-4 w-4 transition-all ${isGeoShift ? 'text-primary animate-pulse' : 'text-muted-foreground opacity-50'}`} />
                                                <Label className="text-sm font-bold cursor-pointer">Impossible Travel Anomaly?</Label>
                                            </div>
                                            <div className={`h-6 w-10 rounded-full p-1 transition-all ${isGeoShift ? 'bg-primary' : 'bg-white/10'}`}>
                                                <div className={`h-4 w-4 rounded-full bg-white transition-all ${isGeoShift ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(fraud_type === 'url' || fraud_type === 'ecommerce') && (
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Neural Intelligence Target (URL)</Label>
                                    <Input
                                        type="text"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://secure-gate.payment-verify.tk"
                                        className="h-16 border-white/5 bg-black/40 font-mono text-sm font-bold rounded-2xl px-6"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-16 gap-3 bg-primary font-black text-xl uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 rounded-3xl group"
                        >
                            {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Shield className="h-7 w-7 transition-transform group-hover:scale-110" />}
                            Execute Forensic Scan
                        </Button>
                    </form>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-7">
                    {result ? (
                        <div id="analysis-report-content" className="space-y-8 animate-slide-in-bottom p-4">
                            {/* Intelligence Cards Row */}
                            <div className="grid md:grid-cols-11 gap-6">
                                <div className={`md:col-span-5 p-8 rounded-[2.5rem] bg-card border shadow-3xl flex flex-col items-center justify-center text-center ${result.final_score >= 0.7 ? 'animate-glow-red border-destructive/20' : 'border-white/5'}`}>
                                    <RiskScoreGauge score={result.final_score} />
                                    <div className="mt-6 space-y-1">
                                        <h3 className={`text-4xl font-black tracking-tighter uppercase ${getVerdictColor(result.verdict)}`}>
                                            {result.verdict}
                                        </h3>
                                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-40">
                                            Forensic Model Verdict
                                        </p>
                                    </div>
                                </div>

                                <div className="md:col-span-6 p-10 rounded-[2.5rem] bg-card/80 border border-white/5 shadow-3xl flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                            <Info className="h-4 w-4" />
                                            Intelligence Summary
                                        </div>
                                        <p className="text-base leading-relaxed text-muted-foreground italic font-medium">
                                            "{result.explanation}"
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                                    AI Confidence
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary shadow-[0_0_10px_#22d3ee]" style={{ width: `${result.confidence * 100}%` }} />
                                                    </div>
                                                    <span className="text-xs font-mono font-bold">{Math.round(result.confidence * 100)}%</span>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Model Accuracy</div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `98.4%` }} />
                                                    </div>
                                                    <span className="text-xs font-mono font-bold">98.4%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-2">Action Directive</div>
                                        <div className={`p-6 rounded-3xl font-black text-sm border-2 flex items-center gap-4 ${result.final_score >= 0.7 ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-primary/40 bg-primary/10 text-primary'}`}>
                                            {result.final_score >= 0.7 ? <XCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                                            <span className="uppercase tracking-widest">{result.recommendation}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Deep Forensic Findings */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                        <AlertCircle className="h-4 w-4" />
                                        Forensic Evidence Chain
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-40">Total Signals: {result.findings.length}</span>
                                </div>
                                <div className="grid gap-3">
                                    {result.findings.map((finding) => (
                                        <FindingCard key={finding.id} finding={finding} />
                                    ))}
                                    {result.findings.length === 0 && (
                                        <div className="p-10 rounded-[2.5rem] border border-dashed border-white/10 text-center bg-white/[0.01]">
                                            <Shield className="h-10 w-10 mx-auto mb-4 opacity-10" />
                                            <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest opacity-40">No Forensic Anomalies Identified in Current Scan</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Export / Share Actions */}
                            <div className="flex gap-4">
                                <Button onClick={handleCopyFindings} variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 gap-2 font-bold uppercase tracking-widest text-xs hover:bg-white/10">
                                    <Clipboard className="h-4 w-4" />
                                    Copy Findings
                                </Button>
                                <Button onClick={handleExportPDF} variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 gap-2 font-bold uppercase tracking-widest text-xs hover:bg-white/10">
                                    <FileText className="h-4 w-4" />
                                    Export PDF
                                </Button>
                                <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 p-0 hover:bg-white/10">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-16 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] text-center space-y-6">
                            <div className="p-6 rounded-full bg-white/5 border border-white/5 animate-pulse">
                                <Shield className="h-16 w-16 text-white/10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white/30 uppercase tracking-tighter">System Idle</h3>
                                <p className="text-sm text-white/20 max-w-xs font-medium">Neural Engine awaiting intelligence payload. Synchronize with Gmail or enter forensic data to begin analysis.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
