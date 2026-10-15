const mongoose = require('mongoose');

const environmentalReadingSchema = new mongoose.Schema(
  {
    locationName: { type: String, required: true, trim: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    aqi: { type: Number, required: true, min: 1, max: 5 },
    pm25: { type: Number, required: true },
    pm10: { type: Number, default: 0 },
    co: { type: Number, default: 0 },
    no2: { type: Number, default: 0 },
    o3: { type: Number, default: 0 },
    so2: { type: Number, default: 0 },
    temperature: { type: Number, default: 25 },
    humidity: { type: Number, default: 50 },
    source: { type: String, default: 'Environmental API' },
    isCached: { type: Boolean, default: false },
    isForecast: { type: Boolean, default: false },
  },
  { timestamps: true }
);

environmentalReadingSchema.index({ locationName: 1, timestamp: -1 });
environmentalReadingSchema.index({ latitude: 1, longitude: 1, timestamp: -1 });

module.exports = mongoose.model('EnvironmentalReading', environmentalReadingSchema);
