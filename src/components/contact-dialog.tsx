"use client";

import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { api } from "~/api/client";

export default function ContactDialog() {
  const [open, setOpen] = useState(false);
  let inputValue;
  const { data: contactList } = api.user.getContactList.useQuery(); //if user is already a friend, send request button will be disabled
  const { data: userList, refetch: refetchUser } = api.user.search.useQuery(
    { name: inputValue },
    { enabled: false },
  );

  return (
    <Dialog>
      <DialogTrigger>
        <FontAwesomeIcon icon={faUserPlus} onClick={() => setOpen(!open)} />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add new Contact</DialogTitle>
        <div>
          <div className="flex gap-x-2">
            <Input
              placeholder="Search for a user..."
              value={inputValue}
              //Bei Klick auf Search hat der User ein Formular ausgefüllt, Formular hat ein onSumbit, onSubmit hat Zugriff auf die Daten der Formularfelder (input Feld)
              //Vorlage in user-settings-dialog.tsx nach Rebase
              //Kommentare nicht auf Deutsch
            ></Input>
            <Button
              onClick={async () => {
                try {
                  await refetchUser();
                } catch {}
              }}
            >
              Search
            </Button>
          </div>
          {/* <div>{userList.map(()=>{})}</div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
