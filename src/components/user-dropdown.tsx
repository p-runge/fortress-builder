"use client";

import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserSettingsDialog from "./user-settings-dialog";

export default function UserDropdown() {
  const { data: session } = useSession();

  const [isSettingsDialogOpen, setSettingsDialogOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2">
            <Image
              src={session.user.image ?? ""}
              alt="User Avatar"
              className="h-8 w-8 rounded-full"
              width={32}
              height={32}
            />
            <span>{session.user.name}</span>
            <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent alignOffset={0}>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => setSettingsDialogOpen(true)}
              className="cursor-pointer"
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => signOut()}
              className="cursor-pointer"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* needs to be rendered always to not mix up the open state when the dropdown closes */}
      <UserSettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </>
  );
}
