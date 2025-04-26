import { api } from "~/api/server";
import UI from "~/components/ui";
import UpgradeBuildingEvent from "~/components/upgrade-building-event";
import { getLocale } from "~/i18n";
import { ResourceType } from "~/server/db/client";
import { BuildingMetric } from "~/server/models/building";
import AddBuildingDialog from "./_components/add-building-dialog";

// type AppRouterPage<T extends string> = (props: {
//   searchParams: Promise<Partial<Record<T, string>>>;
// }) => JSX.Element;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Partial<Record<"payment-canceled", string>>>;
}) {
  const buildings = await api.building.getAll();
  const locale = getLocale();

  const sp = await searchParams;
  const paymentCanceled = sp["payment-canceled"] !== undefined;

  if (paymentCanceled) {
    console.log("Payment canceled");

    // TODO: trigger a toast
  }

  return (
    <UI>
      <main className="grid grid-cols-3 gap-4 px-4 pt-16">
        {buildings.map((building) => (
          <div
            key={building.id}
            className="border-border flex flex-col items-center justify-center gap-4 rounded border p-4 shadow-sm"
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold">{building.type}</h2>
              <p className="text-gray-500">Level: {building.level}</p>
              {/* costs */}
              <div className="flex gap-4 text-gray-500">
                {Object.values(ResourceType)
                  .map((resource) => ({
                    resource,
                    amount:
                      BuildingMetric[building.type].upgrades[building.level + 1]
                        ?.costs[resource],
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
            <UpgradeBuildingEvent building={building} />
          </div>
        ))}
      </main>

      {/* add building button */}
      <div className="border-border flex flex-col items-center justify-center gap-4 rounded border p-4 shadow-sm">
        <AddBuildingDialog />
      </div>
    </UI>
  );
}
