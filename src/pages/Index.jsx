import { useState } from "react";
import { MessageSquare, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection.jsx";
import AnalysisForm from "@/components/AnalysisForm.jsx";
import RiskMeter from "@/components/RiskMeter.jsx";
import ResultCard from "@/components/ResultCard.jsx";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const handleAnalyze = async (data) => {
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

      setResult(res);
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to analyze. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const modules = [];
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
        <div className="flex flex-col items-center">
          <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {result && (
          <div className="mt-12 space-y-8 animate-fade-in">
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
