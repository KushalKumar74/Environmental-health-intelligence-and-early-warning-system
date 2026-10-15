const EnvironmentalAlert = require('../models/EnvironmentalAlert');
const EnvironmentalEvent = require('../models/EnvironmentalEvent');
const { detectAnomaliesML } = require('./mlClient');

/**
 * Early Warning Engine
 * Evaluates real-time environmental data against multi-tier warning rules.
 */
const evaluateEarlyWarnings = async ({ locationName, latitude, longitude, aqi, pm25, pm10, forecastList = [], facilityId = null }) => {
  const alertsCreated = [];

  // Rule 1: Pollution Spike (rapid increase in PM2.5)
  if (pm25 >= 60 || aqi >= 4) {
    const severity = pm25 >= 120 || aqi === 5 ? 'CRITICAL' : 'HIGH';
    const alertId = `ALT-SPIKE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const alert = await EnvironmentalAlert.create({
      alertId,
      type: 'Pollution Spike',
      severity,
      locationName,
      latitude,
      longitude,
      pollutant: 'PM2.5',
      observedValue: pm25,
      thresholdValue: 60,
      message: `Rapid increase in PM2.5 observed (${pm25} µg/m³, AQI level ${aqi}).`,
      recommendedMonitoringAction: 'Increase outdoor monitoring and advise sensitive population groups to remain indoors.',
      facilityId,
    });
    alertsCreated.push(alert);
  }

  // Rule 2: Persistent High Exposure
  if (forecastList && forecastList.length >= 6) {
    const highHours = forecastList.slice(0, 6).filter(item => item.aqi >= 4 || item.components?.pm2_5 >= 55).length;
    if (highHours >= 4) {
      const alertId = `ALT-PERSIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const alert = await EnvironmentalAlert.create({
        alertId,
        type: 'Persistent High Exposure',
        severity: 'HIGH',
        locationName,
        latitude,
        longitude,
        pollutant: 'PM2.5',
        observedValue: pm25,
        thresholdValue: 55,
        message: `Elevated pollution conditions have persisted or are projected to persist for 4+ consecutive hours.`,
        recommendedMonitoringAction: 'Activate persistent environmental health exposure protocols.',
        facilityId,
      });
      alertsCreated.push(alert);
    }
  }

  // Rule 3: Environmental Anomaly Detection (via Isolation Forest ML Service)
  const anomalyResult = await detectAnomaliesML(forecastList.map(f => f.components?.pm2_5 || 30));
  if (anomalyResult.isAnomaly) {
    const alertId = `ALT-ANOMALY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const eventId = `ENV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;

    const alert = await EnvironmentalAlert.create({
      alertId,
      type: 'Environmental Anomaly',
      severity: 'HIGH',
      locationName,
      latitude,
      longitude,
      pollutant: 'PM2.5',
      observedValue: pm25,
      thresholdValue: anomalyResult.mean ? Math.round(anomalyResult.mean * 1.5) : 50,
      message: `An unusual pollution pattern has been detected by the Isolation Forest model (Confidence: ${Math.round((anomalyResult.confidence || 0.85) * 100)}%).`,
      recommendedMonitoringAction: 'Inspect localized emission sources and verify telemetry readings.',
      facilityId,
    });
    alertsCreated.push(alert);

    // Create or update Environmental Event tracking record
    await EnvironmentalEvent.create({
      eventId,
      type: 'Pollution Anomaly',
      locationName,
      latitude: latitude || 12.9716,
      longitude: longitude || 77.5946,
      pollutant: 'PM2.5',
      startTime: new Date(),
      peakValue: pm25,
      baselineValue: anomalyResult.mean || 25,
      severity: 'HIGH',
      confidenceScore: anomalyResult.confidence || 0.85,
      status: 'INCREASING',
      timeline: [
        {
          stage: 'Detection',
          timestamp: new Date(),
          description: `Anomaly detected with score ${anomalyResult.anomalyScore}`,
          pm25Value: pm25,
        },
      ],
    });
  }

  return {
    success: true,
    count: alertsCreated.length,
    alerts: alertsCreated,
  };
};

module.exports = { evaluateEarlyWarnings };
