import { Router } from 'express';
import { getTaskComments, createComment, deleteComment } from '../controllers/comment.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireProjectPermission } from '../middleware/permission.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createCommentSchema } from '../validators/comment.validator.js';
import { ProjectPermissionAction } from '../types/permissions.js';

const router = Router();

router.get('/tasks/:taskId/comments', authenticateUser, requireProjectPermission(ProjectPermissionAction.VIEW_PROJECT), getTaskComments);
router.post('/tasks/:taskId/comments', authenticateUser, requireProjectPermission(ProjectPermissionAction.COMMENT), validateRequest(createCommentSchema), createComment);
router.delete('/comments/:id', authenticateUser, deleteComment);

export default router;
