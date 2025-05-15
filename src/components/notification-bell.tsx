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

  const { data: list } = api.contactRequest.getPendingList.useQuery();

  const { mutateAsync: acceptRequest } = api.contactRequest.accept.useMutation({
    onSuccess() {
      utils.contactRequest.getPendingList.invalidate();
      utils.user.getContactList.invalidate();
    },
  });
  const { mutateAsync: rejectRequest } = api.contactRequest.reject.useMutation({
    onSuccess() {
      utils.contactRequest.getPendingList.invalidate();
    },
  });

  return (
    <Popover>
      <PopoverTrigger>
        <FontAwesomeIcon icon={faBell} onClick={() => setOpen(!open)} />
      </PopoverTrigger>
      <PopoverContent>
        <span className="text-xl font-bold">New Notifications</span>
        {list?.map((listItem) => {
          return (
            <div
              className="w-xs rounded border border-white bg-black p-2"
              key={listItem.id}
            >
              <span className="text-xl font-bold">New Contact Request</span>
              <div className="flex rounded border border-white p-2">
                <div className="flex w-full items-center gap-x-2">
                  <div className="flex items-center">
                    {listItem.from.image ? (
                      <Image
                        alt="Discord User Profile Picture"
                        src={listItem.from.image}
                        width={60}
                        height={60}
                        className="rounded-full"
                      ></Image>
                    ) : (
                      <Image
                        alt="Default User Profile Picture"
                        src="/default-profile-pic.png"
                        width={60}
                        height={60}
                        className="rounded-full"
                      ></Image>
                    )}
                    <div
                      title={listItem.from.name}
                      className="grow truncate text-xl"
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
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
