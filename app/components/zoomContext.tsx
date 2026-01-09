"use client"

import { ZoomContextType } from "@/utils/types";
import { ReactNode, createContext, useContext, useState } from "react";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  // const [note, set]

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const resetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const focusOnNote = (offset: { x: number; y: number }) => {
    setZoom(1);
    setPanOffset(offset);
  };
  

  return (
    <ZoomContext.Provider
      value={{
        zoom,
        setZoom,
        panOffset,
        setPanOffset,
        zoomIn,
        zoomOut,
        resetZoom,
        focusOnNote,
        MAX_ZOOM,
        MIN_ZOOM,
        ZOOM_STEP,
      }}
    >
      {children}
    </ZoomContext.Provider>
  );
}

export function useZoomContext() {
    const context = useContext(ZoomContext);
    if (context === undefined) {
      throw new Error("useZoomContext must be used within ZoomProvider");
    }
    return context;
}