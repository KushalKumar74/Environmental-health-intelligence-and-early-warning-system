const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().required(),
});

const createRecordSchema = Joi.object({
  name: Joi.string().allow('', null).optional(),
  age: Joi.number().min(0).max(120).required(),
  asthma: Joi.boolean().required(),
  allergies: Joi.boolean().optional(),
  diabetes: Joi.boolean().optional(),
  heartDisease: Joi.boolean().optional(),
  maskType: Joi.string().valid('none', 'cloth', 'surgical', 'n95', 'kn95', 'respirator').optional(),
  exerciseIntensity: Joi.string().valid('sedentary', 'light', 'moderate', 'intense').optional(),
  hoursOutside: Joi.number().min(0).max(24).required(),
  aqi: Joi.number().min(0).required(),
  location: Joi.string().allow('', null).optional(),
});

const updateRecordSchema = Joi.object({
  name: Joi.string().allow('', null).optional(),
  age: Joi.number().min(0).max(120).optional(),
  asthma: Joi.boolean().optional(),
  allergies: Joi.boolean().optional(),
  diabetes: Joi.boolean().optional(),
  heartDisease: Joi.boolean().optional(),
  maskType: Joi.string().valid('none', 'cloth', 'surgical', 'n95', 'kn95', 'respirator').optional(),
  exerciseIntensity: Joi.string().valid('sedentary', 'light', 'moderate', 'intense').optional(),
  hoursOutside: Joi.number().min(0).max(24).optional(),
  aqi: Joi.number().min(0).optional(),
  location: Joi.string().allow('', null).optional(),
});

const createProfileSchema = Joi.object({
  name: Joi.string().trim().required(),
  age: Joi.number().min(0).max(120).allow(null).optional(),
  asthma: Joi.boolean().optional(),
  allergies: Joi.boolean().optional(),
  diabetes: Joi.boolean().optional(),
  heartDisease: Joi.boolean().optional(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().optional(),
  age: Joi.number().min(0).max(120).allow(null).optional(),
  asthma: Joi.boolean().optional(),
  allergies: Joi.boolean().optional(),
  diabetes: Joi.boolean().optional(),
  heartDisease: Joi.boolean().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createRecordSchema,
  updateRecordSchema,
  createProfileSchema,
  updateProfileSchema,
};
