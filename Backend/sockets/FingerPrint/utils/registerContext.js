import { pool } from "../../../config/db.js";  // Pool de conexión a la base de datos
/**
 * Registra una nueva huella digital para un usuario.
 * @param {string} fingerprint - Huella digital del usuario
 * @param {number} userId - ID del usuario que está registrando la huella
 * @returns {Promise<Object>} - Mensaje con el resultado de la operación
 */
async function registerFingerprint(fingerprint, finger_name, userId) {
  // Verifica si la huella digital ya existe
  const [existing] = await pool.query(
    "SELECT * FROM fingerprints WHERE fingerprint_data = ?",
    [fingerprint]
  );

  if (existing.length > 0) {
    return { status: "fail", message: "Fingerprint already exists" };
  }

  // Si no existe, actualiza la huella del usuario
  await pool.query(
    `INSERT INTO fingerprints (user_id, fingerprint_data, finger_name)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      fingerprint_data = VALUES(fingerprint_data),
      finger_name = VALUES(finger_name)`,
   [userId, fingerprint, finger_name]
  
 );

  return { status: "success", message: "Fingerprint saved" };
}

export { registerFingerprint };
