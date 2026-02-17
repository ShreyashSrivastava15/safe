import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// URL heuristic analysis
function analyzeUrlHeuristics(url: string): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;

    // Suspicious TLDs
    const suspiciousTlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".work", ".click", ".buzz"];
    if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
      score += 0.25;
      reasons.push("Uses suspicious top-level domain");
    }

    // Excessive subdomains
    const subdomainCount = domain.split(".").length - 2;
    if (subdomainCount > 2) {
      score += 0.15;
      reasons.push("Excessive subdomains detected");
    }

    // IP address instead of domain
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) {
      score += 0.3;
      reasons.push("Uses IP address instead of domain name");
    }

    // Very long domain
    if (domain.length > 30) {
      score += 0.1;
      reasons.push("Unusually long domain name");
    }

    // Suspicious keywords in URL
    const suspiciousKeywords = ["login", "verify", "secure", "account", "update", "confirm", "banking", "paypal", "signin", "password"];
    const urlLower = url.toLowerCase();
    const foundKeywords = suspiciousKeywords.filter(kw => urlLower.includes(kw));
    if (foundKeywords.length > 0) {
      score += 0.15 * Math.min(foundKeywords.length, 3);
      reasons.push(`Contains suspicious keywords: ${foundKeywords.join(", ")}`);
    }

    // Special characters in domain
    if (/[-]{2,}/.test(domain) || domain.includes("_")) {
      score += 0.1;
      reasons.push("Unusual characters in domain");
    }

    // No HTTPS
    if (parsed.protocol !== "https:") {
      score += 0.15;
      reasons.push("Not using HTTPS encryption");
    }

    // URL shortener detection
    const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd"];
    if (shorteners.some(s => domain.includes(s))) {
      score += 0.2;
      reasons.push("URL shortener detected — may hide true destination");
    }

    // @ symbol in URL (credential phishing)
    if (url.includes("@")) {
      score += 0.3;
      reasons.push("Contains @ symbol — possible credential phishing");
    }

  } catch {
    score = 0.5;
    reasons.push("Invalid URL format");
  }

  return { score: Math.min(score, 1), reasons };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, url } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const results: {
      text_score?: number;
      text_reasons?: string[];
      url_score?: number;
      url_reasons?: string[];
      final_score: number;
      verdict: string;
    } = { final_score: 0, verdict: "Safe" };

    let textScore = 0;
    let urlScore = 0;
    let hasText = false;
    let hasUrl = false;

    // Analyze URL with heuristics
    if (url && url.trim()) {
      hasUrl = true;
      const urlResult = analyzeUrlHeuristics(url.trim());
      urlScore = urlResult.score;
      results.url_score = urlResult.score;
      results.url_reasons = urlResult.reasons;
    }

    // Analyze text with AI
    if (message && message.trim()) {
      hasText = true;
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a scam/fraud detection AI. Analyze the given message and determine if it is a scam, phishing attempt, or legitimate message. 

You MUST respond using the suggest_analysis tool with:
- score: a number between 0.0 (completely safe) and 1.0 (definitely a scam)
- reasons: an array of specific reasons for your assessment

Consider these indicators of scams:
- Urgency/pressure tactics ("act now", "limited time")
- Authority impersonation (banks, government, tech companies)
- Requests for personal information or credentials
- Threats or fear-based language
- Too-good-to-be-true offers
- Grammar/spelling errors typical of scams
- Emotional manipulation
- Unsolicited contact about accounts or prizes`
            },
            { role: "user", content: message.trim() }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_analysis",
                description: "Return scam analysis results",
                parameters: {
                  type: "object",
                  properties: {
                    score: { type: "number", description: "Risk score between 0.0 and 1.0" },
                    reasons: {
                      type: "array",
                      items: { type: "string" },
                      description: "List of reasons for the risk assessment"
                    }
                  },
                  required: ["score", "reasons"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "suggest_analysis" } }
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        textScore = Math.max(0, Math.min(1, parsed.score || 0));
        results.text_score = textScore;
        results.text_reasons = parsed.reasons || [];
      }
    }

    // Weighted fusion
    if (hasText && hasUrl) {
      results.final_score = 0.5 * textScore + 0.5 * urlScore;
    } else if (hasText) {
      results.final_score = textScore;
    } else if (hasUrl) {
      results.final_score = urlScore;
    }

    // Verdict
    if (results.final_score >= 0.7) results.verdict = "Fraudulent";
    else if (results.final_score >= 0.4) results.verdict = "Suspicious";
    else results.verdict = "Safe";

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
