import { z } from "zod";
import { BuildingType, ResourceType } from "../db/client";

export const BuildingSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(BuildingType),
  level: z.number().int().positive().min(1).max(5),
  upgradeStart: z.date().nullable(),
});
export type Building = z.infer<typeof BuildingSchema>;

export const BuildingMetric: BuildingMetric = {
  [BuildingType.townhall]: {
    limit: 1,
    upgrades: {
      2: {
        time: 60,
        costs: {
          [ResourceType.wood]: 100,
          [ResourceType.stone]: 50,
        },
      },
      3: {
        time: 120,
        costs: {
          [ResourceType.wood]: 2000,
          [ResourceType.stone]: 1000,
        },
      },
      4: {
        time: 180,
        costs: {
          [ResourceType.wood]: 50000,
          [ResourceType.stone]: 25000,
        },
      },
      5: {
        time: 240,
        costs: {
          [ResourceType.wood]: 2000000,
          [ResourceType.stone]: 1000000,
        },
      },
    },
  },
  [BuildingType.storage]: {
    limit: 1,
    upgrades: {
      2: {
        time: 60,
        costs: {
          [ResourceType.wood]: 100,
          [ResourceType.stone]: 50,
        },
      },
      3: {
        time: 120,
        costs: {
          [ResourceType.wood]: 2000,
          [ResourceType.stone]: 1000,
        },
      },
      4: {
        time: 180,
        costs: {
          [ResourceType.wood]: 50000,
          [ResourceType.stone]: 25000,
        },
      },
      5: {
        time: 240,
        costs: {
          [ResourceType.wood]: 2000000,
          [ResourceType.stone]: 1000000,
        },
      },
    },
  },
};

export type BuildingMetric = Record<
  BuildingType,
  {
    limit: number;
    upgrades: Record<number, BuildingUpgradeData>;
  }
>;

type BuildingUpgradeData = {
  time: number; // in seconds
  costs: Partial<Record<ResourceType, number>>;
};
