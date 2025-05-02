"use client";

import { Text } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mesh } from "three";
import { api } from "~/api/client";
import { getLocale } from "~/i18n";
import { FortressSlot } from "~/server/api/routers/fortress";
import {
  BuildingWithCollectableBuilding,
  calculateCollectableAmount,
  getCollectableLimit,
} from "~/server/models/building";
import { getCanvasPosition } from "~/utils/3d";
import AddBuildingDialog from "./add-building-dialog";
import { useOverlays } from "./overlay-provider";

export default function FortressField({ slot }: { slot: FortressSlot }) {
  const { building } = slot;

  if (!building) {
    return <EmptyFortressField slot={slot} />;
  }

  // this makes typescript happy
  const slotWithBuilding = {
    ...slot,
    building: building!,
  };

  if (building.collectableBuilding) {
    return <FortressFieldWithCollectableBuilding slot={slotWithBuilding} />;
  }

  return <FortressFieldWithBuilding slot={slotWithBuilding} />;
}

function FortressFieldBase({
  position: { x, y },
  label,
  onClick,
}: {
  position: { x: number; y: number };
  label: React.ReactNode;
  onClick: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);

  const position = getCanvasPosition(x, y);

  return (
    <mesh
      position={position}
      ref={meshRef}
      onClick={onClick}
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

function FortressFieldWithBuilding({
  slot,
}: {
  slot: FortressSlot & { building: BuildingWithCollectableBuilding };
}) {
  const label = slot.building.type;

  return (
    <FortressFieldBase
      position={{ x: slot.x, y: slot.y }}
      label={label}
      onClick={() => {
        if (slot.building) {
          if (slot.building.collectableBuilding) {
          }
        }
      }}
    />
  );
}

function EmptyFortressField({ slot }: { slot: FortressSlot }) {
  const { addOverlay, removeTopOverlay } = useOverlays();

  return (
    <FortressFieldBase
      position={{ x: slot.x, y: slot.y }}
      label="[ + ]"
      onClick={() => {
        addOverlay(
          <AddBuildingDialog
            field={{ x: slot.x, y: slot.y }}
            onClose={() => {
              removeTopOverlay();
            }}
          />,
        );
      }}
    />
  );
}

function FortressFieldWithCollectableBuilding({
  slot,
}: {
  slot: FortressSlot & { building: BuildingWithCollectableBuilding };
}) {
  const { collectableBuilding } = slot.building;

  const [isCollecting, setIsCollecting] = useState(false);
  const [collectableAmount, setCollectableAmount] = useState(0);
  const collectableThreshold = 0.1 * getCollectableLimit(slot.building);
  // const isFull = isCollectableAmountFull(slot.building);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!slot.building) {
        return;
      }

      const amount = calculateCollectableAmount(slot.building);
      setCollectableAmount(amount);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [slot.building]);

  const locale = getLocale();
  const router = useRouter();

  const apiUtils = api.useUtils();
  const { mutateAsync: collect } = api.building.collect.useMutation({
    onSuccess() {
      apiUtils.fortress.getAllSlots.invalidate();
      router.refresh();
    },
  });

  return (
    <FortressFieldBase
      position={{ x: slot.x, y: slot.y }}
      label={[
        slot.building.type,
        collectableBuilding &&
          collectableAmount &&
          collectableAmount >= collectableThreshold &&
          `Collect ${new Intl.NumberFormat(locale).format(collectableAmount)} ${collectableBuilding.resourceType}`,
      ]
        .filter(Boolean)
        .join("\n")}
      onClick={async () => {
        if (
          !isCollecting &&
          collectableBuilding &&
          collectableAmount &&
          collectableAmount >= collectableThreshold
        ) {
          setIsCollecting(true);
          try {
            await collect({
              id: collectableBuilding.id,
            });
          } catch {}
          setIsCollecting(false);
          setCollectableAmount(0);
        }
      }}
    />
  );
}
