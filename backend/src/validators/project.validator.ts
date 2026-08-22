import { z } from 'zod';
import { ProjectRole } from '../types/permissions.js';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Project name is required'),
    key: z.string().min(2).max(10).optional(),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    role: z.enum([ProjectRole.ADMIN, ProjectRole.EDITOR, ProjectRole.MEMBER]),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum([ProjectRole.ADMIN, ProjectRole.EDITOR, ProjectRole.MEMBER]),
  }),
});
