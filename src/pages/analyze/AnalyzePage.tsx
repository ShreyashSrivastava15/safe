import { useSearchParams, useParams, Navigate } from "react-router-dom";
import { Mail, Link as LinkIcon, CreditCard, ShoppingCart, Loader2, MessageSquare } from "lucide-react";
import AnalyzeView from "@/components/AnalyzeView";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalyzePage() {
    const { category: pathCategory } = useParams<{ category: string }>();
    const [searchParams] = useSearchParams();
    const { user, isLoading } = useAuth();

    // Redirect if not logged in
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Get analysis type from path or query param
    const category = pathCategory || searchParams.get('category') || 'email';
    console.log("AnalyzePage Trace V2:", { pathCategory, category, searchParam: searchParams.get('category') });

    // Simple mapping to normalized types
    const getScannerConfig = () => {
        if (category === 'message-based' || category === 'message' || category.includes('sms')) {
            return {
                type: 'message' as const,
                title: 'SMS / Messaging Risk',
                description: 'Verify suspicious text messages and instant communication for mobile fraud.',
                icon: <MessageSquare className="h-12 w-12 text-green-500" />
            };
        }
        if (category.includes('email') || category.includes('communication')) {
            return {
                type: 'email' as const,
                title: 'Email / Communication Risk',
                description: 'Analyze messages for social engineering, urgency, and manipulative patterns.',
                icon: <Mail className="h-12 w-12 text-blue-500" />
            };
        }
        if (category.includes('url') || category.includes('phishing')) {
            return {
                type: 'url' as const,
                title: 'Malicious URL Intelligence',
                description: 'Analyze domain features, TLD reputation, and homograph threats.',
                icon: <LinkIcon className="h-12 w-12 text-yellow-500" />
            };
        }
        if (category.includes('transaction')) {
            return {
                type: 'transaction' as const,
                title: 'Financial Fraud Analysis',
                description: 'Evaluate transaction anomalies and geographic shifts.',
                icon: <CreditCard className="h-12 w-12 text-green-500" />
            };
        }
        if (category.includes('ecommerce') || category.includes('shop')) {
            return {
                type: 'ecommerce' as const,
                title: 'E-commerce Scam Scanner',
                description: 'Verify fake deals and suspicious storefront URLs.',
                icon: <ShoppingCart className="h-12 w-12 text-purple-500" />
            };
        }

        // Default to email
        return {
            type: 'email' as const,
            title: 'S.A.F.E. Analysis',
            description: 'Run comprehensive risk analysis on the provided input.',
            icon: <Mail className="h-12 w-12 text-blue-500" />
        };
    };

    const config = getScannerConfig();
    console.log("Rendering AnalyzeView with config:", config.type);

    if (!config) {
        console.error("Critical: getScannerConfig returned undefined!");
        return <div>Error: Could not determine scanner type.</div>;
    }

    return (
        <div key={config.type} className="animate-in fade-in duration-500">
            <AnalyzeView
                fraud_type={config.type}
                title={config.title}
                description={config.description}
                icon={config.icon}
            />
        </div>
    );
}
