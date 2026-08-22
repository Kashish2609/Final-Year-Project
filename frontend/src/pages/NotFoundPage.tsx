import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-7xl font-extrabold text-primary font-mono">404</h1>
      <h2 className="text-xl font-bold text-foreground mt-4">Page Not Found</h2>
      <p className="text-xs text-muted-foreground max-w-sm mt-2 mb-6">
        The page you are looking for doesn't exist or you don't have permission to access it.
      </p>
      <Button leftIcon={<Home className="w-4 h-4" />} onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </div>
  );
};
