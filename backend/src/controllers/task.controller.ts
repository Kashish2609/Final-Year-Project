import { Response } from 'express';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import { AuthenticatedRequest } from '../types/index.js';
import { ActivityService } from '../services/activity.service.js';
import { NotificationService } from '../services/notification.service.js';
import { getIO } from '../sockets/socketManager.js';

export const getProjectTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const { status, priority, assignedTo, search, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;

  const query: any = { project: projectId };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (search) {
    query.$or = [
      { title: { $regex: search as string, $options: 'i' } },
      { description: { $regex: search as string, $options: 'i' } },
    ];
  }

  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort(sortOptions);

  res.status(200).json({
    success: true,
    data: tasks,
  });
});

export const getMyTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { status, priority, search } = req.query;

  const query: any = { assignedTo: userId };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    query.title = { $regex: search as string, $options: 'i' };
  }

  const tasks = await Task.find(query)
    .populate('project', 'name key status')
    .populate('createdBy', 'name email avatar')
    .sort({ dueDate: 1, updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: tasks,
  });
});

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projectId = req.params.projectId;
  const { title, description, priority, status, assignedTo, dueDate, labels } = req.body;

  if (!userId) {
    throw new ErrorResponse('User not authenticated', 401);
  }

  const project = await Project.findById(projectId);
  if (!project || project.isDeleted) {
    throw new ErrorResponse('Project not found', 404);
  }

  // Determine highest taskNumber for project
  const lastTask = await Task.findOne({ project: projectId }).sort({ taskNumber: -1 });
  const taskNumber = lastTask ? lastTask.taskNumber + 1 : 101;

  const task = await Task.create({
    project: projectId,
    taskNumber,
    title,
    description: description || '',
    priority: priority || 'MEDIUM',
    status: status || 'TODO',
    assignedTo: assignedTo || undefined,
    createdBy: userId,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    labels: labels || [],
  });

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'project', select: 'name key' },
  ]);

  await ActivityService.logActivity({
    project: projectId,
    user: userId,
    action: `Created task "${title}" (${project.key}-${taskNumber})`,
    entityType: 'TASK',
    entityId: task._id,
  });

  if (assignedTo) {
    await NotificationService.createNotification({
      recipient: assignedTo,
      sender: userId,
      type: 'TASK_ASSIGNED',
      title: 'Task Assigned',
      message: `You were assigned to task "${title}"`,
      relatedProject: projectId,
      relatedTask: task._id as any,
    });
  }

  // Socket broadcast to project room
  try {
    getIO().to(`project:${projectId}`).emit('task:created', populated);
  } catch (err) {}

  res.status(201).json({
    success: true,
    data: populated,
  });
});

export const getTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.id;
  const task = await Task.findById(taskId)
    .populate('project', 'name key owner members')
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  if (!task) {
    throw new ErrorResponse('Task not found', 404);
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id;
  const { title, description, priority, status, assignedTo, dueDate, labels } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ErrorResponse('Task not found', 404);
  }

  const prevAssignee = task.assignedTo?.toString();

  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority) task.priority = priority;
  if (status) task.status = status;
  if (assignedTo !== undefined) task.assignedTo = assignedTo ? (assignedTo as any) : undefined;
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
  if (labels) task.labels = labels;

  await task.save();

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'project', select: 'name key' },
  ]);

  if (userId) {
    await ActivityService.logActivity({
      project: task.project,
      user: userId,
      action: `Updated task "${task.title}"`,
      entityType: 'TASK',
      entityId: task._id,
    });
  }

  if (assignedTo && assignedTo !== prevAssignee && userId) {
    await NotificationService.createNotification({
      recipient: assignedTo,
      sender: userId,
      type: 'TASK_ASSIGNED',
      title: 'Task Assigned',
      message: `You were assigned to task "${task.title}"`,
      relatedProject: task.project,
      relatedTask: task._id as any,
    });
  }

  try {
    getIO().to(`project:${task.project.toString()}`).emit('task:updated', populated);
  } catch (err) {}

  res.status(200).json({
    success: true,
    data: populated,
  });
});

export const updateTaskStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id;
  const { status } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ErrorResponse('Task not found', 404);
  }

  const oldStatus = task.status;
  task.status = status;
  await task.save();

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'project', select: 'name key' },
  ]);

  if (userId) {
    await ActivityService.logActivity({
      project: task.project,
      user: userId,
      action: `Moved task "${task.title}" from ${oldStatus} to ${status}`,
      entityType: 'TASK',
      entityId: task._id,
    });

    if (task.assignedTo && task.assignedTo.toString() !== userId) {
      await NotificationService.createNotification({
        recipient: task.assignedTo as any,
        sender: userId,
        type: 'TASK_STATUS_UPDATED',
        title: 'Task Status Changed',
        message: `Task "${task.title}" moved to ${status}`,
        relatedProject: task.project,
        relatedTask: task._id as any,
      });
    }
  }

  try {
    getIO().to(`project:${task.project.toString()}`).emit('task:statusUpdated', populated);
  } catch (err) {}

  res.status(200).json({
    success: true,
    data: populated,
  });
});

export const assignTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id;
  const { assignedTo } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ErrorResponse('Task not found', 404);
  }

  task.assignedTo = assignedTo ? (assignedTo as any) : undefined;
  await task.save();

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'project', select: 'name key' },
  ]);

  if (userId && assignedTo) {
    await NotificationService.createNotification({
      recipient: assignedTo,
      sender: userId,
      type: 'TASK_ASSIGNED',
      title: 'Task Assigned',
      message: `You were assigned to task "${task.title}"`,
      relatedProject: task.project,
      relatedTask: task._id as any,
    });
  }

  try {
    getIO().to(`project:${task.project.toString()}`).emit('task:assigned', populated);
  } catch (err) {}

  res.status(200).json({
    success: true,
    data: populated,
  });
});

export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ErrorResponse('Task not found', 404);
  }

  const projectId = task.project.toString();
  await task.deleteOne();

  if (userId) {
    await ActivityService.logActivity({
      project: projectId,
      user: userId,
      action: `Deleted task "${task.title}"`,
      entityType: 'TASK',
      entityId: task._id,
    });
  }

  try {
    getIO().to(`project:${projectId}`).emit('task:deleted', taskId);
  } catch (err) {}

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});
