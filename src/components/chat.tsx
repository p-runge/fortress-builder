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
    { content: "Test Message 1", username: "Test User 1", sendAt: new Date() },
    { content: "Test Message 2", username: "Test User 2", sendAt: new Date() },
    { content: "Test Message 3", username: "Test User 3", sendAt: new Date() },
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
            <div className="grow">
              {messages.map((message) => {
                return (
                  <div key={message.content}>
                    <span>{message.content}</span>
                    <div>{message.username}</div>
                    <div>{message.sendAt.toISOString()}</div>
                  </div>
                );
              })}
            </div>
            <Input />
            <Button>Send</Button>
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}
