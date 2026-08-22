import { Notification } from '../models/Notification.js';
import { getIO } from '../sockets/socketManager.js';
import mongoose from 'mongoose';

export class NotificationService {
  static async createNotification(data: {
    recipient: string | mongoose.Types.ObjectId;
    sender?: string | mongoose.Types.ObjectId;
    type: 'PROJECT_INVITE' | 'ROLE_CHANGE' | 'TASK_ASSIGNED' | 'TASK_STATUS_UPDATED' | 'COMMENT_ADDED' | 'MEMBER_REMOVED';
    title: string;
    message: string;
    relatedProject?: string | mongoose.Types.ObjectId;
    relatedTask?: string | mongoose.Types.ObjectId;
  }) {
    try {
      // Don't send notification to self
      if (data.sender && data.sender.toString() === data.recipient.toString()) {
        return;
      }

      const notification = await Notification.create(data);
      const populated = await notification.populate([
        { path: 'sender', select: 'name email avatar' },
        { path: 'relatedProject', select: 'name key' },
        { path: 'relatedTask', select: 'title taskNumber' },
      ]);

      // Socket.io real-time emit
      try {
        const io = getIO();
        if (io) {
          io.to(`user:${data.recipient.toString()}`).emit('notification:new', populated);
        }
      } catch (err) {
        // Socket may not be initialized during testing/seeding
      }

      return populated;
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
}
