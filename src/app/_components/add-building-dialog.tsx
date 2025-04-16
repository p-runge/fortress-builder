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
import { addBuilding } from "~/server/actions";
import { BuildingType } from "~/server/db/client";

export default function NewBuildingDialog() {
  const [isOpen, setIsOpen] = useState(false);
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
            <Button
              key={type}
              variant="outline"
              className="w-full"
              onClick={async () => {
                await addBuilding(type);
                setIsOpen(false);
              }}
            >
              {type}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
