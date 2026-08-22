import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTasks, setSelectedTask } from '../store/slices/taskSlice';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { TaskModal } from '../components/tasks/TaskModal';
import { CheckSquare, Calendar } from 'lucide-react';
import { AppDispatch, RootState } from '../store';

export const MyTasksPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { myTasks, selectedTask, isLoading } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    dispatch(fetchMyTasks());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Assigned Tasks</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Tasks assigned directly to you across all projects.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : myTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-10 h-10 text-muted-foreground" />}
          title="No assigned tasks"
          description="You currently have no pending tasks assigned to you."
        />
      ) : (
        <div className="space-y-3">
          {myTasks.map((t) => (
            <div
              key={t._id}
              onClick={() => dispatch(setSelectedTask(t))}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 cursor-pointer transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-primary font-bold">
                  {typeof t.project === 'object' ? t.project.key : 'PRJ'}-{t.taskNumber}
                </span>
                <div>
                  <h4 className="font-semibold text-foreground">{t.title}</h4>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Project: {typeof t.project === 'object' ? t.project.name : 'Project'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {t.dueDate && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(t.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                <Badge variant="primary">{t.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => dispatch(setSelectedTask(null))}
      />
    </div>
  );
};
