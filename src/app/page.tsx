import { api } from "~/api/server";
import ScalingFrame from "~/components/scaling-frame";
import UI from "~/components/ui";
import { Button } from "~/components/ui/button";

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
              <h2 className="text-xl font-semibold">{building.type}</h2>
              <Button>Build</Button>
            </div>
          ))}
        </main>
      </UI>
    </ScalingFrame>
  );
}
