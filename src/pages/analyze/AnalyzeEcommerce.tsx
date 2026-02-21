import AnalyzeView from "@/components/AnalyzeView";
import { ShoppingCart } from "lucide-react";

export default function AnalyzeEcommerce() {
    return (
        <AnalyzeView
            fraud_type="ecommerce"
            title="E-commerce Scams"
            description="Verify fake deals and suspicious storefront URLs simultaneously."
            icon={<ShoppingCart className="h-12 w-12 text-purple-500" />}
        />
    );
}
