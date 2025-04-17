import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { env } from "~/env";
import { db } from "~/server/db";

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const buildingUpgradeQueue = new Queue("building-upgrades", {
  connection: redis,
  prefix: "fb",
});

new Worker(
  "building-upgrades",
  async (job) => {
    const { buildingId } = job.data;

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
  },
  { connection: redis }
);
