from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from engines.communication import analyze_communication
from engines.url import analyze_url
from engines.job_offer import analyze_job_offer
from engines.social_engineering import analyze_social_engineering
from engines.transaction_fraud import analyze_transaction

load_dotenv()

app = FastAPI(title="S.A.F.E. AI Inference Service")

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
    return {"status": "ok", "service": "safe-ai-inference"}

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
    uvicorn.run(app, host="0.0.0.0", port=8000)
