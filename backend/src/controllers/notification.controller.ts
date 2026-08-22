import { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getMyNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const notifications = await Notification.find({ recipient: userId })
    .populate('sender', 'name email avatar')
    .populate('relatedProject', 'name key')
    .populate('relatedTask', 'title taskNumber')
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
  });
});

export const markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const notificationId = req.params.id;

  const notification = await Notification.findOne({ _id: notificationId, recipient: userId });
  if (notification) {
    notification.isRead = true;
    await notification.save();
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
  });
});

export const markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});
