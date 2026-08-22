import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import { useDispatch } from 'react-redux';
import { Task } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { updateTaskStatus } from '../../store/slices/taskSlice';
import { addToast } from '../../store/slices/uiSlice';
import { AppDispatch } from '../../store';

interface KanbanBoardProps {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onAddTask?: (status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => void;
  canCreateTask?: boolean;
  canUpdateStatus?: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onOpenTask,
  onAddTask,
  canCreateTask = true,
  canUpdateStatus = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const columns: { id: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'; title: string }[] = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'COMPLETED', title: 'Completed' },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const task = tasks.find((t) => t._id === activeTaskId);
    if (!task) return;

    // Determine target column ID (over could be a column or another card)
    let targetStatus: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | null = null;

    if (['TODO', 'IN_PROGRESS', 'COMPLETED'].includes(over.id as string)) {
      targetStatus = over.id as any;
    } else {
      const overTask = tasks.find((t) => t._id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus && targetStatus !== task.status) {
      if (!canUpdateStatus) {
        dispatch(addToast({ type: 'error', message: '403 Forbidden: You do not have permission to change task status' }));
        return;
      }

      try {
        await dispatch(updateTaskStatus({ id: activeTaskId, status: targetStatus })).unwrap();
        dispatch(addToast({ type: 'success', message: `Moved task to ${targetStatus.replace('_', ' ')}` }));
      } catch (err: any) {
        dispatch(addToast({ type: 'error', message: err || 'Failed to update task status' }));
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 pt-2">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={colTasks}
              onOpenTask={onOpenTask}
              onAddTask={onAddTask}
              canCreateTask={canCreateTask}
            />
          );
        })}
      </div>

      <DragOverlay>{activeTask ? <TaskCard task={activeTask} onOpenTask={() => {}} /> : null}</DragOverlay>
    </DndContext>
  );
};
