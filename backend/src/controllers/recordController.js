const UserHealthRecord = require('../models/UserHealthRecord');
const { predictHealthRisk } = require('../services/predictionService');

/**
 * @route POST /api/records
 * @desc  Create a health record; prediction is computed server-side
 */
const createRecord = async (req, res, next) => {
    try {
        const { name, age, asthma, allergies, diabetes, heartDisease, maskType, exerciseIntensity, hoursOutside, aqi, location } = req.body;

        // Server-side prediction engine
        const { level, score, reasons } = predictHealthRisk({
            age,
            asthma,
            allergies,
            diabetes,
            heartDisease,
            maskType,
            exerciseIntensity,
            hoursOutside,
            aqi,
        });

        const newRecord = new UserHealthRecord({
            name: name || null, // null for records submitted without a name
            age,
            asthma,
            allergies: !!allergies,
            diabetes: !!diabetes,
            heartDisease: !!heartDisease,
            maskType: maskType || 'none',
            exerciseIntensity: exerciseIntensity || 'sedentary',
            hoursOutside,
            aqi,
            predictedRisk: level,
            score,
            reasons,
            location,
            userId: req.user._id, // Scope to the authenticated user
        });

        const savedRecord = await newRecord.save();
        res.status(201).json({ success: true, data: savedRecord });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/records
 * @desc  Get all records belonging to the authenticated user
 */
const getRecords = async (req, res, next) => {
    try {
        const records = await UserHealthRecord
            .find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/records/:id
 * @desc  Get a single record (must belong to authenticated user)
 */
const getRecord = async (req, res, next) => {
    try {
        const record = await UserHealthRecord.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

/**
 * @route PUT /api/records/:id
 * @desc  Update a record and recalculate prediction
 */
const updateRecord = async (req, res, next) => {
    try {
        const currentRecord = await UserHealthRecord.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!currentRecord) return res.status(404).json({ error: 'Record not found' });

        const { name, age, asthma, allergies, diabetes, heartDisease, maskType, exerciseIntensity, hoursOutside, aqi } = req.body;

        // Recalculate prediction with merged values
        const evalParams = {
            age: age !== undefined ? age : currentRecord.age,
            asthma: asthma !== undefined ? asthma : currentRecord.asthma,
            allergies: allergies !== undefined ? allergies : currentRecord.allergies,
            diabetes: diabetes !== undefined ? diabetes : currentRecord.diabetes,
            heartDisease: heartDisease !== undefined ? heartDisease : currentRecord.heartDisease,
            maskType: maskType !== undefined ? maskType : currentRecord.maskType,
            exerciseIntensity: exerciseIntensity !== undefined ? exerciseIntensity : currentRecord.exerciseIntensity,
            hoursOutside: hoursOutside !== undefined ? hoursOutside : currentRecord.hoursOutside,
            aqi: aqi !== undefined ? aqi : currentRecord.aqi,
        };

        const { level, score, reasons } = predictHealthRisk(evalParams);
        // Preserve existing name if not provided in the patch
        const updateData = {
            ...req.body,
            name: name !== undefined ? name : currentRecord.name,
            predictedRisk: level,
            score,
            reasons,
        };

        const updatedRecord = await UserHealthRecord.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updatedRecord });
    } catch (error) {
        next(error);
    }
};

/**
 * @route DELETE /api/records/:id
 * @desc  Delete a record (must belong to authenticated user)
 */
const deleteRecord = async (req, res, next) => {
    try {
        const record = await UserHealthRecord.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

module.exports = { createRecord, getRecords, getRecord, updateRecord, deleteRecord };
