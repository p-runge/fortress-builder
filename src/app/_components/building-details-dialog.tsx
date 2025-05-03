import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import UpgradeBuildingEvent from "~/components/upgrade-building-event";
import { Building } from "~/server/models/building";

export default function BuildingDetailsDialog({
  building,
  onClose,
}: {
  building: Building;
  onClose: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Building Details</DialogTitle>
          <DialogDescription>
            {building.type}
            {building.level > 0 ? ` (Level ${building.level})` : ""}
          </DialogDescription>
        </DialogHeader>
        <UpgradeBuildingEvent building={building} />
      </DialogContent>
    </Dialog>
  );
}
