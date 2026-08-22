import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'PROJECT_INVITE' | 'ROLE_CHANGE' | 'TASK_ASSIGNED' | 'TASK_STATUS_UPDATED' | 'COMMENT_ADDED' | 'MEMBER_REMOVED';
  title: string;
  message: string;
  relatedProject?: mongoose.Types.ObjectId;
  relatedTask?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['PROJECT_INVITE', 'ROLE_CHANGE', 'TASK_ASSIGNED', 'TASK_STATUS_UPDATED', 'COMMENT_ADDED', 'MEMBER_REMOVED'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedProject: { type: Schema.Types.ObjectId, ref: 'Project' },
    relatedTask: { type: Schema.Types.ObjectId, ref: 'Task' },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
