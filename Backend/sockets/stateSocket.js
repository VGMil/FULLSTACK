//Events:
// scan_request: Se emite cuando el cliente solicita un escaneo
// ready_scan: Se emite cuando el cliente está listo para escanear
// scan_successful: Se emite cuando el cliente ha completado un escaneo exitoso
// reset: Se emite cuando el cliente solicita reiniciar el estado

export const setupStateSocket = (io) => {
  const stateSocket = io.of('/estados');
  let currentState = 'ready_scan';
  
  stateSocket.on('connection', (socket) => {
    socket.emit('state_update', currentState);
    console.log('Estado actual:', currentState);

    socket.on('scan_request', () => {
      if (currentState === 'ready_scan') {
        currentState = 'scan_request';
        stateSocket.emit('state_update', currentState);
      }
    });

    socket.on('scan_successful', () => {
      if (currentState === 'scan_request') {
        currentState = 'scan_successful';
        stateSocket.emit('state_update', currentState);
      }
    });

    socket.on('reset', () => {
      currentState = 'ready_scan';
      stateSocket.emit('state_update', currentState);
    });

  });
};