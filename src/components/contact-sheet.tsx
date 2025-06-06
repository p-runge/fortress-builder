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
          <div className="flex justify-between px-4 pr-8">
            <SheetTitle className="text-2xl">Contact List</SheetTitle>
            <ContactDialog />
          </div>
          <div>
            {contactList?.map((contact) => {
              return (
                <div key={contact.id} className="flex items-center gap-x-2">
                  <Image
                    alt="User Profile Picture"
                    src={
                      contact.image ? contact.image : "/default-profile-pic.png"
                    }
                    width={60}
                    height={60}
                    className="rounded-full"
                  ></Image>
                  <div title={contact.name} className="grow truncate text-xl">
                    {contact.name}
                  </div>
                  {/* TODO: Check if removing user is working as soon as the Backend got fixed */}
                  <Button
                    size="lg"
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
