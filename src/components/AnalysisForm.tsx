import { useState } from "react";
import { Shield, Link, MessageSquare, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnalysisData {
    message: string;
    url: string;
    transaction: {
        amount: number;
        country: string;
        timestamp: string;
    };
}

interface AnalysisFormProps {
    onAnalyze: (data: AnalysisData) => void;
    isLoading: boolean;
}

const AnalysisForm = ({ onAnalyze, isLoading }: AnalysisFormProps) => {
    const [message, setMessage] = useState("");
    const [url, setUrl] = useState("");
    const [amount, setAmount] = useState("");
    const [country, setCountry] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAnalyze({
            message,
            url,
            transaction: {
                amount: parseFloat(amount) || 0,
                country: country || "US",
                timestamp: new Date().toISOString(),
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6 animate-fade-in">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Suspicious Message
                    </Label>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder='Paste a suspicious SMS, email, or chat message here...'
                        className="min-h-[100px] resize-none border-border bg-card/50 font-mono text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Link className="h-4 w-4 text-primary" />
                        Suspicious URL
                    </Label>
                    <Input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://suspicious-link-example.com"
                        className="border-border bg-card/50 font-mono text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <CreditCard className="h-4 w-4 text-primary" />
                            Transaction Amount
                        </Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="border-border bg-card/50 font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                            Country Code
                        </Label>
                        <Input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value.toUpperCase())}
                            placeholder="US, IN, NG..."
                            maxLength={2}
                            className="border-border bg-card/50 font-mono text-sm"
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading || (!message && !url && !amount)}
                className="w-full gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
                size="lg"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Shield className="h-5 w-5" />
                        Runs S.A.F.E. Analysis
                    </>
                )}
            </Button>
        </form>
    );
};

export default AnalysisForm;
