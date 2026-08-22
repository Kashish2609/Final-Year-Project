import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Select } from '../ui/Select';
import {
  setFilterStatus,
  setFilterPriority,
  setFilterAssignee,
  setSearchQuery,
} from '../../store/slices/taskSlice';
import { RootState, AppDispatch } from '../../store';

export const TaskFilters: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { filterStatus, filterPriority, filterAssignee, searchQuery } = useSelector(
    (state: RootState) => state.tasks
  );
  const currentProject = useSelector((state: RootState) => state.projects.currentProject);

  const assigneeOptions = [
    { value: 'ALL', label: 'All Assignees' },
    ...(currentProject?.members || []).map((m) => ({
      value: m.user._id,
      label: m.user.name,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card/60 backdrop-blur-md mb-6">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          placeholder="Filter tasks by title or label..."
          className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-input bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Filter Selects */}
      <div className="flex items-center gap-2">
        <Select
          value={filterStatus}
          onChange={(e) => dispatch(setFilterStatus(e.target.value))}
          className="py-1.5 text-xs w-32"
          options={[
            { value: 'ALL', label: 'All Status' },
            { value: 'TODO', label: 'To Do' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' },
          ]}
        />

        <Select
          value={filterPriority}
          onChange={(e) => dispatch(setFilterPriority(e.target.value))}
          className="py-1.5 text-xs w-32"
          options={[
            { value: 'ALL', label: 'All Priorities' },
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'URGENT', label: 'Urgent' },
          ]}
        />

        <Select
          value={filterAssignee}
          onChange={(e) => dispatch(setFilterAssignee(e.target.value))}
          className="py-1.5 text-xs w-36"
          options={assigneeOptions}
        />
      </div>
    </div>
  );
};
