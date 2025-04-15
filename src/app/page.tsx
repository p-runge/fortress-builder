import { api } from "~/api/server";
import ScalingFrame from "~/components/scaling-frame";
import UI from "~/components/ui";
import { Button } from "~/components/ui/button";
import { buildings } from "~/data/buildings";

export default async function Home() {
  const pong = await api.ping();
  console.log("ping", pong);

  return (
    <ScalingFrame>
      <UI>
        <main className="grid grid-cols-3 pt-16 px-4 gap-4">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="flex flex-col items-center justify-center p-4 border border-border rounded shadow-sm gap-4"
            >
              <h2 className="text-xl font-semibold">{building.name}</h2>
              <p className="text-sm">{building.description}</p>
              <Button>Build</Button>
            </div>
          ))}
        </main>
      </UI>
    </ScalingFrame>
  );
}
