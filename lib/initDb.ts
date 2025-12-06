import pool from '@/db/postgres';
import fs from 'fs';



export async function initDB() {

    try {
        const schemaPath = process.env.SCHEMA_PATH;
        const schema = fs.readFileSync(schemaPath!, 'utf-8');   
        await pool.query(schema);

        console.log("Database initialized successfully.");

    } catch(err) {
        console.error("Error initializing database:", err);
    }

}