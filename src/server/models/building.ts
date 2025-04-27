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
      1: {
        time: 0,
        costs: {},
      },
      2: {
        time: 5,
        costs: {
          [ResourceType.wood]: 100,
          [ResourceType.stone]: 50,
        },
      },
      3: {
        time: 10,
        costs: {
          [ResourceType.wood]: 2000,
          [ResourceType.stone]: 1000,
        },
      },
      4: {
        time: 30,
        costs: {
          [ResourceType.wood]: 50000,
          [ResourceType.stone]: 25000,
        },
      },
      5: {
        time: 45,
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
      1: {
        time: 0,
        costs: {
          [ResourceType.wood]: 10,
          [ResourceType.stone]: 5,
        },
      },
      2: {
        time: 5,
        costs: {
          [ResourceType.wood]: 100,
          [ResourceType.stone]: 50,
        },
      },
      3: {
        time: 10,
        costs: {
          [ResourceType.wood]: 2000,
          [ResourceType.stone]: 1000,
        },
      },
      4: {
        time: 30,
        costs: {
          [ResourceType.wood]: 50000,
          [ResourceType.stone]: 25000,
        },
      },
      5: {
        time: 45,
        costs: {
          [ResourceType.wood]: 2000000,
          [ResourceType.stone]: 1000000,
        },
      },
    },
  },
  [BuildingType.farm]: {
    limit: 3,
    upgrades: {
      1: {
        time: 0,
        costs: {},
        generation: {
          rate: 1,
          duration: 300,
        },
      },
      2: {
        time: 5,
        costs: {
          [ResourceType.wood]: 100,
          [ResourceType.stone]: 50,
        },
        generation: {
          rate: 50,
          duration: 600,
        },
      },
      3: {
        time: 10,
        costs: {
          [ResourceType.wood]: 2000,
          [ResourceType.stone]: 1000,
        },
        generation: {
          rate: 10,
          duration: 1800,
        },
      },
      4: {
        time: 30,
        costs: {
          [ResourceType.wood]: 50000,
          [ResourceType.stone]: 25000,
        },
        generation: {
          rate: 25,
          duration: 3600,
        },
      },
      5: {
        time: 45,
        costs: {
          [ResourceType.wood]: 2000000,
          [ResourceType.stone]: 1000000,
        },
        generation: {
          rate: 50,
          duration: 10800,
        },
      },
    },
  },
  [BuildingType.sawmill]: {
    limit: 3,
    upgrades: {
      1: {
        time: 0,
        costs: {},
        generation: {
          rate: 1,
          duration: 300,
        },
      },
      2: {
        time: 5,
        costs: {
          [ResourceType.wood]: 100,
          [ResourceType.stone]: 50,
        },
        generation: {
          rate: 50,
          duration: 600,
        },
      },
      3: {
        time: 10,
        costs: {
          [ResourceType.wood]: 2000,
          [ResourceType.stone]: 1000,
        },
        generation: {
          rate: 10,
          duration: 1800,
        },
      },
      4: {
        time: 30,
        costs: {
          [ResourceType.wood]: 50000,
          [ResourceType.stone]: 25000,
        },
        generation: {
          rate: 25,
          duration: 3600,
        },
      },
      5: {
        time: 45,
        costs: {
          [ResourceType.wood]: 2000000,
          [ResourceType.stone]: 1000000,
        },
        generation: {
          rate: 50,
          duration: 10800,
        },
      },
    },
  },
  [BuildingType.mine]: {
    limit: 3,
    upgrades: {
      1: {
        time: 0,
        costs: {},
        generation: {
          rate: 1,
          duration: 300,
        },
      },
      2: {
        time: 5,
        costs: {
          [ResourceType.wood]: 100,
          [ResourceType.stone]: 50,
        },
        generation: {
          rate: 50,
          duration: 600,
        },
      },
      3: {
        time: 10,
        costs: {
          [ResourceType.wood]: 2000,
          [ResourceType.stone]: 1000,
        },
        generation: {
          rate: 10,
          duration: 1800,
        },
      },
      4: {
        time: 30,
        costs: {
          [ResourceType.wood]: 50000,
          [ResourceType.stone]: 25000,
        },
        generation: {
          rate: 25,
          duration: 3600,
        },
      },
      5: {
        time: 45,
        costs: {
          [ResourceType.wood]: 2000000,
          [ResourceType.stone]: 1000000,
        },
        generation: {
          rate: 50,
          duration: 10800,
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

export type BuildingUpgradeData = {
  time: number; // in seconds
  costs: Partial<Record<ResourceType, number>>;
  generation?: BuildingGenerationData;
};

export type BuildingGenerationData = {
  rate: number; // in resources per second
  duration: number; // in seconds
};

export const buildingTypeCollectableMap: Record<
  BuildingType,
  Exclude<ResourceType, "gems"> | undefined
> = {
  [BuildingType.townhall]: undefined,
  [BuildingType.storage]: undefined,
  [BuildingType.farm]: ResourceType.food,
  [BuildingType.sawmill]: ResourceType.wood,
  [BuildingType.mine]: ResourceType.stone,
};
