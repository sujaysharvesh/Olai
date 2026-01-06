import { TextBox } from "@/utils/types";


export async function fetchNotes(folderId: string): Promise<TextBox[]> {

    try {
        const response = await fetch(`/api/notes/fetch?folderId=${folderId}`, ); 
        const r1 = await response.json();

        // console.log("Fetched notes data:", r1);
    
        const data = r1.response;
        // console.log("Notes data extracted:", data.notes);
    
        const boxes: TextBox[] = data.map((note: any) => ({
          id: note.id,
          title: note.title,
          color: note.color,
          x: note.x,
          y: note.y,
          width: note.width,
          height: note.height,
          text: note.text
        }));
    
        return boxes;
      } catch (err) {
        return []; 
      }

}