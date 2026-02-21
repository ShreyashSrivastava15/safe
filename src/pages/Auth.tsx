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

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/verified`,
                    }
                });
                if (error) throw error;
                setShowResend(true);
                toast({
                    title: "Registration successful!",
                    description: "Please check your email to verify your account.",
                });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate("/dashboard");
            }
        } catch (error: any) {
            toast({
                title: "Authentication Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
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

    const handleGoogleAuth = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                    scopes: 'https://www.googleapis.com/auth/gmail.readonly',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });
            if (error) throw error;
        } catch (error: any) {
            toast({
                title: "Authentication Error",
                description: error.message,
                variant: "destructive",
            });
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
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full relative"
                                onClick={handleGoogleAuth}
                            >
                                <svg className="w-5 h-5 mr-2 absolute left-4" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                    <path fill="none" d="M1 1h22v22H1z" />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

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
