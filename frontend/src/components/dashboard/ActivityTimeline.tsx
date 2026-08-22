import React from 'react';
import { ActivityLog } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Clock, Activity } from 'lucide-react';

export const ActivityTimeline: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-primary" /> Activity History
        </h3>
        <span className="text-[11px] text-muted-foreground">{logs.length} events logged</span>
      </div>

      {logs.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground italic">
          No project activity recorded yet.
        </div>
      ) : (
        <div className="relative border-l border-border/60 ml-3 space-y-4">
          {logs.map((log) => (
            <div key={log._id} className="relative pl-6 text-xs group">
              {/* Dot */}
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-card" />

              <div className="p-3 rounded-xl border border-border/50 bg-card/60 hover:bg-muted/40 transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={log.user?.name || 'User'} src={log.user?.avatar} size="xs" />
                    <span className="font-semibold text-foreground">{log.user?.name || 'System'}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-muted-foreground font-medium pl-6">{log.action}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
