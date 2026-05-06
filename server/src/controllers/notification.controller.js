const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    const unreadCount = await notificationService.getUnreadCount(req.user.id);
    return sendSuccess(res, { notifications, unreadCount }, 'Notifications fetched');
  } catch (error) { next(error); }
};

const markRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    return sendSuccess(res, null, 'Notification marked as read');
  } catch (error) { next(error); }
};

const markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) { next(error); }
};

module.exports = { getAll, markRead, markAllRead };
