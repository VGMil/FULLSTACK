import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useScanState = () => {
  const [scanState, setScanState] = useState('');

  useEffect(() => {
    const stateSocket = io('http://localhost:3001/estados', {
      transports: ['websocket'],
      autoConnect: true
    });

    stateSocket.on('state_update', (state) => setScanState(state));

    return () => {
      stateSocket.off('state_update');
      stateSocket.disconnect();
    };
  }, []);

  const startScan = () => {
    const stateSocket = io('http://localhost:3001/estados');
    stateSocket.emit('scan_request');
  };

  const stopScan = () => {
    const stateSocket = io('http://localhost:3001/estados');
    stateSocket.emit('reset');
  };


  return { scanState, startScan, stopScan };
};