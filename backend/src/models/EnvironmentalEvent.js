const mongoose = require('mongoose');

const environmentalEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    type: { type: String, default: 'Pollution Anomaly' },
    locationName: { type: String, required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    pollutant: { type: String, default: 'PM2.5' },
    startTime: { type: Date, default: Date.now, index: true },
    peakTime: { type: Date, default: Date.now },
    peakValue: { type: Number, required: true },
    baselineValue: { type: Number, default: 25 },
    durationMinutes: { type: Number, default: 60 },
    severity: {
      type: String,
      enum: ['INFO', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'HIGH',
    },
    confidenceScore: { type: Number, default: 0.85 }, // 0..1
    detectionMethod: { type: String, default: 'Isolation Forest ML Model (v1.0)' },
    status: {
      type: String,
      enum: ['DETECTION', 'INCREASING', 'PEAK', 'MONITORING', 'BASELINE', 'RESOLVED'],
      default: 'DETECTION',
      index: true,
    },
    timeline: [
      {
        stage: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: { type: String, required: true },
        pm25Value: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

environmentalEventSchema.index({ startTime: -1 });

module.exports = mongoose.model('EnvironmentalEvent', environmentalEventSchema);
