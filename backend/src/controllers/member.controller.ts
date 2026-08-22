import { Response } from 'express';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import { AuthenticatedRequest } from '../types/index.js';
import { ProjectRole, GlobalRole } from '../types/permissions.js';
import { PermissionService } from '../services/permission.service.js';
import { ActivityService } from '../services/activity.service.js';
import { NotificationService } from '../services/notification.service.js';

export const getMembers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const projectId = req.params.id;
  const project = await Project.findById(projectId).populate('members.user', 'name email avatar globalRole lastSeen isActive');

  if (!project || project.isDeleted) {
    throw new ErrorResponse('Project not found', 404);
  }

  // Get task count assigned per user
  const tasks = await Task.find({ project: projectId });
  const taskCountMap: Record<string, number> = {};
  tasks.forEach((task) => {
    if (task.assignedTo) {
      const uId = task.assignedTo.toString();
      taskCountMap[uId] = (taskCountMap[uId] || 0) + 1;
    }
  });

  const memberList = project.members.map((m: any) => {
    const uObj = m.user ? m.user.toJSON() : {};
    return {
      user: uObj,
      role: m.role,
      joinedAt: m.joinedAt,
      assignedTasksCount: taskCountMap[uObj._id?.toString()] || 0,
    };
  });

  res.status(200).json({
    success: true,
    data: memberList,
  });
});

export const addMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const actorId = req.user?.id;
  const projectId = req.params.id;
  const { email, role } = req.body;

  const project = await Project.findById(projectId);
  if (!project || project.isDeleted) {
    throw new ErrorResponse('Project not found', 404);
  }

  const targetUser = await User.findOne({ email: email.toLowerCase() });
  if (!targetUser) {
    throw new ErrorResponse(`User with email "${email}" not found`, 44);
  }

  // Check if user is already a member or owner
  const isOwner = project.owner.toString() === targetUser._id.toString();
  const existingMember = project.members.find((m) => m.user.toString() === targetUser._id.toString());

  if (isOwner || existingMember) {
    throw new ErrorResponse('User is already a member of this project', 400);
  }

  project.members.push({
    user: targetUser._id as any,
    role: role as ProjectRole,
    joinedAt: new Date(),
  });

  await project.save();

  if (actorId) {
    await ActivityService.logActivity({
      project: project._id,
      user: actorId,
      action: `Added ${targetUser.name} as ${role}`,
      entityType: 'MEMBER',
      entityId: targetUser._id,
    });

    await NotificationService.createNotification({
      recipient: targetUser._id as any,
      sender: actorId as any,
      type: 'PROJECT_INVITE',
      title: 'Added to Project',
      message: `You were added to project "${project.name}" as ${role}`,
      relatedProject: project._id as any,
    });
  }

  const populated = await project.populate('members.user', 'name email avatar globalRole lastSeen isActive');

  res.status(200).json({
    success: true,
    data: populated.members,
  });
});

export const updateMemberRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const actorId = req.user?.id;
  const actorGlobalRole = req.user?.globalRole || GlobalRole.USER;
  const projectId = req.params.id;
  const targetUserId = req.params.userId;
  const { role } = req.body;

  const project = await Project.findById(projectId);
  if (!project || project.isDeleted) {
    throw new ErrorResponse('Project not found', 404);
  }

  if (!actorId) {
    throw new ErrorResponse('User not authenticated', 401);
  }

  const actorRole = PermissionService.getMemberRole(project, actorId);
  if (!actorRole && actorGlobalRole !== GlobalRole.SUPER_ADMIN) {
    throw new ErrorResponse('Not authorized', 403);
  }

  const memberIndex = project.members.findIndex((m) => m.user.toString() === targetUserId);
  if (memberIndex === -1) {
    throw new ErrorResponse('Member not found in project', 404);
  }

  const currentTargetRole = project.members[memberIndex].role;

  // Verify permissions using PermissionService
  const canChange = PermissionService.canChangeRole(
    actorGlobalRole,
    actorRole || ProjectRole.MEMBER,
    currentTargetRole,
    role as ProjectRole
  );

  if (!canChange) {
    throw new ErrorResponse('403 Forbidden: You do not have permission to change this role', 403);
  }

  project.members[memberIndex].role = role as ProjectRole;
  await project.save();

  await ActivityService.logActivity({
    project: project._id,
    user: actorId,
    action: `Updated member role to ${role}`,
    entityType: 'MEMBER',
    entityId: targetUserId as any,
  });

  await NotificationService.createNotification({
    recipient: targetUserId as any,
    sender: actorId as any,
    type: 'ROLE_CHANGE',
    title: 'Project Role Updated',
    message: `Your role in "${project.name}" was changed to ${role}`,
    relatedProject: project._id as any,
  });

  const populated = await project.populate('members.user', 'name email avatar globalRole lastSeen isActive');

  res.status(200).json({
    success: true,
    data: populated.members,
  });
});

export const removeMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const actorId = req.user?.id;
  const actorGlobalRole = req.user?.globalRole || GlobalRole.USER;
  const projectId = req.params.id;
  const targetUserId = req.params.userId;

  const project = await Project.findById(projectId);
  if (!project || project.isDeleted) {
    throw new ErrorResponse('Project not found', 404);
  }

  if (project.owner.toString() === targetUserId) {
    throw new ErrorResponse('Cannot remove the Project Owner', 400);
  }

  if (!actorId) {
    throw new ErrorResponse('User not authenticated', 401);
  }

  const actorRole = PermissionService.getMemberRole(project, actorId);
  const targetMember = project.members.find((m) => m.user.toString() === targetUserId);

  if (!targetMember) {
    throw new ErrorResponse('Member not found in project', 404);
  }

  const canRemove = PermissionService.canChangeRole(
    actorGlobalRole,
    actorRole || ProjectRole.MEMBER,
    targetMember.role,
    targetMember.role
  );

  if (!canRemove && actorId !== targetUserId) {
    throw new ErrorResponse('403 Forbidden: You do not have permission to remove this member', 403);
  }

  project.members = project.members.filter((m) => m.user.toString() !== targetUserId);
  await project.save();

  // Unassign tasks assigned to removed member
  await Task.updateMany(
    { project: projectId, assignedTo: targetUserId },
    { $unset: { assignedTo: 1 } }
  );

  await ActivityService.logActivity({
    project: project._id,
    user: actorId,
    action: `Removed member from project`,
    entityType: 'MEMBER',
    entityId: targetUserId as any,
  });

  await NotificationService.createNotification({
    recipient: targetUserId as any,
    sender: actorId as any,
    type: 'MEMBER_REMOVED',
    title: 'Removed from Project',
    message: `You were removed from project "${project.name}"`,
    relatedProject: project._id as any,
  });

  res.status(200).json({
    success: true,
    message: 'Member removed successfully',
  });
});
