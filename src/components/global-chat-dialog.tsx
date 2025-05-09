"use client";

import { faComments } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import { api } from "~/api/client";
import Chat from "./chat";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export default function GlobalChatDialog() {
  const { data: session } = useSession();

  const { data: room, isError } = api.chat.getChatRoomByName.useQuery({
    name: "Global",
  });

  if (isError) {
    console.error('Chat room with name "Global" not found.');
  }

  return (
    <Sheet>
      <SheetTrigger>
        <FontAwesomeIcon
          icon={faComments}
          size="2x"
          className="m-2 cursor-pointer transition-transform hover:scale-110"
        />
      </SheetTrigger>
      {session && room && (
        <SheetContent className="p-4">
          <SheetHeader className="p-0">
            <SheetTitle>Chat</SheetTitle>
            <SheetDescription>
              This is a global chat for Fortress Builder. Stay connected with
              your friends and other people!
            </SheetDescription>
          </SheetHeader>

          {/*
             // TODO: fix serializing of Date objects 
          */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Chat room={room as any} />
        </SheetContent>
      )}
    </Sheet>
  );
}
