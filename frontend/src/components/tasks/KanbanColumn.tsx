import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';

interface KanbanColumnProps {
  id: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  title: string;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onAddTask?: (status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => void;
  canCreateTask?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onOpenTask,
  onAddTask,
  canCreateTask = true,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const columnDotColor = {
    TODO: 'bg-slate-400',
    IN_PROGRESS: 'bg-blue-500 animate-pulse',
    COMPLETED: 'bg-emerald-500',
  }[id];

  return (
    <div className="flex flex-col w-80 shrink-0 rounded-2xl border border-border bg-card/40 p-4 min-h-[500px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={clsx('w-2.5 h-2.5 rounded-full', columnDotColor)} />
          <h3 className="font-bold text-xs tracking-wider uppercase text-foreground">{title}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            {tasks.length}
          </span>
        </div>

        {canCreateTask && onAddTask && (
          <button
            onClick={() => onAddTask(id)}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Add Task"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Droppable Task Container */}
      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 flex flex-col gap-3 transition-colors rounded-xl p-1',
          isOver && 'bg-primary/5 ring-2 ring-primary/20'
        )}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onOpenTask={onOpenTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-border/60 rounded-xl text-xs text-muted-foreground">
            <span>No tasks in {title.toLowerCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
};
