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
    2: 5,
    3: 20,
    4: 90,
    5: 300,
  },
};
export type BuildingUpgradeTimes = typeof BuildingUpgradeTimes;
