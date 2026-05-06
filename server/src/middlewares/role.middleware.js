const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

/**
 * Check if user is a member of the project (from route param :id or :projectId)
 * Attaches the membership record to req.membership
 */
const projectAccessMiddleware = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;

    if (!projectId) {
      throw new AppError('Project ID is required.', 400);
    }

    // Check project exists and is not deleted
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    // Check membership
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
    });

    if (!membership) {
      throw new AppError('You are not a member of this project.', 403);
    }

    req.project = project;
    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has the required project-level role
 * Must be used AFTER projectAccessMiddleware
 */
const roleGuard = (requiredRole) => {
  return (req, res, next) => {
    if (!req.membership) {
      return next(new AppError('Access denied. Membership not verified.', 403));
    }

    const roleHierarchy = { ADMIN: 2, MEMBER: 1 };
    const userLevel = roleHierarchy[req.membership.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return next(
        new AppError(`Access denied. Requires ${requiredRole} role in this project.`, 403)
      );
    }

    next();
  };
};

module.exports = { projectAccessMiddleware, roleGuard };
