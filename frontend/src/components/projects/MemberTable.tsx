import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectMember, ProjectRole } from '../../types';
import { Avatar } from '../ui/Avatar';
import { PermissionSelector } from './PermissionSelector';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { updateProjectMemberRole, removeProjectMember } from '../../store/slices/teamSlice';
import { updateProjectMemberRoleInState } from '../../store/slices/projectSlice';
import { addToast } from '../../store/slices/uiSlice';
import { AppDispatch, RootState } from '../../store';
import { usePermissions } from '../../hooks/usePermissions';
import { Trash2, UserMinus } from 'lucide-react';

interface MemberTableProps {
  projectId: string;
  members: ProjectMember[];
}

export const MemberTable: React.FC<MemberTableProps> = ({ projectId, members }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentProject = useSelector((state: RootState) => state.projects.currentProject);
  const permissions = usePermissions(currentProject);

  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRoleChange = async (targetUserId: string, targetCurrentRole: ProjectRole, newRole: ProjectRole) => {
    if (!permissions.canChangeSpecificMemberRole(targetCurrentRole, newRole)) {
      dispatch(addToast({ type: 'error', message: '403 Forbidden: You do not have permission to change this member role' }));
      return;
    }

    try {
      const updatedMembers = await dispatch(
        updateProjectMemberRole({ projectId, userId: targetUserId, role: newRole })
      ).unwrap();

      dispatch(updateProjectMemberRoleInState({ members: updatedMembers }));
      dispatch(addToast({ type: 'success', message: `Member role updated to ${newRole}` }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Failed to update member role' }));
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      await dispatch(
        removeProjectMember({ projectId, userId: memberToRemove.user._id })
      ).unwrap();

      dispatch(addToast({ type: 'success', message: `${memberToRemove.user.name} removed from project` }));
      setMemberToRemove(null);
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Failed to remove member' }));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border uppercase font-semibold text-muted-foreground text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Member</th>
              <th className="py-3 px-4">Role & Access</th>
              <th className="py-3 px-4 text-center">Assigned Tasks</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {members.map((member) => {
              const isOwner = member.role === ProjectRole.OWNER;
              const canEditRole = permissions.canChangeRoles && !isOwner;
              const canRemove = permissions.canManageMembers && !isOwner;

              return (
                <tr key={member.user._id} className="hover:bg-muted/30 transition-colors">
                  {/* Member Name & Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.user.name} src={member.user.avatar} size="sm" />
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{member.user.name}</span>
                          {isOwner && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                              Owner
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground text-[11px]">{member.user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role & PermissionSelector */}
                  <td className="py-3 px-4">
                    {isOwner ? (
                      <span className="font-semibold text-xs text-amber-600 dark:text-amber-400 capitalize">
                        Project Owner
                      </span>
                    ) : (
                      <PermissionSelector
                        currentRole={member.role}
                        disabled={!canEditRole}
                        onChangeRole={(newRole) => handleRoleChange(member.user._id, member.role, newRole)}
                      />
                    )}
                  </td>

                  {/* Assigned Tasks */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-foreground">
                    {member.assignedTasksCount || 0}
                  </td>

                  {/* Joined Date */}
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    {canRemove ? (
                      <button
                        onClick={() => setMemberToRemove(member)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-xs font-medium"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">Protected</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${memberToRemove?.user.name} (${memberToRemove?.user.email}) from this project? Their assigned tasks will be unassigned.`}
        confirmText="Remove Member"
        isLoading={isRemoving}
      />
    </>
  );
};
