import { useState } from "react";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export function useZoom() {
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const zoomIn = () => setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  const zoomOut = () => setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  const resetZoom = () => {
    setZoom(1);
    setPanOffset({ x:  0, y: 0 });
  };

  return {
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    zoomIn,
    zoomOut,
    resetZoom,
    MIN_ZOOM,
    MAX_ZOOM,
    ZOOM_STEP,
  };
}