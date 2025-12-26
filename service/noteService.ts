import pool from "@/db/postgres";
import {
  BEGIN,
  COMMIT,
  DeleteNotes,
  ROLLBACK,
  deleteNote,
  getAllNotesId,
  updateUserNotes,
} from "@/db/querie/noteQuerie";
import { TextBox } from "@/utils/types";

export async function getNotes(userId: string) {

    const notes = await getAllNotesId(userId);
    return notes;

}

export async function updateNotes(notes: TextBox[], userId: string) {
    const client = await pool.connect(); 
    try {
      console.log("Updating notes for user:", notes);
      const currentNotes = await getAllNotesId(userId);
      const existingIds = currentNotes.map(r => r.id);
      const newIds = notes.map(n => n.id);
      const idsToDelete = existingIds.filter(id => !newIds.includes(id));
  
      await client.query('BEGIN');
  
      await Promise.all(
        notes.map(note => {
            updateUserNotes(note, userId);
        })
      );
  
      if (idsToDelete.length > 0) {
        DeleteNotes(idsToDelete, userId);
      }
  
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
  