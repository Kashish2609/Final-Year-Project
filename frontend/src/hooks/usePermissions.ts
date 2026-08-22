import { useAuth } from './useAuth';
import { Project, GlobalRole, ProjectRole } from '../types';

export const usePermissions = (project?: Project | null) => {
  const { user } = useAuth();

  const isSuperAdmin = user?.globalRole === GlobalRole.SUPER_ADMIN;

  let currentRole: ProjectRole | null = null;
  if (project && user) {
    if (project.owner._id === user._id || (typeof project.owner === 'string' && project.owner === user._id)) {
      currentRole = ProjectRole.OWNER;
    } else {
      const member = project.members.find(
        (m) => m.user._id === user._id || (typeof m.user === 'string' && m.user === user._id)
      );
      if (member) {
        currentRole = member.role;
      }
    }
  }

  const isOwner = currentRole === ProjectRole.OWNER;
  const isAdmin = currentRole === ProjectRole.ADMIN;
  const isEditor = currentRole === ProjectRole.EDITOR;
  const isMember = currentRole === ProjectRole.MEMBER;

  return {
    currentRole,
    isSuperAdmin,
    isOwner,
    isAdmin,
    isEditor,
    isMember,

    canEditProject: isSuperAdmin || isOwner || isAdmin,
    canDeleteProject: isSuperAdmin || isOwner || isAdmin,
    canManageMembers: isSuperAdmin || isOwner || isAdmin,
    canChangeRoles: isSuperAdmin || isOwner || isAdmin,
    canCreateTask: isSuperAdmin || isOwner || isAdmin || isEditor,
    canEditTask: isSuperAdmin || isOwner || isAdmin || isEditor,
    canDeleteTask: isSuperAdmin || isOwner || isAdmin || isEditor,
    canAssignTask: isSuperAdmin || isOwner || isAdmin || isEditor,

    canUpdateTaskStatus: (assignedToUserId?: string) => {
      if (isSuperAdmin || isOwner || isAdmin || isEditor) return true;
      if (isMember && assignedToUserId && user?._id === assignedToUserId) return true;
      return false;
    },

    canChangeSpecificMemberRole: (targetCurrentRole: ProjectRole, targetNewRole: ProjectRole) => {
      if (isSuperAdmin) return true;
      if ((targetCurrentRole as string) === ProjectRole.OWNER || (targetNewRole as string) === ProjectRole.OWNER) return false;
      if (isOwner) return true;
      if (isAdmin) {
        return (targetCurrentRole as string) !== ProjectRole.OWNER && (targetNewRole as string) !== ProjectRole.OWNER;
      }
      return false;
    },
  };
};
