import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { Avatar } from '../ui/Avatar';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);
  const { user } = useSelector((state: RootState) => state.auth);
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Projects', path: '/projects', icon: <FolderKanban className="w-4 h-4" /> },
    { label: 'My Tasks', path: '/my-tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { label: 'Team', path: '/team', icon: <Users className="w-4 h-4" /> },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={clsx(
        'relative flex flex-col border-r border-border bg-card/60 backdrop-blur-md transition-all duration-300 z-30 h-screen sticky top-0 shrink-0 select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* App Branding Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-foreground">Team Task Manager</span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">SaaS Enterprise</span>
            </div>
          )}
        </div>

        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Workspace Indicator */}
      {!collapsed && (
        <div className="mx-3 my-3 p-2.5 rounded-lg border border-border/60 bg-muted/40 flex items-center gap-2.5 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-foreground truncate">Main Workspace</span>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <div className="shrink-0">{item.icon}</div>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {item.badge && (
              <span
                className={clsx(
                  'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  collapsed ? 'absolute top-1 right-1' : '',
                  'bg-red-500 text-white'
                )}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Global Role Tag */}
      {!collapsed && user && (
        <div className="mx-3 mb-3 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="truncate">
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Global Role</div>
            <div className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{user.globalRole.replace('_', ' ')}</div>
          </div>
        </div>
      )}

      {/* User Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">{user?.name}</span>
              <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => dispatch(logout())}
            title="Logout"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
