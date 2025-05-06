"use client";

import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import { FormEventHandler } from "react";
import { getLocale } from "~/i18n";
import { cn } from "~/lib/utils";
import { ChatRoom } from "~/server/api/routers/chat";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Props = {
  room: ChatRoom;
};
export default function Chat({ room }: Props) {
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

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex grow flex-col gap-y-2 overflow-y-auto rounded-lg border-4 p-2">
        {room.messages.map((message) => {
          return (
            <div
              key={message.content}
              className={cn(
                "mb-2 w-4/5 rounded border border-white px-1",
                message.sender.name !== session?.user?.name
                  ? "self-start bg-gray-500"
                  : "self-end bg-gray-700",
              )}
            >
              <div className="flex justify-between">
                <div className="text-xs">{message.sender.name}</div>
                <div className="text-xs">
                  {new Intl.DateTimeFormat(locale, {
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                  }).format(message.createdAt)}
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
  );
}
