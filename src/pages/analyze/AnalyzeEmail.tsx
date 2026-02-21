import AnalyzeView from "@/components/AnalyzeView";
import { Mail } from "lucide-react";

export default function AnalyzeEmail() {
    return (
        <AnalyzeView
            fraud_type="email"
            title="Email / Communication Risk"
            description="Analyze messages for social engineering, urgency, and manipulative patterns."
            icon={<Mail className="h-12 w-12 text-blue-500" />}
        />
    );
}
