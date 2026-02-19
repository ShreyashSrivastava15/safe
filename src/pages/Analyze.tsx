import { useState } from "react";
import { MessageSquare, Link, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AnalysisForm from "@/components/AnalysisForm";
import RiskMeter from "@/components/RiskMeter";
import ResultCard from "@/components/ResultCard";
import { analyzeRisk, AnalysisRequest, AnalysisResponse } from "@/services/api";

const Analyze = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const { toast } = useToast();

    const handleAnalyze = async (data: AnalysisRequest) => {
        setIsLoading(true);
        setResult(null);

        try {
            const res = await analyzeRisk(data);
            setResult(res);

            toast({
                title: "Analysis Complete",
                description: `Risk Level: ${res.risk_level}`,
                variant: res.risk_level === "HIGH" ? "destructive" : "default",
            });

        } catch (err: any) {
            toast({
                title: "Analysis Failed",
                description: err.message || "Could not connect to S.A.F.E. server.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const modules = result ? [
        {
            score: result.scores.nlp,
            reasons: [], // Server can provide reasons later
            label: "NLP / Text Analysis",
            icon: <MessageSquare className="h-4 w-4" />,
        },
        {
            score: result.scores.url,
            reasons: [],
            label: "URL Heuristics",
            icon: <Link className="h-4 w-4" />,
        },
        {
            score: result.scores.transaction,
            reasons: [],
            label: "Transaction Anomaly",
            icon: <CreditCard className="h-4 w-4" />,
        }
    ] : [];

    return (
        <div className="container px-4 py-8 animate-fade-in max-w-4xl mx-auto">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">S.A.F.E. Analysis Engine</h1>
                <p className="text-muted-foreground">
                    Enter suspicious details below to run a multi-modal fraud analysis.
                </p>
            </div>

            <div className="flex flex-col items-center gap-12">
                <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} />

                {result && (
                    <div className="w-full space-y-8 animate-slide-in-bottom">
                        <div className="p-6 rounded-2xl bg-card border shadow-sm flex flex-col items-center text-center">
                            <h2 className="mb-6 text-sm font-mono text-muted-foreground tracking-widest uppercase">
                                Aggregated Verdict
                            </h2>
                            <RiskMeter score={result.final_score} />
                            <div className="mt-6 space-y-1">
                                <h3 className="text-2xl font-bold">{result.verdict}</h3>
                                <p className="text-muted-foreground">
                                    Confidence Score: {Math.round(result.final_score * 100)}/100
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {modules.map((m) => (
                                <ResultCard key={m.label} module={m} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analyze;
