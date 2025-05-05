/**
 * Envía un evento a todos los clientes conectados a través de WebSocket
 * @param {WebSocket.Server} wss - Instancia del servidor WebSocket
 * @param {string} event - Nombre del evento a enviar
 * @param {string} context - Contexto del evento Auth, Register
 * @param {Object} payload - Datos adicionales del evento (opcional)
 * @param {string} origin - Origen del evento (por defecto: "server")
 */
const sendEvent = (wss, event, status ,context, payload = {}, origin = "server") => {
    // Construye el objeto mensaje con la información del evento
    const message = {
      event,
      status,
      context,
      payload,
      origin,
      timestamp: new Date().toISOString()
    };
  
    // Itera sobre todos los clientes conectados
    wss.clients.forEach((client) => {
      // Envía el mensaje solo a los clientes que están listos para recibir
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

export {sendEvent};