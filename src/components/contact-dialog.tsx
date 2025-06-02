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
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";

const UserSearchSchema = z.object({
  username: z.string(),
});
type UserSearch = z.infer<typeof UserSearchSchema>;

export default function ContactDialog() {
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<UserSearch>({
    resolver: zodResolver(UserSearchSchema),
    defaultValues: { username: "" },
  });

  const formState = form.watch();

  const { data: contactList } = api.user.getContactList.useQuery();
  const { data: userList, refetch: refetchUser } = api.user.search.useQuery(
    { name: formState.username },
    { enabled: false },
  );
  const { mutateAsync: addUser } = api.contactRequest.create.useMutation();

  async function onSubmit() {
    setIsSearching(true);
    await refetchUser();
    setIsSearching(false);
  }

  return (
    <Dialog>
      <DialogTrigger>
        <FontAwesomeIcon icon={faUserPlus} onClick={() => setOpen(!open)} />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add new Contact</DialogTitle>
        <div>
          <div className="flex gap-x-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grow">
                <div className="flex gap-x-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="grow">
                        <FormControl>
                          <Input
                            placeholder="Search for a user..."
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSearching}>
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          {userList && userList.length > 0 && (
            <div>
              {userList.map((user) => {
                const alreadyContact =
                  contactList?.some((contact) => contact.id === user.id) ??
                  false;
                return (
                  <div key={user.id} className="flex items-center gap-x-2 py-2">
                    {user.image ? (
                      <Image
                        alt="Discord User Profile Picture"
                        src={user.image}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                    ) : (
                      <Image
                        alt="Default User Profile Picture"
                        src="/default-profile-pic.png"
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                    )}
                    <div className="flex-1">{user.name}</div>
                    <Button
                      disabled={alreadyContact}
                      onClick={() => {
                        addUser({ userId: user.id });
                      }}
                    >
                      Add
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
