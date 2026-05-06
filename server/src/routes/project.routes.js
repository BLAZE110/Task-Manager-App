const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { projectAccessMiddleware, roleGuard } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProjectSchema, updateProjectSchema, addMemberSchema } = require('../validators/project.validator');

// All project routes require authentication
router.use(authMiddleware);

// Project CRUD
router.post('/', validate(createProjectSchema), projectController.create);
router.get('/', projectController.getAll);
router.get('/:id', projectAccessMiddleware, projectController.getOne);
router.put('/:id', projectAccessMiddleware, roleGuard('ADMIN'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', projectAccessMiddleware, roleGuard('ADMIN'), projectController.remove);
router.get('/:id/activity', projectAccessMiddleware, projectController.getActivity);

// Member management
router.get('/:id/members', projectAccessMiddleware, projectController.getMembers);
router.post('/:id/members', projectAccessMiddleware, roleGuard('ADMIN'), validate(addMemberSchema), projectController.addMember);
router.delete('/:id/members/:userId', projectAccessMiddleware, roleGuard('ADMIN'), projectController.removeMember);

module.exports = router;
