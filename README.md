# TaskPulse - Full-Stack Team Task Manager SaaS

TaskPulse is a modern, production-ready **Full-Stack Team Task Manager Web Application** inspired by **Linear**, **Notion**, **Jira**, and **Trello**. Built with Node.js, Express, TypeScript, MongoDB, Socket.io, React, Redux Toolkit, Tailwind CSS, and dnd-kit.

---

## 🌟 Key Features

- 🔐 **Two-Level RBAC Permission System**:
  - **Global Roles**: `SUPER_ADMIN` and `USER`.
  - **Project Roles**: `Project Owner`, `Project Admin`, `Project Editor`, `Project Member`.
  - Enforced across Frontend UI, Backend API, and Database service layer.
- 📋 **Interactive Drag-and-Drop Kanban Board**: Real-time board reordering & status updates built with `@dnd-kit`.
- ⚡ **Real-Time Collaboration**: Socket.io event bus syncing task movement, comments, and push notifications instantly across connected clients.
- 📊 **Executive Dashboard & Analytics**: Recharts visualizations for task completion velocity, status distribution, priority breakdowns, and team productivity.
- 👥 **Project Settings & Access Management**: Dedicated `Members & Permissions` interface with `<PermissionSelector />`, custom role assignments, and ownership controls.
- 📜 **Activity Timeline & Audit Trail**: Comprehensive logging of project events (creations, role updates, assignments, status changes).
- 🌓 **Persisted Light / Dark Theme Toggle**: Customized theme styling inspired by Linear and Notion.
- 🗑️ **Soft-Delete Architecture**: Secure project deletion workflow with typing confirmation modal.

---

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** with **TypeScript**
- **MongoDB** & **Mongoose** (Supports local MongoDB or auto-fallback to `mongodb-memory-server`)
- **Socket.io** (Real-time WebSockets engine)
- **JWT & bcryptjs** (Authentication & password hashing)
- **Zod** (Schema validation)
- **Helmet, CORS, Rate Limiter** (Production security)

### Frontend
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** + **Framer Motion** + **Lucide Icons**
- **Redux Toolkit** (State management for auth, projects, tasks, team, notifications, UI)
- **@dnd-kit/core** & **@dnd-kit/sortable** (Kanban drag and drop)
- **Recharts** (Data visualization)
- **React Hook Form** + **Zod** (Form management and validation)

---

## 🔑 Demo Credentials

To immediately test the application, run the seed script to create these pre-configured demo users (all use password: `Password123!`):

| User / Role | Email | Password | Project Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@example.com` | `Password123!` | Global System Admin (Full system override capability) |
| **Project Manager** | `manager@example.com` | `Password123!` | Project Admin (Manage members, roles, tasks & settings) |
| **Lead Developer** | `editor@example.com` | `Password123!` | Project Editor (Create, edit, assign, delete tasks) |
| **UI/UX Designer** | `member@example.com` | `Password123!` | Project Member (View project & update assigned task status) |

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo users, projects, 20+ tasks, comments, and logs
npm run dev      # Starts Express + Socket.io server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔐 3-Tier Permission Matrix

| Action | Super Admin | Project Owner | Project Admin | Project Editor | Project Member |
| :--- | :---: | :---: | :---: | :---: | :---: |
| View Project & Tasks | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Project Details | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add / Remove Members | ✅ | ✅ | ✅ | ❌ | ❌ |
| Change Member Roles | ✅ | ✅ | ✅ (Non-owners) | ❌ | ❌ |
| Create / Edit Tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Assign Tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Change Task Status | ✅ | ✅ | ✅ | ✅ | Assigned Only |
| Comment on Tasks | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 📚 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `GET /api/auth/me` - Get current authenticated user profile.
- `POST /api/auth/logout` - Logout user session.

### Projects (`/api/projects`)
- `GET /api/projects` - List accessible projects (supports `search`, `status`, pagination).
- `POST /api/projects` - Create a new project (caller automatically becomes `Project Owner`).
- `GET /api/projects/:id` - Get project details & statistics.
- `PUT /api/projects/:id` - Update project (Requires Owner or Admin).
- `DELETE /api/projects/:id` - Soft-delete project (Requires Owner or Admin).

### Project Members & Permissions (`/api/projects/:id/members`)
- `GET /api/projects/:id/members` - List project members and task counts.
- `POST /api/projects/:id/members` - Invite member by email (`admin`, `editor`, `member`).
- `PUT /api/projects/:id/members/:userId` - Update member project role (Requires Admin/Owner).
- `DELETE /api/projects/:id/members/:userId` - Remove member from project.

### Tasks (`/api`)
- `GET /api/projects/:projectId/tasks` - List tasks in a project.
- `POST /api/projects/:projectId/tasks` - Create task in project.
- `GET /api/my-tasks` - Get user's assigned tasks across all projects.
- `GET /api/tasks/:id` - Get task details with comments.
- `PUT /api/tasks/:id` - Update task details.
- `PATCH /api/tasks/:id/status` - Move task status (`TODO`, `IN_PROGRESS`, `COMPLETED`).
- `PATCH /api/tasks/:id/assign` - Reassign task to a user.
- `DELETE /api/tasks/:id` - Delete task.

### Comments & Notifications (`/api`)
- `GET /api/tasks/:taskId/comments` - List comments for a task.
- `POST /api/tasks/:taskId/comments` - Add comment to task.
- `GET /api/notifications` - Get user notifications & unread count.
- `PATCH /api/notifications/read-all` - Mark all notifications as read.

---

## 🛡️ Production Build & Verification

```bash
# Build Backend
cd backend && npm run build

# Build Frontend
cd frontend && npm run build
```

---

&copy; 2026 TaskPulse SaaS. All rights reserved.
