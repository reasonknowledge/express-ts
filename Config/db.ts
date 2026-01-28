import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error('Variable manquante : ' + key);
    process.exit(1);
  }
}

export const db = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT) || 20,
  maxIdle: Number(process.env.DB_MAX_IDLE) || 10,
  idleTimeout: 60000,
  queueLimit: 0,
  connectTimeout: 10000,
  timezone: '+01:00',
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function initDb() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log('MySQL pool initialisé');
  } catch (error) {
    console.error('Erreur connexion MySQL :', error);
    process.exit(1);
  }
}
