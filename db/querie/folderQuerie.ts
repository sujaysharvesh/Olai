import pool from "../postgres";




export async function createFolderForUser(name: string, userId: string) {

    const querie = `INSERT INTO folders(name, user_id, created_at, updated_at) values ($1, $2, now(), now()) RETURNING *;`;
    const values = [name, userId];
    const result = await pool.query(querie, values);   
    return result.rows[0];

}

export async function deleteFolder(folderId: string) {
    
    const querie = `DELETE FROM folders WHERE id = $1;`;
    const values = [folderId];
    await pool.query(querie, values);

}

export async function updateFolderName(folderId: string, name:string) {

    const querie = `UPDATE folders SET name = $1, updated_at = now() WHERE id = $2;`;
    const values = [name, folderId];
    const result = await pool.query(querie, values);
    return result;

}

// export async function FoldersByUserId(userId: string) {
//     const querie = `SELECT * FROM folders WHERE user_id = $1 ORDER BY created_at DESC;`;
//     const values = [userId];
//     const result = await pool.query(querie, values);
//     return result.rows;
// }

export async function FoldersByUserId(userId:string) {

    const query = `
      SELECT
        f.id   AS folder_id,
        f.name AS folder_name,
        n.id   AS note_id,
        n.title AS note_title,
        n.x,
        n.y
      FROM folders f
      LEFT JOIN notes n ON n.folder_id = f.id
      WHERE f.user_id = $1
      ORDER BY f.created_at, n.created_at
    `;

    const values = [userId];
    const rows  = await pool.query(query, values);
    return rows;
    
}