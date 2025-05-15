"use client";

import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { api } from "~/api/client";

export default function ContactDialog() {
  const [open, setOpen] = useState(false);
  let inputValue;
  const { data: contactList } = api.user.getContactList.useQuery(); //if user is already a friend, send request button will be disabled
  const { data: userList } = api.user.search.useQuery(
    { name: inputValue },
    { enabled: false },
  );

  return (
    <Dialog>
      <DialogTrigger>
        <FontAwesomeIcon icon={faUserPlus} onClick={() => setOpen(!open)} />
      </DialogTrigger>
      <DialogContent>
        <div>
          <div className="flex gap-x-2">
            <Input
              placeholder="Search for a user..."
              value={inputValue}
            ></Input>
            <Button>Search</Button>
          </div>
          {/* <div>{userList.map(()=>{})}</div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
