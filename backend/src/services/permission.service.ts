import { GlobalRole, ProjectRole, ProjectPermissionAction } from '../types/permissions.js';
import { IProject } from '../models/Project.js';

export class PermissionService {
  /**
   * Determine project role for a user given a project object
   */
  static getMemberRole(project: IProject, userId: string): ProjectRole | null {
    if (project.owner.toString() === userId.toString()) {
      return ProjectRole.OWNER;
    }
    const member = project.members.find(
      (m) => m.user.toString() === userId.toString()
    );
    return member ? member.role : null;
  }

  /**
   * Checks if user has permission to perform action on a project
   */
  static hasPermission(
    globalRole: GlobalRole,
    projectRole: ProjectRole | null,
    action: ProjectPermissionAction,
    isTaskAssignee: boolean = false
  ): boolean {
    // Super Admin has global override capability
    if (globalRole === GlobalRole.SUPER_ADMIN) {
      return true;
    }

    if (!projectRole) {
      return false;
    }

    switch (action) {
      case ProjectPermissionAction.VIEW_PROJECT:
        return true; // Any member can view project

      case ProjectPermissionAction.EDIT_PROJECT:
        return [ProjectRole.OWNER, ProjectRole.ADMIN].includes(projectRole);

      case ProjectPermissionAction.DELETE_PROJECT:
        return [ProjectRole.OWNER, ProjectRole.ADMIN].includes(projectRole);

      case ProjectPermissionAction.MANAGE_MEMBERS:
        return [ProjectRole.OWNER, ProjectRole.ADMIN].includes(projectRole);

      case ProjectPermissionAction.CHANGE_ROLES:
        return [ProjectRole.OWNER, ProjectRole.ADMIN].includes(projectRole);

      case ProjectPermissionAction.CREATE_TASK:
      case ProjectPermissionAction.EDIT_TASK:
      case ProjectPermissionAction.DELETE_TASK:
      case ProjectPermissionAction.ASSIGN_TASK:
        return [ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.EDITOR].includes(projectRole);

      case ProjectPermissionAction.CHANGE_TASK_STATUS:
        if ([ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.EDITOR].includes(projectRole)) {
          return true;
        }
        // Member can update task status if they are assigned to it
        return projectRole === ProjectRole.MEMBER && isTaskAssignee;

      case ProjectPermissionAction.COMMENT:
        return true; // All project members can comment

      case ProjectPermissionAction.VIEW_ANALYTICS:
        return [ProjectRole.OWNER, ProjectRole.ADMIN, ProjectRole.EDITOR].includes(projectRole);

      default:
        return false;
    }
  }

  /**
   * Helper to verify if target user role change is permitted
   */
  static canChangeRole(
    actorGlobalRole: GlobalRole,
    actorProjectRole: ProjectRole,
    targetCurrentRole: ProjectRole,
    targetNewRole: ProjectRole
  ): boolean {
    if (actorGlobalRole === GlobalRole.SUPER_ADMIN) {
      return true;
    }
    // Cannot change owner role
    if ((targetCurrentRole as string) === ProjectRole.OWNER || (targetNewRole as string) === ProjectRole.OWNER) {
      return false;
    }
    // Owner can change anyone
    if (actorProjectRole === ProjectRole.OWNER) {
      return true;
    }
    // Admin can change roles of editors & members, but cannot assign someone to owner
    if (actorProjectRole === ProjectRole.ADMIN) {
      return (targetCurrentRole as string) !== ProjectRole.OWNER && (targetNewRole as string) !== ProjectRole.OWNER;
    }
    return false;
  }
}
