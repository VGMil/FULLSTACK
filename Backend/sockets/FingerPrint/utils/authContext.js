import { pool } from '../../../config/db.js';

// Umbral de similitud para autenticación
const FINGERPRINT_SIMILARITY_THRESHOLD = 0.75; // Umbral para considerar una coincidencia válida

/**
 * Representa una minutia (punto característico de una huella)
 * @typedef {Object} Minutia
 * @property {number} x - Coordenada x
 * @property {number} y - Coordenada y
 * @property {number} angle - Orientación en radianes
 * @property {string} type - Tipo ('termination' o 'bifurcation')
 */

/**
 * Convierte datos hexadecimales en una lista de minutiae (simplificado)
 * @param {string} hexData - Datos de huella en hexadecimal
 * @returns {Minutia[]} - Lista de minutiae
 */
function extractMinutiae(hexData) {
    if (!hexData || typeof hexData !== 'string') {
        throw new Error('Datos de huella inválidos');
    }

    // Normalizar datos
    const normalized = hexData.replace(/[^0-9A-Fa-f]/g, '').toLowerCase();
    if (normalized.length < 128) {
        throw new Error('Datos de huella demasiado cortos');
    }

    // Simulación de extracción de minutiae
    const minutiae = [];
    const chunkSize = 8; // Cada 8 caracteres representan una minutia (x, y, angle, type)
    for (let i = 0; i < normalized.length - chunkSize; i += chunkSize) {
        const chunk = normalized.substr(i, chunkSize);
        const x = parseInt(chunk.substr(0, 2), 16);
        const y = parseInt(chunk.substr(2, 2), 16);
        const angle = (parseInt(chunk.substr(4, 2), 16) / 255) * 2 * Math.PI;
        const type = parseInt(chunk.substr(6, 2), 16) % 2 === 0 ? 'termination' : 'bifurcation';
        minutiae.push({ x, y, angle, type });
    }

    return minutiae;
}

/**
 * Compara dos conjuntos de minutiae y calcula el porcentaje de similitud
 * @param {Minutia[]} minutiae1 - Primer conjunto de minutiae
 * @param {Minutia[]} minutiae2 - Segundo conjunto de minutiae
 * @returns {number} - Porcentaje de similitud (0-1)
 */
function compareMinutiae(minutiae1, minutiae2) {
    if (!minutiae1.length || !minutiae2.length) {
        return 0;
    }

    // Parámetros de tolerancia
    const distanceThreshold = 10; // Distancia máxima para considerar una coincidencia
    const angleThreshold = Math.PI / 6; // 30 grados de tolerancia

    let matches = 0;
    const maxMinutiae = Math.min(minutiae1.length, minutiae2.length);

    // Comparar cada minutia de la primera huella con las de la segunda
    for (const m1 of minutiae1) {
        for (const m2 of minutiae2) {
            // Calcular distancia euclidiana
            const distance = Math.sqrt((m1.x - m2.x) ** 2 + (m1.y - m2.y) ** 2);
            // Calcular diferencia angular
            let angleDiff = Math.abs(m1.angle - m2.angle);
            angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff); // Normalizar ángulo

            // Verificar si es una coincidencia
            if (
                distance < distanceThreshold &&
                angleThreshold &&
                m1.type === m2.type
            ) {
                matches++;
                break; // Evitar contar la misma minutia dos veces
            }
        }
    }

    // Calcular similitud
    const similarity = matches / maxMinutiae;
    return Math.min(similarity, 1.0);
}

/**
 * Compara dos huellas dactilares y devuelve el porcentaje de similitud
 * @param {string} print1 - Primera huella en hexadecimal
 * @param {string} print2 - Segunda huella en hexadecimal
 * @returns {number} - Porcentaje de similitud (0-1)
 */
function compareFingerprints(print1, print2) {
    try {
        // Extraer minutiae de ambas huellas
        const minutiae1 = extractMinutiae(print1);
        const minutiae2 = extractMinutiae(print2);

        // Comparar minutiae
        const minutiaeScore = compareMinutiae(minutiae1, minutiae2);

        return minutiaeScore;
    } catch (error) {
        console.error('Error al comparar huellas:', error.message);
        return 0;
    }
}

/**
 * Valida el formato de la huella dactilar
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
 * Autentica a un usuario comparando una huella dactilar con las almacenadas
 * @param {string} fingerprint - Datos de huella en hexadecimal
 * @returns {Promise<Object|null>} - Datos del usuario autenticado o null si no hay coincidencia
 */
async function authenticateUser(fingerprint) {
    const connection = await pool.getConnection();
    
    try {
        // Validación estricta del formato de huella
        if (!isValidFingerprint(fingerprint)) {
            console.error("Formato de huella inválido");
            return null;
        }

        // Intentar coincidencia exacta
        const [exactMatches] = await connection.query(
            `SELECT u.*, f.fingerprint_raw 
             FROM fingerprints f
             JOIN users u ON f.user_id = u.id
             WHERE f.fingerprint_raw = ?`,
            [fingerprint]
        );

        if (exactMatches.length > 0) {
            console.log("Coincidencia exacta encontrada");
            return exactMatches[0];
        }

        // Obtener todas las huellas y comparar
        const [allFingerprints] = await connection.query(
            `SELECT u.*, f.fingerprint_raw 
             FROM fingerprints f
             JOIN users u ON f.user_id = u.id`
        );

        console.log("Total de huellas en la base de datos:", allFingerprints.length);

        // Comparar cada huella usando el algoritmo de minutiae
        for (const user of allFingerprints) {
            const similarity = compareFingerprints(user.fingerprint_raw, fingerprint);
            console.log(`Comparando huella para usuario ${user.id}, similitud: ${(similarity * 100).toFixed(2)}%`);
            
            if (similarity >= FINGERPRINT_SIMILARITY_THRESHOLD) {
                console.log("Coincidencia encontrada con similitud:", similarity);
                return user;
            }
        }

        console.log("No se encontraron coincidencias tras comparar todos los registros");
        return null;
    } catch (error) {
        console.error("Error de autenticación:", error);
        return null;
    } finally {
        connection.release();
    }
}

export { authenticateUser };