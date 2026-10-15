const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 4000,
});

/**
 * Call Python ML microservice for Isolation Forest anomaly detection.
 * If Python ML service is unavailable, falls back gracefully to local statistical z-score.
 */
const detectAnomaliesML = async (readings) => {
  try {
    const response = await mlClient.post('/detect-anomalies', { readings });
    return response.data;
  } catch (error) {
    console.warn(`[ML Client] Python ML service unreachable (${error.message}). Using statistical z-score fallback.`);
    return runStatisticalAnomalyFallback(readings);
  };
};

/**
 * Call Python ML service to evaluate model performance metrics (MAE, RMSE, Precision, Recall, F1).
 */
const evaluateModelMetricsML = async (actuals, predictions, taskType = 'regression') => {
  try {
    const response = await mlClient.post('/evaluate-model', { actuals, predictions, taskType });
    return response.data;
  } catch (error) {
    console.warn(`[ML Client] Model evaluation ML service offline. Using JS metrics fallback.`);
    return calculateJSMetrics(actuals, predictions, taskType);
  }
};

/**
 * Statistical fallback for anomaly detection (Z-score & rolling delta)
 */
function runStatisticalAnomalyFallback(readings) {
  if (!readings || readings.length < 3) {
    return { isAnomaly: false, anomalyScore: 0.1, confidence: 0.70, method: 'Statistical Z-Score Fallback' };
  }

  const values = readings.map(r => typeof r === 'number' ? r : (r.pm25 || r.aqi || 0));
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance) || 1;

  const latest = values[values.length - 1];
  const zScore = (latest - mean) / stdDev;
  const isAnomaly = zScore > 2.2 || (latest > 60 && latest > values[values.length - 2] * 1.5);
  const anomalyScore = Math.min(1.0, Math.max(0.0, (zScore / 4.0)));

  return {
    isAnomaly,
    anomalyScore: Number(anomalyScore.toFixed(3)),
    confidence: 0.82,
    latestValue: latest,
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    method: 'Statistical Rolling Z-Score (JS Fallback)',
  };
}

function calculateJSMetrics(actuals, predictions, taskType) {
  if (!actuals || !predictions || actuals.length === 0) {
    return { mae: 0, rmse: 0, r2: 0, modelVersion: 'v1.0-fallback' };
  }

  const n = actuals.length;
  let maeSum = 0;
  let mseSum = 0;
  let actualSum = 0;

  for (let i = 0; i < n; i++) {
    const diff = predictions[i] - actuals[i];
    maeSum += Math.abs(diff);
    mseSum += diff * diff;
    actualSum += actuals[i];
  }

  const mae = maeSum / n;
  const mse = mseSum / n;
  const rmse = Math.sqrt(mse);
  const meanActual = actualSum / n;

  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    ssTot += Math.pow(actuals[i] - meanActual, 2);
    ssRes += Math.pow(actuals[i] - predictions[i], 2);
  }
  const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

  return {
    mae: Number(mae.toFixed(2)),
    rmse: Number(rmse.toFixed(2)),
    r2: Number(r2.toFixed(3)),
    accuracy: Number((Math.max(0, 1 - (mae / (meanActual || 1))) * 100).toFixed(1)),
    modelVersion: 'v1.0 (JS Evaluator)',
  };
}

module.exports = {
  detectAnomaliesML,
  evaluateModelMetricsML,
  runStatisticalAnomalyFallback,
};
