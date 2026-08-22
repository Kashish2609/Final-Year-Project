import React from 'react';
import { clsx } from 'clsx';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={clsx('animate-pulse rounded-lg bg-muted/60', className)} />;
};
