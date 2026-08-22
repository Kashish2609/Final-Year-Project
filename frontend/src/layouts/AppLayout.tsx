import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { ToastContainer } from '../components/ui/Toast';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { useSocket } from '../hooks/useSocket';
import { fetchNotifications } from '../store/slices/notificationSlice';
import { AppDispatch, RootState } from '../store';

export const AppLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentProject = useSelector((state: RootState) => state.projects.currentProject);

  // Activate real-time socket events
  useSocket(currentProject?._id);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
      <CreateProjectModal />
    </div>
  );
};
