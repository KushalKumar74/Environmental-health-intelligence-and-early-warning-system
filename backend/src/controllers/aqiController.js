const { getGeoCoordinates, reverseGeocode, fetchAQIByCoordinates, fetchAQIForecast, fetchWeatherForecast } = require('../services/aqiService');

const geocode = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
        const data = await getGeoCoordinates(q);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const reverseGeocodeController = async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Missing lat/lon' });
        const data = await reverseGeocode(lat, lon);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const getCurrentAqi = async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Missing lat/lon' });
        const data = await fetchAQIByCoordinates(lat, lon);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const getAqiForecast = async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Missing lat/lon' });
        const data = await fetchAQIForecast(lat, lon);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const getWeatherForecast = async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Missing lat/lon' });
        const data = await fetchWeatherForecast(lat, lon);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    geocode,
    reverseGeocode: reverseGeocodeController,
    getCurrentAqi,
    getAqiForecast,
    getWeatherForecast
};
