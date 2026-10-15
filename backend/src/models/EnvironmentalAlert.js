const mongoose = require('mongoose');

const environmentalAlertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['Pollution Spike', 'Persistent High Exposure', 'Forecasted Elevated Exposure', 'Environmental Anomaly', 'Facility Threshold Breach'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['INFO', 'MODERATE', 'HIGH', 'CRITICAL'],
      required: true,
      index: true,
    },
    locationName: { type: String, required: true, index: true },
    latitude: { type: Number },
    longitude: { type: Number },
    pollutant: { type: String, default: 'PM2.5' },
    observedValue: { type: Number, required: true },
    thresholdValue: { type: Number, required: true },
    message: { type: String, required: true },
    recommendedMonitoringAction: { type: String, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'],
      default: 'ACTIVE',
      index: true,
    },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', default: null, index: true },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    acknowledgedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

environmentalAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EnvironmentalAlert', environmentalAlertSchema);
