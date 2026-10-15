const mongoose = require('mongoose');

const exposureRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    timestamp: { type: Date, default: Date.now, index: true },
    locationName: { type: String, default: 'Default Location' },
    environmentalScore: { type: Number, required: true, min: 0, max: 100 },
    exposureLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Severe'],
      required: true,
    },
    aqi: { type: Number, required: true },
    pm25: { type: Number, required: true },
    hoursOutside: { type: Number, default: 2 },
    activityLevel: { type: String, default: 'moderate' },
    contributingFactors: [
      {
        factor: { type: String, required: true },
        value: { type: String, required: true },
        contribution: { type: Number, required: true }, // e.g. percentage or score impact
        explanation: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

exposureRecordSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ExposureRecord', exposureRecordSchema);
