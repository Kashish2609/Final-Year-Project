import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Calendar, Users, CheckCircle2, ChevronRight } from 'lucide-react';

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const navigate = useNavigate();

  const priorityColors = {
    LOW: 'default',
    MEDIUM: 'primary',
    HIGH: 'warning',
    URGENT: 'danger',
  } as const;

  return (
    <Card
      onClick={() => navigate(`/projects/${project._id}`)}
      className="group cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            {project.key}
          </span>
          <Badge variant={priorityColors[project.priority]} size="sm">
            {project.priority}
          </Badge>
        </div>

        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
          <span>{project.name}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
          <span>Progress</span>
          <span className="text-foreground">{project.progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{project.members?.length || 1} members</span>
        </div>

        {/* Member Avatars Stack */}
        <div className="flex -space-x-2 overflow-hidden">
          {(project.members || []).slice(0, 4).map((m, idx) => (
            <Avatar key={idx} name={m.user.name} src={m.user.avatar} size="xs" className="ring-2 ring-card" />
          ))}
        </div>
      </div>
    </Card>
  );
};
