import { useState } from "react";
import { Shield, Link, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const AnalysisForm = ({ onAnalyze, isLoading }) => {
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() && !url.trim()) return;
    onAnalyze({ message, url });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-5">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="h-4 w-4 text-primary" />
          Suspicious Message
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Paste a suspicious SMS, email, or chat message here...\n\nExample: "Your account has been blocked. Click here to verify your identity immediately."'
          className="min-h-[120px] resize-none border-border bg-card font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Link className="h-4 w-4 text-primary" />
          Suspicious URL
        </label>
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://suspicious-link-example.com/login"
          className="border-border bg-card font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || (!message.trim() && !url.trim())}
        className="w-full gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90 glow-primary transition-all duration-300"
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
            Analyze for Threats
          </>
        )}
      </Button>
    </form>
  );
};

export default AnalysisForm;
