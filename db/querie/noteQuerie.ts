import { TextBox } from "@/utils/types";
import pool from "../postgres";


export async function BEGIN() {
    await pool.query('BEGIN;');
}

export async function COMMIT() {
    await pool.query('COMMIT;');
}

export async function ROLLBACK() {
    await pool.query('ROLLBACK;');
}

export async function getAllNotes(userId:string) {
    
    const query = `SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC;`;

    const value = [userId];
    const result = await pool.query(query, value);

    return result.rows;

}

export async function NotesByFolderId(folderId: string) {

    const querie = `SELECT * FROM notes WHERE folder_id = $1 ORDER BY created_at DESC;`;
    const values = [folderId];
    const result = await pool.query(querie, values);
    return result.rows;

}

// export async function getAllNotesId(userId: string) {

//     const query = `SELECT id FROM notes WHERE user_id = $1 ORDER BY created_at DESC;`;

//     const value = [userId];
//     const result = await pool.query(query, value);
//     return result.rows;

// }



export async function updateUserNotes(box: TextBox, userId: string, folderId: string) {
    const query = `
            INSERT INTO notes (id, user_id, x, y, width, height, text, created_at, updated_at, color, title, folder_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, $12)
            ON CONFLICT (id) DO UPDATE SET
              x=EXCLUDED.x,
              y=EXCLUDED.y,
              width=EXCLUDED.width,
              height=EXCLUDED.height,
              color = EXCLUDED.color,
              title = EXCLUDED.title,
              text=EXCLUDED.text,
              updated_at=NOW()
          `;
    
    const values = [box.id, userId, box.x, box.y, box.width, box.height, box.text, new Date(), new Date(), box.color, box.title, folderId];
    
    const result = await pool.query(query, values);
      
  }

export async function DeleteNotes(noteIds: string[], userId: string) {

    const querie = `DELETE FROM notes WHERE id = ANY($1::uuid[]) AND user_id = $2`;
    await pool.query(querie, [noteIds, userId]);

}

export async function deleteNote(id: string, userId: string) {

    const querie = `DELETE FROM notes WHERE id = $1 AND user_id = $2;`
    const values = [id, userId];
    const result = await pool.query(querie, values);
    return result.rows[0];

}

