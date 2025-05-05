import { pool } from "../../../config/db.js";  // Pool de conexión a la base de datos
/**
 * Verifica si la huella digital existe en la base de datos para autenticación.
 * @param {string} fingerprint - Huella digital a verificar
 * @returns {Promise<Object>} - El usuario si es encontrado, null si no
 */
async function authenticateUser(fingerprint) {
  const [users] = await pool.query(
    "SELECT * FROM fingerprints WHERE fingerprint_data = ?",
    [fingerprint]
  );
  // Si no se encuentra el usuario, retorna null
  if (users.length === 0) {
    return null;
  }
  // Si el usuario es encontrado, devuelve los datos del usuario
  return users[0];
}

export { authenticateUser };
