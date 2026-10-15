const mongoose = require('mongoose');

const userHealthRecordSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: null, // null for old records — handled gracefully on the frontend
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 120
  },
  asthma: {
    type: Boolean,
    required: true,
    default: false
  },
  allergies: {
    type: Boolean,
    default: false
  },
  diabetes: {
    type: Boolean,
    default: false
  },
  heartDisease: {
    type: Boolean,
    default: false
  },
  maskType: {
    type: String,
    enum: ['none', 'cloth', 'surgical', 'n95', 'kn95', 'respirator'],
    default: 'none'
  },
  exerciseIntensity: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'intense'],
    default: 'sedentary'
  },
  hoursOutside: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  aqi: {
    type: Number,
    required: true,
    min: 0
  },
  predictedRisk: {
    type: String,
    required: true,
    enum: ['Low', 'Moderate', 'High', 'Severe']
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  reasons: [{
    type: String
  }],
  location: {
    type: String
  },
  userId: {
    // Optional: links record to a registered user for data isolation
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexing for performance
userHealthRecordSchema.index({ createdAt: -1 });
userHealthRecordSchema.index({ aqi: 1 });
userHealthRecordSchema.index({ name: 1 });

const UserHealthRecord = mongoose.model('UserHealthRecord', userHealthRecordSchema);

module.exports = UserHealthRecord;
