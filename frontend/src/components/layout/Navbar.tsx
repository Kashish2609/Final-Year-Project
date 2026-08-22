import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Plus, Bell, Check, LogOut, Shield } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { setTheme, setCreateProjectModalOpen } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { markAllNotificationsRead } from '../../store/slices/notificationSlice';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { clsx } from 'clsx';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between gap-4">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects, tasks, or team members... (Ctrl+K)"
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </form>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Create Project Button */}
        <Button
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => dispatch(setCreateProjectModalOpen(true))}
        >
          New Project
        </Button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Notifications Popout */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-card p-3 shadow-2xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                  <span className="text-xs font-bold text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markAllNotificationsRead())}
                      className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (n.relatedProject) navigate(`/projects/${(n.relatedProject as any)._id || n.relatedProject}`);
                        }}
                        className={clsx(
                          'p-2.5 rounded-lg border border-border/50 cursor-pointer transition-colors text-xs space-y-1',
                          !n.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card hover:bg-muted'
                        )}
                      >
                        <div className="font-semibold text-foreground flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu Popout */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl border border-border p-1 pr-2 hover:bg-muted transition-colors focus:outline-none"
          >
            <Avatar name={user?.name || 'User'} src={user?.avatar} size="xs" />
            <span className="text-xs font-semibold text-foreground max-w-[100px] truncate hidden md:inline">
              {user?.name}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-2xl">
                <div className="p-2 border-b border-border">
                  <div className="text-xs font-bold text-foreground">{user?.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold">
                    <Shield className="w-3 h-3" /> {user?.globalRole}
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      dispatch(logout());
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>Log Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
