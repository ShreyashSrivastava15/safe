import { useSearchParams, useParams } from "react-router-dom";
import { Mail, Link as LinkIcon, CreditCard, ShoppingCart } from "lucide-react";
import AnalyzeView from "@/components/AnalyzeView";

export default function AnalyzePage() {
    const { type } = useParams<{ type: string }>();
    const [searchParams] = useSearchParams();

    // Get analysis type from path or query param
    const category = type || searchParams.get('category') || 'email';

    // Simple mapping to normalized types
    const getScannerConfig = () => {
        if (category.includes('email') || category.includes('communication') || category.includes('message')) {
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
