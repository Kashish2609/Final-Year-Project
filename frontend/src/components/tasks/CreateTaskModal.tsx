import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { createTask } from '../../store/slices/taskSlice';
import { setCreateTaskModalOpen, addToast } from '../../store/slices/uiSlice';
import { AppDispatch, RootState } from '../../store';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  labelsStr: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const CreateTaskModal: React.FC<{ initialStatus?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' }> = ({
  initialStatus = 'TODO',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((state: RootState) => state.ui.createTaskModalOpen);
  const currentProject = useSelector((state: RootState) => state.projects.currentProject);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: initialStatus,
      assignedTo: '',
      dueDate: '',
      labelsStr: '',
    },
  });

  const onClose = () => {
    reset();
    dispatch(setCreateTaskModalOpen(false));
  };

  const onSubmit = async (data: TaskFormData) => {
    if (!currentProject) {
      dispatch(addToast({ type: 'error', message: 'No active project selected' }));
      return;
    }

    const labels = data.labelsStr
      ? data.labelsStr.split(',').map((l) => l.trim()).filter(Boolean)
      : [];

    try {
      await dispatch(
        createTask({
          projectId: currentProject._id,
          data: {
            title: data.title,
            description: data.description,
            priority: data.priority,
            status: data.status,
            assignedTo: data.assignedTo || undefined,
            dueDate: data.dueDate || undefined,
            labels,
          },
        })
      ).unwrap();

      dispatch(addToast({ type: 'success', message: 'Task created successfully' }));
      onClose();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Failed to create task' }));
    }
  };

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...(currentProject?.members || []).map((m) => ({
      value: m.user._id,
      label: m.user.name,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g., Integrate Socket.io notifications gateway"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Detailed description or requirements..."
            className="w-full rounded-lg border border-input bg-card p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' },
            ]}
            {...register('priority')}
          />

          <Select
            label="Status"
            options={[
              { value: 'TODO', label: 'To Do' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
            {...register('status')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Assignee" options={memberOptions} {...register('assignedTo')} />

          <Input label="Due Date" type="date" {...register('dueDate')} />
        </div>

        <Input
          label="Labels (comma separated)"
          placeholder="Frontend, API, High Priority"
          {...register('labelsStr')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isSubmitting}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
