import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, precision_score, recall_score, f1_score

def evaluate_model_performance(actuals, predictions, task_type="regression"):
    """
    Evaluates ML model predictions against ground truth actual values.
    Returns quantitative metrics: MAE, RMSE, R2 for regression; Precision, Recall, F1 for classification.
    """
    y_true = np.array(actuals)
    y_pred = np.array(predictions)

    if task_type == "regression":
        mae = float(mean_absolute_error(y_true, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
        r2 = float(r2_score(y_true, y_pred))
        mean_y = float(np.mean(y_true)) or 1.0
        accuracy = float(np.clip(100.0 - (mae / mean_y * 100.0), 0.0, 100.0))

        return {
            "taskType": "regression",
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2": round(r2, 3),
            "accuracy": round(accuracy, 1),
            "modelVersion": "v1.0-FastAPI",
            "evaluationSampleCount": len(actuals)
        }
    else:
        prec = float(precision_score(y_true, y_pred, zero_division=0))
        rec = float(recall_score(y_true, y_pred, zero_division=0))
        f1 = float(f1_score(y_true, y_pred, zero_division=0))

        return {
            "taskType": "classification",
            "precision": round(prec, 3),
            "recall": round(rec, 3),
            "f1Score": round(f1, 3),
            "modelVersion": "v1.0-FastAPI",
            "evaluationSampleCount": len(actuals)
        }
