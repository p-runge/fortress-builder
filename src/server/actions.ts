"use server";

import { revalidatePath } from "next/cache";
import { api } from "~/api/server";
import { BuildingType } from "./db/client";

export async function addBuilding(type: BuildingType) {
  await api.building.add({ type });
  revalidatePath("/");
}

export async function upgradeBuilding(id: string) {
  await api.building.upgrade({ id });
  revalidatePath("/");
}
