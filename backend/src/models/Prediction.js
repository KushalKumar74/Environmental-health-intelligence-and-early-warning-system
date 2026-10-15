const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    modelName: { type: String, required: true, default: 'environmental-exposure-model' },
    modelVersion: { type: String, required: true, default: 'v1.0' },
    inputData: { type: mongoose.Schema.Types.Mixed, required: true },
    predictionOutput: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: [String], default: [] },
    confidenceScore: { type: Number, default: 0.90 },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', predictionSchema);
