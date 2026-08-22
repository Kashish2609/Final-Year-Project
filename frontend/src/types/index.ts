export enum GlobalRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  USER = 'USER',
}

export enum ProjectRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  MEMBER = 'member',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  globalRole: GlobalRole;
  isActive: boolean;
  lastSeen?: string;
  createdAt: string;
}

export interface ProjectMember {
  user: User;
  role: ProjectRole;
  joinedAt: string;
  assignedTasksCount?: number;
}

export interface Project {
  _id: string;
  name: string;
  key: string;
  description?: string;
  owner: User;
  members: ProjectMember[];
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate?: string;
  dueDate?: string;
  progress: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  _id?: string;
  name: string;
  url: string;
  size?: number;
  uploadedAt: string;
}

export interface Task {
  _id: string;
  project: Project | string;
  taskNumber: number;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo?: User;
  createdBy: User;
  dueDate?: string;
  labels: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender?: User;
  type: 'PROJECT_INVITE' | 'ROLE_CHANGE' | 'TASK_ASSIGNED' | 'TASK_STATUS_UPDATED' | 'COMMENT_ADDED' | 'MEMBER_REMOVED';
  title: string;
  message: string;
  relatedProject?: Project;
  relatedTask?: Task;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  project: string;
  user: User;
  action: string;
  entityType: 'PROJECT' | 'TASK' | 'MEMBER' | 'COMMENT';
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DashboardOverview {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  productivityPercentage: number;
  teamMembersCount: number;
}

export interface DashboardAnalytics {
  tasksByStatus: { name: string; value: number; color: string }[];
  tasksByPriority: { name: string; value: number }[];
  projectProgress: { name: string; key: string; progress: number }[];
  teamProductivity: { name: string; completed: number; total: number }[];
}
