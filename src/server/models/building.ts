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
  [BuildingType.sawmill]: {
    limit: 3,
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
  [BuildingType.mine]: {
    limit: 3,
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
};
