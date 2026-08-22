import { Router } from 'express';
import {
  getProjectTasks,
  getMyTasks,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireProjectPermission } from '../middleware/permission.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
} from '../validators/task.validator.js';
import { ProjectPermissionAction } from '../types/permissions.js';

const router = Router();

// User's global tasks across projects
router.get('/my-tasks', authenticateUser, getMyTasks);

// Project specific task routes
router.get('/projects/:projectId/tasks', authenticateUser, requireProjectPermission(ProjectPermissionAction.VIEW_PROJECT), getProjectTasks);
router.post('/projects/:projectId/tasks', authenticateUser, requireProjectPermission(ProjectPermissionAction.CREATE_TASK), validateRequest(createTaskSchema), createTask);

// Task specific routes
router.get('/tasks/:id', authenticateUser, requireProjectPermission(ProjectPermissionAction.VIEW_PROJECT), getTaskById);
router.put('/tasks/:id', authenticateUser, requireProjectPermission(ProjectPermissionAction.EDIT_TASK), validateRequest(updateTaskSchema), updateTask);
router.patch('/tasks/:id/status', authenticateUser, requireProjectPermission(ProjectPermissionAction.CHANGE_TASK_STATUS), validateRequest(updateTaskStatusSchema), updateTaskStatus);
router.patch('/tasks/:id/assign', authenticateUser, requireProjectPermission(ProjectPermissionAction.ASSIGN_TASK), validateRequest(assignTaskSchema), assignTask);
router.delete('/tasks/:id', authenticateUser, requireProjectPermission(ProjectPermissionAction.DELETE_TASK), deleteTask);

export default router;
