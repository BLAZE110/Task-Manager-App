const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

/**
 * Create a new project — creator auto-becomes ADMIN member
 */
const createProject = async (data, userId) => {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      ownerId: userId,
      members: {
        create: {
          userId: userId,
          role: 'ADMIN',
        },
      },
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { tasks: true } },
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      userId: userId,
      action: 'CREATED',
    }
  });

  return project;
};

/**
 * Get all projects for a user
 */
const getUserProjects = async (userId) => {
  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      members: {
        some: { userId },
      },
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      _count: {
        select: {
          tasks: { where: { deletedAt: null } },
          members: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return projects;
};

/**
 * Get single project by ID
 */
const getProjectById = async (projectId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      _count: {
        select: {
          tasks: { where: { deletedAt: null } },
        },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};

/**
 * Update project
 */
const updateProject = async (projectId, data, actionUserId) => {
  const oldProject = await prisma.project.findUnique({ where: { id: projectId } });
  
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;

  const project = await prisma.project.update({
    where: { id: projectId },
    data: updateData,
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      _count: {
        select: { tasks: true, members: true },
      },
    },
  });

  if (data.status && data.status !== oldProject.status) {
    await prisma.activityLog.create({
      data: {
        projectId,
        userId: actionUserId,
        action: 'PROJECT_STATUS_CHANGED',
        oldValue: oldProject.status,
        newValue: data.status
      }
    });
  }

  if (data.deadline !== undefined) {
    const oldD = oldProject.deadline ? oldProject.deadline.toISOString() : 'None';
    const newD = project.deadline ? project.deadline.toISOString() : 'None';
    if (oldD !== newD) {
      await prisma.activityLog.create({
        data: {
          projectId,
          userId: actionUserId,
          action: 'PROJECT_DEADLINE_CHANGED',
          oldValue: oldProject.deadline ? oldProject.deadline.toISOString().split('T')[0] : 'None',
          newValue: project.deadline ? project.deadline.toISOString().split('T')[0] : 'None'
        }
      });
    }
  }

  return project;
};

/**
 * Soft-delete project
 */
const deleteProject = async (projectId) => {
  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });
};

/**
 * Add member to project
 */
const addMember = async (projectId, email, role, actionUserId) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('User with this email not found', 404, [
      { field: 'email', message: 'No user found with this email' },
    ]);
  }

  // Check if already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: user.id,
      },
    },
  });

  if (existingMember) {
    throw new AppError('User is already a member of this project', 409);
  }

  // Add member
  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: user.id,
      role: role || 'MEMBER',
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  // Create notification for the added user
  await prisma.notification.create({
    data: {
      userId: user.id,
      message: `You've been added to a project`,
      type: 'PROJECT_INVITE',
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      userId: actionUserId,
      action: 'PROJECT_MEMBER_ADDED',
      newValue: user.name
    }
  });

  return member;
};

/**
 * Remove member from project (with last admin protection)
 */
const removeMember = async (projectId, userId, actionUserId) => {
  // Check if member exists
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError('User is not a member of this project', 404);
  }

  const userToRemove = await prisma.user.findUnique({ where: { id: userId } });

  // Last admin protection
  if (member.role === 'ADMIN') {
    const adminCount = await prisma.projectMember.count({
      where: {
        projectId,
        role: 'ADMIN',
      },
    });

    if (adminCount <= 1) {
      throw new AppError(
        'Cannot remove the only project admin. Assign another admin first.',
        400
      );
    }
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      userId: actionUserId,
      action: 'PROJECT_MEMBER_REMOVED',
      oldValue: userToRemove.name
    }
  });
};

/**
 * Get project members
 */
const getMembers = async (projectId) => {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true, role: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return members;
};

/**
 * Get project activity logs
 */
const getProjectActivity = async (projectId) => {
  const logs = await prisma.activityLog.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } }
    },
    orderBy: { timestamp: 'desc' }
  });
  return logs;
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getMembers,
  getProjectActivity,
};
