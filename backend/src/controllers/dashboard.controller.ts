import { Response } from 'express';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/index.js';
import { GlobalRole } from '../types/permissions.js';

export const getDashboardOverview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const globalRole = req.user?.globalRole;

  const projectFilter: any = { isDeleted: false };
  if (globalRole !== GlobalRole.SUPER_ADMIN) {
    projectFilter.$or = [{ owner: userId }, { 'members.user': userId }];
  }

  const projects = await Project.find(projectFilter);
  const projectIds = projects.map((p) => p._id);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;

  const tasks = await Task.find({ project: { $in: projectIds } });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const pendingTasks = tasks.filter((t) => t.status === 'TODO').length;

  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED'
  ).length;

  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalUsers = await User.countDocuments({ isActive: true });

  res.status(200).json({
    success: true,
    data: {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      productivityPercentage: productivity,
      teamMembersCount: totalUsers,
    },
  });
});

export const getDashboardAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const globalRole = req.user?.globalRole;

  const projectFilter: any = { isDeleted: false };
  if (globalRole !== GlobalRole.SUPER_ADMIN) {
    projectFilter.$or = [{ owner: userId }, { 'members.user': userId }];
  }

  const projects = await Project.find(projectFilter).select('name progress status key');
  const projectIds = projects.map((p) => p._id);
  const tasks = await Task.find({ project: { $in: projectIds } }).populate('assignedTo', 'name email avatar');

  // Tasks by status
  const tasksByStatus = [
    { name: 'To Do', value: tasks.filter((t) => t.status === 'TODO').length, color: '#94a3b8' },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'IN_PROGRESS').length, color: '#3b82f6' },
    { name: 'Completed', value: tasks.filter((t) => t.status === 'COMPLETED').length, color: '#10b981' },
  ];

  // Tasks by priority
  const tasksByPriority = [
    { name: 'Low', value: tasks.filter((t) => t.priority === 'LOW').length },
    { name: 'Medium', value: tasks.filter((t) => t.priority === 'MEDIUM').length },
    { name: 'High', value: tasks.filter((t) => t.priority === 'HIGH').length },
    { name: 'Urgent', value: tasks.filter((t) => t.priority === 'URGENT').length },
  ];

  // Project progress data
  const projectProgress = projects.map((p) => ({
    name: p.name,
    key: p.key,
    progress: p.progress,
  }));

  // Team productivity mapping
  const userMap: Record<string, { name: string; completed: number; total: number }> = {};
  tasks.forEach((t: any) => {
    if (t.assignedTo) {
      const uName = t.assignedTo.name || 'Unassigned';
      if (!userMap[uName]) {
        userMap[uName] = { name: uName, completed: 0, total: 0 };
      }
      userMap[uName].total += 1;
      if (t.status === 'COMPLETED') {
        userMap[uName].completed += 1;
      }
    }
  });

  const teamProductivity = Object.values(userMap).slice(0, 8);

  res.status(200).json({
    success: true,
    data: {
      tasksByStatus,
      tasksByPriority,
      projectProgress,
      teamProductivity,
    },
  });
});

export const getProjectActivity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const projectId = req.params.id;
  const { limit = '20' } = req.query;

  const logs = await ActivityLog.find({ project: projectId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit as string, 10));

  res.status(200).json({
    success: true,
    data: logs,
  });
});
