export interface FraudCategory {
    id: string;
    name: string;
    description: string;
    supportedTypes: string[];
    detectionApproach: string;
    exampleSignals: string[];
    detectionType: "Real-time" | "Pattern-based" | "Hybrid";
    icon?: string;
}

export const fraudCategories: FraudCategory[] = [
    {
        id: "email-communication",
        name: "Email & Communication Frauds",
        description: "Detection of malicious intent, spear-phishing, and structural communication patterns using Transformer models.",
        supportedTypes: [
            "Email Phishing",
            "Spear Phishing",
            "Business Email Compromise (BEC)",
            "Email Spoofing",
            "Fake Invoice Emails",
            "Scam Promotional Emails"
        ],
        detectionApproach: "NLP + Sentiment Analysis",
        exampleSignals: [
            "Urgent/Time-pressure language",
            "Sender-receiver mismatch",
            "Financial intent triggers",
            "Suspicious attachment context"
        ],
        detectionType: "Real-time",
        icon: "Mail"
    },
    {
        id: "message-based",
        name: "SMS & Messaging (Smishing)",
        description: "Protection against smishing and mobile-first social engineering across SMS and instant messaging platforms.",
        supportedTypes: [
            "SMS Phishing (Smishing)",
            "OTP Scam Messages",
            "Missed Call Scam Messages",
            "Fake Alert / Bank Warnings",
            "WhatsApp / Telegram Scams"
        ],
        detectionApproach: "NLP Intent Recognition",
        exampleSignals: [
            "Suspicious OTP request context",
            "Shortened malicious links",
            "Impersonation of bank entities",
            "High-pressure call-to-action"
        ],
        detectionType: "Real-time",
        icon: "MessageSquare"
    },
    {
        id: "phishing-urls",
        name: "Phishing & Malicious URLs",
        description: "Advanced analysis of 30+ domain features and real-time WHOIS metadata to identify deceptive links.",
        supportedTypes: [
            "Phishing Websites",
            "Fake Login Pages",
            "Fake Shopping Websites",
            "Shortened / Obfuscated URLs",
            "Newly Registered Domains"
        ],
        detectionApproach: "ML Feature Intelligence",
        exampleSignals: [
            "Homograph domain characters",
            "Low domain age (WHOIS)",
            "High entropy in path names",
            "Suspicious TLD (e.g., .xyz, .top)"
        ],
        detectionType: "Real-time",
        icon: "Link2"
    },
    {
        id: "e-commerce",
        name: "E-Commerce & Consumer Scams",
        description: "Identifying fraudulent marketplace activities, fake storefronts, and deceptive consumer traps.",
        supportedTypes: [
            "Non-Delivery Scams",
            "Fake Marketplace Sellers",
            "Refund & Return Abuse",
            "Subscription Trap Scams",
            "Phony Giveaway Frauds"
        ],
        detectionApproach: "Multi-Modal Engine Consensus",
        exampleSignals: [
            "Extremely low prices",
            "No contact info on seller page",
            "Requests for off-platform pay",
            "Misleading return policies"
        ],
        detectionType: "Hybrid",
        icon: "ShoppingCart"
    }
];
