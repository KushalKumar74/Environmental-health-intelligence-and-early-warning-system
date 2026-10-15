const express = require('express');
const { getFacilities, createFacility, getFacilityById, getFacilityReadings } = require('../controllers/facilityController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

router.get('/', getFacilities);
router.post('/', protect, authorize('ADMIN', 'FACILITY_USER'), createFacility);
router.get('/:id', getFacilityById);
router.get('/:id/readings', getFacilityReadings);

module.exports = router;
