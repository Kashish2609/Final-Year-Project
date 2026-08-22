import { ActivityLog } from '../models/ActivityLog.js';
import mongoose from 'mongoose';

export class ActivityService {
  static async logActivity(data: {
    project: string | mongoose.Types.ObjectId;
    user: string | mongoose.Types.ObjectId;
    action: string;
    entityType: 'PROJECT' | 'TASK' | 'MEMBER' | 'COMMENT';
    entityId?: string | mongoose.Types.ObjectId;
    metadata?: Record<string, any>;
  }) {
    try {
      await ActivityLog.create(data);
    } catch (error) {
      console.error('Failed to record activity log:', error);
    }
  }
}
