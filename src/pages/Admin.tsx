import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, FileText, AlertTriangle, ShieldCheck, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Admin = () => {
    const { isAdmin, isLoading } = useAuth();
    const [stats, setStats] = useState({
        totalRegistered: 0,
        activeUsers: 0,
        totalScans: 0,
        fraudDetected: 0,
        suspicious: 0
    });
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [contentLoading, setContentLoading] = useState(true);

    const deleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this user? This cannot be undone.")) return;

        try {
            // Full deletion via Backend (requires Service Role Key)
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete user');
            }

            toast.success("User account permanently deleted");
            setProfiles(prev => prev.filter(p => p.id !== userId));
            setStats(prev => ({ ...prev, totalRegistered: prev.totalRegistered - 1 }));
        } catch (err: any) {
            console.error("Delete error:", err);
            toast.error(err.message || "Failed to remove user. Ensure Service Role Key is set on Backend.");
        }
    };

    useEffect(() => {
        if (!isAdmin) return;

        const fetchAdminData = async () => {
            try {
                // Fetch All Profiles
                const { data: profs, error: profError, count: userCount } = await (supabase as any)
                    .from('profiles')
                    .select('*', { count: 'exact' })
                    .order('created_at', { ascending: false });

                if (profError) throw profError;
                setProfiles(profs || []);

                // Fetch Recent Activity Logs
                const { data: logs, error: logsError } = await (supabase as any)
                    .from('analysis_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (logsError) throw logsError;

                const l = logs as any[] || [];
                setRecentLogs(l);

                setStats({
                    totalRegistered: userCount || 0,
                    activeUsers: new Set(l.map(u => u.user_id)).size,
                    totalScans: l.length,
                    fraudDetected: l.filter(f => (f.risk_level === 'FRAUD' || f.risk_level === 'HIGH')).length,
                    suspicious: l.filter(s => s.risk_level === 'SUSPICIOUS').length
                });

            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setContentLoading(false);
            }
        };

        fetchAdminData();
    }, [isAdmin]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="container px-4 py-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Admin Control Center</h1>
                <p className="text-muted-foreground">Regulate platform users and monitor global threat intelligence.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRegistered}</div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalScans}</div>
                    </CardContent>
                </Card>
                <Card className="bg-destructive/5 border-destructive/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fraud Blocked</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{stats.fraudDetected}</div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">Optimal</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage all registered platform accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {contentLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {profiles.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium text-xs truncate max-w-[150px]">
                                                {p.email}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(new Date(p.created_at), "MMM d, yy")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {p.email !== 'shreyashsr2004@gmail.com' && (
                                                    <button
                                                        onClick={() => deleteUser(p.id)}
                                                        className="text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors"
                                                        title="Remove User"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Global Activity Feed</CardTitle>
                        <CardDescription>Live stream of all user analysis requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {contentLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Risk</TableHead>
                                        <TableHead>Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-[9px] text-muted-foreground">
                                                {log.user_id?.substring(0, 5)}...
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] uppercase h-5">{log.fraud_type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    log.risk_level === 'FRAUD' || log.risk_level === 'HIGH'
                                                        ? "destructive"
                                                        : log.risk_level === 'SUSPICIOUS'
                                                            ? "secondary"
                                                            : "outline"
                                                } className="text-[10px] h-5">
                                                    {log.risk_level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-[10px] text-muted-foreground">
                                                {log.created_at ? format(new Date(log.created_at), "HH:mm") : ""}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Admin;
