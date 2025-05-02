"use client";

import { Text } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mesh } from "three";
import { api } from "~/api/client";
import { getLocale } from "~/i18n";
import { FortressField as TFortressField } from "~/server/api/routers/fortress";
import {
  BuildingWithCollectableBuilding,
  calculateCollectableAmount,
  CollectableBuilding,
  getCollectableLimit,
  isCollectableAmountFull,
} from "~/server/models/building";
import { getCanvasPosition } from "~/utils/3d";
import AddBuildingDialog from "./add-building-dialog";
import { useOverlays } from "./overlay-provider";

export default function FortressField({ field }: { field: TFortressField }) {
  const { building } = field;

  if (!building) {
    return <EmptyFortressField field={field} />;
  }

  if (building.collectableBuilding) {
    return (
      <FortressFieldWithCollectableBuilding
        field={
          field as TFortressField & {
            building: BuildingWithCollectableBuilding & {
              collectableBuilding: CollectableBuilding;
            };
          }
        }
      />
    );
  }

  return (
    <FortressFieldWithBuilding
      field={
        field as TFortressField & { building: BuildingWithCollectableBuilding }
      }
    />
  );
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

function EmptyFortressField({ field }: { field: TFortressField }) {
  const { addOverlay, removeTopOverlay } = useOverlays();

  return (
    <FortressFieldBase
      position={{ x: field.x, y: field.y }}
      label="[ + ]"
      onClick={() => {
        addOverlay(
          <AddBuildingDialog
            field={{ x: field.x, y: field.y }}
            onClose={() => {
              removeTopOverlay();
            }}
          />,
        );
      }}
    />
  );
}

function FortressFieldWithBuilding({
  field,
}: {
  field: TFortressField & { building: BuildingWithCollectableBuilding };
}) {
  const label = field.building.type;

  return (
    <FortressFieldBase
      position={{ x: field.x, y: field.y }}
      label={label}
      onClick={() => {}}
    />
  );
}

function FortressFieldWithCollectableBuilding({
  field,
}: {
  field: TFortressField & {
    building: BuildingWithCollectableBuilding & {
      collectableBuilding: CollectableBuilding;
    };
  };
}) {
  const { collectableBuilding } = field.building;

  const [isCollecting, setIsCollecting] = useState(false);
  const [collectableAmount, setCollectableAmount] = useState(0);
  const collectableThreshold = 0.1 * getCollectableLimit(field.building);
  const isFull = isCollectableAmountFull(field.building);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!field.building) {
        return;
      }

      const amount = calculateCollectableAmount(field.building);
      setCollectableAmount(amount);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [field.building]);

  const locale = getLocale();
  const router = useRouter();

  const apiUtils = api.useUtils();
  const { mutateAsync: collect } = api.building.collect.useMutation({
    onSuccess() {
      apiUtils.fortress.getAllFields.invalidate();
      router.refresh();
    },
  });

  return (
    <FortressFieldBase
      position={{ x: field.x, y: field.y }}
      label={[
        field.building.type,
        collectableBuilding &&
          collectableAmount &&
          collectableAmount >= collectableThreshold &&
          `Collect ${new Intl.NumberFormat(locale).format(collectableAmount)} ${collectableBuilding.resourceType}${
            isFull ? ` (full)` : ""
          }`,
      ]
        .filter(Boolean)
        .join("\n")}
      onClick={async () => {
        if (
          !isCollecting &&
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
