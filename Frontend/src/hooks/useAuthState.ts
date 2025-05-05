import { useEffect, useState } from 'react';
export const useAuthState = () => {
  const [authStatus, setAuthStatus] = useState('Desconectado');
  
  useEffect(() => {
    // Conectar usando la API WebSocket nativa
    // Asumimos que el servidor WebSocket para autenticación está en la raíz del puerto 3001
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('WebSocket de autenticación conectado');
      setAuthStatus('Conectado');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'auth_update') {
          setAuthStatus(message.payload);
        }
      } catch (error) {
        console.error('Error al parsear mensaje de autenticación:', event.data, error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket de autenticación desconectado');
      setAuthStatus('Desconectado');
    };

    ws.onerror = (error) => {
      console.error('Error en WebSocket de autenticación:', error);
      setAuthStatus('Error'); // Opcional: indicar estado de error
    };

    // Limpieza al desmontar el componente
    return () => {
      ws.close();
    };
  }, []); // El array vacío asegura que esto se ejecute solo al montar/desmontar

  return authStatus;
};