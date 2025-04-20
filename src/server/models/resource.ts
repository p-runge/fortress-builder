export const ResourceType = {
  food: "food",
  wood: "wood",
  stone: "stone",
  gold: "gold",
} as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
