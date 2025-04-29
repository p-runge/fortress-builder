"use client";

import { Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Mesh } from "three";
import { FORTRESS_SIZE, getCoordinatesForSize } from "~/server/models/fortress";
import { getCanvasPosition } from "~/utils/3d";

export default function Fortress() {
  // const { data: slots, isLoading } = api.fortress.getAllSlots.useQuery();

  const coordinates = getCoordinatesForSize(FORTRESS_SIZE);
  const slots = coordinates.map((coord) => ({
    id: `${coord.x}/${coord.y}`,
    x: coord.x,
    y: coord.y,
  }));

  // if (isLoading) {
  //   return null;
  // }

  if (!slots) {
    return <div>No slots</div>;
  }

  return (
    <Canvas camera={{ position: [0, 5, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      {slots.map((slot) => {
        console.log(slot.x, slot.y, getCanvasPosition(slot.x, slot.y));
        return (
          <Box
            key={slot.id}
            position={getCanvasPosition(slot.x, slot.y)}
            label={slot.id.toString()}
            onClick={() => console.log("click")}
          />
        );
      })}
    </Canvas>
  );
}

function Box(props: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  args?: [number, number, number];
  label?: string;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <mesh
      position={props.position}
      rotation={props.rotation}
      ref={meshRef}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <cylinderGeometry args={[1, 1, 0.2, 6]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
      {props.label && (
        <Text
          position={[0, 0.2, 0]} // Position the label slightly above the top face
          fontSize={0.2}
          rotation={[-Math.PI / 2, 0, 0]} // Rotate the text to face upwards
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {props.label}
        </Text>
      )}
    </mesh>
  );
}
