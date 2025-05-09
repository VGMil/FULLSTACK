import { sendEvent } from '../utils/sendEvent.js';
import { authenticateUser } from '../utils/authContext.js';
import { registerFingerprint } from '../utils/registercontext.js';


/**
 * Valida el formato de una huella dactilar
 * @param {string} fingerprint - Datos de huella en hexadecimal
 * @returns {boolean} - Verdadero si es válida
 */
function isValidFingerprint(fingerprint) {
    return fingerprint &&
           typeof fingerprint === 'string' &&
           fingerprint.length >= 512 &&
           /^[0-9A-Fa-f]+$/.test(fingerprint);
}

/**
 * Maneja el evento scan_done enviado desde el ESP32
 * @param {WebSocketServer} wss - Servidor WebSocket
 * @param {string} status - Estado del escaneo ('success' o 'error')
 * @param {string} context - Contexto ('auth' o 'register')
 * @param {Object} payload - Datos del evento (fingerprint_data, user_id, etc.)
 * @param {string} origin - Origen del evento ('ESP32' o 'server')
 * @param {Object} currentState - Estado actual del sistema
 * @returns {Object} - Estado actualizado
 */
async function handleScanDone(wss, status, context, payload, origin, currentState) {
    // Validar origen
    if (origin !== "ESP32") {
        console.error(`Evento scan_done recibido de origen inválido: ${origin}`);
        sendEvent(wss, "scan_done", "error", "none", {
            message: "Origen no autorizado. Se requiere ESP32."
        }, "server");
        return currentState;
    }

    // Validar estado del escaneo
    if (status !== "success") {
        console.error(`Escaneo fallido recibido desde ESP32: ${status}`);
        sendEvent(wss, "scan_done", "error", "none", {
            message: "Escaneo realizado, pero huella inválida (no coincide, corrupta, etc.)."
        }, "server");
        return currentState;
    }

    // Validar fingerprint_data
    if (!payload.fingerprint_data || !isValidFingerprint(payload.fingerprint_data)) {
        console.error("Datos de huella inválidos o ausentes en el payload");
        sendEvent(wss, "scan_done", "error", "none", {
            message: "Datos de huella inválidos o no proporcionados."
        }, "server");
        return currentState;
    }

    console.log(`Procesando evento scan_done con contexto: ${context}`);

    // Manejar contexto de autenticación
    if (context === "auth") {
        const user = await authenticateUser(payload.fingerprint_data);
        if (!user) {
            console.log("Autenticación fallida: no se encontró coincidencia de huella");
            sendEvent(wss, "scan_done", "error", "auth", {
                message: "No se encontró un usuario con la huella proporcionada."
            }, "server");
            return currentState;
        }

        console.log(`Usuario autenticado con éxito: ${user.id}`);
        sendEvent(wss, "scan_done", "success", "auth", {
            message: "Huella autenticada exitosamente.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        }, "server");
        return currentState;
    }

    // Manejar contexto de registro
    if (context === "register") {
        if (!payload.user_id || typeof payload.user_id !== 'number') {
            console.error("user_id inválido o no proporcionado para registro");
            sendEvent(wss, "scan_done", "error", "register", {
                message: "ID de usuario inválido o no proporcionado."
            }, "server");
            return currentState;
        }

        const result = await registerFingerprint(payload.fingerprint_data, payload.user_id);
        console.log(`Resultado de registro: ${result.status}, mensaje: ${result.message}`);

        sendEvent(wss, "scan_done", result.status, "register", {
            message: result.message,
            fingerprintId: result.fingerprintId || null
        }, "server");
        return currentState;
    }

    // Manejar contexto inválido
    console.error(`Contexto inválido recibido: ${context}`);
    sendEvent(wss, "scan_done", "error", "none", {
        message: `Contexto inválido: ${context}. Se esperaba 'auth' o 'register'.`
    }, "server");
    return currentState;
}

export default handleScanDone;