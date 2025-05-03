export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    io.emit('auth_update', 'Conectado');

    socket.on('auth_status', (status) => {
      io.emit('auth_update', status);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
};