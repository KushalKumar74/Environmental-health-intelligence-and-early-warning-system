const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'elderly-care', 'rehabilitation', 'school'],
      required: true,
    },
    address: { type: String, default: '' },
    locationName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    capacity: { type: Number, default: 100 },
    monitoringStatus: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE', 'OFFLINE'],
      default: 'ACTIVE',
    },
    alertStatus: {
      type: String,
      enum: ['NORMAL', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'NORMAL',
    },
    customThresholds: {
      pm25High: { type: Number, default: 60 },
      aqiHigh: { type: Number, default: 4 },
    },
    contactEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facility', facilitySchema);
