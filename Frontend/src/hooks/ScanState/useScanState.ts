//| `event`           | `status`  | Origen   | Destino  | Descripción                                                               |
//| ----------------- | --------- | ------   | -------- | ------------------------------------------------------------------------- |
//| `ready_scan`      | `success` | Server   | frontend | El servidor notifica que el ESP32 está listo para escanear.               |
//| `ready_scan`      | `error`   | Server   | frontend | El ESP32 no esta conectado, o hay otro error.                             |

//| `scan_request`    | `success` | ESP32    | frontend | El ESP32 iniciar el escaneo.                                              |
//| `scan_request`    | `error`   | ESP32    | frontend | El ESP32 rechaza el escaneo                                               |
//| `scan_confirm`    | `info   ` | ESP32    | frontend | Confirmación de segunda pasada de huella.                                 |
//| `scan_confirm`    | `success` | ESP32    | frontend | Confirmación de segunda pasada de huella aceptada.                        |
//| `scan_confirm`    | `error  ` | ESP32    | frontend | Problemas con la de segunda pasada de huella.                             |
//| `scan_done      ` | `success` | ESP32    | Server   | Huella escaneada con éxito, envio de datos.                               |                |
//| `scan_done      ` | `error`   | ESP32    | Server   | Escaneo realizado, pero huella inválida (no coincide, corrupta, etc.).    |
//| `miss_conection`  | `error`   | Server   | frontend | El ESP32 no responde a la solicitud de escaneo.  

import { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { Message } from '../../Models/Message';
import { HandleConnection, makeMessageConnection } from './Handlers/HandleConnection';
import HandleReadyScan from './Handlers/HandleReadyScan';
import {HandleScanRequest, makeScanRequestMessage} from './Handlers/HandleScanRequest';
import HandleScanConfirm from './Handlers/HandleScanConfirm';
import HandleScanDone from './Handlers/HandleScanDone';



// Hook personalizado para manejar el estado del escaneo WebSocket
const useScanState = () => {
  // Estado para almacenar los eventos recibidos
  const [message, setMessage] = useState({} as Message);
  // Estado para el contexto (auth o register)
  const [event, setEvent] = useState('');
  const [esp32Connected, setEsp32Connected] = useState(false);
  const [user, setUser] = useState({});

  const { sendJsonMessage, lastMessage, readyState } = useWebSocket('ws://localhost:3001', 
    {
    onOpen: () => {
      
        console.log('[WebSocket] Conexión establecida');
        const connectionMessage = makeMessageConnection();
        console.log('[WebSocket] Enviando mensaje de conexión:', connectionMessage);
        sendJsonMessage(connectionMessage);
      
    },
    onError: (error) => console.error('[WebSocket] Error:', error),
    onClose: (event) => {
      console.log('[WebSocket] Conexión cerrada:', event.code, event.reason);
      setEsp32Connected(false);
    },
    shouldReconnect: () => true, // Reconectar automáticamente
  });

  // Manejar mensajes entrantes
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const mensaje = JSON.parse(lastMessage.data);
        console.log(mensaje);
        setMessage(mensaje);
        const { event } = mensaje;
        setEvent(event);
        switch(event) {
          case 'ready_scan':
            HandleReadyScan(mensaje, setEsp32Connected);
            break; 
          case 'connection':
            HandleConnection(mensaje, setEsp32Connected);
            break;
          case 'scan_request':
            HandleScanRequest(mensaje);
            break;
          case 'scan_confirm':
            HandleScanConfirm(mensaje);
            break;
          case 'scan_done':
            const scanResult = HandleScanDone(mensaje);
            if (!scanResult) {
              setUser({});
            }
            setUser(scanResult!);
            break;
          case 'miss_conection':
            console.warn('Error de conexión con ESP32');
            break;
          default:
            console.log('Evento no manejado:', event);
        }
      } catch (err) {
        console.warn('⚠️ Mensaje JSON inválido:', lastMessage.data);
      }
    }
  }, [lastMessage]);
  return {
    esp32Connected,
    event,
    makeScanRequestMessage,
    sendJsonMessage,
    user,
    message
  }; // Devuelve el estado y la función de envío de mensajes al componen
};


export default useScanState;