import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws'; // Importar WebSocketServer
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes.js';

import setupStateSocket from './sockets/FingerPrint/wsFingerPrint.js';
import logger from 'morgan';

const app = express();
const httpServer = createServer(app);
// Crear instancia de WebSocketServer en lugar de Socket.IO Server

app.use(logger('dev'));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(bodyParser.json());
app.use('/users', userRoutes);



const wss = new WebSocketServer({ server: httpServer }); 
wss.on('connection', (ws, req) => {
  console.log('Cliente conectado por WebSocket');
  setupStateSocket(wss,ws, req);
});


const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});