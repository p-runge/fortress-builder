"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { faUsers, faUserXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "~/api/client";
import { Button } from "./ui/button";
import Image from "next/image";
import ContactDialog from "./contact-dialog";

export default function ContactSheet() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const { data: contactList } = api.user.getContactList.useQuery();

  const { mutateAsync: removeContact } = api.user.deleteContact.useMutation({
    onSuccess() {
      utils.user.getContactList.invalidate();
    },
  });

  return (
    <Sheet>
      <SheetTrigger>
        <FontAwesomeIcon icon={faUsers} onClick={() => setOpen(!open)} />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <div className="flex justify-between px-4">
            <SheetTitle>Contact List</SheetTitle>
            <ContactDialog />
          </div>
          <div>
            {contactList?.map((contact) => {
              return (
                <div key={contact.id} className="flex gap-x-2">
                  {contact.image ? (
                    <Image
                      alt="Discord User Profile Picture"
                      src={contact.image}
                      width={40}
                      height={40}
                      className="rounded-full"
                    ></Image>
                  ) : (
                    <Image
                      alt="Default User Profile Picture"
                      src="/default-profile-pic.png"
                      width={40}
                      height={40}
                      className="rounded-full"
                    ></Image>
                  )}
                  <div>{contact.name}</div>
                  {/* TODO: Check if removing user is working as soon as the Backend got fixed */}
                  <Button
                    onClick={() => {
                      removeContact({ userId: contact.id });
                    }}
                  >
                    <FontAwesomeIcon icon={faUserXmark} />
                  </Button>
                </div>
              );
            })}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
