//| `event`           | `status`  | Origen   | Destino  | Descripción                                                               |
//| ----------------- | --------- | ------   | -------- | ------------------------------------------------------------------------- |
//| `ready_scan`      | `info   ` | ESP32    | Server   | El ESP32 avisa que está listo para escanear.                              |
//| `ready_scan`      | `success` | Server   | frontend | El servidor notifica que el ESP32 está listo para escanear.               |
//| `ready_scan`      | `error`   | Server   | frontend | El ESP32 no esta conectado, o hay otro error.                             |
//| `scan_request`    | `info   ` | frontend | ESP32    | El frontend solicita iniciar el escaneo.                                  |
//| `scan_request`    | `success` | ESP32    | frontend | El ESP32 iniciar el escaneo.                                              |
//| `scan_request`    | `error`   | ESP32    | frontend | El ESP32 rechaza el escaneo                                               |
//| `scan_confirm`    | `info   ` | ESP32    | frontend | Confirmación de segunda pasada de huella.                                 |
//| `scan_confirm`    | `success` | ESP32    | frontend | Confirmación de segunda pasada de huella aceptada.                        |
//| `scan_confirm`    | `error  ` | ESP32    | frontend | Problemas con la de segunda pasada de huella.                             |
//| `scan_done      ` | `success` | ESP32    | Server   | Huella escaneada con éxito, envio de datos.                               |                |
//| `scan_done      ` | `error`   | ESP32    | Server   | Escaneo realizado, pero huella inválida (no coincide, corrupta, etc.).    |
//| `miss_conection`  | `error`   | Server   | frontend | El ESP32 no responde a la solicitud de escaneo.                           |
import  handleReset from "./Reqs/HandleReset.js";
import  handleScanRequest from "./Reqs/HandleScanRequest.js";
// import  handleScanData from "./Reqs/HandleScanData.js";	
import  handleReadyScan from "./Reqs/HandleReadyScan.js";	
import { sendEvent } from "./utils/sendEvent.js";
import HandleScanConfirm from "./Reqs/HandleScanConfirm.js";
import handleScanDone from "./Reqs/HandleScanDone.js";
import {HandleConnection}  from "./Reqs/HandleConnection.js";

let currentState = {
    "event": "none",// Tipo de evento, ej: "scan_request", "scan_data"
    "status": "none",// Estado del evento, ej: "success", "error", "info", "none"
    "context": "none",// Contexto: "auth", "register", o "none"
    "payload": {},// Datos específicos del evento
    "origin": "server", // Quién envía el mensaje
    "timestamp": new Date(),
  };

  let esp32Connected = false;

  const eventHandlers = {

    connection: (wss, status, context, payload, origin) => {      
      HandleConnection(wss, status, origin, esp32Connected);
    },

    ready_scan: (wss, status, context, payload, origin) => {
        currentState = handleReadyScan(wss, status, context, payload, origin, currentState) // Maneja el evento ready_sca
        if(currentState.status === "success"){
            esp32Connected = true;
            console.log("ESP32 connected");
        }else{
            esp32Connected = false;
            console.log("ESP32 not connected"); 
        }
    },
    
    scan_request: (wss, status, context, payload, origin) => {
        handleScanRequest(wss, status, context, payload, origin, currentState);
    },

    scan_confirm:(wss, status, context, payload, origin) =>{
        HandleScanConfirm(wss, status, context, payload, origin, currentState)
    },

    scan_done: (wss, status, context, payload, origin) => {
        handleScanDone(wss, status, context, payload, origin, currentState);
    },

    reset: (wss) => {
        handleReset(wss, currentState);
        esp32Connected = false;
        console.log("ESP32 disconnected");
    }
  };
  
  
  const setupStateSocket = (wss, ws, req) => {
    ws.on("message", (messageStr) => {
      let message;
      try {
        message = JSON.parse(messageStr);
      } catch (err) {
        console.warn("⚠️ Mensaje JSON inválido:", messageStr);
        return;
      }
      const { event, status, context, payload = {}, origin = "unknown" } = message;
      console.log("📨 Mensaje recibido:", message);
      const handler = eventHandlers[event];
  
      if (handler) {

        console.log("📨 Evento recibido:", event ," - ", origin, " - ", status);

        if(event !=="ready_scan" && !esp32Connected && event !=="connection"){
          sendEvent(wss, "miss_conection", "error", "none", {message: "ESP32 not connected"}, "server");
          return;
        }
          handler(wss,  status, context, { ...payload }, origin);
      } else {
        console.warn("⚠️ Evento desconocido:", event);
      }
    });
  };
  export default setupStateSocket;
  