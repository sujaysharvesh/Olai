import { TextBox } from "@/utils/types";


export async function fetchNotes(): Promise<TextBox[]> {

    try {
        const response = await fetch('/api/notes/fetch'); 
        const r1 = await response.json();
    
        const data = r1.response;
    
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