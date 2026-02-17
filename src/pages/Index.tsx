import { useState } from "react";
import { MessageSquare, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import AnalysisForm from "@/components/AnalysisForm";
import RiskMeter from "@/components/RiskMeter";
import ResultCard, { type ModuleResult } from "@/components/ResultCard";

interface AnalysisResult {
  text_score?: number;
  text_reasons?: string[];
  url_score?: number;
  url_reasons?: string[];
  final_score: number;
  verdict: string;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (data: { message: string; url: string }) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data: res, error } = await supabase.functions.invoke("analyze", {
        body: { message: data.message, url: data.url },
      });

      if (error) throw error;
      if (res?.error) {
        toast({ title: "Analysis Error", description: res.error, variant: "destructive" });
        return;
      }

      setResult(res as AnalysisResult);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to analyze. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const modules: ModuleResult[] = [];
  if (result?.text_score !== undefined) {
    modules.push({
      score: result.text_score,
      reasons: result.text_reasons || [],
      label: "Message Analysis (NLP)",
      icon: <MessageSquare className="h-4 w-4" />,
    });
  }
  if (result?.url_score !== undefined) {
    modules.push({
      score: result.url_score,
      reasons: result.url_reasons || [],
      label: "URL Analysis (Heuristic)",
      icon: <Link className="h-4 w-4" />,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <main className="mx-auto max-w-3xl px-4 pb-20">
        {/* Analysis Form */}
        <div className="flex flex-col items-center">
          <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Results */}
        {result && (
          <div className="mt-12 space-y-8 animate-fade-in">
            {/* Final Score */}
            <div className="flex flex-col items-center">
              <h2 className="mb-1 text-sm font-mono text-muted-foreground tracking-widest uppercase">
                Fusion Verdict
              </h2>
              <div className="relative flex items-center justify-center">
                <RiskMeter score={result.final_score} />
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground max-w-md">
                {result.verdict === "Fraudulent" && "⚠️ HIGH RISK — This content exhibits strong indicators of fraud. Do not interact."}
                {result.verdict === "Suspicious" && "⚡ CAUTION — Some suspicious patterns detected. Proceed with care."}
                {result.verdict === "Safe" && "✅ LOW RISK — No significant threat indicators found."}
              </p>
            </div>

            {/* Module Breakdown */}
            {modules.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                  Module Breakdown
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {modules.map((m) => (
                    <ResultCard key={m.label} module={m} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
