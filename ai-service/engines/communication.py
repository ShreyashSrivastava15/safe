import torch
from transformers import pipeline
import re

try:
    from transformers import pipeline
    MODEL_NAME = "mshenoda/roberta-spam"
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
    signals = []
    
    if not classifier:
        return {
            "risk_score": 0.5,
            "confidence": "LOW",
            "signals": ["Model failed to load, falling back to heuristics"],
            "model_version": "fallback-v1"
        }

    # NLP Inference
    result = classifier(content)[0]
    nlp_score = result['score'] if result['label'] == 'LABEL_1' else (1 - result['score'])
    
    # Heuristic Augmentation
    urgency_keywords = ['urgent', 'immediate', 'action required', 'expires', 'limited time']
    financial_keywords = ['bank', 'account', 'verify', 'payment', 'transfer', 'invoice', 'tax']
    
    if any(k in content.lower() for k in urgency_keywords):
        signals.append("Urgent/Time-pressure language detected")
        nlp_score = min(0.99, nlp_score + 0.1)
        
    if any(k in content.lower() for k in financial_keywords):
        signals.append("Financial intent detected")
        
    if re.search(r'\d{4,}', content): # Sequences of numbers often imply codes/OTPs
        signals.append("OTP/Verification code pattern suspected")

    # Final Risk Assessment
    risk_score = float(nlp_score)
    confidence = "HIGH" if risk_score > 0.8 or risk_score < 0.2 else "MEDIUM"
    
    if risk_score > 0.7:
        signals.append(f"AI classified content as high-risk spam/phishing ({result['label']})")
    
    return {
        "risk_score": round(risk_score, 2),
        "confidence": confidence,
        "signals": signals if signals else ["No significant anomalies detected"],
        "model_version": MODEL_NAME
    }
