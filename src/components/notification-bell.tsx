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
        {list?.map((listItem) => {
          return (
            <div className="flex" key={listItem.id}>
              <div className="flex gap-x-2">
                <div>{listItem.from.image}</div>
                <div>{listItem.from.name}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    acceptRequest({ id: listItem.id });
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </Button>
                <Button
                  onClick={() => {
                    rejectRequest({ id: listItem.id });
                  }}
                >
                  <FontAwesomeIcon icon={faX} />
                </Button>
              </div>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
