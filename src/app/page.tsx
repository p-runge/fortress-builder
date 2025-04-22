import { api } from "~/api/server";
import ScalingFrame from "~/components/scaling-frame";
import UI from "~/components/ui";
import UpgradeBuildingEvent from "~/components/upgrade-building-event";
import { getLocale } from "~/i18n";
import { ResourceType } from "~/server/db/client";
import { BuildingMetric } from "~/server/models/building";
import AddBuildingDialog from "./_components/add-building-dialog";

export default async function Home() {
  const buildings = await api.building.getAll();
  const locale = getLocale();

  return (
    <ScalingFrame>
      <UI>
        <main className="grid grid-cols-3 pt-16 px-4 gap-4">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="flex flex-col items-center justify-center p-4 border border-border rounded shadow-sm gap-4"
            >
              <div className="text-center">
                <h2 className="text-xl font-semibold">{building.type}</h2>
                <p className="text-gray-500">Level: {building.level}</p>
                {/* costs */}
                <div>
                  <div className="text-gray-500 flex gap-4">
                    {Object.values(ResourceType)
                      .map((resource) => ({
                        resource,
                        amount:
                          BuildingMetric[building.type].upgrades[
                            building.level + 1
                          ]?.costs[resource],
                      }))
                      .filter(({ amount }) => !!amount)
                      .map(({ resource, amount }) => (
                        <span key={resource}>
                          {resource}:{" "}
                          {new Intl.NumberFormat(locale).format(amount!)}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
              <UpgradeBuildingEvent building={building} />
            </div>
          ))}
        </main>

        {/* add building button */}
        <div className="flex flex-col items-center justify-center p-4 border border-border rounded shadow-sm gap-4">
          <AddBuildingDialog />
        </div>
      </UI>
    </ScalingFrame>
  );
}
