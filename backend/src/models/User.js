const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema — stores authentication credentials.
 * Passwords are bcrypt-hashed in a pre-save hook.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['USER', 'FACILITY_USER', 'ADMIN'],
      default: 'USER',
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      default: null,
    },
    notificationPreferences: {
      emailAlerts: { type: Boolean, default: true },
      minSeverity: { type: String, enum: ['INFO', 'MODERATE', 'HIGH', 'CRITICAL'], default: 'MODERATE' },
    },
  },
  { timestamps: true }
);

// Hash password before saving (Mongoose 7+ async middleware — no `next` callback)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
