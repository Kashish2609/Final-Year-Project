import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

  if (!socket) {
    socket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
    });
  } else if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
