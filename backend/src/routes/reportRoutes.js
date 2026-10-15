const express = require('express');
const { generateEnvironmentReport } = require('../controllers/reportController');

const router = express.Router();

router.get('/environment', generateEnvironmentReport);

module.exports = router;
