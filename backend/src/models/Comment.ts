import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  task: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ task: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
