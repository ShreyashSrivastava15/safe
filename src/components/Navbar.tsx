import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, History, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
    const location = useLocation();
    const { user, signOut, isAdmin } = useAuth();

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex">
                    <Link to="/" className="mr-6 flex items-center space-x-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="font-bold inline-block">S.A.F.E.</span>
                    </Link>
                    {user && (
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <Link
                                to="/dashboard"
                                className={`transition-colors hover:text-foreground/80 ${isActive("/dashboard") ? "text-foreground" : "text-foreground/60"}`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/fraud-coverage"
                                className={`transition-colors hover:text-foreground/80 ${isActive("/fraud-coverage") ? "text-foreground" : "text-foreground/60"}`}
                            >
                                Fraud Coverage
                            </Link>
                            <Link
                                to="/history"
                                className={`transition-colors hover:text-foreground/80 ${isActive("/history") ? "text-foreground" : "text-foreground/60"}`}
                            >
                                History
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className={`transition-colors hover:text-foreground/80 ${isActive("/admin") ? "text-foreground" : "text-foreground/60"}`}
                                >
                                    Admin
                                </Link>
                            )}
                        </nav>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {user ? (
                        <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    ) : (
                        <Link to="/auth">
                            <Button size="sm">Sign In / Register</Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
