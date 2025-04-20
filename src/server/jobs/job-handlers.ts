import { eventEmitter } from "~/server/api/event-emitter";
import { db } from "../db";
import { registerJobHandler } from "./dev-worker";

// Register a job handler for building upgrades
registerJobHandler(
  "upgrade-building",
  async ({ buildingId }: { buildingId: string }) => {
    console.log(`Upgrading building with ID: ${buildingId}`);

    const building = await db.building.findUniqueOrThrow({
      where: { id: buildingId },
    });

    if (!building.upgradeStart || new Date() < building.upgradeStart) {
      throw new Error("Building upgrade not started or already completed");
    }

    await db.building.update({
      where: { id: buildingId },
      data: {
        level: {
          increment: 1,
        },
        upgradeStart: null,
      },
    });
    console.log(
      `Building ${buildingId} upgraded to level ${building.level + 1}`
    );

    eventEmitter.emit("upgrade-building", {
      id: buildingId,
      level: building.level + 1,
    });

    console.log("Emitted event for building upgrade:", buildingId);

    // return {
    //   buildingId,
    //   level: building.level + 1,
    //   timestamp: new Date().toISOString(),
    // };
  }
);
