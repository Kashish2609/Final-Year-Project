import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Task, ProjectRole } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  fetchTaskComments,
  addComment,
  deleteTask,
  updateTask,
} from '../../store/slices/taskSlice';
import { addToast } from '../../store/slices/uiSlice';
import { AppDispatch, RootState } from '../../store';
import { usePermissions } from '../../hooks/usePermissions';
import { Calendar, User as UserIcon, Trash2, Send, Clock, Tag } from 'lucide-react';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentProject = useSelector((state: RootState) => state.projects.currentProject);
  const { comments, isCommentsLoading } = useSelector((state: RootState) => state.tasks);

  const permissions = usePermissions(currentProject);

  const [commentText, setCommentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      dispatch(fetchTaskComments(task._id));
    }
  }, [dispatch, task, isOpen]);

  if (!task) return null;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    try {
      await dispatch(updateTask({ id: task._id, data: { status: newStatus } })).unwrap();
      dispatch(addToast({ type: 'success', message: 'Status updated' }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err }));
    }
  };

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value;
    try {
      await dispatch(updateTask({ id: task._id, data: { priority: newPriority } })).unwrap();
      dispatch(addToast({ type: 'success', message: 'Priority updated' }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err }));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await dispatch(addComment({ taskId: task._id, content: commentText.trim() })).unwrap();
      setCommentText('');
      dispatch(addToast({ type: 'success', message: 'Comment added' }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err }));
    }
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteTask(task._id)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Task deleted' }));
      setShowConfirmDelete(false);
      onClose();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-muted-foreground">
                #{task.taskNumber}
              </span>
              <Badge variant="primary">{task.status.replace('_', ' ')}</Badge>
            </div>

            {permissions.canDeleteTask && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-500/10"
                onClick={() => setShowConfirmDelete(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Body Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{task.title}</h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              {/* Labels */}
              {task.labels && task.labels.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {task.labels.map((l, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground border">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t border-border pt-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Activity & Comments</h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {isCommentsLoading ? (
                    <div className="text-xs text-muted-foreground">Loading comments...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">No comments yet.</div>
                  ) : (
                    comments.map((c) => (
                      <div key={c._id} className="p-3 rounded-lg border border-border bg-card/60 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Avatar name={c.user.name} src={c.user.avatar} size="xs" />
                            <span className="font-semibold text-foreground">{c.user.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-7">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button type="submit" size="sm" rightIcon={<Send className="w-3.5 h-3.5" />}>
                    Send
                  </Button>
                </form>
              </div>
            </div>

            {/* Sidebar Details Column */}
            <div className="space-y-4 border-l border-border pl-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Status</label>
                <Select
                  value={task.status}
                  disabled={!permissions.canUpdateTaskStatus(task.assignedTo?._id)}
                  onChange={handleStatusChange}
                  options={[
                    { value: 'TODO', label: 'To Do' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'COMPLETED', label: 'Completed' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Priority</label>
                <Select
                  value={task.priority}
                  disabled={!permissions.canEditTask}
                  onChange={handlePriorityChange}
                  options={[
                    { value: 'LOW', label: 'Low' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' },
                    { value: 'URGENT', label: 'Urgent' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Assignee</label>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card">
                  {task.assignedTo ? (
                    <>
                      <Avatar name={task.assignedTo.name} src={task.assignedTo.avatar} size="xs" />
                      <span className="text-xs font-semibold text-foreground truncate">{task.assignedTo.name}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Unassigned</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Due Date</label>
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-lg border border-border bg-card">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Created By</label>
                <div className="flex items-center gap-2">
                  <Avatar name={task.createdBy?.name || 'User'} src={task.createdBy?.avatar} size="xs" />
                  <span className="text-xs text-muted-foreground">{task.createdBy?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to permanently delete task "${task.title}"?`}
        confirmText="Delete Task"
        isLoading={isDeleting}
      />
    </>
  );
};
