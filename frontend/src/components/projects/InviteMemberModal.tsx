import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { addProjectMember } from '../../store/slices/teamSlice';
import { updateProjectMemberRoleInState } from '../../store/slices/projectSlice';
import { setInviteMemberModalOpen, addToast } from '../../store/slices/uiSlice';
import { AppDispatch, RootState } from '../../store';
import { ProjectRole } from '../../types';

const inviteSchema = z.object({
  email: z.string().email('Valid email address is required'),
  role: z.enum([ProjectRole.ADMIN, ProjectRole.EDITOR, ProjectRole.MEMBER]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export const InviteMemberModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((state: RootState) => state.ui.inviteMemberModalOpen);
  const currentProject = useSelector((state: RootState) => state.projects.currentProject);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: ProjectRole.MEMBER,
    },
  });

  const onClose = () => {
    reset();
    dispatch(setInviteMemberModalOpen(false));
  };

  const onSubmit = async (data: InviteFormData) => {
    if (!currentProject) return;
    try {
      const updatedMembers = await dispatch(
        addProjectMember({ projectId: currentProject._id, email: data.email, role: data.role })
      ).unwrap();

      dispatch(updateProjectMemberRoleInState({ members: updatedMembers }));
      dispatch(addToast({ type: 'success', message: `Invited ${data.email} as ${data.role}` }));
      onClose();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Failed to add member' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member to Project" maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="User Email Address"
          placeholder="e.g., alex@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Select
          label="Project Role"
          options={[
            { value: ProjectRole.ADMIN, label: 'Project Admin (Manage members & tasks)' },
            { value: ProjectRole.EDITOR, label: 'Editor (Create & edit tasks)' },
            { value: ProjectRole.MEMBER, label: 'Member (View & update assigned tasks)' },
          ]}
          {...register('role')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isSubmitting}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
