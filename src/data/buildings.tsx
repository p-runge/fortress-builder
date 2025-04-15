type BuildingType =
  | "townhall"
  | "barracks"
  | "archery_range"
  | "stable"
  | "blacksmith"
  | "market"
  | "university"
  | "monastery"
  | "castle";

type Building = {
  id: BuildingType | `${BuildingType}_${number}`;
  type: BuildingType;
  name: string;
  description: string;
};

export const buildings: Building[] = [
  {
    id: "townhall",
    type: "townhall",
    name: "Town Hall",
    description: "The main building of the town.",
  },
  {
    id: "barracks",
    type: "barracks",
    name: "Barracks",
    description: "A building for training infantry units.",
  },
  {
    id: "archery_range_1",
    type: "archery_range",
    name: "Archery Range",
    description: "A building for training archers.",
  },
  {
    id: "archery_range_2",
    type: "archery_range",
    name: "Archery Range",
    description: "A building for training archers.",
  },
  {
    id: "stable",
    type: "stable",
    name: "Stable",
    description: "A building for training cavalry units.",
  },
  {
    id: "blacksmith",
    type: "blacksmith",
    name: "Blacksmith",
    description: "A building for upgrading units and armor.",
  },
  {
    id: "market",
    type: "market",
    name: "Market",
    description: "A building for trading resources.",
  },
  {
    id: "university",
    type: "university",
    name: "University",
    description: "A building for researching technologies.",
  },
  {
    id: "monastery",
    type: "monastery",
    name: "Monastery",
    description:
      "A building for training monks and researching religious technologies.",
  },
  {
    id: "castle",
    type: "castle",
    name: "Castle",
    description: "A stronghold that can train unique units.",
  },
];
