//| `scan_confirm`    | `info   ` | ESP32    | frontend | Confirmación de segunda pasada de huella.                                 |
//| `scan_confirm`    | `success` | ESP32    | frontend | Confirmación de segunda pasada de huella aceptada.                        |
//| `scan_confirm`    | `error  ` | ESP32    | frontend | Problemas con la de segunda pasada de huella.   
import { sendEvent } from '../utils/sendEvent.js';

function HandleScanConfirm(wss, status, context, payload, origin, currentState) {
    currentState.status = status;
    currentState.context = context;
    currentState.payload = payload;
    currentState.origin = origin;
    currentState.timestamp = new Date().toISOString();

    sendEvent(wss, "scan_confirm", status, context, payload, origin);

    return currentState;
}

export default HandleScanConfirm;