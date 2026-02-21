import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function PrivateRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Require email verification flow
    if (!user.email_confirmed_at) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center p-8 bg-card rounded-xl border max-w-md w-full shadow-lg">
                    <h2 className="text-2xl font-bold text-destructive mb-2">Verification Required</h2>
                    <p className="text-muted-foreground">
                        Please verify your email address before accessing to the S.A.F.E. platform. Check your inbox.
                    </p>
                </div>
            </div>
        );
    }

    return <Outlet />;
}
