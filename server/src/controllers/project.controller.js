const projectService = require('../services/project.service');
const { sendSuccess } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    return sendSuccess(res, { project }, 'Project created successfully', 201);
  } catch (error) { next(error); }
};

const getAll = async (req, res, next) => {
  try {
    const projects = await projectService.getUserProjects(req.user.id);
    return sendSuccess(res, { projects }, 'Projects fetched');
  } catch (error) { next(error); }
};

const getOne = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return sendSuccess(res, { project }, 'Project fetched');
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
    return sendSuccess(res, { project }, 'Project updated');
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    return sendSuccess(res, null, 'Project deleted');
  } catch (error) { next(error); }
};

const addMember = async (req, res, next) => {
  try {
    const member = await projectService.addMember(req.params.id, req.body.email, req.body.role, req.user.id);
    return sendSuccess(res, { member }, 'Member added', 201);
  } catch (error) { next(error); }
};

const removeMember = async (req, res, next) => {
  try {
    await projectService.removeMember(req.params.id, req.params.userId, req.user.id);
    return sendSuccess(res, null, 'Member removed');
  } catch (error) { next(error); }
};

const getMembers = async (req, res, next) => {
  try {
    const members = await projectService.getMembers(req.params.id);
    return sendSuccess(res, { members }, 'Members fetched');
  } catch (error) { next(error); }
};

const getActivity = async (req, res, next) => {
  try {
    const logs = await projectService.getProjectActivity(req.params.id);
    return sendSuccess(res, { logs }, 'Activity fetched');
  } catch (error) { next(error); }
};

module.exports = { create, getAll, getOne, update, remove, addMember, removeMember, getMembers, getActivity };
