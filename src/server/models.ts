import { z } from "zod";
import { BuildingType } from "./db/client";

export const BuildingSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(BuildingType),
  level: z.number().int().positive().min(1).max(5),
  upgradeStart: z.date().nullable(),
});
export type Building = z.infer<typeof BuildingSchema>;

export const BuildingUpgradeTimes: Record<
  BuildingType,
  Record<number, number>
> = {
  [BuildingType.townhall]: {
    1: 5,
    2: 20,
    3: 90,
    4: 300,
    5: 1200,
  },
};
export type BuildingUpgradeTimes = typeof BuildingUpgradeTimes;
