import { Shield, Zap, Brain } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pb-8 pt-20 text-center">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative z-10 mx-auto max-w-3xl px-4">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-mono text-primary animate-fade-in">
          <Shield className="h-3.5 w-3.5" />
          SCAM ANALYSIS & FRAUD EVALUATION
        </div>

        {/* Title */}
        <h1 className="mb-4 text-5xl font-black tracking-tight md:text-6xl lg:text-7xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <span className="text-gradient-primary">S.A.F.E.</span>
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
          AI-powered multi-modal fraud detection. Paste a suspicious message or URL and get instant risk analysis using correlated threat intelligence.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {[
            { icon: <Brain className="h-4 w-4" />, label: "NLP Scam Detection" },
            { icon: <Shield className="h-4 w-4" />, label: "URL Phishing Analysis" },
            { icon: <Zap className="h-4 w-4" />, label: "Weighted Fusion Engine" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground"
            >
              <span className="text-primary">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
