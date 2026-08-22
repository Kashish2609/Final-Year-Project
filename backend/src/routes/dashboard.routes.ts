import { Router } from 'express';
import {
  getDashboardOverview,
  getDashboardAnalytics,
  getProjectActivity,
} from '../controllers/dashboard.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireProjectPermission } from '../middleware/permission.middleware.js';
import { ProjectPermissionAction } from '../types/permissions.js';

const router = Router();

router.use(authenticateUser);

router.get('/overview', getDashboardOverview);
router.get('/analytics', getDashboardAnalytics);
router.get('/projects/:id/activity', requireProjectPermission(ProjectPermissionAction.VIEW_PROJECT), getProjectActivity);

export default router;
