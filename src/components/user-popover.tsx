import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { auth } from "~/server/auth";
import { SignOutButton } from "./auth-buttons";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export default async function UserPopover() {
  const session = await auth();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2">
          <Image
            src={session?.user?.image ?? ""}
            alt="User Avatar"
            className="h-8 w-8 rounded-full"
            width={32}
            height={32}
          />
          <span>{session?.user?.name}</span>
          <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-fit overflow-hidden p-0">
        <ul className="grid">
          <li>
            {/* TODO: add user settings dialog */}
            <Button variant="ghost" className="rounded-none">
              Settings
            </Button>
          </li>
          <li>
            <Separator />
          </li>
          <li>
            <SignOutButton />
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
