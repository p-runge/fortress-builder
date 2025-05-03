"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/api/client";
import { Building, BuildingMetric } from "~/server/models/building";
import { Button } from "./ui/button";

export default function UpgradeBuildingEvent({
  building,
  onUpgrade,
}: {
  building: Building;
  onUpgrade?: () => void;
}) {
  const router = useRouter();

  // subscribe to the building upgrade event
  api.building.onUpgrade.useSubscription(
    { id: building.id },
    {
      onData(data) {
        console.log("Building upgraded:", data);
        router.refresh();
      },
    },
  );

  const utils = api.useUtils();
  const { mutateAsync: startUpgrade } = api.building.startUpgrade.useMutation({
    onSuccess() {
      // trigger a refetch of the buildings from the page to reinitialize the component
      utils.fortress.getAllFields.invalidate();
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!building.upgradeStart) return;

    const timeLeft = calculateRemainingUpgradeTime(building);
    setRemainingTime(timeLeft);

    const interval = setInterval(() => {
      const timeLeft = calculateRemainingUpgradeTime(building);
      setRemainingTime(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [building]);

  const upgradeTime =
    BuildingMetric[building.type].upgrades[building.level + 1]?.time;

  const maxLevel = Math.max(
    ...Object.keys(BuildingMetric[building.type].upgrades).map(Number),
  );
  const nextLevel = building.level + 1 > maxLevel ? null : building.level + 1;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <p className="text-gray-500">
        {!building.upgradeStart // no upgrade in progress, show upgrade time
          ? upgradeTime && `Upgrade time: ${upgradeTime}s`
          : remainingTime > 0 // upgrade in progress, show remaining time
            ? `Upgrading... ${remainingTime}s remaining`
            : // upgrade finished, show finished message
              "Upgrade finished"}
      </p>
      <Button
        disabled={
          isLoading || !!building.upgradeStart || building.level >= maxLevel
        }
        onClick={async () => {
          setIsLoading(true);
          try {
            await startUpgrade({ id: building.id });
            onUpgrade?.();
          } catch {}
          setIsLoading(false);
        }}
      >
        {nextLevel
          ? `Upgrade to Lv. ${building.level + 1}`
          : "Max level reached"}
      </Button>
    </div>
  );
}

function calculateRemainingUpgradeTime(building: Building): number {
  const upgradetime =
    BuildingMetric[building.type].upgrades[building.level + 1]?.time;
  if (upgradetime === undefined) {
    return 0;
  }

  if (!building.upgradeStart) {
    return 0;
  }

  const now = new Date();
  if (building.upgradeStart > now) {
    console.warn(
      "Upgrade start time is in the future. This should not happen.",
    );
    return 0;
  }

  const upgradeEnd = new Date(
    building.upgradeStart.getTime() + upgradetime * 1000,
  );

  if (upgradeEnd < now) {
    return 0;
  }

  const remainingTime = Math.floor(
    (upgradeEnd.getTime() - now.getTime()) / 1000,
  );

  return remainingTime;
}
