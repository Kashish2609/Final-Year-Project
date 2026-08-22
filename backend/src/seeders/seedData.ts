import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { GlobalRole, ProjectRole } from '../types/permissions.js';

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing database collections...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('👤 Creating seed users...');
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

    console.log('📁 Creating seed projects...');

    // Project 1: Alpha Platform Redesign
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

    // Project 2: Mobile App Integration
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

    // Project 3: Enterprise AI Analytics Engine
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

    console.log('✅ Creating seed tasks (20+ tasks)...');

    const tasksData = [
      // Project 1 Tasks
      { project: project1._id, taskNumber: 101, title: 'Design System & Component Library', priority: 'HIGH', status: 'COMPLETED', assignedTo: memberUser._id, createdBy: adminUser._id, labels: ['Design', 'UI/UX'] },
      { project: project1._id, taskNumber: 102, title: 'Implement RBAC & 3-Tier Permission Middleware', priority: 'URGENT', status: 'COMPLETED', assignedTo: editorUser._id, createdBy: adminUser._id, labels: ['Backend', 'Security'] },
      { project: project1._id, taskNumber: 103, title: 'Kanban Drag & Drop Board with dnd-kit', priority: 'HIGH', status: 'IN_PROGRESS', assignedTo: editorUser._id, createdBy: managerUser._id, labels: ['Frontend', 'Kanban'] },
      { project: project1._id, taskNumber: 104, title: 'Real-Time Socket.io Event Bus Integration', priority: 'HIGH', status: 'IN_PROGRESS', assignedTo: editorUser._id, createdBy: adminUser._id, labels: ['WebSockets', 'Realtime'] },
      { project: project1._id, taskNumber: 105, title: 'Member Permissions Management UI & Modal', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: memberUser._id, createdBy: managerUser._id, labels: ['Frontend', 'RBAC'] },
      { project: project1._id, taskNumber: 106, title: 'Dark / Light Mode Persisted Theme Switcher', priority: 'LOW', status: 'COMPLETED', assignedTo: memberUser._id, createdBy: managerUser._id, labels: ['UI/UX', 'Theme'] },
      { project: project1._id, taskNumber: 107, title: 'Activity Timeline & Audit Trail Service', priority: 'MEDIUM', status: 'TODO', assignedTo: editorUser._id, createdBy: adminUser._id, labels: ['Backend', 'Logging'] },
      { project: project1._id, taskNumber: 108, title: 'Automated Database Seed Script & End-to-End Tests', priority: 'URGENT', status: 'TODO', assignedTo: adminUser._id, createdBy: adminUser._id, labels: ['DevOps', 'Testing'] },

      // Project 2 Tasks
      { project: project2._id, taskNumber: 201, title: 'Setup React Native Repository Scaffolding', priority: 'MEDIUM', status: 'COMPLETED', assignedTo: editorUser._id, createdBy: managerUser._id, labels: ['Mobile', 'Setup'] },
      { project: project2._id, taskNumber: 202, title: 'Push Notification Gateway Setup', priority: 'HIGH', status: 'IN_PROGRESS', assignedTo: memberUser._id, createdBy: editorUser._id, labels: ['Notifications'] },
      { project: project2._id, taskNumber: 203, title: 'Offline Task Caching & Optimistic Sync', priority: 'URGENT', status: 'TODO', assignedTo: editorUser._id, createdBy: managerUser._id, labels: ['Mobile', 'Sync'] },
      { project: project2._id, taskNumber: 204, title: 'Biometric Authentication Flow', priority: 'MEDIUM', status: 'TODO', assignedTo: memberUser._id, createdBy: managerUser._id, labels: ['Security', 'Mobile'] },
      { project: project2._id, taskNumber: 205, title: 'Mobile Kanban View Layout Optimization', priority: 'LOW', status: 'TODO', assignedTo: memberUser._id, createdBy: managerUser._id, labels: ['Mobile', 'UI'] },

      // Project 3 Tasks
      { project: project3._id, taskNumber: 301, title: 'MongoDB Data Aggregation Pipelines', priority: 'HIGH', status: 'COMPLETED', assignedTo: editorUser._id, createdBy: adminUser._id, labels: ['Backend', 'Analytics'] },
      { project: project3._id, taskNumber: 302, title: 'Recharts Productivity Overview Widget', priority: 'MEDIUM', status: 'COMPLETED', assignedTo: managerUser._id, createdBy: adminUser._id, labels: ['Frontend', 'Charts'] },
      { project: project3._id, taskNumber: 303, title: 'CSV & PDF Executive Report Export', priority: 'LOW', status: 'IN_PROGRESS', assignedTo: managerUser._id, createdBy: adminUser._id, labels: ['Feature', 'Reports'] },
      { project: project3._id, taskNumber: 304, title: 'Role-Based Executive Analytics Filters', priority: 'HIGH', status: 'TODO', assignedTo: adminUser._id, createdBy: adminUser._id, labels: ['Analytics', 'RBAC'] },
      { project: project3._id, taskNumber: 305, title: 'Automated Weekly Email Digest Job', priority: 'LOW', status: 'TODO', assignedTo: managerUser._id, createdBy: adminUser._id, labels: ['Backend', 'Email'] },
      { project: project3._id, taskNumber: 306, title: 'Performance Tuning & Indexing Audit', priority: 'URGENT', status: 'TODO', assignedTo: editorUser._id, createdBy: adminUser._id, labels: ['Database', 'Optimization'] },
      { project: project3._id, taskNumber: 307, title: 'Rate Limiting & Helmet Middleware Verification', priority: 'MEDIUM', status: 'COMPLETED', assignedTo: adminUser._id, createdBy: adminUser._id, labels: ['Security'] },
    ];

    const createdTasks = await Task.insertMany(tasksData);

    console.log('💬 Creating seed task comments...');
    await Comment.create([
      { task: createdTasks[2]._id, user: managerUser._id, content: 'Great progress on dnd-kit integration! Please make sure touch dragging works cleanly.' },
      { task: createdTasks[2]._id, user: editorUser._id, content: 'Touch sensors added and verified across mobile viewports!' },
      { task: createdTasks[1]._id, user: adminUser._id, content: 'Backend permission checks verified for Project Admin role capabilities.' },
    ]);

    console.log('🔔 Creating seed notifications...');
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
      {
        recipient: editorUser._id,
        sender: managerUser._id,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: 'You were assigned to Kanban Drag & Drop Board task.',
        relatedProject: project1._id,
        relatedTask: createdTasks[2]._id,
        isRead: false,
      },
      {
        recipient: memberUser._id,
        sender: managerUser._id,
        type: 'PROJECT_INVITE',
        title: 'Added to Project',
        message: 'You were added as UI/UX Designer to Alpha SaaS Platform.',
        relatedProject: project1._id,
        isRead: true,
      },
    ]);

    console.log('📜 Creating seed activity logs...');
    await ActivityLog.create([
      { project: project1._id, user: adminUser._id, action: 'Created project Alpha SaaS Platform', entityType: 'PROJECT', entityId: project1._id },
      { project: project1._id, user: adminUser._id, action: 'Promoted Sarah to Project Admin', entityType: 'MEMBER', entityId: managerUser._id },
      { project: project1._id, user: managerUser._id, action: 'Assigned "Kanban Drag & Drop Board" to Alex', entityType: 'TASK', entityId: createdTasks[2]._id },
      { project: project1._id, user: editorUser._id, action: 'Moved "Design System" to COMPLETED', entityType: 'TASK', entityId: createdTasks[0]._id },
    ]);

    console.log('\n🎉 Seed database successfully populated!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials for Login:');
    console.log('1. Super Admin:     admin@example.com   / Password123!');
    console.log('2. Project Manager: manager@example.com / Password123!');
    console.log('3. Lead Developer:  editor@example.com  / Password123!');
    console.log('4. UI/UX Designer:  member@example.com  / Password123!');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
