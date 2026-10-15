const express = require('express');
const {
  getCurrentEnvironment,
  getEnvironmentHistory,
  getEnvironmentForecast,
  getMapLayers,
} = require('../controllers/environmentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/current', getCurrentEnvironment);
router.get('/history', protect, getEnvironmentHistory);
router.get('/forecast', getEnvironmentForecast);
router.get('/map-layers', getMapLayers);

module.exports = router;
