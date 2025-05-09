
import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();


// Get all finger records for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = 'SELECT id FROM fingerprints WHERE user_id = ?';
    const values = [userId];

    const result = await pool.query(query, values);

    let rows;
    if (Array.isArray(result)) {
      rows = result[0]; // Para mysql2
    } else if (result.rows) {
      rows = result.rows; // Para PostgreSQL u otras libs
    } else {
      throw new Error('Formato de respuesta de la base de datos no soportado');
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No finger records found for this user' });
    }

    const fingerIds = rows.map(row => row.id);

    res.status(200).json({ fingerIds });
  } catch (error) {
    console.error('Error en GET /fingers/:userId:', error);
    res.status(500).json({ error: error.message });
  }
});


// Delete a finger record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Add database logic here to delete finger record
    res.status(200).json({ message: 'Finger record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
