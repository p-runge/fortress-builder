"use client";

import { Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Mesh } from "three";
import { api } from "~/api/client";
import { FortressSlot } from "~/server/api/routers/fortress";
import { getCanvasPosition } from "~/utils/3d";
import AddBuildingDialog from "./add-building-dialog";
import { useOverlays } from "./overlay-provider";

export default function Fortress() {
  const { data: slots, isLoading } = api.fortress.getAllSlots.useQuery();

  const { overlays } = useOverlays();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!slots) {
    return <div>No slots</div>;
  }

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 5, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        {slots.map((slot) => {
          // @ts-expect-error date props within building are incorrectly inferred by Zod
          return <FortressField key={slot.id} slot={slot} />;
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

function FortressField({ slot }: { slot: FortressSlot }) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);

  const position = getCanvasPosition(slot.x, slot.y);
  const label = slot.building?.type ?? "[ + ]";

  const { addOverlay, removeTopOverlay } = useOverlays();

  return (
    <mesh
      position={position}
      ref={meshRef}
      onClick={() => {
        if (!slot.building) {
          addOverlay(
            <AddBuildingDialog
              field={{ x: slot.x, y: slot.y }}
              onClose={() => {
                removeTopOverlay();
              }}
            />,
          );
        }
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <cylinderGeometry args={[1, 1, 0.2, 6]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.2}
        rotation={[-Math.PI / 2, 0, 0]}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </mesh>
  );
}
