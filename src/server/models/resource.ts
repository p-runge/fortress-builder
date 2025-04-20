import { z } from "zod";
import { ResourceType } from "../db/client";

export const ResourceSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ResourceType),
});
export type Inventory = z.infer<typeof ResourceSchema>;
