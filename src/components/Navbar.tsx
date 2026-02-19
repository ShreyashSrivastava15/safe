import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, History, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <Link to="/" className="mr-6 flex items-center space-x-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="font-bold inline-block">S.A.F.E.</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            to="/dashboard"
                            className={`transition-colors hover:text-foreground/80 ${isActive("/dashboard") ? "text-foreground" : "text-foreground/60"}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/analyze"
                            className={`transition-colors hover:text-foreground/80 ${isActive("/analyze") ? "text-foreground" : "text-foreground/60"}`}
                        >
                            Analyze
                        </Link>
                        <Link
                            to="/history"
                            className={`transition-colors hover:text-foreground/80 ${isActive("/history") ? "text-foreground" : "text-foreground/60"}`}
                        >
                            History
                        </Link>
                    </nav>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                    {/* User profile or other actions */}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
