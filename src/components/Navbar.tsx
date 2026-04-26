import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, History, Menu, LogOut, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
    const location = useLocation();
    const { user, signOut, isAdmin } = useAuth();

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-white/5 supports-[backdrop-filter]:bg-background/20">
            <div className="container flex h-20 items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-all">
                            <Shield className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tighter text-white leading-none">S.A.F.E.</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary leading-none mt-1">V2 Intelligence</span>
                        </div>
                    </Link>
                    
                    {user && (
                        <nav className="hidden md:flex items-center space-x-1">
                            {[
                                { path: "/dashboard", label: "Console", icon: LayoutDashboard },
                                { path: "/fraud-coverage", label: "Intelligence", icon: Search },
                                { path: "/history", label: "Archive", icon: History },
                            ].map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        isActive(item.path) 
                                        ? "bg-white/5 text-primary shadow-[inset_0_0_10px_rgba(34,211,238,0.1)] border border-white/5" 
                                        : "text-slate-500 hover:text-white hover:bg-white/[0.02]"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        isActive("/admin") 
                                        ? "bg-white/5 text-primary" 
                                        : "text-slate-500 hover:text-white hover:bg-white/[0.02]"
                                    }`}
                                >
                                    Admin
                                </Link>
                            )}
                        </nav>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-500 hover:text-white hover:bg-white/5">
                                <Bell className="h-5 w-5" />
                            </Button>
                            <div className="h-8 w-px bg-white/5" />
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={signOut} 
                                className="h-10 px-4 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5"
                            >
                                <LogOut className="h-4 w-4" />
                                Disconnect
                            </Button>
                        </div>
                    ) : (
                        <Link to="/auth">
                            <Button size="sm" className="h-10 px-6 rounded-xl bg-primary text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                Access Secure Node
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
