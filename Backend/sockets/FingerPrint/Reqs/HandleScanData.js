import { sendEvent } from '../utils/sendEvent.js';
import { authenticateUser } from '../utils/authContext.js';
import { registerFingerprint } from '../utils//registerContext.js';

async function handleScanData(wss, status, context, payload, origin, currentState) {

  
  
  if (context !== currentState.context) {
    payload={
      status: "Error",
      message: "Contexto no válido"
    };
    sendEvent(wss, "scan_result", context, payload, origin);
    return;
  }
  if (!payload.fingerprint_data) {
    payload={
      status: "Error",
      message: "Fingerprint no válido"
    }; 
    sendEvent(wss, "scan_result", context, payload, origin);
    return;
  }
  
  if (context === "auth") {
    const user = await authenticateUser(payload.fingerprint_data);
    if(!user){
    payload={
      status: "Error",
      message: "Usuario no encontrado"
    };
      sendEvent(wss, "scan_result", "auth", payload); 
    }

    sendEvent(wss, "scan_result", "auth", {
      status: "success",
      message: "User authenticated",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  }

  if (context === "register") {
    const result = await registerFingerprint( payload.fingerprint_data,payload.finger_name, payload.user_id);
    sendEvent(wss, "scan_result", "register", result);
  }

  currentState.payload = null; // reinicializa el payload
  currentState.context = null; // reinicializa el contexto
  currentState.scan_status = "success";
  currentState.last_event = "scan_data";

}

export default handleScanData ;
