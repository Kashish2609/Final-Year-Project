import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, glass = false, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-all',
        glass && 'glass-panel',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
