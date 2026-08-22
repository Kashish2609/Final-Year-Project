import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { GlobalRole, ProjectRole } from '../types/permissions.js';

export const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`📊 Database contains ${userCount} existing users. Skipping auto-seed.`);
      return;
    }

    console.log('🌱 Database is empty. Running automatic seed data initialization...');
    const demoPassword = 'Password123!';

    const adminUser = await User.create({
      name: 'System Admin (John)',
      email: 'admin@example.com',
      password: demoPassword,
      globalRole: GlobalRole.SUPER_ADMIN,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    const managerUser = await User.create({
      name: 'Project Manager (Sarah)',
      email: 'manager@example.com',
      password: demoPassword,
      globalRole: GlobalRole.USER,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const editorUser = await User.create({
      name: 'Lead Developer (Alex)',
      email: 'editor@example.com',
      password: demoPassword,
      globalRole: GlobalRole.USER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    const memberUser = await User.create({
      name: 'UI/UX Designer (Aman)',
      email: 'member@example.com',
      password: demoPassword,
      globalRole: GlobalRole.USER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    const project1 = await Project.create({
      name: 'Alpha SaaS Platform',
      key: 'ALPHA',
      description: 'Next generation team workspace with real-time Kanban and RBAC permissions',
      owner: adminUser._id,
      members: [
        { user: adminUser._id, role: ProjectRole.OWNER, joinedAt: new Date() },
        { user: managerUser._id, role: ProjectRole.ADMIN, joinedAt: new Date() },
        { user: editorUser._id, role: ProjectRole.EDITOR, joinedAt: new Date() },
        { user: memberUser._id, role: ProjectRole.MEMBER, joinedAt: new Date() },
      ],
      status: 'ACTIVE',
      priority: 'HIGH',
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-09-15'),
      progress: 65,
    });

    const project2 = await Project.create({
      name: 'Mobile App Suite',
      key: 'MOBI',
      description: 'Cross-platform iOS and Android companion app for task push notifications',
      owner: managerUser._id,
      members: [
        { user: managerUser._id, role: ProjectRole.OWNER, joinedAt: new Date() },
        { user: editorUser._id, role: ProjectRole.ADMIN, joinedAt: new Date() },
        { user: memberUser._id, role: ProjectRole.EDITOR, joinedAt: new Date() },
      ],
      status: 'ACTIVE',
      priority: 'URGENT',
      startDate: new Date('2026-08-10'),
      dueDate: new Date('2026-10-01'),
      progress: 30,
    });

    const project3 = await Project.create({
      name: 'Enterprise Analytics Engine',
      key: 'DATA',
      description: 'High performance data pipeline and executive reporting dashboard',
      owner: adminUser._id,
      members: [
        { user: adminUser._id, role: ProjectRole.OWNER, joinedAt: new Date() },
        { user: managerUser._id, role: ProjectRole.ADMIN, joinedAt: new Date() },
      ],
      status: 'ACTIVE',
      priority: 'MEDIUM',
      startDate: new Date('2026-07-15'),
      dueDate: new Date('2026-11-30'),
      progress: 45,
    });

    const tasksData = [
      { project: project1._id, taskNumber: 101, title: 'Design System & Component Library', priority: 'HIGH', status: 'COMPLETED', assignedTo: memberUser._id, createdBy: adminUser._id, labels: ['Design', 'UI/UX'] },
      { project: project1._id, taskNumber: 102, title: 'Implement RBAC & 3-Tier Permission Middleware', priority: 'URGENT', status: 'COMPLETED', assignedTo: editorUser._id, createdBy: adminUser._id, labels: ['Backend', 'Security'] },
      { project: project1._id, taskNumber: 103, title: 'Kanban Drag & Drop Board with dnd-kit', priority: 'HIGH', status: 'IN_PROGRESS', assignedTo: editorUser._id, createdBy: managerUser._id, labels: ['Frontend', 'Kanban'] },
      { project: project1._id, taskNumber: 104, title: 'Real-Time Socket.io Event Bus Integration', priority: 'HIGH', status: 'IN_PROGRESS', assignedTo: editorUser._id, createdBy: adminUser._id, labels: ['WebSockets', 'Realtime'] },
      { project: project1._id, taskNumber: 105, title: 'Member Permissions Management UI & Modal', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: memberUser._id, createdBy: managerUser._id, labels: ['Frontend', 'RBAC'] },
      { project: project1._id, taskNumber: 106, title: 'Dark / Light Mode Persisted Theme Switcher', priority: 'LOW', status: 'COMPLETED', assignedTo: memberUser._id, createdBy: managerUser._id, labels: ['UI/UX', 'Theme'] },
      { project: project1._id, taskNumber: 107, title: 'Activity Timeline & Audit Trail Service', priority: 'MEDIUM', status: 'TODO', assignedTo: editorUser._id, createdBy: adminUser._id, labels: ['Backend', 'Logging'] },
      { project: project1._id, taskNumber: 108, title: 'Automated Database Seed Script & End-to-End Tests', priority: 'URGENT', status: 'TODO', assignedTo: adminUser._id, createdBy: adminUser._id, labels: ['DevOps', 'Testing'] },

      { project: project2._id, taskNumber: 201, title: 'Setup React Native Repository Scaffolding', priority: 'MEDIUM', status: 'COMPLETED', assignedTo: editorUser._id, createdBy: managerUser._id, labels: ['Mobile', 'Setup'] },
      { project: project2._id, taskNumber: 202, title: 'Push Notification Gateway Setup', priority: 'HIGH', status: 'IN_PROGRESS', assignedTo: memberUser._id, createdBy: editorUser._id, labels: ['Notifications'] },
      { project: project2._id, taskNumber: 203, title: 'Offline Task Caching & Optimistic Sync', priority: 'URGENT', status: 'TODO', assignedTo: editorUser._id, createdBy: managerUser._id, labels: ['Mobile', 'Sync'] },

      { project: project3._id, taskNumber: 301, title: 'MongoDB Data Aggregation Pipelines', priority: 'HIGH', status: 'COMPLETED', assignedTo: editorUser._id, createdBy: adminUser._id, labels: ['Backend', 'Analytics'] },
      { project: project3._id, taskNumber: 302, title: 'Recharts Productivity Overview Widget', priority: 'MEDIUM', status: 'COMPLETED', assignedTo: managerUser._id, createdBy: adminUser._id, labels: ['Frontend', 'Charts'] },
    ];

    const createdTasks = await Task.insertMany(tasksData);

    await Comment.create([
      { task: createdTasks[2]._id, user: managerUser._id, content: 'Great progress on dnd-kit integration! Please make sure touch dragging works cleanly.' },
      { task: createdTasks[2]._id, user: editorUser._id, content: 'Touch sensors added and verified across mobile viewports!' },
    ]);

    await Notification.create([
      {
        recipient: managerUser._id,
        sender: adminUser._id,
        type: 'ROLE_CHANGE',
        title: 'Granted Project Admin Rights',
        message: 'System Admin assigned you as Project Admin on Alpha SaaS Platform.',
        relatedProject: project1._id,
        isRead: false,
      },
    ]);

    await ActivityLog.create([
      { project: project1._id, user: adminUser._id, action: 'Created project Alpha SaaS Platform', entityType: 'PROJECT', entityId: project1._id },
      { project: project1._id, user: adminUser._id, action: 'Promoted Sarah to Project Admin', entityType: 'MEMBER', entityId: managerUser._id },
    ]);

    console.log('🎉 Auto-seed completed successfully!');
  } catch (err) {
    console.error('Failed to auto-seed database:', err);
  }
};
