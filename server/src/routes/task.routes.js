const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/task.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { projectAccessMiddleware, roleGuard } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createTaskSchema, updateTaskSchema, taskFilterSchema, commentSchema } = require('../validators/task.validator');

// All task routes require auth + project membership
router.use(authMiddleware);
router.use(projectAccessMiddleware);

// Task CRUD
router.post('/', roleGuard('ADMIN'), validate(createTaskSchema), taskController.create);
router.get('/', validate(taskFilterSchema, 'query'), taskController.getAll);
router.get('/:taskId', taskController.getOne);
router.put('/:taskId', validate(updateTaskSchema), taskController.update);
router.delete('/:taskId', roleGuard('ADMIN'), taskController.remove);

// Comments
router.post('/:taskId/comments', validate(commentSchema), taskController.addComment);
router.get('/:taskId/comments', taskController.getComments);

// Activity
router.get('/:taskId/activity', taskController.getActivity);

module.exports = router;
