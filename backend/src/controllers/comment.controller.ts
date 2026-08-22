import { Response } from 'express';
import { Comment } from '../models/Comment.js';
import { Task } from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import { AuthenticatedRequest } from '../types/index.js';
import { NotificationService } from '../services/notification.service.js';
import { ActivityService } from '../services/activity.service.js';
import { getIO } from '../sockets/socketManager.js';

export const getTaskComments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.taskId;
  const comments = await Comment.find({ task: taskId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    data: comments,
  });
});

export const createComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.taskId;
  const { content } = req.body;

  if (!userId) {
    throw new ErrorResponse('User not authenticated', 401);
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ErrorResponse('Task not found', 404);
  }

  const comment = await Comment.create({
    task: taskId,
    user: userId,
    content,
  });

  const populated = await comment.populate('user', 'name email avatar');

  await ActivityService.logActivity({
    project: task.project,
    user: userId,
    action: `Commented on task "${task.title}"`,
    entityType: 'COMMENT',
    entityId: comment._id,
  });

  if (task.assignedTo && task.assignedTo.toString() !== userId) {
    await NotificationService.createNotification({
      recipient: task.assignedTo as any,
      sender: userId,
      type: 'COMMENT_ADDED',
      title: 'New Comment',
      message: `Someone commented on task "${task.title}"`,
      relatedProject: task.project,
      relatedTask: task._id as any,
    });
  }

  try {
    getIO().to(`project:${task.project.toString()}`).emit('comment:created', populated);
  } catch (err) {}

  res.status(201).json({
    success: true,
    data: populated,
  });
});

export const deleteComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const commentId = req.params.id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ErrorResponse('Comment not found', 404);
  }

  if (comment.user.toString() !== userId) {
    throw new ErrorResponse('Not authorized to delete this comment', 403);
  }

  await comment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Comment deleted',
  });
});
