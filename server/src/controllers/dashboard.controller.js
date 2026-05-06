const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user.id);
    return sendSuccess(res, { stats }, 'Dashboard stats fetched');
  } catch (error) { next(error); }
};

const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await dashboardService.getMyTasks(req.user.id);
    return sendSuccess(res, { tasks }, 'My tasks fetched');
  } catch (error) { next(error); }
};

const getOverdue = async (req, res, next) => {
  try {
    const tasks = await dashboardService.getOverdueTasks(req.user.id);
    return sendSuccess(res, { tasks }, 'Overdue tasks fetched');
  } catch (error) { next(error); }
};

module.exports = { getStats, getMyTasks, getOverdue };
