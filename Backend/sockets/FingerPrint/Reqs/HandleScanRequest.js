//| `event`           | `status`  | Origen   | Destino  | Descripción                                                               |
//| ----------------- | --------- | ------   | -------- | ------------------------------------------------------------------------- |
//| `scan_request`    | `info   ` | frontend | ESP32    | El frontend solicita iniciar el escaneo.                                  |
//| `scan_request`    | `success` | ESP32    | frontend | El ESP32 iniciar el escaneo.                                              |
//| `scan_request`    | `error`   | ESP32    | frontend | El ESP32 rechaza el escaneo                                               |
import { sendEvent } from '../utils/sendEvent.js';

function handleScanRequest(wss, status, context, payload, origin, currentState) {
  currentState.status = status;
  currentState.context = context;
  currentState.payload = payload;
  currentState.origin = origin;
  currentState.timestamp = new Date().toISOString();
  
  sendEvent(wss, "scan_request", status, context, payload, origin );

  return currentState;
}

export default  handleScanRequest;
