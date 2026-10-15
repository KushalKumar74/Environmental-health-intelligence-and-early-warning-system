const express = require('express');
const {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/profileController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createProfileSchema, updateProfileSchema } = require('../validators/schemas');

const router = express.Router();

router.use(protect); // All profile routes require authentication

router.route('/')
  .get(getProfiles)
  .post(validate(createProfileSchema), createProfile);

router.route('/:id')
  .put(validate(updateProfileSchema), updateProfile)
  .delete(deleteProfile);

module.exports = router;
