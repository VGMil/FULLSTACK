//| `event`           | `status`  | Origen   | Destino  | Descripción                                                               |
//| ----------------- | --------- | ------   | -------- | ------------------------------------------------------------------------- |
//| `ready_scan`      | `info   ` | ESP32    | Server   | El ESP32 avisa que está listo para escanear.                              |
//| `ready_scan`      | `success` | Server   | frontend | El servidor notifica que el ESP32 está listo para escanear.               |
//| `ready_scan`      | `error`   | Server   | frontend | El ESP32 no esta conectado, o hay otro error.  

import { sendEvent } from '../utils/sendEvent.js';

function handleReadyScan(wss, status, context, payload, origin, currentState) {
    
    if (origin === "ESP32" && status === "info") {
        status = "success";
    }else {
        status = "error";
        payload = {message: "ESP32 not connected"};
    }
    currentState = {
        event: "ready_scan",
        context: context,
        status: status, // Estado del evento, ej: "success", "error", "info", "none"
        payload: payload,
        origin: "server",
        timestamp: Date.now(),
    };
    sendEvent(wss, currentState.event, currentState.status, currentState.context, currentState.payload);

    return currentState;
}

export default handleReadyScan;