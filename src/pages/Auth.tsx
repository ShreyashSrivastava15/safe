import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const endpoint = isSignUp ? '/auth/register' : '/auth/login';
        const fullUrl = `${API_URL}${endpoint}`;
        
        console.log(`Attempting auth at: ${fullUrl}`);

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            if (isSignUp) {
                signUp(data.token, data.user);
                toast({
                    title: "Registration Successful!",
                    description: "Your account has been created and you are now signed in.",
                });
            } else {
                signIn(data.token, data.user);
                toast({
                    title: "Welcome Back!",
                    description: "Successfully signed in.",
                });
            }

            navigate("/dashboard");
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
                    <form className="space-y-6" onSubmit={handleAuth}>
                        <div className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading
                                ? "Processing..."
                                : isSignUp
                                    ? "Register"
                                    : "Sign In"}
                        </Button>
                    </form>
                </div>

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
            </div>
        </div>
    );
}
