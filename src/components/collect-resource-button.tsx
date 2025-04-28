"use client";

import { useEffect, useState } from "react";
import { BuildingWithCollectableBuilding } from "~/server/models/building";
import { Button } from "./ui/button";

export default function CollectResourceButton({
  building,
}: {
  building: BuildingWithCollectableBuilding;
}) {
  // const { mutateAsync: collectResource } = api.building.collect.useMutation();

  const handleCollectResource = async () => {
    console.log("Collecting resource...");

    // await collectResource({
    //   id: building.id,
    // });
  };

  const [collectableAmount, setCollectableAmount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!building.collectableBuilding) {
        return;
      }

      const amount = calculateCollectableAmount(building);
      setCollectableAmount(amount);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [building]);

  if (!building.collectableBuilding) {
    console.error("Building is not collectable", building);
    return null;
  }

  return collectableAmount === 0 ? null : (
    <Button onClick={handleCollectResource}>
      {`Collect ${collectableAmount} ${building.collectableBuilding.resourceType}`}
    </Button>
  );
}

function calculateCollectableAmount(building: BuildingWithCollectableBuilding) {
  if (!building.collectableBuilding) {
    return 0;
  }

  const { lastCollected, generationRate } = building.collectableBuilding;

  const now = new Date();
  const lastCollectedDate = new Date(lastCollected);
  const diffInSeconds = Math.floor(
    (now.getTime() - lastCollectedDate.getTime()) / 1000,
  );

  const amount = Math.floor(diffInSeconds / generationRate);

  return amount;
}
