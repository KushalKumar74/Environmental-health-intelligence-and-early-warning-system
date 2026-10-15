const express = require('express');
const {
    createRecord,
    getRecords,
    getRecord,
    updateRecord,
    deleteRecord
} = require('../controllers/recordController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createRecordSchema, updateRecordSchema } = require('../validators/schemas');

const router = express.Router();

// All record routes require authentication
router.route('/')
    .get(protect, getRecords)
    .post(protect, validate(createRecordSchema), createRecord);

router.route('/:id')
    .get(protect, getRecord)
    .put(protect, validate(updateRecordSchema), updateRecord)
    .delete(protect, deleteRecord);

module.exports = router;
