"use client";

import { Canvas } from "@react-three/fiber";
import { api } from "~/api/client";
import FortressField from "./fortress-field";
import { useOverlays } from "./overlay-provider";

export default function Fortress() {
  const { data: fields, isLoading } = api.fortress.getAllFields.useQuery();

  const { overlays } = useOverlays();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!fields) {
    return <div>No fields</div>;
  }

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 5, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        {fields.map((field) => {
          // @ts-expect-error date props within building are incorrectly inferred by Zod
          return <FortressField key={field.id} field={field} />;
        })}
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
