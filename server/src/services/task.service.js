const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

/**
 * Create a new task within a project
 */
const createTask = async (projectId, data, userId) => {
  if (data.assigneeIds && data.assigneeIds.length > 0) {
    const members = await prisma.projectMember.findMany({
      where: {
        projectId,
        userId: { in: data.assigneeIds },
      },
    });

    if (members.length !== data.assigneeIds.length) {
      throw new AppError('One or more assignees are not members of this project', 400);
    }
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      tags: data.tags || [],
      estimatedHours: data.estimatedHours || null,
      projectId,
      createdById: userId,
      assignees: data.assigneeIds ? { connect: data.assigneeIds.map(id => ({ id })) } : undefined,
    },
    include: {
      assignees: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      _count: { select: { comments: true } },
    },
  });

  // Log activity (task-level)
  await prisma.activityLog.create({
    data: {
      taskId: task.id,
      userId,
      action: 'CREATED',
      newValue: task.title,
    },
  });

  // Log activity (project-level)
  await prisma.activityLog.create({
    data: {
      projectId,
      userId,
      action: 'TASK_ADDED',
      newValue: task.title,
    },
  });

  // Notification for assignees
  if (data.assigneeIds && data.assigneeIds.length > 0) {
    const notifyIds = data.assigneeIds.filter(id => id !== userId);
    for (const id of notifyIds) {
      await prisma.notification.create({
        data: {
          userId: id,
          message: `You've been assigned: ${task.title}`,
          type: 'ASSIGNMENT',
          relatedTaskId: task.id,
        },
      });
    }
  }

  return task;
};

/**
 * Get all tasks in a project with filters and pagination
 */
const getTasks = async (projectId, filters) => {
  const { status, priority, assignees, search, page = 1, limit = 20 } = filters;

  const where = {
    projectId,
    deletedAt: null,
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assignees) where.assignees = { some: { id: assignees } };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        assignees: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get single task with comments and activity
 */
const getTaskById = async (taskId) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      deletedAt: null,
    },
    include: {
      assignees: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      comments: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      activityLogs: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { timestamp: 'desc' },
      },
      attachments: {
        include: {
          uploader: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { comments: true } },
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task;
};

/**
 * Update task fields
 */
const updateTask = async (taskId, projectId, data, userId) => {
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
    include: { assignees: { select: { id: true } } },
  });

  if (!existingTask) {
    throw new AppError('Task not found', 404);
  }

  // Get user's role in the project
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });

  if (!membership) {
    throw new AppError('You are not a member of this project.', 403);
  }

  if (membership.role !== 'ADMIN') {
    // Member can only update status, and only if they are one of the assignees
    const isAssignee = existingTask.assignees.some(a => a.id === userId);
    if (!isAssignee) {
      throw new AppError('Members can only update status of tasks assigned to them', 403);
    }
    
    const keys = Object.keys(data);
    if (keys.length > 1 || !keys.includes('status')) {
      throw new AppError('Members can only change task status', 403);
    }
  }

  // If assignees are being changed, verify they are project members
  if (data.assigneeIds && data.assigneeIds.length > 0) {
    const members = await prisma.projectMember.findMany({
      where: {
        projectId,
        userId: { in: data.assigneeIds },
      },
    });

    if (members.length !== data.assigneeIds.length) {
      throw new AppError('One or more assignees are not members of this project', 400);
    }
  }

  // Build update data
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.assigneeIds !== undefined) updateData.assignees = { set: data.assigneeIds.map(id => ({ id })) };
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assignees: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      _count: { select: { comments: true } },
    },
  });

  // Activity logging for specific changes
  const logActivity = async (action, oldVal, newVal) => {
    await prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action,
        oldValue: oldVal ? String(oldVal).substring(0, 255) : null,
        newValue: newVal ? String(newVal).substring(0, 255) : null,
      },
    });
  };

  if (data.title && data.title !== existingTask.title) {
    await logActivity('UPDATED', existingTask.title, data.title);
  }
  
  if (data.description !== undefined && data.description !== existingTask.description) {
    await logActivity('UPDATED', 'Description', 'Updated Description');
  }

  if (data.priority && data.priority !== existingTask.priority) {
    await logActivity('UPDATED', existingTask.priority, data.priority);
  }

  if (data.dueDate !== undefined) {
    const oldDate = existingTask.dueDate ? existingTask.dueDate.toISOString().split('T')[0] : null;
    const newDate = data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : null;
    if (oldDate !== newDate) {
      await logActivity('UPDATED', oldDate, newDate);
    }
  }

  if (data.status && data.status !== existingTask.status) {
    await logActivity('STATUS_CHANGED', existingTask.status, data.status);
  }

  if (data.assigneeIds !== undefined) {
    const oldIds = existingTask.assignees.map(a => a.id);
    const newIds = data.assigneeIds;
    const addedIds = newIds.filter(id => !oldIds.includes(id));
    const removedIds = oldIds.filter(id => !newIds.includes(id));

    if (addedIds.length > 0 || removedIds.length > 0) {
      const oldNames = existingTask.assignees.map(a => a.name).join(', ') || 'Unassigned';
      const newNames = task.assignees.map(a => a.name).join(', ') || 'Unassigned';
      await logActivity('ASSIGNED', oldNames, newNames);

      // Notification for newly added assignees
      for (const id of addedIds) {
        if (id !== userId) {
          await prisma.notification.create({
            data: {
              userId: id,
              message: `You've been assigned: ${task.title}`,
              type: 'ASSIGNMENT',
              relatedTaskId: taskId,
            },
          });
        }
      }
    }
  }

  return task;
};

/**
 * Soft-delete task
 */
const deleteTask = async (taskId, userId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  });

  // Activity log
  await prisma.activityLog.create({
    data: {
      taskId,
      userId,
      action: 'DELETED',
      oldValue: task.title,
    },
  });
};

/**
 * Add comment to task
 */
const addComment = async (taskId, content, userId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      userId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  // Activity log
  await prisma.activityLog.create({
    data: {
      taskId,
      userId,
      action: 'COMMENTED',
      newValue: content.substring(0, 100),
    },
  });

  // Notify task creator if different from commenter
  if (task.createdById !== userId) {
    await prisma.notification.create({
      data: {
        userId: task.createdById,
        message: `New comment on: ${task.title}`,
        type: 'COMMENT',
        relatedTaskId: taskId,
      },
    });
  }

  return comment;
};

/**
 * Get comments for a task
 */
const getComments = async (taskId) => {
  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return comments;
};

/**
 * Get activity log for a task
 */
const getTaskActivity = async (taskId) => {
  const logs = await prisma.activityLog.findMany({
    where: { taskId },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { timestamp: 'desc' },
  });

  return logs;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  getComments,
  getTaskActivity,
};
