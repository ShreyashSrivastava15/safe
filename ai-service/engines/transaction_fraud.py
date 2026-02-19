import numpy as np
from sklearn.ensemble import IsolationForest
import pickle
import os

# Simplified feature extraction for transactions
def extract_features(data):
    # Features: [amount, velocity (count in period), geo_shift (0/1), device_change (0/1)]
    amount = float(data.get('amount', 0))
    velocity = float(data.get('velocity', 1)) 
    geo_shift = 1.0 if data.get('geo_shift', False) else 0.0
    device_change = 1.0 if data.get('device_change', False) else 0.0
    
    return [amount, velocity, geo_shift, device_change]

# Model path
MODEL_PATH = "models/isolation_forest_tx.pkl"

# Initialize or load model
def get_model():
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, 'rb') as f:
                return pickle.load(f)
        except:
            pass
            
    # Train a simple background model with synthetic "safe" data
    # Safe transactions: Low amount, slow velocity, no shift
    X_train = np.array([
        [100, 1, 0, 0],
        [200, 2, 0, 0],
        [50, 1, 0, 0],
        [500, 3, 0, 0],
        [150, 1, 0, 0],
        [1000, 5, 0, 0],
        [300, 2, 0, 0],
    ])
    
    model = IsolationForest(contamination=0.1, random_state=42)
    model.fit(X_train)
    
    os.makedirs("models", exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
        
    return model

model = get_model()

async def analyze_transaction(transaction_data: dict):
    signals = []
    
    features = extract_features(transaction_data)
    
    # Isolation Forest Prediction
    # -1 is anomaly, 1 is normal
    prediction = model.predict([features])[0]
    anomaly_score = model.decision_function([features])[0]
    
    # Normalize anomaly score to 0-1 risk score
    # decision_function returns values where lower is more anomalous
    risk_score = 1.0 - ((anomaly_score + 0.5) / 1.0) # Rough mapping
    risk_score = max(0.01, min(0.99, risk_score))

    # Business Rule Overlays
    if features[0] > 10000:
        signals.append("High-value transaction above threshold")
        risk_score = max(risk_score, 0.7)
        
    if features[2] > 0:
        signals.append("Geographic location shift detected")
        risk_score = min(0.99, risk_score + 0.2)
        
    if features[3] > 0:
        signals.append("Device change detected for account")
        risk_score = min(0.99, risk_score + 0.2)

    if prediction == -1:
        signals.append("Isolation Forest flagged behavioral anomaly")
    
    confidence = "HIGH" if risk_score > 0.8 else "MEDIUM"
    
    return {
        "risk_score": round(risk_score, 2),
        "confidence": confidence,
        "signals": signals if signals else ["Transaction within normal behavioral parameters"],
        "model_version": "isolation-forest-tx-v1"
    }
