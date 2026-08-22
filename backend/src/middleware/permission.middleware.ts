import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { PermissionService } from '../services/permission.service.js';
import { ProjectPermissionAction, ProjectRole, GlobalRole } from '../types/permissions.js';

export const requireProjectPermission = (action: ProjectPermissionAction) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const globalRole = req.user?.globalRole || GlobalRole.USER;

      if (!userId) {
        return next(new ErrorResponse('User not authenticated', 401));
      }

      let projectId = req.params.id || req.params.projectId;

      // If route is task-based (e.g. /api/tasks/:id)
      if (!projectId && (req.params.taskId || req.params.id)) {
        const taskId = req.params.taskId || req.params.id;
        const task = await Task.findById(taskId);
        if (!task) {
          return next(new ErrorResponse('Task not found', 404));
        }
        projectId = task.project.toString();
        // Save task on request for downstream usage
        (req as any).task = task;
      }

      if (!projectId) {
        return next(new ErrorResponse('Project ID is required', 400));
      }

      const project = await Project.findById(projectId);
      if (!project || project.isDeleted) {
        return next(new ErrorResponse('Project not found or deleted', 404));
      }

      // Save project on request
      (req as any).project = project;

      const projectRole = PermissionService.getMemberRole(project, userId);
      req.projectMembershipRole = projectRole || undefined;

      // Check if task assignee for status updates
      let isTaskAssignee = false;
      if (action === ProjectPermissionAction.CHANGE_TASK_STATUS && (req as any).task) {
        isTaskAssignee = (req as any).task.assignedTo?.toString() === userId;
      }

      const hasAccess = PermissionService.hasPermission(
        globalRole,
        projectRole,
        action,
        isTaskAssignee
      );

      if (!hasAccess) {
        return next(new ErrorResponse('403 Forbidden: You do not have permission to perform this action', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireProjectAccess = requireProjectPermission(ProjectPermissionAction.VIEW_PROJECT);
export const requireProjectOwner = requireProjectPermission(ProjectPermissionAction.DELETE_PROJECT);
export const requireProjectAdmin = requireProjectPermission(ProjectPermissionAction.EDIT_PROJECT);
