import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useAuthState = () => {
  const [authStatus, setAuthStatus] = useState('Desconectado');
  
  useEffect(() => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true
    });

    const handleAuthUpdate = (status: string) => setAuthStatus(status);
    
    socket.on('auth_update', handleAuthUpdate);
    socket.on('connect', () => setAuthStatus('Conectado'));
    socket.on('disconnect', () => setAuthStatus('Desconectado'));

    return () => {
      socket.off('auth_update', handleAuthUpdate);
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, []);

  return authStatus;
};