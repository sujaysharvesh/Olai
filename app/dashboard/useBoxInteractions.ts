import { useRef, useState, useCallback } from "react";

export function useBoxInteractions() {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [didDrag, setDidDrag] = useState(false);

  const isResizingRef = useRef(false);

  /** Call this on resize handle mouse down */
  const startResize = useCallback((id: string) => {
    isResizingRef.current = true;
    setResizingId(id);
  }, []);

  /** Call this on box mouse down */
  const startDrag = useCallback((id: string) => {
    setDidDrag(false);
    setDraggingId(id);
  }, []);

  /** Call this on mouse move while dragging */
  const markDragged = useCallback(() => {
    setDidDrag(true);
  }, []);

  /** Call on mouse up */
  const endInteraction = useCallback(() => {
    setDraggingId(null);
    setResizingId(null);

    setTimeout(() => {
      setDidDrag(false);
      isResizingRef.current = false;
    }, 50);
  }, []);

  /** SAFE click checker */
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
