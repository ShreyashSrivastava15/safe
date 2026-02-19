import re
import math
import tldextract
import whois
from datetime import datetime
import requests

async def analyze_url(url: str):
    signals = []
    score = 0.1
    
    # 1. Feature-based scoring
    if len(url) > 75:
        signals.append("Excessively long URL")
        score += 0.2
        
    # Entropy calculation for hostname
    try:
        ext = tldextract.extract(url)
        hostname = ext.domain
        if hostname:
            entropy = -sum(p * math.log2(p) for p in (hostname.count(c) / len(hostname) for c in set(hostname)))
            if entropy > 3.5:
                signals.append("High entropy domain name (random-like)")
                score += 0.2
    except:
        pass

    # TLD risk
    suspicious_tlds = ['.xyz', '.top', '.club', '.info', '.best', '.icu', '.gq', '.tk']
    if any(url.lower().endswith(tld) for tld in suspicious_tlds):
        signals.append(f"Suspicious TLD detected")
        score += 0.3

    # Special characters/Obfuscation
    if '@' in url or '-' in hostname:
        signals.append("URL contains potentially deceptive characters")
        score += 0.1

    # 2. Intelligence-based (WHOIS)
    try:
        # Note: WHOIS can be slow or blocked in some environments
        w = whois.whois(hostname)
        creation_date = w.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]
            
        if creation_date:
            age = (datetime.now() - creation_date).days
            if age < 30:
                signals.append("Newly registered domain (less than 30 days old)")
                score += 0.4
            elif age < 180:
                signals.append("Relatively young domain (less than 6 months)")
                score += 0.2
    except:
        signals.append("WHOIS data unavailable or privacy-protected")

    # 3. Short link detection
    shorteners = ['bit.ly', 't.co', 'tinyurl.com', 'is.gd', 'buff.ly']
    if any(s in url.lower() for s in shorteners):
        signals.append("Obfuscated or shortened URL")
        score += 0.2
        # Future: Expand URL and analyze target

    # Final normalization
    risk_score = min(0.99, score)
    confidence = "HIGH" if score > 0.7 else "MEDIUM"
    
    return {
        "risk_score": round(risk_score, 2),
        "confidence": confidence,
        "signals": signals if signals else ["No significant URL anomalies detected"],
        "model_version": "url-heuristic-intelligence-v1"
    }
