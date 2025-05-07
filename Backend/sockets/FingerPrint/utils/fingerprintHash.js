import CryptoJS from 'crypto-js';

/**
 * Genera un hash estable para búsqueda aproximada de huellas dactilares
 * @param {string} fingerprintData - Datos de la huella en hexadecimal
 * @returns {string} - Hash parcial SHA-256 (primeros 64 caracteres)
 */
function generateFingerprintHash(fingerprintData) {
    if (!fingerprintData || typeof fingerprintData !== 'string') {
        throw new Error('Invalid fingerprint data: must be a non-empty string');
    }
    
    // Normalización de los datos
    const normalized = fingerprintData
        .replace(/\s+/g, '')
        .toLowerCase()
        .trim();
        
    if (normalized.length < 64) {
        throw new Error('Fingerprint data too short');
    }
    
    // Generación del hash
    return CryptoJS.SHA256(normalized)
        .toString(CryptoJS.enc.Hex)
        .substring(0, 64);
}

/**
 * Compara dos huellas usando sus hashes generados
 * @param {string} hash1 - Hash de la primera huella
 * @param {string} hash2 - Hash de la segunda huella
 * @param {number} [threshold=8] - Número mínimo de caracteres iniciales que deben coincidir
 * @returns {boolean} - True si se considera una coincidencia aproximada
 */
function compareFingerprintHashes(hash1, hash2, threshold = 8) {
    if (!hash1 || !hash2) return false;
    return hash1.substring(0, threshold) === hash2.substring(0, threshold);
}

export { generateFingerprintHash, compareFingerprintHashes };