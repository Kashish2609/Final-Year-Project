import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  project: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  action: string;
  entityType: 'PROJECT' | 'TASK' | 'MEMBER' | 'COMMENT';
  entityId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['PROJECT', 'TASK', 'MEMBER', 'COMMENT'],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

ActivityLogSchema.index({ project: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
