const express = require('express');
const { geocode, reverseGeocode, getCurrentAqi, getAqiForecast, getWeatherForecast } = require('../controllers/aqiController');

const router = express.Router();

router.get('/geocode', geocode);
router.get('/reverse-geocode', reverseGeocode);
router.get('/current', getCurrentAqi);
router.get('/forecast', getAqiForecast);
router.get('/weather', getWeatherForecast);

module.exports = router;
