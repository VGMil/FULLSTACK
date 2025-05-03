import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes.js';
import { setupSocket } from './sockets/authSocket.js';
import { setupStateSocket } from './sockets/stateSocket.js';
import logger from 'morgan';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST']
  }
});

app.use(logger('dev'));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(bodyParser.json());
app.use('/users', userRoutes);

// WebSockets
setupSocket(io);
setupStateSocket(io);

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});