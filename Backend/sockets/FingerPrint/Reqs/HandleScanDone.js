//| `scan_done` | `success` | ESP32    | Server   | Huella escaneada con éxito, envio de datos.                               |                |
//| `scan_done` | `error`   | ESP32    | Server   | Escaneo realizado, pero huella inválida (no coincide, corrupta, etc.).    |
import { sendEvent } from '../utils/sendEvent.js';
import { authenticateUser } from '../utils/authContext.js';
import { registerFingerprint } from '../utils//registerContext.js';


async function handleScanDone(wss, status, context, payload, origin, currentState) {
    if(origin !== "ESP32" ){
        sendEvent(wss, "scan_done", status = "error", context ="none", payload = {
            message: "No permissions"
        }, origin = "server" );    
    }
    if (status !== "success") {
        sendEvent(wss, "scan_done", status = "error", context = "none", payload = {
            message: "Escaneo realizado, pero huella inválida (no coincide, corrupta, etc.)."
        }, origin = "server");
        return;
    }
    if (!payload.fingerprint_data) {
        sendEvent(wss, "scan_done", status="error", context = "none", payload ={
            message: "Fingerprint no existe"
          }, origin = "server");
        return;
    }

    if(context === "auth"){
        const user = await authenticateUser(payload.fingerprint_data);
        if(!user){
            sendEvent(wss, "scan_done", status="error", context="none", payload = {
                message: "Usuario no encontrado"
            }, origin = "server"); 
            return;
        }
        sendEvent(wss, "scan_done", status = "success",context ="auth", payload = {
            message: "User authenticated",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
            }, origin = "server" 
        );
    }
    if(context === "register"){
        const result = await registerFingerprint( payload.fingerprint_data, payload.user_id);
        sendEvent(wss, "scan_done",status = result.status ,context ="register", payload = { ...payload,
            message: result.message,
        }, origin = "server" );    
    }

    return currentState

}

export default handleScanDone;  