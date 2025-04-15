import Image from "next/image";
import { auth } from "~/server/auth";
import SignOutButton from "./signout-button";

export default async function UI({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="relative h-full">
      {children}
      {/* second col as big as possible */}
      <div className="absolute inset-0 pointer-events-none grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4">
        {/* top menu */}
        <div className="col-span-3 p-2 pointer-events-auto flex justify-end gap-4">
          <div className="flex items-center gap-2">
            <Image
              src={session?.user?.image ?? ""}
              alt="User Avatar"
              className="h-8 w-8 rounded-full"
              width={32}
              height={32}
            />
            <span>{session?.user?.name}</span>
            <SignOutButton />
          </div>
        </div>

        {/* left menu */}
        <div className="p-2 pointer-events-auto"></div>

        {/* right menu */}
        <div className="col-start-3 p-2 pointer-events-auto"></div>

        {/* bottom menu */}
        <div className="col-span-3 pointer-events-auto"></div>
      </div>
    </div>
  );
}
