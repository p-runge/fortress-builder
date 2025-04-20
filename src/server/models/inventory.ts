import { z } from "zod";
import { ResourceType } from "./resource";

export const InventorySchema = z.record(
  z.nativeEnum(ResourceType),
  z.number().int().nonnegative()
);
export type Inventory = Record<ResourceType, number>;

export const mockedInventory: Inventory = {
  food: Math.floor(Math.random() * 100 * 1000),
  wood: Math.floor(Math.random() * 100 * 1000),
  stone: Math.floor(Math.random() * 100 * 1000),
  gold: Math.floor(Math.random() * 100 * 1000),
};
console.log("mockedInventory", mockedInventory);
