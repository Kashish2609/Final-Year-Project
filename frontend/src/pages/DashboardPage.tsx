import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { AnalyticsCharts } from '../components/dashboard/AnalyticsCharts';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/api';
import { setCreateProjectModalOpen } from '../store/slices/uiSlice';
import { DashboardOverview, DashboardAnalytics, ActivityLog } from '../types';
import { RootState, AppDispatch } from '../store';

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [overviewRes, analyticsRes]: [any, any] = await Promise.all([
          api.get('/dashboard/overview'),
          api.get('/dashboard/analytics'),
        ]);
        setOverview(overviewRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <span>{currentDate}</span>
            <span>•</span>
            <span className="text-primary font-semibold">Workspace Overview</span>
          </p>
        </div>

        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => dispatch(setCreateProjectModalOpen(true))}
        >
          Create Project
        </Button>
      </div>

      {/* KPI Cards Grid */}
      {isLoading || !overview ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Projects"
            value={overview.totalProjects}
            subtitle={`${overview.activeProjects} active projects`}
            color="blue"
            icon={<FolderKanban className="w-5 h-5" />}
          />
          <KPICard
            title="Completed Tasks"
            value={overview.completedTasks}
            subtitle={`${overview.inProgressTasks} currently in progress`}
            color="emerald"
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <KPICard
            title="Productivity"
            value={`${overview.productivityPercentage}%`}
            subtitle="Overall completion velocity"
            color="purple"
            trend="+12% this week"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <KPICard
            title="Overdue Tasks"
            value={overview.overdueTasks}
            subtitle="Action required immediately"
            color="rose"
            icon={<AlertTriangle className="w-5 h-5" />}
          />
        </div>
      )}

      {/* Recharts Analytics Charts */}
      {analytics && <AnalyticsCharts analytics={analytics} />}

      {/* Project Progress Summary & Quick Navigation */}
      {analytics && analytics.projectProgress.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Project Velocity & Completion
            </h3>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.projectProgress.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-border/60 bg-card space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground">{p.name}</span>
                  <span className="font-mono text-primary">{p.key}</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-semibold text-foreground">{p.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
