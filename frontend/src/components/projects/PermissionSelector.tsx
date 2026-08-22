import React, { useState } from 'react';
import { ProjectRole } from '../../types';
import { Shield, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface PermissionSelectorProps {
  currentRole: ProjectRole;
  disabled?: boolean;
  onChangeRole: (newRole: ProjectRole) => void;
}

const roleDescriptions: Record<ProjectRole, { title: string; desc: string }> = {
  [ProjectRole.OWNER]: {
    title: 'Project Owner',
    desc: 'Full administrative authority, project deletion, and ownership transfer.',
  },
  [ProjectRole.ADMIN]: {
    title: 'Project Admin',
    desc: 'Can manage members, permissions, tasks, and project settings.',
  },
  [ProjectRole.EDITOR]: {
    title: 'Editor',
    desc: 'Can create and manage tasks but cannot manage project access.',
  },
  [ProjectRole.MEMBER]: {
    title: 'Member',
    desc: 'Can view the project and manage their assigned tasks.',
  },
};

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  currentRole,
  disabled = false,
  onChangeRole,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const availableRoles = [ProjectRole.ADMIN, ProjectRole.EDITOR, ProjectRole.MEMBER];

  const handleSelect = (role: ProjectRole) => {
    if (disabled || role === currentRole) return;
    onChangeRole(role);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        <Shield className="w-3.5 h-3.5 text-primary" />
        <span className="capitalize">{roleDescriptions[currentRole]?.title || currentRole}</span>
        {!disabled && <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />}
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-xl focus:outline-none">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
              Select Member Role
            </div>
            <div className="space-y-1">
              {availableRoles.map((role) => {
                const isSelected = role === currentRole;
                const info = roleDescriptions[role];
                return (
                  <button
                    key={role}
                    onClick={() => handleSelect(role)}
                    className={clsx(
                      'w-full text-left p-2.5 rounded-lg transition-colors flex items-start gap-2.5 text-xs',
                      isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <div className="flex-1">
                      <div className="font-semibold flex items-center justify-between">
                        <span>{info.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{info.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
