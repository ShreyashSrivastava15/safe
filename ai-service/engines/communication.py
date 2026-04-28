import re

classifier = None
MODEL_NAME = "heuristic-v1"

try:
    import torch
    from transformers import pipeline
    # Using a TINY model to fit in Render's 512MB free tier
    MODEL_NAME = "mrm8488/bert-tiny-finetuned-sms-spam-detection"
    classifier = pipeline("text-classification", model=MODEL_NAME, device=-1)
except ImportError:
    print("Transformers/Torch not found. Using heuristic fallback.")
    classifier = None
    MODEL_NAME = "heuristic-v1"
except Exception as e:
    print(f"Error loading model: {e}")
    classifier = None
    MODEL_NAME = "fallback-v1"

async def analyze_communication(content: str):
    global MODEL_NAME
    signals = []
    
    if not classifier:
        signals.append("Model failed to load, falling back to heuristics")
        nlp_score = 0.1
        MODEL_NAME = "heuristic-v1"
    else:
        # NLP Inference
        result = classifier(content)[0]
        nlp_score = result['score'] if result['label'] == 'LABEL_1' else (1 - result['score'])
    
    # Heuristic Augmentation (Hardened)
    urgency_keywords = ['urgent', 'immediate', 'action required', 'expires', 'limited time', 'asap', 'quickly', 'buy now', 'units left', 'stock left', 'limited offer', 'flashsale', 'flash sale']
    financial_keywords = ['bank', 'account', 'verify', 'payment', 'transfer', 'invoice', 'tax', 'wire', 'payroll', 'gift card', 'deposit', 'price', 'cost', 'fee']
    predatory_keywords = ['confidential', 'secret', 'available', 'shortlisted', 'winner', 'clearance', '90% off', 'huge discount', 'unbelievable', 'cheap', 'selling mine', 'selling because', 'dont need', 'moved away', 'moving', 'photos here', 'check photos']

    heuristic_boost = 0
    
    if any(k in content.lower() for k in urgency_keywords):
        signals.append("Urgent/Time-pressure language detected")
        heuristic_boost += 0.25
        
    if any(k in content.lower() for k in financial_keywords):
        signals.append("Financial intent detected")
        heuristic_boost += 0.25
        
    if any(k in content.lower() for k in predatory_keywords):
        signals.append("Predatory/Manipulative keywords detected")
        heuristic_boost += 0.15

    if re.search(r'\d{4,}', content): 
        signals.append("OTP/Verification code pattern suspected")
        heuristic_boost += 0.1

    # Apply boost to the base score
    risk_score = min(0.99, nlp_score + heuristic_boost)
    
    # Critical Risk Override: If both Urgency AND Financial intent are present, it's a massive red flag (BEC)
    if "Urgent" in str(signals) and "Financial" in str(signals):
        risk_score = max(risk_score, 0.85)
        signals.append("High-Confidence Pattern: Urgency + Financial Intent (Likely CEO Fraud/BEC)")

    import random
    jitter = random.uniform(-0.04, 0.04)
    if risk_score <= 0.15:
        jitter = random.uniform(0.01, 0.04)

    risk_score = min(0.99, max(0.01, risk_score + jitter))

    # Final Risk Assessment
    confidence = "HIGH" if risk_score > 0.8 or risk_score < 0.2 else "MEDIUM"
    
    if risk_score > 0.7 and classifier:
        signals.append(f"AI classified content as high-risk spam/phishing")
    
    return {
        "risk_score": round(risk_score, 2),
        "confidence": confidence,
        "signals": signals if signals else ["No significant anomalies detected"],
        "model_version": MODEL_NAME
    }
