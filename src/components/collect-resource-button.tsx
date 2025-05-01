"use client";

// import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/api/client";
import { getLocale } from "~/i18n";
import {
  BuildingWithCollectableBuilding,
  calculateCollectableAmount,
  isCollectableAmountFull,
} from "~/server/models/building";
import { Button } from "./ui/button";

export default function CollectResourceButton({
  building,
}: {
  building: BuildingWithCollectableBuilding;
}) {
  const [isCollecting, setIsCollecting] = useState(false);

  const apiUtils = api.useUtils();
  const { mutateAsync: collect } = api.building.collect.useMutation({
    onSuccess() {
      apiUtils.fortress.getAllSlots.invalidate();
    },
  });

  const [collectableAmount, setCollectableAmount] = useState(0);
  const isFull = isCollectableAmountFull(building);

  const locale = getLocale();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!building) {
        return;
      }

      const amount = calculateCollectableAmount(building);
      setCollectableAmount(amount);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [building]);

  const { collectableBuilding } = building;

  // const router = useRouter();

  if (!collectableBuilding) {
    return null;
  }

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

        /**
         * The router refresh is needed here to update api data in server components
         * but does not work because this component gets rendered inside of
         * @react-three/drei's Html component which is missing Next.js's router
         * context.
         */
        // router.refresh();
      }}
      variant={isFull ? "destructive" : "default"}
    >
      {`Collect ${new Intl.NumberFormat(locale).format(collectableAmount)} ${collectableBuilding.resourceType}`}
    </Button>
  );
}
