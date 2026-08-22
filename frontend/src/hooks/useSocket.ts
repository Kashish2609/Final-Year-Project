import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSocket } from '../services/socket';
import { socketNotificationReceived } from '../store/slices/notificationSlice';
import {
  socketTaskCreated,
  socketTaskUpdated,
  socketTaskDeleted,
  socketCommentCreated,
} from '../store/slices/taskSlice';
import { addToast } from '../store/slices/uiSlice';

export const useSocket = (projectId?: string) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (projectId) {
      socket.emit('project:join', projectId);
    }

    const handleNotification = (notification: any) => {
      dispatch(socketNotificationReceived(notification));
      dispatch(
        addToast({
          type: 'info',
          message: `${notification.title}: ${notification.message}`,
        })
      );
    };

    const handleTaskCreated = (task: any) => {
      dispatch(socketTaskCreated(task));
    };

    const handleTaskUpdated = (task: any) => {
      dispatch(socketTaskUpdated(task));
    };

    const handleTaskStatusUpdated = (task: any) => {
      dispatch(socketTaskUpdated(task));
    };

    const handleTaskDeleted = (taskId: string) => {
      dispatch(socketTaskDeleted(taskId));
    };

    const handleCommentCreated = (comment: any) => {
      dispatch(socketCommentCreated(comment));
    };

    socket.on('notification:new', handleNotification);
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:statusUpdated', handleTaskStatusUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('comment:created', handleCommentCreated);

    return () => {
      if (projectId) {
        socket.emit('project:leave', projectId);
      }
      socket.off('notification:new', handleNotification);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:statusUpdated', handleTaskStatusUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('comment:created', handleCommentCreated);
    };
  }, [dispatch, projectId]);
};
