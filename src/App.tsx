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
import AnalyzeEmail from "@/pages/analyze/AnalyzeEmail";
import AnalyzeUrl from "@/pages/analyze/AnalyzeUrl";
import AnalyzeTransaction from "@/pages/analyze/AnalyzeTransaction";
import AnalyzeEcommerce from "@/pages/analyze/AnalyzeEcommerce";

const queryClient = new QueryClient();

const LegacyRedirect = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');

    switch (category) {
        case 'email-communication':
        case 'message-based':
            return <Navigate to="/analyze/email" replace />;
        case 'phishing-urls':
            return <Navigate to="/analyze/url" replace />;
        case 'e-commerce':
            return <Navigate to="/analyze/ecommerce" replace />;
        default:
            return <Navigate to="/fraud-coverage" replace />;
    }
};

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
                            <Route path="/analyze" element={<LegacyRedirect />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/fraud-coverage" element={<FraudCoverage />} />
                            <Route path="/fraud-coverage/:id" element={<FraudCategoryDetail />} />
                            <Route element={<PrivateRoute />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/analyze/email" element={<AnalyzeEmail />} />
                                <Route path="/analyze/url" element={<AnalyzeUrl />} />
                                <Route path="/analyze/transaction" element={<AnalyzeTransaction />} />
                                <Route path="/analyze/ecommerce" element={<AnalyzeEcommerce />} />
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
