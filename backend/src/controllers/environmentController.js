const EnvironmentalReading = require('../models/EnvironmentalReading');
const ExposureRecord = require('../models/ExposureRecord');
const { fetchAQIByCoordinates, fetchAQIForecast, fetchWeatherForecast, getGeoCoordinates } = require('../services/aqiService');
const { predictHealthRisk } = require('../services/predictionService');
const { evaluateEarlyWarnings } = require('../services/earlyWarningService');

/**
 * GET /api/environment/current
 * Returns current environmental parameters, exposure indicator score, factor breakdown, and triggers early warning evaluation.
 */
const getCurrentEnvironment = async (req, res, next) => {
  try {
    const { lat = 12.9716, lon = 77.5946, locationName = 'Bangalore' } = req.query;

    const [aqiData, forecastData, weatherData] = await Promise.all([
      fetchAQIByCoordinates(lat, lon),
      fetchAQIForecast(lat, lon),
      fetchWeatherForecast(lat, lon),
    ]);

    const pm25 = aqiData.components.pm2_5 || 35;
    const pm10 = aqiData.components.pm10 || 50;
    const temp = weatherData[0]?.tempMax || 26;
    const humidity = weatherData[0]?.humidity || 55;

    // Calculate explainable risk indicator
    const riskEval = predictHealthRisk({
      age: 30,
      asthma: false,
      hoursOutside: 3,
      aqi: aqiData.aqi,
      exerciseIntensity: 'moderate',
    });

    // Save reading to history
    await EnvironmentalReading.create({
      locationName,
      latitude: Number(lat),
      longitude: Number(lon),
      aqi: aqiData.aqi,
      pm25,
      pm10,
      co: aqiData.components.co || 0,
      no2: aqiData.components.no2 || 0,
      o3: aqiData.components.o3 || 0,
      so2: aqiData.components.so2 || 0,
      temperature: temp,
      humidity,
      source: 'OpenWeather API (Live)',
    }).catch(err => console.error('Error saving reading:', err.message));

    // Run early warning engine evaluation
    await evaluateEarlyWarnings({
      locationName,
      latitude: Number(lat),
      longitude: Number(lon),
      aqi: aqiData.aqi,
      pm25,
      pm10,
      forecastList: forecastData,
    }).catch(err => console.error('Early warning eval error:', err.message));

    // Factor breakdown
    const factorBreakdown = [
      { factor: 'PM2.5 Concentration', value: `${pm25} µg/m³`, contribution: 38, explanation: 'Elevated fine particulate matter is the primary contributor.' },
      { factor: 'AQI Level', value: `Level ${aqiData.aqi} / 5`, contribution: 25, explanation: 'Overall ambient air pollution level indicator.' },
      { factor: 'Outdoor Exposure', value: '3 hours', contribution: 18, explanation: 'Accumulated time spent outdoors during peak hours.' },
      { factor: 'Temperature & Humidity', value: `${temp}°C, ${humidity}%`, contribution: 12, explanation: 'Atmospheric pressure & humidity influence particulate dispersion.' },
      { factor: 'Individual Sensitivity', value: 'Standard profile', contribution: 7, explanation: 'Based on selected sensitivity parameters.' },
    ];

    res.status(200).json({
      success: true,
      data: {
        locationName,
        coordinates: { lat: Number(lat), lon: Number(lon) },
        timestamp: new Date(),
        aqi: aqiData.aqi,
        pm25,
        pm10,
        temperature: temp,
        humidity,
        components: aqiData.components,
        exposureIndicator: {
          score: riskEval.score,
          level: riskEval.level,
          statusText: riskEval.level.toUpperCase(),
          explanation: 'Current environmental conditions contribute substantially to the calculated exposure-risk indicator.',
          factorBreakdown,
        },
        sourceInfo: {
          source: 'Environmental API',
          timestamp: new Date().toISOString(),
          isLive: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/environment/history
 */
const getEnvironmentHistory = async (req, res, next) => {
  try {
    const { days = 7, locationName = 'Bangalore' } = req.query;
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const readings = await EnvironmentalReading.find({
      timestamp: { $gte: since },
    })
      .sort({ timestamp: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/environment/forecast
 */
const getEnvironmentForecast = async (req, res, next) => {
  try {
    const { lat = 12.9716, lon = 77.5946 } = req.query;
    const [aqiForecast, weatherForecast] = await Promise.all([
      fetchAQIForecast(lat, lon),
      fetchWeatherForecast(lat, lon),
    ]);

    const hourlyExposureForecast = aqiForecast.slice(0, 24).map((item, idx) => {
      const pm25 = item.components.pm2_5 || 30;
      const score = Math.min(100, Math.round(pm25 * 0.8 + item.aqi * 10));
      let category = 'Low';
      if (score >= 75) category = 'Very High';
      else if (score >= 50) category = 'High';
      else if (score >= 30) category = 'Moderate';

      return {
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: item.dt * 1000,
        predictedPm25: Math.round(pm25),
        predictedAqi: item.aqi,
        exposureScore: score,
        exposureCategory: category,
        temperature: weatherForecast[0]?.tempMax || 26,
        humidity: weatherForecast[0]?.humidity || 55,
      };
    });

    res.status(200).json({
      success: true,
      hourlyForecast: hourlyExposureForecast,
      weeklyWeather: weatherForecast,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/map/layers
 */
const getMapLayers = async (req, res, next) => {
  try {
    const locations = [
      { name: 'Bangalore Central', lat: 12.9716, lon: 77.5946, aqi: 3, pm25: 48, pm10: 72, trend: 'stable', exposureScore: 58, anomaly: false },
      { name: 'Indiranagar', lat: 12.9784, lon: 77.6408, aqi: 2, pm25: 28, pm10: 42, trend: 'decreasing', exposureScore: 35, anomaly: false },
      { name: 'Whitefield Tech Corridor', lat: 12.9698, lon: 77.7500, aqi: 4, pm25: 88, pm10: 124, trend: 'increasing', exposureScore: 78, anomaly: true },
      { name: 'Electronic City', lat: 12.8399, lon: 77.6770, aqi: 3, pm25: 52, pm10: 80, trend: 'stable', exposureScore: 62, anomaly: false },
      { name: 'Hebbal North', lat: 13.0358, lon: 77.5970, aqi: 4, pm25: 94, pm10: 138, trend: 'increasing', exposureScore: 84, anomaly: true },
    ];

    res.status(200).json({
      success: true,
      layers: {
        layer1_aqi: locations.map(l => ({ name: l.name, lat: l.lat, lon: l.lon, value: l.aqi })),
        layer2_pm25: locations.map(l => ({ name: l.name, lat: l.lat, lon: l.lon, value: l.pm25 })),
        layer3_pm10: locations.map(l => ({ name: l.name, lat: l.lat, lon: l.lon, value: l.pm10 })),
        layer4_trend: locations.map(l => ({ name: l.name, lat: l.lat, lon: l.lon, trend: l.trend })),
        layer5_exposure: locations.map(l => ({ name: l.name, lat: l.lat, lon: l.lon, score: l.exposureScore })),
        layer6_anomalies: locations.filter(l => l.anomaly).map(l => ({ name: l.name, lat: l.lat, lon: l.lon, severity: 'HIGH' })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentEnvironment,
  getEnvironmentHistory,
  getEnvironmentForecast,
  getMapLayers,
};
