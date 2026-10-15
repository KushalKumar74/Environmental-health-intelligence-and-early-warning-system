const Profile = require('../models/Profile');

/**
 * @route GET /api/profiles
 * @desc  Get all saved profiles for authenticated user
 */
const getProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find({ userId: req.user._id }).sort({ name: 1 });
    res.status(200).json({ success: true, count: profiles.length, data: profiles });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/profiles
 * @desc  Create a new profile
 */
const createProfile = async (req, res, next) => {
  try {
    const { name, age, asthma, allergies, diabetes, heartDisease } = req.body;
    const newProfile = new Profile({
      userId: req.user._id,
      name,
      age: age !== undefined ? age : null,
      asthma: !!asthma,
      allergies: !!allergies,
      diabetes: !!diabetes,
      heartDisease: !!heartDisease,
    });

    const savedProfile = await newProfile.save();
    res.status(201).json({ success: true, data: savedProfile });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/profiles/:id
 * @desc  Update a profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/profiles/:id
 * @desc  Delete a profile
 */
const deleteProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
};
