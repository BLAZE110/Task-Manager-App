const taskService = require('../services/task.service');
const { sendSuccess } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.params.projectId, req.body, req.user.id);
    return sendSuccess(res, { task }, 'Task created successfully', 201);
  } catch (error) { next(error); }
};

const getAll = async (req, res, next) => {
  try {
    const result = await taskService.getTasks(req.params.projectId, req.query);
    return sendSuccess(res, result, 'Tasks fetched');
  } catch (error) { next(error); }
};

const getOne = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId);
    return sendSuccess(res, { task }, 'Task fetched');
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.taskId, req.params.projectId, req.body, req.user.id);
    return sendSuccess(res, { task }, 'Task updated');
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.taskId, req.user.id);
    return sendSuccess(res, null, 'Task deleted');
  } catch (error) { next(error); }
};

const addComment = async (req, res, next) => {
  try {
    const comment = await taskService.addComment(req.params.taskId, req.body.content, req.user.id);
    return sendSuccess(res, { comment }, 'Comment added', 201);
  } catch (error) { next(error); }
};

const getComments = async (req, res, next) => {
  try {
    const comments = await taskService.getComments(req.params.taskId);
    return sendSuccess(res, { comments }, 'Comments fetched');
  } catch (error) { next(error); }
};

const getActivity = async (req, res, next) => {
  try {
    const activity = await taskService.getTaskActivity(req.params.taskId);
    return sendSuccess(res, { activity }, 'Activity fetched');
  } catch (error) { next(error); }
};

module.exports = { create, getAll, getOne, update, remove, addComment, getComments, getActivity };
