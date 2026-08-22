import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { createProject } from '../../store/slices/projectSlice';
import { setCreateProjectModalOpen, addToast } from '../../store/slices/uiSlice';
import { AppDispatch, RootState } from '../../store';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  key: z.string().min(2, 'Key must be 2-6 letters').max(10).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export const CreateProjectModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isOpen = useSelector((state: RootState) => state.ui.createProjectModalOpen);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
      priority: 'MEDIUM',
      startDate: '',
      dueDate: '',
    },
  });

  const onClose = () => {
    reset();
    dispatch(setCreateProjectModalOpen(false));
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const created = await dispatch(createProject(data)).unwrap();
      dispatch(addToast({ type: 'success', message: `Project "${created.name}" created!` }));
      onClose();
      navigate(`/projects/${created._id}`);
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Failed to create project' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Project Name"
              placeholder="e.g., Alpha SaaS Engine"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <Input
            label="Key"
            placeholder="e.g., ALPHA"
            error={errors.key?.message}
            {...register('key')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Objectives and scope of this project..."
            className="w-full rounded-lg border border-input bg-card p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
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

          <Input label="Start Date" type="date" {...register('startDate')} />
          <Input label="Due Date" type="date" {...register('dueDate')} />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isSubmitting}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
