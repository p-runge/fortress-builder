import ScalingFrame from "~/components/scaling-frame";
import UI from "~/components/ui";

export default async function Home() {
  return (
    <ScalingFrame>
      <UI>
        <main className="flex flex-col gap-[32px] items-center sm:items-start">
          <h1>Fortress Builder</h1>
          <div>Main content</div>
        </main>
      </UI>
    </ScalingFrame>
  );
}
