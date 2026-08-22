import { Response } from 'express';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import { AuthenticatedRequest } from '../types/index.js';
import { GlobalRole, ProjectRole } from '../types/permissions.js';
import { ActivityService } from '../services/activity.service.js';

export const getProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const globalRole = req.user?.globalRole;
  const { search, status, page = '1', limit = '20' } = req.query;

  const query: any = { isDeleted: false };

  // If normal user, filter by membership or ownership
  if (globalRole !== GlobalRole.SUPER_ADMIN) {
    query.$or = [{ owner: userId }, { 'members.user': userId }];
  }

  if (search) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { name: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
        { key: { $regex: search as string, $options: 'i' } },
      ],
    });
  }

  if (status) {
    query.status = status;
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Project.countDocuments(query);
  const projects = await Project.find(query)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: projects,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, key, description, priority, startDate, dueDate } = req.body;

  if (!userId) {
    throw new ErrorResponse('User not authenticated', 401);
  }

  // Generate short key if not provided
  let projectKey = key;
  if (!projectKey) {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    projectKey = (cleanName.slice(0, 4) || 'PRJ') + Math.floor(10 + Math.random() * 90);
  }

  const project = await Project.create({
    name,
    key: projectKey,
    description: description || '',
    owner: userId,
    members: [
      {
        user: userId,
        role: ProjectRole.OWNER,
        joinedAt: new Date(),
      },
    ],
    priority: priority || 'MEDIUM',
    startDate: startDate ? new Date(startDate) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });

  const populated = await project.populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members.user', select: 'name email avatar' },
  ]);

  await ActivityService.logActivity({
    project: project._id,
    user: userId,
    action: 'Created the project',
    entityType: 'PROJECT',
    entityId: project._id,
  });

  res.status(201).json({
    success: true,
    data: populated,
  });
});

export const getProjectById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = (req as any).project || (await Project.findById(req.params.id));
  if (!project || project.isDeleted) {
    throw new ErrorResponse('Project not found', 404);
  }

  const populated = await project.populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members.user', select: 'name email avatar' },
  ]);

  // Compute tasks summary
  const tasks = await Task.find({ project: project._id });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (project.progress !== progress) {
    project.progress = progress;
    await project.save();
  }

  res.status(200).json({
    success: true,
    data: populated,
    stats: {
      totalTasks,
      completedTasks,
      inProgressTasks: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      todoTasks: tasks.filter((t) => t.status === 'TODO').length,
    },
  });
});

export const updateProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projectId = req.params.id;
  const { name, description, status, priority, startDate, dueDate } = req.body;

  const project = await Project.findById(projectId);
  if (!project || project.isDeleted) {
    throw new ErrorResponse('Project not found', 404);
  }

  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (status) project.status = status;
  if (priority) project.priority = priority;
  if (startDate !== undefined) project.startDate = startDate ? new Date(startDate) : undefined;
  if (dueDate !== undefined) project.dueDate = dueDate ? new Date(dueDate) : undefined;

  await project.save();

  const populated = await project.populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members.user', select: 'name email avatar' },
  ]);

  if (userId) {
    await ActivityService.logActivity({
      project: project._id,
      user: userId,
      action: 'Updated project details',
      entityType: 'PROJECT',
      entityId: project._id,
    });
  }

  res.status(200).json({
    success: true,
    data: populated,
  });
});

export const deleteProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projectId = req.params.id;

  const project = await Project.findById(projectId);
  if (!project || project.isDeleted) {
    throw new ErrorResponse('Project not found', 404);
  }

  project.isDeleted = true;
  project.deletedAt = new Date();
  await project.save();

  if (userId) {
    await ActivityService.logActivity({
      project: project._id,
      user: userId,
      action: 'Soft-deleted project',
      entityType: 'PROJECT',
      entityId: project._id,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  });
});
