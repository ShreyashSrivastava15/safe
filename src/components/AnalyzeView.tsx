import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { analyzeRisk, AnalysisResponse, AnalysisRequest } from "@/services/api";
import { Shield, Link, MessageSquare, CreditCard, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ResultCard from "@/components/ResultCard";
import RiskMeter from "@/components/RiskMeter";

interface AnalyzeViewProps {
    fraud_type: 'email' | 'url' | 'transaction' | 'ecommerce';
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function AnalyzeView({ fraud_type, title, description, icon }: AnalyzeViewProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResponse | null>(null);

    const [message, setMessage] = useState("");
    const [url, setUrl] = useState("");
    const [amount, setAmount] = useState("");
    const [country, setCountry] = useState("");

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        try {
            const data: AnalysisRequest = {
                fraud_type,
            };

            if (fraud_type === 'email' || fraud_type === 'ecommerce') {
                data.message = message;
            }
            if (fraud_type === 'url' || fraud_type === 'ecommerce') {
                data.url = url;
            }
            if (fraud_type === 'transaction') {
                data.transaction = {
                    amount: parseFloat(amount) || 0,
                    country: country || "US",
                    timestamp: new Date().toISOString(),
                };
            }

            const response = await analyzeRisk(data);
            setResult(response);

            toast({
                title: "Analysis Complete",
                description: `S.A.F.E. risk score generated: ${response.final_score * 100}/100`,
            });
        } catch (error: any) {
            toast({
                title: "Analysis Failed",
                description: error.message || "Failed to analyze risk.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const modules = result ? [
        ...(result.scores.nlp !== undefined ? [{
            score: result.scores.nlp,
            reasons: result.signals.filter(s => s.startsWith('[Comm]')).map(s => s.replace('[Comm] ', '')),
            label: "Communication Analysis",
            icon: <MessageSquare className="h-4 w-4" />,
            id: 'comm'
        }] : []),
        ...(result.scores.url !== undefined ? [{
            score: result.scores.url,
            reasons: result.signals.filter(s => s.startsWith('[URL]')).map(s => s.replace('[URL] ', '')),
            label: "URL Intelligence",
            icon: <Link className="h-4 w-4" />,
            id: 'url'
        }] : []),
        ...(result.scores.transaction !== undefined ? [{
            score: result.scores.transaction,
            reasons: result.signals.filter(s => s.startsWith('[TX]')).map(s => s.replace('[TX] ', '')),
            label: "Transaction Behavior",
            icon: <CreditCard className="h-4 w-4" />,
            id: 'tx'
        }] : [])
    ] : [];

    return (
        <div className="container px-4 py-8 animate-fade-in max-w-4xl mx-auto">
            <div className="mb-8 text-center space-y-2">
                <div className="flex justify-center mb-4">{icon}</div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            <div className="flex flex-col items-center gap-12">
                <form onSubmit={handleAnalyze} className="w-full max-w-2xl space-y-6 animate-fade-in">
                    <div className="space-y-4">
                        {(fraud_type === 'email' || fraud_type === 'ecommerce') && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    Suspicious Message / Content
                                </Label>
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder='Paste suspicious content here...'
                                    className="min-h-[100px] resize-none border-border bg-card/50 font-mono text-sm"
                                    required
                                />
                            </div>
                        )}

                        {(fraud_type === 'url' || fraud_type === 'ecommerce') && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Link className="h-4 w-4 text-primary" />
                                    URL to Verify
                                </Label>
                                <Input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="border-border bg-card/50 font-mono text-sm"
                                    required
                                />
                            </div>
                        )}

                        {fraud_type === 'transaction' && (
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
                                        required
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
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
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
                                Run S.A.F.E. Analysis
                            </>
                        )}
                    </Button>
                </form>

                {result && (
                    <div className="w-full space-y-8 animate-slide-in-bottom">
                        <div className="p-6 rounded-2xl bg-card border shadow-sm flex flex-col items-center text-center">
                            <h2 className="mb-6 text-sm font-mono text-muted-foreground tracking-widest uppercase">
                                Aggregated Verdict
                            </h2>
                            <RiskMeter score={result.final_score} />
                            <div className="mt-6 space-y-3 max-w-2xl">
                                <div>
                                    <h3 className="text-2xl font-bold">{result.verdict}</h3>
                                    <p className="text-muted-foreground">
                                        Risk Score: {Math.round(result.final_score * 100)}/100
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg text-sm italic">
                                    {result.explanation}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 justify-center">
                            {modules.map((m) => (
                                <ResultCard key={m.label} module={m} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
