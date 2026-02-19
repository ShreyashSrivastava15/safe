import re
import tldextract

async def analyze_job_offer(content: str):
    signals = []
    score = 0.1
    
    # 1. Financial triggers
    financial_red_flags = [
        'security deposit', 'interview fee', 'processing fee', 
        'equipment fee', 'training fee', 'payment first', 'crypto'
    ]
    if any(flag in content.lower() for flag in financial_red_flags):
        signals.append("Upfront payment request detected (common job scam)")
        score += 0.4

    # 2. Unrealistic promises
    unrealistic_promises = [
        'earn $5000 weekly', 'no experience required', 'work from home 1 hour', 
        'immediate hiring', 'flexible hours $100/hr'
    ]
    if any(promise in content.lower() for promise in unrealistic_promises):
        signals.append("Unrealistic salary or promise detected")
        score += 0.3

    # 3. Domain analysis (within content if present)
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', content)
    for url in urls:
        ext = tldextract.extract(url)
        # Job scams often use public domains (gmail, outlook) or suspicious TLDs
        public_domains = ['gmail', 'outlook', 'yahoo', 'hotmail', 'protonmail']
        if ext.domain in public_domains:
            signals.append("Company using public email domain for recruitment")
            score += 0.2

    # 4. Authority/Urgency (Inherit from general NLP patterns)
    if 'whatsapp' in content.lower() or 'telegram' in content.lower():
        signals.append("Request to move communication to encrypted chat apps")
        score += 0.2

    # Final normalize
    risk_score = min(0.99, score)
    confidence = "HIGH" if score > 0.6 else "MEDIUM"
    
    return {
        "risk_score": round(risk_score, 2),
        "confidence": confidence,
        "signals": signals if signals else ["No typical job scam signatures detected"],
        "model_version": "job-offer-v1"
    }
