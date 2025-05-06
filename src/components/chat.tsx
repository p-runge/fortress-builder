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
import { api } from "~/api/client";

type Props = {
  room: ChatRoom;
};
export default function Chat({ room }: Props) {
  if (!room.name) {
    console.error("Chat room name is not defined");
  }

  const { data: session } = useSession();

  const locale = getLocale();

  const { mutateAsync: sendMessage } =
    api.chat.sendMessageToChatRoom.useMutation();

  const apiUtils = api.useUtils();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (formEvent) => {
    formEvent.preventDefault();
    const message = formEvent.currentTarget.message.value;
    if (message.length > 0) {
      if (room.name) {
        const target = formEvent.currentTarget;
        sendMessage({
          name: room.name,
          message,
        }).then(() => {
          apiUtils.chat.getChatRoomByName.invalidate();
          target.reset();
        });
      }
    }
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-0 grow flex-col gap-y-2 overflow-y-auto rounded-lg border-4 p-2">
        {room.messages.map((message, index) => {
          return (
            <div
              key={index}
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
                  }).format(new Date(message.createdAt))}
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
