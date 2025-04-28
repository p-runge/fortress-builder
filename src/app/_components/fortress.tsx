import { api } from "~/api/server";
import CollectResourceButton from "~/components/collect-resource-button";
import UpgradeBuildingEvent from "~/components/upgrade-building-event";
import { getLocale } from "~/i18n";
import { FortressSlot as TFortressSlot } from "~/server/api/routers/fortress";
import { ResourceType } from "~/server/db/client";
import { BuildingMetric } from "~/server/models/building";
import AddBuildingDialog from "./add-building-dialog";
import { FORTRESS_SIZE } from "~/server/models/fortress";

export default async function Fortress() {
  const slots = await api.fortress.getAllSlots();

  const cols = FORTRESS_SIZE * 2 - 1;

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="relative h-[300px] w-[500px]"
          // TODO: this is not dynamic enough for correctly render fortresses of different sizes
          style={{
            gridColumn: `${slot.x + FORTRESS_SIZE} / span 1`,
            gridRow: `${slot.y + FORTRESS_SIZE} / span 1`,
          }}
        >
          <FortressSlot slot={slot} />
        </div>
      ))}
    </div>
  );
}

function FortressSlot({ slot }: { slot: TFortressSlot }) {
  const { building } = slot;

  const locale = getLocale();

  if (!building) {
    return (
      <div className="border-border flex h-full flex-col items-center justify-center gap-4 rounded border p-4 shadow-sm">
        <AddBuildingDialog x={slot.x} y={slot.y} />
      </div>
    );
  }

  return (
    <div className="border-border relative flex h-full flex-col items-center justify-center gap-4 rounded border p-4 shadow-sm">
      <div className="text-center">
        <h2 className="text-xl font-semibold">{building.type}</h2>
        <p className="text-gray-500">Level: {building.level}</p>
        {/* costs */}
        <div className="flex gap-4 text-gray-500">
          {Object.values(ResourceType)
            .map((resource) => ({
              resource,
              amount:
                BuildingMetric[building.type].upgrades[building!.level + 1]
                  ?.costs[resource],
            }))
            .filter(({ amount }) => !!amount)
            .map(({ resource, amount }) => (
              <span key={resource}>
                {resource}: {new Intl.NumberFormat(locale).format(amount!)}
              </span>
            ))}
        </div>
      </div>
      <UpgradeBuildingEvent building={building} />
      {building.collectableBuilding && (
        <div className="absolute top-0 right-0 p-4">
          <CollectResourceButton building={building} />
        </div>
      )}
    </div>
  );
}
