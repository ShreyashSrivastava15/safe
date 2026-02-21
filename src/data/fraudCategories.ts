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
        description: "Detection of malicious intent within email correspondence and structural communication patterns.",
        supportedTypes: [
            "Email Phishing",
            "Spear Phishing",
            "Business Email Compromise (BEC)",
            "Email Spoofing",
            "Fake Invoice Emails",
            "Scam / Fraudulent Promotional Emails"
        ],
        detectionApproach: "NLP + Intent Analysis",
        exampleSignals: [
            "Urgent/Time-pressure language",
            "Sender-receiver mismatch",
            "Financial intent triggers",
            "Suspicious attachment context"
        ],
        detectionType: "Real-time"
    },
    {
        id: "message-based",
        name: "Message-Based Frauds (SMS / Chat)",
        description: "Protection against smishing and mobile-first social engineering across SMS and instant messaging platforms.",
        supportedTypes: [
            "SMS Phishing (Smishing)",
            "OTP Scam Messages",
            "Missed Call Scam Messages",
            "Fake Alert / Bank Warning Messages"
        ],
        detectionApproach: "NLP (shared pipeline with email)",
        exampleSignals: [
            "Suspicious OTP request context",
            "Shortened malicious links",
            "Impersonation of bank entities",
            "High-pressure call-to-action"
        ],
        detectionType: "Real-time"
    },
    {
        id: "phishing-urls",
        name: "Phishing & Malicious URLs",
        description: "Advanced analysis of URL features, domain reputation, and webpage metadata to identify deceptive links.",
        supportedTypes: [
            "Phishing Websites",
            "Fake Login Pages",
            "Fake Shopping Websites",
            "Shortened / Obfuscated URLs",
            "Newly Registered Malicious Domains"
        ],
        detectionApproach: "ML-based URL Feature Analysis",
        exampleSignals: [
            "Homograph domain characters",
            "Low domain age (WHOIS)",
            "High entropy in path names",
            "Suspicious TLD (e.g., .xyz, .top)"
        ],
        detectionType: "Real-time"
    },
    {
        id: "e-commerce",
        name: "E-Commerce & Consumer Scams",
        description: "Identifying fraudulent marketplace activities and deceptive consumer traps.",
        supportedTypes: [
            "Non-Delivery Scams",
            "Fake Seller / Marketplace Scams",
            "Refund & Return Abuse",
            "Subscription Trap Scams"
        ],
        detectionApproach: "NLP + URL + Behavior Signals",
        exampleSignals: [
            "Extremely low prices for high-value items",
            "No contact information on seller page",
            "Pressure to pay outside official platform",
            "Misleading return policy structure"
        ],
        detectionType: "Hybrid"
    }
];
