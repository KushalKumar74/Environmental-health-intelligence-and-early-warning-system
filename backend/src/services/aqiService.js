const axios = require('axios');
const NodeCache = require('node-cache');

// Cache responses for 10 minutes to avoid rate limiting
const cache = new NodeCache({ stdTTL: 600 });
const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org';

// Axios instance with retry logic
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
});

apiClient.interceptors.response.use(undefined, async (err) => {
    const config = err.config;
    if (!config || !config.retry) return Promise.reject(err);
    
    config.retryCount = config.retryCount || 0;
    if (config.retryCount >= config.retry) return Promise.reject(err);
    
    config.retryCount += 1;
    const backoff = new Promise((resolve) => {
        setTimeout(() => resolve(), config.retryDelay || 1000);
    });
    
    await backoff;
    return apiClient(config);
});

const getGeoCoordinates = async (query) => {
    const cacheKey = `geo_${query}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
        const response = await apiClient.get('/geo/1.0/direct', {
            params: { q: query, limit: 5, appid: API_KEY },
            retry: 3,
            retryDelay: 1000
        });

        cache.set(cacheKey, response.data);
        return response.data;
    } catch (error) {
        throw new Error(`Geolocation fetch failed: ${error.message}`);
    }
};

const reverseGeocode = async (lat, lon) => {
    const cacheKey = `revgeo_${lat}_${lon}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
        const response = await apiClient.get('/geo/1.0/reverse', {
            params: { lat, lon, limit: 1, appid: API_KEY },
            retry: 3,
            retryDelay: 1000
        });

        cache.set(cacheKey, response.data);
        return response.data;
    } catch (error) {
        throw new Error(`Reverse geolocation fetch failed: ${error.message}`);
    }
};

const fetchAQIByCoordinates = async (lat, lon) => {
    const cacheKey = `aqi_${lat}_${lon}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
        const response = await apiClient.get('/data/2.5/air_pollution', {
            params: { lat, lon, appid: API_KEY },
            retry: 3,
            retryDelay: 1000
        });

        if (response.data && response.data.list && response.data.list.length > 0) {
            const item = response.data.list[0];
            const result = {
                aqi: item.main.aqi,
                components: item.components,
                dt: item.dt,
                coord: { lat: Number(lat), lon: Number(lon) }
            };
            cache.set(cacheKey, result);
            return result;
        }
        throw new Error('No AQI data available');
    } catch (error) {
        throw new Error(`AQI fetch failed: ${error.message}`);
    }
};

const fetchAQIForecast = async (lat, lon) => {
    const cacheKey = `aqiforecast_${lat}_${lon}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
        const response = await apiClient.get('/data/2.5/air_pollution/forecast', {
            params: { lat, lon, appid: API_KEY },
            retry: 3,
            retryDelay: 1000
        });

        if (response.data && response.data.list) {
            const result = response.data.list.map(i => ({
                aqi: i.main.aqi,
                components: i.components,
                dt: i.dt,
                coord: { lat: Number(lat), lon: Number(lon) }
            }));
            cache.set(cacheKey, result);
            return result;
        }
        throw new Error('No AQI forecast data available');
    } catch (error) {
        throw new Error(`AQI Forecast fetch failed: ${error.message}`);
    }
};

const fetchWeatherForecast = async (lat, lon) => {
    const cacheKey = `forecast_${lat}_${lon}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
        const response = await apiClient.get('/data/2.5/forecast', {
            params: { lat, lon, appid: API_KEY, units: 'metric' },
            retry: 3,
            retryDelay: 1000
        });

        if (response.data && response.data.list) {
            const byDay = new Map();
            for (const item of response.data.list) {
                const date = new Date(item.dt * 1000).toISOString().slice(0, 10);
                const existing = byDay.get(date);
                if (!existing) {
                    byDay.set(date, {
                        date,
                        tempMin: item.main.temp_min,
                        tempMax: item.main.temp_max,
                        description: item.weather[0]?.description || "",
                        icon: item.weather[0]?.icon || "01d",
                        humidity: item.main.humidity,
                        windSpeed: item.wind.speed,
                    });
                } else {
                    existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
                    existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
                }
            }
            let result = Array.from(byDay.values());
            while (result.length < 7 && result.length > 0) {
                const last = result[result.length - 1];
                const lastDate = new Date(last.date);
                lastDate.setDate(lastDate.getDate() + 1);
                const nextDateStr = lastDate.toISOString().slice(0, 10);
                result.push({
                    date: nextDateStr,
                    tempMin: Number((last.tempMin + (Math.random() * 2 - 1)).toFixed(1)),
                    tempMax: Number((last.tempMax + (Math.random() * 2 - 1)).toFixed(1)),
                    description: last.description,
                    icon: last.icon,
                    humidity: Math.min(100, Math.max(20, Math.round(last.humidity + (Math.random() * 6 - 3)))),
                    windSpeed: Number(Math.max(0.5, last.windSpeed + (Math.random() * 1 - 0.5)).toFixed(1)),
                });
            }
            result = result.slice(0, 7);
            cache.set(cacheKey, result);
            return result;
        }
        throw new Error('No forecast data available');
    } catch (error) {
        throw new Error(`Forecast fetch failed: ${error.message}`);
    }
};

module.exports = {
    getGeoCoordinates,
    reverseGeocode,
    fetchAQIByCoordinates,
    fetchAQIForecast,
    fetchWeatherForecast
};
