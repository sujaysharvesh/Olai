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

export async function fetchNotes() {
  const response = await fetch("/api/notes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }

  const data = await response.json();
  return data.notes;
}

export async function updateNotes(notes: TextBox[], userId: string) {
    const client = await pool.connect(); 
    try {
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
  