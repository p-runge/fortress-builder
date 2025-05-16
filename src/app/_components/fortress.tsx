"use client";

import { Canvas } from "@react-three/fiber";
import { api } from "~/api/client";
import { CanvasHtml } from "~/components/canvas-html";
import { Skeleton } from "~/components/ui/skeleton";
import { FORTRESS_SIZE, getCoordinatesForSize } from "~/server/models/fortress";
import { getCanvasPosition } from "~/utils/3d";
import FortressField from "./fortress-field";
import { useOverlays } from "./overlay-provider";

export default function Fortress() {
  const { data: fields, isLoading } = api.fortress.getAllFields.useQuery();

  const { overlays } = useOverlays();

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 5, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        {isLoading ? (
          <FortressSkeleton />
        ) : (
          fields?.map((field) => {
            return <FortressField key={field.id} field={field} />;
          })
        )}
      </Canvas>
      {/* overlay wrapper */}
      <div className="pointer-events-none absolute inset-0">
        {overlays.map((overlay, index) => (
          <div key={index} className="pointer-events-auto">
            {overlay}
          </div>
        ))}
      </div>
    </div>
  );
}

const HEXAGON_SIZE = 160; // px
const HEXAGON_SIDE_RELATION = 2 / Math.sqrt(3); // 1.1547

function FortressSkeleton() {
  const coordinates = getCoordinatesForSize(FORTRESS_SIZE);

  return (
    <CanvasHtml>
      <div
        className="relative h-full w-full"
        style={{ transform: "perspective(650px) rotateX(45deg)" }}
      >
        {coordinates.map(({ x, y }, index) => {
          const position = getCanvasPosition(x, y);

          return (
            <Skeleton
              key={index}
              className="-translate-1/2"
              style={{
                position: "absolute",
                left: `${((position[0] * HEXAGON_SIDE_RELATION) / 2) * HEXAGON_SIZE}px`,
                top: `${((position[2] * HEXAGON_SIDE_RELATION) / 2) * HEXAGON_SIZE}px`,
                width: `${HEXAGON_SIZE}px`,
                height: `${HEXAGON_SIZE * HEXAGON_SIDE_RELATION}px`,
                // hexagon shape
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            />
          );
        })}
      </div>
    </CanvasHtml>
  );
}
