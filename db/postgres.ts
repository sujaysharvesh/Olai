import { Pool } from "pg";

declare global {
  var pgPool: Pool | undefined;
}

const pool =
  global.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

global.pgPool = pool;

// pool.on("connect", () => {
//   console.log("🟢 PostgreSQL connected");
// });

// pool.on("error", (err) => {
//   console.error("🔴 PostgreSQL pool error", err);
// });

export default pool;
