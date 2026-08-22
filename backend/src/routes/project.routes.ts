import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
} from '../controllers/member.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireProjectPermission } from '../middleware/permission.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from '../validators/project.validator.js';
import { ProjectPermissionAction } from '../types/permissions.js';

const router = Router();

router.use(authenticateUser);

router.get('/', getProjects);
router.post('/', validateRequest(createProjectSchema), createProject);

router.get('/:id', requireProjectPermission(ProjectPermissionAction.VIEW_PROJECT), getProjectById);
router.put('/:id', requireProjectPermission(ProjectPermissionAction.EDIT_PROJECT), validateRequest(updateProjectSchema), updateProject);
router.delete('/:id', requireProjectPermission(ProjectPermissionAction.DELETE_PROJECT), deleteProject);

// Members routes
router.get('/:id/members', requireProjectPermission(ProjectPermissionAction.VIEW_PROJECT), getMembers);
router.post('/:id/members', requireProjectPermission(ProjectPermissionAction.MANAGE_MEMBERS), validateRequest(addMemberSchema), addMember);
router.put('/:id/members/:userId', requireProjectPermission(ProjectPermissionAction.CHANGE_ROLES), validateRequest(updateMemberRoleSchema), updateMemberRole);
router.delete('/:id/members/:userId', requireProjectPermission(ProjectPermissionAction.MANAGE_MEMBERS), removeMember);

export default router;
