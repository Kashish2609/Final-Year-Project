import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles, Shield, Zap, Users } from 'lucide-react';
import { ToastContainer } from '../components/ui/Toast';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* Left Branding Hero Section */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-12 flex-col justify-between overflow-hidden border-r border-border/20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="w-6 h-6 text-white fill-current" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">Team Task Manager</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" /> High Velocity SaaS Platform
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Streamline projects with granular RBAC permissions & real-time velocity.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Full-stack collaborative task management with 3-tier project roles, real-time Kanban boards, executive analytics, and enterprise audit trails.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Shield className="w-5 h-5 text-blue-400 mb-2" />
              <div className="font-semibold text-xs text-white">2-Level RBAC</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Global Super Admin & Project-level roles</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Users className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="font-semibold text-xs text-white">Real-Time Sync</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Socket.io board updates & notifications</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-white/10 pt-6">
          <span>&copy; 2026 Team Task Manager SaaS Inc.</span>
          <span>Security Certified</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <Outlet />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
