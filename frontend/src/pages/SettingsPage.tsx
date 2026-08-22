import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { setTheme } from '../store/slices/uiSlice';
import { RootState } from '../store';
import { Sun, Moon, Monitor, Shield, User } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useSelector((state: RootState) => state.ui.theme);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Account & App Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your personal profile information, themes, and global permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Profile Information
          </h3>

          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
            <Avatar name={user?.name || 'User'} src={user?.avatar} size="xl" />
            <div>
              <h4 className="text-base font-bold text-foreground">{user?.name}</h4>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                <Shield className="w-3.5 h-3.5" /> {user?.globalRole}
              </div>
            </div>
          </div>
        </Card>

        {/* Theme Settings */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-foreground">Appearance Theme</h3>
          <p className="text-xs text-muted-foreground">Select your interface preference.</p>

          <div className="space-y-2">
            <button
              onClick={() => dispatch(setTheme('dark'))}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4" /> Dark Mode
              </div>
              {theme === 'dark' && <Badge variant="primary">Active</Badge>}
            </button>

            <button
              onClick={() => dispatch(setTheme('light'))}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" /> Light Mode
              </div>
              {theme === 'light' && <Badge variant="primary">Active</Badge>}
            </button>

            <button
              onClick={() => dispatch(setTheme('system'))}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                theme === 'system' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" /> System Preference
              </div>
              {theme === 'system' && <Badge variant="primary">Active</Badge>}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
