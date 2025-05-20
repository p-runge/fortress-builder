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
  const [inputValue, setInputValue] = useState("");

  // const { data: contactList } = api.user.getContactList.useQuery(); //if user is already a friend, send request button will be disabled
  const { data: userList, refetch: refetchUser } = api.user.search.useQuery(
    { name: inputValue },
    { enabled: false },
  );

  // const submit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     await refetchUser();
  //   } catch (error) {
  //     console.error("Search failed", error);
  //   }
  // };

  async function onSubmit(data: UserSearch) {}

  const form = useForm<UserSearch>({
    resolver: zodResolver(UserSearchSchema),
    defaultValues: { username: "" },
  });

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
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
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
                  <Button type="submit">Search</Button>
                </div>
              </form>
            </Form>
          </div>
          {userList && userList.length > 0 && (
            <div>
              {userList.map((user) => {
                return (
                  <div key={user.id} className="flex">
                    {user.image ? (
                      <Image
                        alt="Discord User Profile Picture"
                        src={user.image}
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
                    <div>{user.name}</div>
                    <Button>Add</Button>
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
