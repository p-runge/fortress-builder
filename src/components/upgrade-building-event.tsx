"use client";

import { Building, BuildingUpgradeTimes } from "~/server/models";
import { Button } from "./ui/button";
import { api } from "~/api/client";
import { useState } from "react";

export default function UpgradeBuildingEvent({
  building,
}: {
  building: Building;
}) {
  const { mutateAsync: upgradeBuilding } = api.building.upgrade.useMutation();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <p className="text-gray-500">
        {!building.upgradeStart // no upgrade in progress, show upgrade time
          ? `Upgrade time: ${
              BuildingUpgradeTimes[building.type][building.level]
            }s`
          : calculateRemainingUpgradeTime(building) > 0 // upgrade in progress, show remaining time
          ? `Upgrading... ${calculateRemainingUpgradeTime(building)}s remaining`
          : // upgrade finished, show finished message
            "Upgrade finished"}
      </p>
      <Button
        disabled={isLoading || !!building.upgradeStart || building.level >= 5}
        onClick={async () => {
          setIsLoading(true);
          try {
            await upgradeBuilding({ id: building.id });
          } catch (error) {
            console.error("Error upgrading building:", error);
          }
          setIsLoading(false);
        }}
      >
        Upgrade
      </Button>
    </div>
  );
}

function calculateRemainingUpgradeTime(building: Building): number {
  if (!building.upgradeStart) {
    return 0;
  }

  const now = new Date();
  if (building.upgradeStart > now) {
    console.warn(
      "Upgrade start time is in the future. This should not happen."
    );
    return 0;
  }

  const upgradeEnd = new Date(
    building.upgradeStart.getTime() +
      BuildingUpgradeTimes[building.type][building.level] * 1000
  );

  if (upgradeEnd < now) {
    return 0;
  }

  const remainingTime = Math.floor(
    (upgradeEnd.getTime() - now.getTime()) / 1000
  );

  return remainingTime;
}
