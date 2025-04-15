"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

type FrameContextType = {
  scale: number;
};
const ScalingFrameContext = createContext<FrameContextType | null>(null);

export function useScalingFrame() {
  const frame = useContext(ScalingFrameContext);
  if (!frame)
    throw new Error("useScalingFrame must be used within ScalingFrame");
  return frame;
}

const WIDTH = 1920;
const HEIGHT = 1080;

export default function ScalingFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const resize = () => {
      if (!ref.current || !frameRef.current) return;

      const scale = Math.min(
        (1 / WIDTH) * frameRef.current.getBoundingClientRect().width,
        (1 / HEIGHT) * frameRef.current.getBoundingClientRect().height
      );
      setScale(scale);
      ref.current.style.transform = `scale(${scale})`;
      setInitialized(true);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <ScalingFrameContext.Provider value={{ scale }}>
      <div
        ref={frameRef}
        className="flex h-full w-full items-center justify-center overflow-hidden bg-accent"
      >
        <div
          ref={ref}
          className={cn(
            "bg-background text-foreground shadow select-none",
            initialized ? "opacity-100" : "opacity-0"
          )}
          style={{
            height: HEIGHT,
            width: WIDTH,
            aspectRatio: `${WIDTH}/${HEIGHT}`,
          }}
        >
          <div className="h-full overflow-hidden">{children}</div>
        </div>
      </div>
    </ScalingFrameContext.Provider>
  );
}
