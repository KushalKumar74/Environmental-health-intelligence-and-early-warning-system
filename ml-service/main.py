from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Union
from app.anomaly_detector import anomaly_detector_service
from app.evaluator import evaluate_model_performance

app = FastAPI(
    title="EHI-EWS Python ML Service",
    description="Machine Learning Microservice for Environmental Anomaly Detection & Model Evaluation",
    version="1.0.0"
)

class AnomalyRequest(BaseModel):
    readings: List[float] = Field(..., description="Array of historical or forecasted PM2.5/AQI values")

class EvaluationRequest(BaseModel):
    actuals: List[float]
    predictions: List[float]
    taskType: Optional[str] = "regression"

@app.get("/")
def health_check():
    return {
        "status": "ONLINE",
        "service": "EHI-EWS Python ML Engine",
        "version": "v1.0",
        "supportedModels": ["IsolationForest", "ZScoreRolling", "ModelEvaluatorMetrics"]
    }

@app.post("/detect-anomalies")
def detect_anomalies(payload: AnomalyRequest):
    try:
        result = anomaly_detector_service.fit_and_predict(payload.readings)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@app.post("/evaluate-model")
def evaluate_model(payload: EvaluationRequest):
    try:
        result = evaluate_model_performance(payload.actuals, payload.predictions, payload.taskType)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model evaluation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
