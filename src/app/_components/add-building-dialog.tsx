"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { getLocale } from "~/i18n";
import { addBuilding } from "~/server/actions";
import { BuildingType, ResourceType } from "~/server/db/client";
import { BuildingMetric } from "~/server/models/building";

export default function NewBuildingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const locale = getLocale();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Build</Button>
      </DialogTrigger>
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
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await addBuilding(type);
                  } catch (error) {
                    console.error("Error adding building:", error);
                  }
                  setIsLoading(false);
                  setIsOpen(false);
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
