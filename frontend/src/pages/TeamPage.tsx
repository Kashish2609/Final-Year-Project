import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Search, Shield } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { searchPlatformUsers } from '../store/slices/teamSlice';
import { AppDispatch, RootState } from '../store';

export const TeamPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { searchUsers, isLoading } = useSelector((state: RootState) => state.team);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(searchPlatformUsers(query));
  }, [dispatch, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Team Workspace Directory</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse workspace team members, global administrative roles, and active users.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter team members by name or email..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchUsers.map((u) => (
            <div
              key={u._id}
              className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <Avatar name={u.name} src={u.avatar} size="md" />
                <div>
                  <h4 className="font-bold text-foreground">{u.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{u.email}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Badge variant={u.globalRole === 'SUPER_ADMIN' ? 'danger' : 'primary'}>
                  {u.globalRole.replace('_', ' ')}
                </Badge>
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
