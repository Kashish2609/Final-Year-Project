import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Calendar, MessageSquare, GripVertical, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  onOpenTask: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onOpenTask }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    LOW: 'default',
    MEDIUM: 'primary',
    HIGH: 'warning',
    URGENT: 'danger',
  } as const;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group relative flex flex-col gap-2.5 p-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 transition-all select-none',
        isDragging && 'opacity-40 scale-95 border-dashed border-primary'
      )}
    >
      {/* Top Header: Drag handle & Priority & Task Key */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground rounded transition-colors"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] font-bold text-muted-foreground">
            #{task.taskNumber}
          </span>
        </div>

        <Badge variant={priorityColors[task.priority]} size="sm">
          {task.priority}
        </Badge>
      </div>

      {/* Title */}
      <div
        onClick={() => onOpenTask(task)}
        className="font-semibold text-xs text-foreground cursor-pointer hover:text-primary transition-colors line-clamp-2 leading-relaxed"
      >
        {task.title}
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Due date, comments count, assignee avatar */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div
              className={clsx(
                'flex items-center gap-1 font-medium',
                isOverdue ? 'text-red-500' : 'text-muted-foreground'
              )}
            >
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              {isOverdue && <AlertCircle className="w-3 h-3 text-red-500 ml-0.5" />}
            </div>
          )}

          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="w-3 h-3" />
            <span>0</span>
          </div>
        </div>

        <div>
          {task.assignedTo ? (
            <Avatar name={task.assignedTo.name} src={task.assignedTo.avatar} size="xs" />
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-border flex items-center justify-center text-[9px] text-muted-foreground font-bold">
              ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
