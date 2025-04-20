import Image from "next/image";
import { api } from "~/api/server";
import { SignOutButton } from "~/components/auth-buttons";
import { auth } from "~/server/auth";
import { ResourceType } from "~/server/db/client";
import AddResourceButton from "./add-resource-button";

export default async function UI({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const resources = await api.resource.getAll();

  return (
    <div className="relative h-full">
      {children}
      {/* second col as big as possible */}
      <div className="absolute inset-0 pointer-events-none grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4">
        {/* top menu */}
        <div className="col-span-3 p-2 pointer-events-auto flex justify-end gap-12">
          {/* resources */}
          <div className="flex gap-4">
            {Object.values(ResourceType).map((resource) => (
              <div key={resource} className="text-xl">
                <span className="capitalize">{resource}</span>{" "}
                <span>
                  {new Intl.NumberFormat(navigator.language).format(
                    resources[resource]
                  )}
                </span>
                <AddResourceButton
                  type={resource}
                  amount={100000}
                  className="ml-2"
                />
              </div>
            ))}
          </div>

          {/* user info */}
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
