import re

async def analyze_social_engineering(content: str):
    signals = []
    score = 0.1
    
    # 1. Psychological Triggers
    
    # Fear / Panic / Emergency
    fear_triggers = [
        'critical', 'accident', 'arrest', 'legal action', 'police', 
        'prosecution', 'suspension', 'immediate attention', 'emergency'
    ]
    if any(trigger in content.lower() for trigger in fear_triggers):
        signals.append("Fear-based psychological trigger detected (Pressure)")
        score += 0.3

    # Greed / Gain
    greed_triggers = [
        'lottery', 'won', 'prize', 'gift card', 'inheritance', 
        'congratulations', 'claim now', 'unclaimed funds'
    ]
    if any(trigger in content.lower() for trigger in greed_triggers):
        signals.append("Greed-based psychological trigger detected (Reward)")
        score += 0.3

    # Romance / Matrimonial
    romance_triggers = [
        'dearest', 'beloved', 'loving husband', 'lonely', 'beautiful', 
        'marriage', 'trust me', 'financial help'
    ]
    if any(trigger in content.lower() for trigger in romance_triggers):
        signals.append("Romance/Emotional manipulation pattern detected")
        score += 0.3

    # 2. Authority Abuse
    authority_keywords = [
        'official', 'government', 'tax department', 'internal revenue', 
        'compliance officer', 'executive office'
    ]
    if any(k in content.lower() for k in authority_keywords):
        signals.append("Impersonation of authority/official entity suspected")
        score += 0.2

    # 3. Category Tagging
    category = "GENERAL"
    if any(trigger in content.lower() for trigger in fear_triggers):
        category = "EMERGENCY/THREAT"
    elif any(trigger in content.lower() for trigger in greed_triggers):
        category = "LOTTERY/PRIZE"
    elif any(trigger in content.lower() for trigger in romance_triggers):
        category = "ROMANCE"

    # Final Risk Assessment
    risk_score = min(0.99, score)
    confidence = "HIGH" if score > 0.6 else "MEDIUM"
    
    return {
        "risk_score": round(risk_score, 2),
        "confidence": confidence,
        "signals": signals if signals else ["No strong social engineering signatures detected"],
        "model_version": "social-engineering-v1",
        "category": category
    }
