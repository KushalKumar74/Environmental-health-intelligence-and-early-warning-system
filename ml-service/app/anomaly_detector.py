import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class PollutionAnomalyDetector:
    def __init__(self, contamination=0.1):
        self.model = IsolationForest(contamination=contamination, random_state=42)
        self.model_version = "v1.0-IsolationForest"

    def fit_and_predict(self, readings):
        """
        Input: list of numerical readings (PM2.5 or AQI)
        Returns: dict with is_anomaly, anomaly_score, confidence, and metrics
        """
        if not readings or len(readings) < 3:
            return {
                "isAnomaly": False,
                "anomalyScore": 0.05,
                "confidence": 0.70,
                "modelVersion": self.model_version,
                "method": "Baseline threshold fallback"
            }
        
        data = np.array(readings).reshape(-1, 1)
        
        # Fit Isolation Forest model on sequence
        if len(readings) >= 5:
            self.model.fit(data)
            scores = self.model.decision_function(data)
            predictions = self.model.predict(data) # -1 = anomaly, 1 = normal
            
            latest_idx = len(readings) - 1
            is_anomaly = bool(predictions[latest_idx] == -1)
            raw_score = float(scores[latest_idx])
            # Normalize decision score to 0..1 scale (lower decision score means higher anomaly likelihood)
            anomaly_score = float(np.clip(1.0 - (raw_score + 0.5), 0.0, 1.0))
        else:
            mean_val = np.mean(readings)
            std_val = np.std(readings) or 1.0
            latest = readings[-1]
            z_score = (latest - mean_val) / std_val
            is_anomaly = bool(z_score > 2.2)
            anomaly_score = float(np.clip(z_score / 4.0, 0.0, 1.0))

        return {
            "isAnomaly": is_anomaly,
            "anomalyScore": round(anomaly_score, 3),
            "confidence": 0.88 if is_anomaly else 0.95,
            "modelVersion": self.model_version,
            "sampleCount": len(readings),
            "latestValue": float(readings[-1]),
            "mean": round(float(np.mean(readings)), 2),
            "stdDev": round(float(np.std(readings)), 2)
        }

anomaly_detector_service = PollutionAnomalyDetector()
