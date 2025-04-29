"use client";

import { faComments, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
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
import { FormEventHandler } from "react";
import { getLocale } from "~/i18n";

export default function Chat() {
  const { data: session } = useSession();
  const locale = getLocale();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (formEvent) => {
    formEvent.preventDefault();
    const message = formEvent.currentTarget.message.value;
    if (message.length > 0) {
      console.log(message);
      formEvent.currentTarget.reset();
    }
  };

  // TODO: Read from API
  const messages = [
    {
      content: "Test Message 1",
      username: "acidaufraedern",
      sentAt: new Date(),
    },
    {
      content: "Test Message 2 Test Message 2 ",
      username: "Test User 2",
      sentAt: new Date(),
    },
    {
      content: "Test Message 3 Test Message 3 Test Message 3 ",
      username: "Test User 3",
      sentAt: new Date(),
    },
    { content: "T", username: "Test User 4", sentAt: new Date() },
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
        <SheetContent className="p-4">
          <SheetHeader className="p-0">
            <SheetTitle>Chat</SheetTitle>
            <SheetDescription>
              This is a global chat for Fortress Builder. Stay connected with
              your friends and other people!
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col gap-2">
            <div className="flex grow flex-col gap-y-2 overflow-y-auto rounded-lg border-4 p-2">
              {messages.map((message) => {
                return (
                  <div
                    key={message.content}
                    className={`mb-2 w-4/5 rounded border border-white px-1 ${message.username !== session?.user?.name ? "self-start bg-gray-500" : "self-end bg-gray-700"}`}
                  >
                    <div className="flex justify-between">
                      <div className="text-xs">{message.username}</div>
                      <div className="text-xs">
                        {new Intl.DateTimeFormat(locale, {
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                        }).format(message.sentAt)}
                      </div>
                    </div>
                    <span>{message.content}</span>
                  </div>
                );
              })}
            </div>
            <form className="flex gap-x-2" onSubmit={handleSubmit}>
              <Input name="message" placeholder="Type your message here" />
              <Button>
                <FontAwesomeIcon icon={faPaperPlane} />
              </Button>
            </form>
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}
