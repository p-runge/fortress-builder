"use client";

import { faComments } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";

export default function Chat() {
  const { data: session } = useSession();

  const messages = [
    {
      content: "Test Message 1",
      username: "acidaufraedern",
      sendAt: new Date(),
    },
    {
      content: "Test Message 2 Test Message 2 ",
      username: "Test User 2",
      sendAt: new Date(),
    },
    {
      content: "Test Message 3 Test Message 3 Test Message 3 ",
      username: "Test User 3",
      sendAt: new Date(),
    },
    { content: "Test Message 4", username: "Test User 4", sendAt: new Date() },
  ];

  return (
    <Sheet>
      <SheetTrigger>
        <FontAwesomeIcon
          icon={faComments}
          size="2x"
          className="m-2 cursor-pointer transition-transform hover:scale-110"
        />
      </SheetTrigger>
      {session && (
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Chat</SheetTitle>
            <SheetDescription>
              This is a global chat for Fortress Builder. Stay connected with
              your friends and other people!
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col gap-2">
            <div className="flex max-h-48 grow flex-col gap-y-2 overflow-y-auto rounded-lg border-4 p-2">
              {messages.map((message) => {
                return (
                  <div
                    key={message.content}
                    className={`mb-2 max-w-4/5 rounded border border-white bg-gray-500 px-1 ${message.username === session?.user?.name ? "self-start" : "self-end"}`}
                  >
                    <div className="flex justify-between">
                      <div className="text-xs">{message.username}</div>
                      <div className="text-xs">
                        {message.sendAt.toISOString()}
                      </div>
                    </div>
                    <span>{message.content}</span>
                  </div>
                );
              })}
            </div>
            <Input placeholder="Type your message here" />
            <Button type="submit">Send</Button>
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}
