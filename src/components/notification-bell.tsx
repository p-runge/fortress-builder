"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { api } from "~/api/client";
import { Button } from "./ui/button";
import Image from "next/image";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const { data: list } = api.contactRequest.getPendingReceivedList.useQuery();

  const { mutateAsync: acceptRequest } = api.contactRequest.accept.useMutation({
    onSuccess() {
      utils.contactRequest.getPendingReceivedList.invalidate();
      utils.user.getContactList.invalidate();
    },
  });
  const { mutateAsync: rejectRequest } = api.contactRequest.reject.useMutation({
    onSuccess() {
      utils.contactRequest.getPendingReceivedList.invalidate();
    },
  });

  return (
    <Popover>
      <PopoverTrigger>
        <FontAwesomeIcon icon={faBell} onClick={() => setOpen(!open)} />
      </PopoverTrigger>
      <PopoverContent className="rounded border border-white bg-black p-2">
        <div className="mb-2 block text-xl font-bold">New Notifications</div>
        {list?.map((listItem) => {
          return (
            <div key={listItem.id}>
              <div className="mb-2 flex flex-col rounded border border-white p-2">
                <div className="text-xl font-bold">New Contact Request</div>
                <div className="flex">
                  <div className="flex items-center gap-x-2">
                    <div className="flex w-xs items-center">
                      <Image
                        alt="User Profile Picture"
                        src={
                          listItem.from.image
                            ? listItem.from.image
                            : "/default-profile-pic.png"
                        }
                        width={60}
                        height={60}
                        className="shrink-0 rounded-full"
                      ></Image>
                      <div
                        title={listItem.from.name}
                        className="truncate text-xl"
                      >
                        {listItem.from.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      className="bg-green-400"
                      onClick={() => {
                        acceptRequest({ id: listItem.id });
                      }}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </Button>
                    <Button
                      className="bg-red-400"
                      onClick={() => {
                        rejectRequest({ id: listItem.id });
                      }}
                    >
                      <FontAwesomeIcon icon={faX} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
