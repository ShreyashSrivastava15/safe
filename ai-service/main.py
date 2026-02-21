from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("safe-ai-service")

from engines.communication import analyze_communication
from engines.url import analyze_url
from engines.job_offer import analyze_job_offer
from engines.social_engineering import analyze_social_engineering
from engines.transaction_fraud import analyze_transaction

app = FastAPI(title="S.A.F.E. AI Inference Service")

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"Method: {request.method} Path: {request.url.path} Duration: {duration:.2f}s Status: {response.status_code}")
    return response

class AnalysisRequest(BaseModel):
    content: Optional[str] = None
    data: Optional[dict] = None

class AnalysisResponse(BaseModel):
    risk_score: float
    confidence: str
    signals: List[str]
    model_version: str
    category: Optional[str] = None

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "safe-ai-inference", "timestamp": time.time()}

@app.post("/analyze/communication", response_model=AnalysisResponse)
async def analyze_comm_endpoint(request: AnalysisRequest):
    return await analyze_communication(request.content or "")

@app.post("/analyze/url", response_model=AnalysisResponse)
async def analyze_url_endpoint(request: AnalysisRequest):
    return await analyze_url(request.content or "")

@app.post("/analyze/job-offer", response_model=AnalysisResponse)
async def analyze_job_endpoint(request: AnalysisRequest):
    return await analyze_job_offer(request.content or "")

@app.post("/analyze/social-engineering", response_model=AnalysisResponse)
async def analyze_social_endpoint(request: AnalysisRequest):
    return await analyze_social_engineering(request.content or "")

@app.post("/analyze/transaction", response_model=AnalysisResponse)
async def analyze_tx_endpoint(request: AnalysisRequest):
    return await analyze_transaction(request.data or {})

if __name__ == "__main__":
    import uvicorn
    # Render passes the port via environment variable
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
