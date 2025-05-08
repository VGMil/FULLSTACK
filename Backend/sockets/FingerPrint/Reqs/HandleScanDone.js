import { sendEvent } from '../utils/sendEvent.js';
import { authenticateUser } from '../utils/authContext.js';
import { registerFingerprint } from '../utils/registerContext.js';

// Códigos de error centralizados
const ERROR_CODES = {
    INVALID_ORIGIN: 'invalid_origin',
    INVALID_FINGERPRINT: 'invalid_fingerprint',
    USER_NOT_FOUND: 'user_not_found',
    REGISTRATION_ERROR: 'registration_error'
};

async function handleScanDone(wss, status, context, payload, origin, currentState) {
    // Validación de origen
    if (origin !== "ESP32") {
        await sendEvent(wss, "scan_done", "error", "none", {
            code: ERROR_CODES.INVALID_ORIGIN,
            message: "Unauthorized origin"
        }, "server");
        return currentState;
    }

    // Validación de estado fallido
    if (status !== "success") {
        await sendEvent(wss, "scan_done", "error", context, {
            code: ERROR_CODES.INVALID_FINGERPRINT,
            message: "Escaneo realizado, pero huella inválida"
        }, "server");
        return currentState;
    }

    // Validación de payload
    if (!payload?.fingerprint_data) {
        await sendEvent(wss, "scan_done", "error", context, {
            code: ERROR_CODES.INVALID_FINGERPRINT,
            message: "Datos de huella no proporcionados"
        }, "server");
        return currentState;
    }

    try {
        // Procesamiento según contexto
        switch (context) {
            case "auth":
                const user = await authenticateUser(payload.fingerprint_data);
                if (!user) {
                    await sendEvent(wss, "scan_done", "error", context, {
                        code: ERROR_CODES.USER_NOT_FOUND,
                        message: "Usuario no encontrado"
                    }, "server");
                    return currentState;
                }

                await sendEvent(wss, "scan_done", "success", context, {
                    message: "Autenticación exitosa",
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                        // No incluir datos sensibles
                    }
                }, "server");
                break;

            case "register":
                const result = await registerFingerprint(payload.fingerprint_data, payload.user_id);
                await sendEvent(wss, "scan_done", result.status, context, {
                    ...payload,
                    message: result.message,
                    code: result.code || undefined
                }, "server");
                break;

            default:
                await sendEvent(wss, "scan_done", "error", "none", {
                    code: "invalid_context",
                    message: "Contexto no válido"
                }, "server");
        }

        return currentState;

    } catch (error) {
        console.error(`Error processing scan_done: ${error.message}`);
        await sendEvent(wss, "scan_done", "error", context, {
            code: "processing_error",
            message: "Error al procesar huella digital"
        }, "server");
        return currentState;
    }
}

export default handleScanDone;