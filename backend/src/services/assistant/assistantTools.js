/**
 * Assistant Tools for EVA — Data Fetching Helpers
 */
const { fetchAQIByCoordinates, fetchWeatherForecast } = require('../aqiService');
const EnvironmentalAlert = require('../../models/EnvironmentalAlert');
const EnvironmentalEvent = require('../../models/EnvironmentalEvent');
const { getFacilities } = require('../../controllers/facilityController');

async function getEnvironmentalContext({ locationName = 'Bangalore', lat = 12.9716, lon = 77.5946, intent = '' }) {
  try {
    const [aqiData, weatherData, activeAlerts, activeEvents] = await Promise.all([
      fetchAQIByCoordinates(lat, lon).catch(() => ({ aqi: 3, components: { pm2_5: 42, pm10: 58 } })),
      fetchWeatherForecast(lat, lon).catch(() => []),
      EnvironmentalAlert.find({ status: 'ACTIVE' }).limit(5),
      EnvironmentalEvent.find({ status: { $ne: 'RESOLVED' } }).limit(5),
    ]);

    const pm25 = aqiData.components?.pm2_5 || 42;
    const pm10 = aqiData.components?.pm10 || 58;
    const temp = weatherData[0]?.tempMax || 26;
    const humidity = weatherData[0]?.humidity || 55;
    const expScore = Math.min(100, Math.round(pm25 * 0.8 + aqiData.aqi * 10));

    return {
      locationName,
      aqi: aqiData.aqi,
      pm25,
      pm10,
      temp,
      humidity,
      exposureScore: expScore,
      activeAlerts: activeAlerts.map(a => ({ type: a.type, severity: a.severity, message: a.message })),
      activeEvents: activeEvents.map(e => ({ id: e.eventId, pollutant: e.pollutant, peakValue: e.peakValue })),
      weatherForecast: weatherData.slice(0, 3).map(w => ({ day: w.day, desc: w.description, tempMax: w.tempMax })),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error building environmental context:', error);
    return {
      locationName,
      aqi: 3,
      pm25: 40,
      pm10: 55,
      temp: 25,
      humidity: 50,
      exposureScore: 65,
      activeAlerts: [],
      activeEvents: [],
      weatherForecast: [],
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = { getEnvironmentalContext };
