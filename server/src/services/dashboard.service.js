const prisma = require('../utils/prisma');

const getDashboardStats = async (userId) => {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const projectIds = memberships.map((m) => m.projectId);

  if (projectIds.length === 0) {
    return { 
      totalTasks: 0, 
      byStatus: { TODO: 0, IN_PROGRESS: 0, DONE: 0 }, 
      byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      byUser: [], 
      overdueCount: 0, 
      totalProjects: 0,
      projectStatus: { ACTIVE: 0, COMPLETED: 0, ARCHIVED: 0 }
    };
  }

  const baseWhere = { projectId: { in: projectIds }, deletedAt: null };
  const totalTasks = await prisma.task.count({ where: baseWhere });

  const statusGroups = await prisma.task.groupBy({ by: ['status'], where: baseWhere, _count: true });
  const byStatus = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  statusGroups.forEach((g) => { byStatus[g.status] = g._count; });

  const priorityGroups = await prisma.task.groupBy({ by: ['priority'], where: baseWhere, _count: true });
  const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  priorityGroups.forEach(g => { byPriority[g.priority] = g._count; });

  const projectGroups = await prisma.project.groupBy({ by: ['status'], where: { id: { in: projectIds }, deletedAt: null }, _count: true });
  const projectStatus = { ACTIVE: 0, COMPLETED: 0, ARCHIVED: 0 };
  projectGroups.forEach(g => { projectStatus[g.status] = g._count; });

  const usersWithTasks = await prisma.user.findMany({
    where: {
      assignedTasks: { some: baseWhere }
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      assignedTasks: {
        where: baseWhere,
        select: { status: true }
      }
    }
  });

  const byUser = usersWithTasks.map(u => {
    let TODO = 0, IN_PROGRESS = 0, DONE = 0;
    u.assignedTasks.forEach(t => {
      if (t.status === 'TODO') TODO++;
      else if (t.status === 'IN_PROGRESS') IN_PROGRESS++;
      else if (t.status === 'DONE') DONE++;
    });
    return {
      user: { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl },
      taskCount: u.assignedTasks.length,
      TODO,
      IN_PROGRESS,
      DONE
    };
  }).sort((a, b) => b.taskCount - a.taskCount).slice(0, 10);

  const overdueCount = await prisma.task.count({ where: { ...baseWhere, dueDate: { lt: new Date() }, status: { not: 'DONE' } } });

  return { totalTasks, byStatus, byPriority, byUser, overdueCount, totalProjects: projectIds.length, projectStatus };
};

const getMyTasks = async (userId) => {
  return prisma.task.findMany({
    where: { assignees: { some: { id: userId } }, deletedAt: null },
    include: { project: { select: { id: true, name: true } }, createdBy: { select: { id: true, name: true } }, _count: { select: { comments: true } } },
    orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
  });
};

const getOverdueTasks = async (userId) => {
  const memberships = await prisma.projectMember.findMany({ where: { userId }, select: { projectId: true } });
  const projectIds = memberships.map((m) => m.projectId);
  return prisma.task.findMany({
    where: { projectId: { in: projectIds }, deletedAt: null, dueDate: { lt: new Date() }, status: { not: 'DONE' } },
    include: { project: { select: { id: true, name: true } }, assignees: { select: { id: true, name: true, email: true, avatarUrl: true } }, _count: { select: { comments: true } } },
    orderBy: { dueDate: 'asc' },
  });
};

module.exports = { getDashboardStats, getMyTasks, getOverdueTasks };
