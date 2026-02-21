import AnalyzeView from "@/components/AnalyzeView";
import { CreditCard } from "lucide-react";

export default function AnalyzeTransaction() {
    return (
        <AnalyzeView
            fraud_type="transaction"
            title="Financial Fraud Analysis"
            description="Evaluate transaction anomalies and geographic shifts for early fraud detection."
            icon={<CreditCard className="h-12 w-12 text-yellow-500" />}
        />
    );
}
