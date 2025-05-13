import Image from "next/image";
import { auth } from "~/server/auth";
import { SignOutButton } from "./auth-buttons";

export default async function UserPopover() {
  const session = await auth();

  return (
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
  );
}
