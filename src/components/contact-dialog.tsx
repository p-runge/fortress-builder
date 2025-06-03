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
import { User } from "~/server/api/routers/user";

const UserSearchSchema = z.object({
  username: z.string(),
});
type UserSearch = z.infer<typeof UserSearchSchema>;

type Props = { user: User };

function UserListItem({ user }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: addUser } = api.contactRequest.create.useMutation({
    onSuccess() {
      utils.contactRequest.getPendingSentList.invalidate();
    },
  });
  const { data: pendingRequestList } =
    api.contactRequest.getPendingSentList.useQuery();
  const utils = api.useUtils();

  const { data: contactList } = api.user.getContactList.useQuery();

  const alreadyContact =
    contactList?.some((contact) => contact.id === user.id) ?? false;
  const isRequestPending =
    pendingRequestList?.some((request) => request.to.id === user.id) ?? false;
  return (
    <div key={user.id} className="flex items-center gap-x-2 py-2">
      <Image
        alt="User Profile Picture"
        src={user.image ? user.image : "/default-profile-pic.png"}
        width={60}
        height={60}
        className="rounded-full"
      />
      <div className="flex-1 truncate" title={user.name}>
        {user.name}
      </div>
      <Button
        disabled={isLoading || alreadyContact || isRequestPending}
        onClick={async () => {
          setIsLoading(true);
          await addUser({ userId: user.id });
          setIsLoading(false);
        }}
      >
        {alreadyContact
          ? "Already Sent Request"
          : isRequestPending
            ? "Requested"
            : "Add"}
      </Button>
    </div>
  );
}

export default function ContactDialog() {
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<UserSearch>({
    resolver: zodResolver(UserSearchSchema),
    defaultValues: { username: "" },
  });

  const formState = form.watch();

  const { data: userList, refetch: refetchUser } = api.user.search.useQuery(
    { name: formState.username },
    { enabled: false },
  );

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
                return <UserListItem key={user.id} user={user} />;
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
