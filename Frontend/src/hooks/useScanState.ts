import { useEffect, useState, useRef } from 'react';

export const useScanState = () => {
  const [scanState, setScanState] = useState('');
  // Usar useRef para mantener la instancia de WebSocket sin causar re-renders
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Conectar al endpoint /estados
    ws.current = new WebSocket('ws://localhost:3001/estados');
    const currentWs = ws.current;

    currentWs.onopen = () => {
      console.log('WebSocket de estado conectado');
      // El servidor enviará el estado actual al conectar
    };

    currentWs.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'state_update') {
          console.log('Estado recibido:', message.payload);
          setScanState(message.payload);
        }
      } catch (error) {
        console.error('Error al parsear mensaje de estado:', event.data, error);
      }
    };

    currentWs.onclose = () => {
      console.log('WebSocket de estado desconectado');
      setScanState('Desconectado'); // Indicar desconexión
      ws.current = null;
    };

    currentWs.onerror = (error) => {
      console.error('Error en WebSocket de estado:', error);
      setScanState('Error');
      ws.current = null;
    };

    // Limpieza al desmontar el componente
    return () => {
      // No cerrar aquí directamente, usar stopScan si es necesario
      // currentWs?.close(); 
    };
  }, []); // Ejecutar solo al montar

  // Función para enviar mensajes al WebSocket
  const sendMessage = (type: string, payload?: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket de estado no está conectado o listo.');
      // Podrías implementar lógica de reintento o cola de mensajes aquí
    }
  };

  const startScan = () => {
    sendMessage('scan_request');
  };

  // Renombrado para claridad, ya que 'reset' es el evento del backend
  const resetScanState = () => {
    sendMessage('reset');
  };

  // Función para cerrar la conexión WebSocket
  const stopScan = () => {
    if (ws.current) {
      console.log('Cerrando WebSocket de estado manualmente');
      ws.current.close();
      ws.current = null; // Limpiar la referencia
      setScanState('Desconectado'); // Actualizar estado
    }
  };

  // Exponer el estado y las acciones
  return { scanState, startScan, resetScanState, stopScan };
};