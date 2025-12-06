
import { Pool } from "pg";

const globalForPg = global as unknown as { pool: Pool | undefined; }


const pool = globalForPg.pool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    max: 20, 
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 2000, 
  });

if(process.env.NODE_ENV !== "production") globalForPg.pool = pool;

export default pool;