import ScalingFrame from "~/components/scaling-frame";
import UI from "~/components/ui";
import { buildings } from "~/data/buildings";

export default async function Home() {
  return (
    <ScalingFrame>
      <UI>
        <main className="grid grid-cols-3 pt-16 px-4 gap-4">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded shadow-sm"
            >
              <h2 className="text-lg font-semibold">{building.name}</h2>
              <p>{building.description}</p>
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                Build
              </button>
            </div>
          ))}
        </main>
      </UI>
    </ScalingFrame>
  );
}
