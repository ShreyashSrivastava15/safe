console.log("S.A.F.E. App Initializing...");
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import FraudCoverage from "@/pages/FraudCoverage";
import FraudCategoryDetail from "@/pages/FraudCategoryDetail";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import Auth from "@/pages/Auth";
import Verified from "@/pages/Verified";
import Admin from "@/pages/Admin";
import AnalyzePage from "@/pages/analyze/AnalyzePage";

const queryClient = new QueryClient();


const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background">{children}</main>
    </div>
);

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <AuthProvider>
                    <Layout>
                        <Routes>
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/verified" element={<Verified />} />
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/fraud-coverage" element={<FraudCoverage />} />
                            <Route path="/fraud-coverage/:id" element={<FraudCategoryDetail />} />
                            <Route path="/analyze/:category?" element={<AnalyzePage />} />
                            <Route element={<PrivateRoute />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/history" element={<History />} />
                            </Route>
                            <Route path="*" element={
                                <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
                                    <h1 className="text-4xl font-bold mb-4">404: Route Not Found</h1>
                                    <p className="text-muted-foreground mb-8">The scanner route you are looking for might have moved.</p>
                                    <Button asChild>
                                        <Link to="/dashboard">Return to Dashboard</Link>
                                    </Button>
                                </div>
                            } />
                        </Routes>
                    </Layout>
                </AuthProvider>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
