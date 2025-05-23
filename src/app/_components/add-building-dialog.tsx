"use client";

import { useState } from "react";
import { api } from "~/api/client";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { getLocale } from "~/i18n";
import { BuildingType, ResourceType } from "~/server/db/client";
import { BuildingMetric } from "~/server/models/building";

type Props = {
  field: {
    x: number;
    y: number;
  };
  onClose: () => void;
};
export default function AddBuildingDialog({ field, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const locale = getLocale();

  const utils = api.useUtils();

  const { mutateAsync: build } = api.building.build.useMutation({
    onSuccess() {
      utils.fortress.getAllFields.invalidate();
    },
  });

  const { data: fields } = api.fortress.getAllFields.useQuery();

  const allBuildingTypes = Object.values(BuildingType);

  const buildableBuildingTypes = allBuildingTypes.filter((buildingType) => {
    const builtCount =
      fields?.filter((field) => field.building?.type === buildingType).length ??
      0;
    const limit = BuildingMetric[buildingType].limit;
    return builtCount < limit;
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Build new building</DialogTitle>
          <DialogDescription>
            What building do you want to build?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.values(BuildingType).map((type) => (
            <div key={type}>
              {/* costs */}
              <div className="flex gap-4 text-gray-500">
                {Object.values(ResourceType)
                  .map((resource) => ({
                    resource,
                    amount: BuildingMetric[type].upgrades[1]?.costs[resource],
                  }))
                  .filter(({ amount }) => !!amount)
                  .map(({ resource, amount }) => (
                    <span key={resource}>
                      {resource}:{" "}
                      {new Intl.NumberFormat(locale).format(amount!)}
                    </span>
                  ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading || !buildableBuildingTypes.includes(type)}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await build({ type, x: field.x, y: field.y });
                    onClose();
                  } catch {}
                  setIsLoading(false);
                }}
              >
                {isLoading ? "Building..." : type}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
