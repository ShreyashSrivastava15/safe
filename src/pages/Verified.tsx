import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield } from "lucide-react";

export default function Verified() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/dashboard");
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="max-w-md w-full text-center space-y-6 p-8 bg-card border rounded-2xl shadow-xl">
                <div className="flex justify-center">
                    <div className="bg-success/10 p-4 rounded-full">
                        <CheckCircle2 className="h-16 w-16 text-success" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Email Verified!</h1>
                    <p className="text-muted-foreground">
                        Your account is now fully secured and active. You can now access all S.A.F.E. detection engines.
                    </p>
                </div>

                <div className="pt-4">
                    <Link to="/dashboard">
                        <Button className="w-full gap-2 text-lg h-12 shadow-lg shadow-primary/20">
                            <Shield className="h-5 w-5" />
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-muted-foreground pt-4">
                    Redirecting you to the system command center...
                </p>
            </div>
        </div>
    );
}
