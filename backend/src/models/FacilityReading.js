const mongoose = require('mongoose');

const facilityReadingSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
      index: true,
    },
    timestamp: { type: Date, default: Date.now, index: true },
    aqi: { type: Number, required: true },
    pm25: { type: Number, required: true },
    pm10: { type: Number, default: 0 },
    temperature: { type: Number, default: 24 },
    humidity: { type: Number, default: 55 },
    indoorAirIndex: { type: Number, default: 22 },
    ventilationStatus: { type: String, default: 'OPTIMAL' },
  },
  { timestamps: true }
);

facilityReadingSchema.index({ facilityId: 1, timestamp: -1 });

module.exports = mongoose.model('FacilityReading', facilityReadingSchema);
