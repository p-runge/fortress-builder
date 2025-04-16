import { api } from "~/api/server";
import ScalingFrame from "~/components/scaling-frame";
import UI from "~/components/ui";
import { Button } from "~/components/ui/button";
import AddBuildingDialog from "./_components/add-building-dialog";
import { upgradeBuilding } from "~/server/actions";

export default async function Home() {
  const buildings = await api.building.getAll();

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
              </div>
              <form
                action={async () => {
                  "use server";
                  await upgradeBuilding(building.id);
                }}
              >
                <Button>Upgrade</Button>
              </form>
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
