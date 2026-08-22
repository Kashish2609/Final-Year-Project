import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../store/slices/notificationSlice';
import { AppDispatch, RootState } from '../store';
import { clsx } from 'clsx';

export const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Notifications</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time notifications for task assignments, role changes, and comments.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Check className="w-4 h-4" />}
            onClick={() => dispatch(markAllNotificationsRead())}
          >
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10 text-muted-foreground" />}
          title="No notifications"
          description="You have no notifications at this time."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                dispatch(markNotificationRead(n._id));
                if (n.relatedProject) {
                  navigate(`/projects/${(n.relatedProject as any)._id || n.relatedProject}`);
                }
              }}
              className={clsx(
                'p-4 rounded-xl border border-border cursor-pointer transition-all flex items-start justify-between gap-4 text-xs',
                !n.isRead ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-card hover:bg-muted/40'
              )}
            >
              <div className="space-y-1">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <span>{n.title}</span>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <p className="text-muted-foreground leading-relaxed">{n.message}</p>
              </div>

              <span className="text-[10px] text-muted-foreground shrink-0">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
