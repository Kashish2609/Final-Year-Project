import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FolderKanban,
  Kanban,
  ListTodo,
  Users,
  Activity,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Calendar,
  Shield,
  UserPlus,
} from 'lucide-react';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { TaskModal } from '../components/tasks/TaskModal';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { MemberTable } from '../components/projects/MemberTable';
import { InviteMemberModal } from '../components/projects/InviteMemberModal';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  fetchProjectById,
  deleteProject,
} from '../store/slices/projectSlice';
import {
  fetchProjectTasks,
  setSelectedTask,
} from '../store/slices/taskSlice';
import { fetchProjectMembers } from '../store/slices/teamSlice';
import {
  setCreateTaskModalOpen,
  setInviteMemberModalOpen,
  addToast,
} from '../store/slices/uiSlice';
import { api } from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import { Task, ActivityLog } from '../types';
import { AppDispatch, RootState } from '../store';
import { clsx } from 'clsx';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentProject, currentStats, isLoading } = useSelector(
    (state: RootState) => state.projects
  );
  const { tasks, selectedTask, filterStatus, filterPriority, filterAssignee, searchQuery } =
    useSelector((state: RootState) => state.tasks);
  const { members } = useSelector((state: RootState) => state.team);

  const permissions = usePermissions(currentProject);

  const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'tasks' | 'team' | 'activity' | 'settings'>('kanban');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchProjectTasks(id));
      dispatch(fetchProjectMembers(id));

      api.get(`/dashboard/projects/${id}/activity`).then((res: any) => {
        setActivities(res.data);
      });
    }
  }, [dispatch, id]);

  if (isLoading || !currentProject) {
    return <Skeleton className="h-96 w-full" />;
  }

  // Filter tasks for view
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false;
    if (filterAssignee !== 'ALL' && task.assignedTo?._id !== filterAssignee) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteProject(currentProject._id)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Project deleted' }));
      navigate('/projects');
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Failed to delete project' }));
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'kanban', label: 'Kanban Board', icon: <Kanban className="w-4 h-4" /> },
    { id: 'tasks', label: 'All Tasks', icon: <ListTodo className="w-4 h-4" /> },
    { id: 'team', label: 'Members & Roles', icon: <Users className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
                {currentProject.key}
              </span>
              <Badge variant="primary">{currentProject.status}</Badge>
              <Badge variant="outline">Role: {permissions.currentRole || 'Member'}</Badge>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{currentProject.name}</h1>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              {currentProject.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {permissions.canManageMembers && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<UserPlus className="w-4 h-4" />}
                onClick={() => dispatch(setInviteMemberModalOpen(true))}
              >
                Add Member
              </Button>
            )}

            {permissions.canCreateTask && (
              <Button
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => dispatch(setCreateTaskModalOpen(true))}
              >
                Create Task
              </Button>
            )}
          </div>
        </div>

        {/* Members Bar & Progress */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">Team Members:</span>
            <div className="flex -space-x-2">
              {(currentProject.members || []).map((m, i) => (
                <Avatar key={i} name={m.user.name} src={m.user.avatar} size="xs" className="ring-2 ring-card" />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Completion:</span>
              <span className="font-bold text-foreground">{currentProject.progress}%</span>
            </div>
            <div className="w-36 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${currentProject.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0',
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase">Tasks Breakdown</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/40">
                <div className="text-muted-foreground">Total Tasks</div>
                <div className="text-xl font-bold text-foreground">{currentStats?.totalTasks || 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                <div className="font-medium">Completed</div>
                <div className="text-xl font-bold">{currentStats?.completedTasks || 0}</div>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase">Project Timeline</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-border">
                <div className="text-muted-foreground">Start Date</div>
                <div className="font-semibold text-foreground mt-1">
                  {currentProject.startDate ? new Date(currentProject.startDate).toLocaleDateString() : 'Not set'}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border">
                <div className="text-muted-foreground">Target Due Date</div>
                <div className="font-semibold text-foreground mt-1">
                  {currentProject.dueDate ? new Date(currentProject.dueDate).toLocaleDateString() : 'Not set'}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <TaskFilters />
          <KanbanBoard
            tasks={filteredTasks}
            onOpenTask={(task) => dispatch(setSelectedTask(task))}
            onAddTask={() => dispatch(setCreateTaskModalOpen(true))}
            canCreateTask={permissions.canCreateTask}
            canUpdateStatus={permissions.canUpdateTaskStatus()}
          />
        </div>
      )}

      {/* Tab 3: Tasks List View */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <TaskFilters />
          <div className="space-y-2">
            {filteredTasks.map((t) => (
              <div
                key={t._id}
                onClick={() => dispatch(setSelectedTask(t))}
                className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground font-bold">#{t.taskNumber}</span>
                  <span className="font-semibold text-foreground">{t.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="primary">{t.status}</Badge>
                  <Avatar name={t.assignedTo?.name || 'Unassigned'} src={t.assignedTo?.avatar} size="xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Team Members & Permissions (Requirement #4) */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Project Members & Access Control</h2>
              <p className="text-xs text-muted-foreground">
                Manage roles (Admin, Editor, Member) and granular permission assignments.
              </p>
            </div>

            {permissions.canManageMembers && (
              <Button
                size="sm"
                leftIcon={<UserPlus className="w-4 h-4" />}
                onClick={() => dispatch(setInviteMemberModalOpen(true))}
              >
                Add Member
              </Button>
            )}
          </div>

          <MemberTable projectId={currentProject._id} members={members} />
        </div>
      )}

      {/* Tab 5: Activity Timeline */}
      {activeTab === 'activity' && <ActivityTimeline logs={activities} />}

      {/* Tab 6: Settings & Soft Delete (Requirement #7) */}
      {activeTab === 'settings' && (
        <Card className="space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-foreground">Project Settings</h3>
            <p className="text-xs text-muted-foreground">Manage administrative settings and deletion.</p>
          </div>

          {permissions.canDeleteProject ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
              <div className="font-bold text-xs text-red-500 uppercase tracking-wider">Danger Zone</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deleting this project will permanently remove its tasks, comments, activity logs and project data.
              </p>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Project
              </Button>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">
              Only Project Owners and Project Admins can access destructive project settings.
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <TaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => dispatch(setSelectedTask(null))}
      />

      <CreateTaskModal />
      <InviteMemberModal />

      {/* Requirement #7 Project Deletion Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project?"
        message="Deleting this project will permanently remove its tasks, comments, activity logs and project data."
        confirmMatchString={currentProject.name}
        confirmText="Delete Project"
        isLoading={isDeleting}
      />
    </div>
  );
};
