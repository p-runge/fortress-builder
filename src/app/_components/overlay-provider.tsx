"use client";

import { createContext, useContext, useState } from "react";

const OverlayContext = createContext<
  | {
      overlays: React.ReactNode[];
      addOverlay: (overlay: React.ReactNode) => void;
      removeTopOverlay: () => void;
    }
  | undefined
>(undefined);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [overlays, setOverlays] = useState<React.ReactNode[]>([]);
  const addOverlay = (overlay: React.ReactNode) => {
    setOverlays((prev) => [...prev, overlay]);
  };
  const removeTopOverlay = () => {
    setOverlays((prev) => prev.slice(0, -1));
  };
  return (
    <OverlayContext.Provider value={{ overlays, addOverlay, removeTopOverlay }}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlays() {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error("useOverlays must be used within an OverlayProvider");
  }
  return context;
}
