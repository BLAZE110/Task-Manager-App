const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', dashboardController.getStats);
router.get('/my-tasks', dashboardController.getMyTasks);
router.get('/overdue', dashboardController.getOverdue);

module.exports = router;
