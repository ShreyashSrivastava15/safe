import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, Activity, Loader2, Mail, Link as LinkIcon, CreditCard, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        safe: 0,
        suspicious: 0,
        fraudulent: 0,
        total: 0
    });
    const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch stats scoped to user
                const { data: logs, error } = await (supabase as any)
                    .from('analysis_logs')
                    .select('verdict, risk_level, created_at, message, url')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (error) throw error;

                const safe = logs.filter((l: any) => l.verdict === 'SAFE').length;
                const suspicious = logs.filter((l: any) => l.verdict === 'SUSPICIOUS').length;
                const fraudulent = logs.filter((l: any) => l.verdict === 'FRAUDULENT').length;

                setStats({
                    safe,
                    suspicious,
                    fraudulent,
                    total: logs.length
                });

                // Get high risk alerts
                const alerts = logs.filter((l: any) => l.risk_level === 'FRAUD' || l.risk_level === 'SUSPICIOUS').slice(0, 5);
                setRecentAlerts(alerts);

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const channel = supabase
            .channel('dashboard_updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analysis_logs' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container px-4 py-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.email}. Supervise your threat detection network.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link to="/analyze/email">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-500/20 bg-blue-500/5">
                        <CardHeader className="pb-2">
                            <Mail className="h-8 w-8 text-blue-500 mb-2" />
                            <CardTitle>Email & Comms</CardTitle>
                            <CardDescription>Analyze messages for phishing</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link to="/analyze/url">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-500/20 bg-green-500/5">
                        <CardHeader className="pb-2">
                            <LinkIcon className="h-8 w-8 text-green-500 mb-2" />
                            <CardTitle>URL Intelligence</CardTitle>
                            <CardDescription>Detect malicious links</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link to="/analyze/transaction">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-yellow-500/20 bg-yellow-500/5">
                        <CardHeader className="pb-2">
                            <CreditCard className="h-8 w-8 text-yellow-500 mb-2" />
                            <CardTitle>Financial Fraud</CardTitle>
                            <CardDescription>Detect transaction anomalies</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link to="/analyze/ecommerce">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-500/20 bg-purple-500/5">
                        <CardHeader className="pb-2">
                            <ShoppingCart className="h-8 w-8 text-purple-500 mb-2" />
                            <CardTitle>E-Commerce</CardTitle>
                            <CardDescription>Identify scam storefronts</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Safe Entities</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.safe}</div>
                        <p className="text-xs text-muted-foreground">in your last 100 scans</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suspicious / Fraud</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.suspicious + stats.fraudulent}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.fraudulent} Confirmed Fraud
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Your Activity</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Total personal records analyzed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 transition-all hover:shadow-md">
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground space-y-2 flex-col">
                            <Activity className="h-10 w-10 opacity-20" />
                            <p>Analysis Engine is Online</p>
                            <div className="flex gap-4 text-xs">
                                <span>NLP: Active</span>
                                <span>URL: Active</span>
                                <span>Transaction: Active</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 transition-all hover:shadow-md">
                    <CardHeader>
                        <CardTitle>Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentAlerts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No high-risk alerts recently.</p>
                            ) : (
                                recentAlerts.map((alert, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="text-sm font-medium leading-none truncate w-[200px]">
                                                {alert.message ? "Message Content" : alert.url ? "Malicious URL" : "Transaction"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <div className={`ml-auto font-medium text-xs px-2 py-1 rounded-full ${alert.risk_level === 'FRAUD' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                                            }`}>
                                            {alert.risk_level === 'FRAUD' ? 'FRAUD' : 'SUSPICIOUS'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
