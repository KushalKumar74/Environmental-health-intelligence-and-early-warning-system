const express = require('express');
const { getAlerts, acknowledgeAlert, dismissAlert } = require('../controllers/alertController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getAlerts);
router.post('/:id/acknowledge', protect, acknowledgeAlert);
router.post('/:id/dismiss', protect, dismissAlert);

module.exports = router;
