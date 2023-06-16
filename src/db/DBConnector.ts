import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export default new Pool ({
    max: 20,
    connectionString: `postgres://${process.env.DB_USER ?? 'digitalwardrobe'}:${process.env.DB_PASSWORD ?? ''}@${process.env.DB_URL ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME ?? 'digitalwardrobe'}`,
    idleTimeoutMillis: 30000
});