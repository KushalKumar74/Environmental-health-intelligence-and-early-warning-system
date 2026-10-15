const express = require('express');
const { getAdminStats, getUsersAdmin, updateUserRole, getModelEvaluation } = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getAdminStats);
router.get('/users', getUsersAdmin);
router.put('/users/:id/role', updateUserRole);
router.get('/model-eval', getModelEvaluation);

module.exports = router;
