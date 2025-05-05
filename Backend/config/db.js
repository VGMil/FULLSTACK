import mysql from 'mysql2/promise';
import 'dotenv/config';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;


try {
  pool = mysql.createPool(dbConfig);
  // Test the connection by getting a connection
  const connection = await pool.getConnection();
  console.log('Successfully connected to the database.');
  connection.release(); // Release the connection back to the pool
} catch (error) {
  console.error('!!! Failed to connect to the database !!!');
  console.error('Error details:', error);
  // Exit the process if the database connection fails, as it's critical
  process.exit(1);
}

export { pool };
