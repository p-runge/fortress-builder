"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/api/client";
import { CollectableBuilding } from "~/server/db/client";
import { calculateCollectableAmount } from "~/server/models/building";
import { Button } from "./ui/button";
import { getLocale } from "~/i18n";

export default function CollectResourceButton({
  collectableBuilding,
}: {
  collectableBuilding: Omit<CollectableBuilding, "buildingId">;
}) {
  const [isCollecting, setIsCollecting] = useState(false);
  const { mutateAsync: collect } = api.building.collect.useMutation();

  const [collectableAmount, setCollectableAmount] = useState(0);

  const router = useRouter();
  const locale = getLocale();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!collectableBuilding) {
        return;
      }

      const amount = calculateCollectableAmount(collectableBuilding);
      setCollectableAmount(amount);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [collectableBuilding]);

  return collectableAmount === 0 || isCollecting ? null : (
    <Button
      onClick={async () => {
        setIsCollecting(true);
        try {
          await collect({
            id: collectableBuilding.id,
          });
        } catch {}
        setIsCollecting(false);
        setCollectableAmount(0);
        router.refresh();
      }}
    >
      {`Collect ${new Intl.NumberFormat(locale).format(collectableAmount)} ${collectableBuilding.resourceType}`}
    </Button>
  );
}
