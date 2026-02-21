import AnalyzeView from "@/components/AnalyzeView";
import { Link } from "lucide-react";

export default function AnalyzeUrl() {
    return (
        <AnalyzeView
            fraud_type="url"
            title="URL Intelligence"
            description="Detect phishing links, domain spoofing, and malicious websites."
            icon={<Link className="h-12 w-12 text-green-500" />}
        />
    );
}
