"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Mesh } from "three";

export default function Fortress() {
  return (
    <Canvas camera={{ position: [0, 20, 20], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <Box position={[1.2, 0, 0]} />
    </Canvas>
  );
}

function Box(props: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  args?: [number, number, number];
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef<Mesh>(null);
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((_state, delta) => (meshRef.current!.rotation.x += delta));
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      position={props.position}
      rotation={props.rotation}
      ref={meshRef}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}
