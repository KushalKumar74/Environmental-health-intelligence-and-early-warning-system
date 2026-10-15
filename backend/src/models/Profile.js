const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    min: 0,
    max: 120,
    default: null,
  },
  asthma: {
    type: Boolean,
    default: false,
  },
  allergies: {
    type: Boolean,
    default: false,
  },
  diabetes: {
    type: Boolean,
    default: false,
  },
  heartDisease: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

profileSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Profile', profileSchema);
