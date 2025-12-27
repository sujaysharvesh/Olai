import { useRef, useState, useCallback } from "react";

export function useBoxInteractions() {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [didDrag, setDidDrag] = useState(false);

  const isResizingRef = useRef(false);

  const startResize = useCallback((id: string) => {
    isResizingRef.current = true;
    setResizingId(id);
  }, []);

  const startDrag = useCallback((id: string) => {
    setDidDrag(false);
    setDraggingId(id);
  }, []);

  const markDragged = useCallback(() => {
    setDidDrag(true);
  }, []);

  const endInteraction = useCallback(() => {
    setDraggingId(null);
    setResizingId(null);

    setTimeout(() => {
      setDidDrag(false);
      isResizingRef.current = false;
    }, 50);
  }, []);

  const canOpenEditor = useCallback(() => {
    return !didDrag && !resizingId && !isResizingRef.current;
  }, [didDrag, resizingId]);

  return {
    draggingId,
    resizingId,
    isResizingRef,
    startResize,
    startDrag,
    markDragged,
    endInteraction,
    canOpenEditor,
  };
}
