import { useEffect, useState } from "react";
import { getRecentLogs } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Database, Search, ChevronRight, ChevronLeft, Shield } from "lucide-react";
import { format } from "date-fns";

const History = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getRecentLogs();
                setLogs(data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const totalPages = Math.ceil(logs.length / logsPerPage);
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

    const getVerdictStyle = (v: string) => {
        if (v === 'FRAUDULENT') return 'bg-destructive/10 text-destructive border-destructive/20';
        if (v === 'SUSPICIOUS') return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
            </div>
        );
    }

    return (
        <div className="container px-4 py-12 max-w-6xl mx-auto space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                            <Database className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-100 uppercase">Intelligence Archive</h1>
                    </div>
                    <p className="text-slate-400 text-sm max-w-xl">Comprehensive audit log of all neural system scans and forensic investigations.</p>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                    <Shield className="h-3 w-3 text-primary/60" />
                    Total Records: {logs.length}
                </div>
            </div>

            <div className="rounded-[2.5rem] border border-white/5 bg-card/30 backdrop-blur-2xl shadow-3xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/[0.02]">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6 pl-8">Time (UTC)</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Intelligence Payload</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Risk Level</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Score</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pr-8 text-right">Verdict</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-64 text-muted-foreground font-mono uppercase text-xs opacity-40">
                                    No investigation records found in archive.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentLogs.map((log) => (
                                <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="font-mono text-[10px] py-5 pl-8 text-slate-400">
                                        {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                                    </TableCell>
                                    <TableCell className="max-w-[400px]">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-200 truncate group-hover:text-primary transition-colors">
                                                {log.message || log.url || "Manual Transaction Scan"}
                                            </span>
                                            <span className="text-[9px] font-mono uppercase text-slate-500 opacity-60">ID: {log.id.split('-')[0]}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-lg px-2.5 py-0.5 text-[9px] font-black tracking-widest ${
                                            log.risk_level === 'HIGH' ? 'bg-destructive/20 text-destructive border-destructive/20' : 
                                            log.risk_level === 'MEDIUM' ? 'bg-orange-500/20 text-orange-500 border-orange-500/20' : 
                                            'bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                                        }`} variant="outline">
                                            {log.risk_level}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs font-bold text-slate-300">
                                        {Math.round(log.final_score * 100)}/100
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg border ${getVerdictStyle(log.verdict)}`}>
                                            {log.verdict}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pro Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2">
                    <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                        Showing {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, logs.length)} of {logs.length} entries
                    </p>
                    <div className="flex items-center gap-1.5">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-white/5 disabled:opacity-20"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <Button
                                key={i}
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(i + 1)}
                                className={`h-9 min-w-[2.25rem] px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                                    currentPage === i + 1 
                                        ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(34,211,238,0.25)]' 
                                        : 'text-primary/40 hover:bg-white/5 hover:text-primary/70'
                                }`}
                            >
                                {i + 1}
                            </Button>
                        ))}

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-white/5 disabled:opacity-20"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
