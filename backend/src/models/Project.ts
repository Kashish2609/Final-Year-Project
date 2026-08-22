import mongoose, { Schema, Document } from 'mongoose';
import { ProjectRole } from '../types/permissions.js';

export interface IProjectMember {
  user: mongoose.Types.ObjectId;
  role: ProjectRole;
  joinedAt: Date;
}

export interface IProject extends Document {
  name: string;
  key: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: IProjectMember[];
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate?: Date;
  dueDate?: Date;
  progress: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: Object.values(ProjectRole),
    default: ProjectRole.MEMBER,
    required: true,
  },
  joinedAt: { type: Date, default: Date.now },
});

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [ProjectMemberSchema],
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED', 'COMPLETED'],
      default: 'ACTIVE',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ 'members.user': 1 });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ isDeleted: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
