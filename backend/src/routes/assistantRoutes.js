const express = require('express');
const { queryAssistant } = require('../controllers/assistantController');

const router = express.Router();

router.post('/query', queryAssistant);

module.exports = router;
