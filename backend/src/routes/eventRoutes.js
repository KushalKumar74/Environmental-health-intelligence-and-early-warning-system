const express = require('express');
const { getEvents, getEventById } = require('../controllers/eventController');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

module.exports = router;
