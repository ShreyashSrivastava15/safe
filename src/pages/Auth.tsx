import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Bypass Supabase and go straight to dashboard for production-ready frontend demo
        setTimeout(() => {
            setIsLoading(false);
            navigate("/dashboard");
        }, 800);
    };

    const handleResendVerification = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/verified`,
                }
            });
            if (error) throw error;
            toast({
                title: "Email Sent",
                description: "Verification link has been resent to your email.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full space-y-8 p-8 border rounded-xl bg-card shadow-lg">
                <div className="flex flex-col items-center">
                    <Shield className="h-12 w-12 text-primary mb-4" />
                    <h2 className="text-2xl font-bold text-center">
                        {isSignUp ? "Create a S.A.F.E. Account" : "Sign in to S.A.F.E."}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                        Secure your digital life with advanced threat detection.
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    {!showResend ? (
                        <>

                            <form className="space-y-6" onSubmit={handleAuth}>
                                <div className="space-y-4">
                                    <Input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading
                                        ? "Processing..."
                                        : isSignUp
                                            ? "Register"
                                            : "Sign In"}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="space-y-4 text-center animate-fade-in">
                            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                                <p className="text-sm text-foreground">
                                    A verification link was sent to <span className="font-bold">{email}</span>. Please click the link in your inbox.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleResendVerification}
                                disabled={isLoading}
                            >
                                {isLoading ? "Resending..." : "Resend Verification Email"}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => setShowResend(false)}
                            >
                                Back to Sign In
                            </Button>
                        </div>
                    )}
                </div>

                {!showResend && (
                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-primary hover:underline"
                        >
                            {isSignUp
                                ? "Already have an account? Sign in"
                                : "Need an account? Register"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
