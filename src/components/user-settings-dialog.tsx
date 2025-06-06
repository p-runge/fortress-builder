"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "~/api/client";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  UserSettings,
  UserSettingsSchema,
} from "~/server/models/user-settings";
import { Checkbox } from "./ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/form";

export default function UserSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: settings } = api.user.getSettings.useQuery();

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      {settings && (
        <UserSettingsDialogContent
          settings={settings}
          onSubmit={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  );
}

function UserSettingsDialogContent({
  settings,
  onSubmit: onSubmitProp,
}: {
  settings: UserSettings;
  onSubmit: () => void;
}) {
  const { mutateAsync: updateSettings } = api.user.updateSettings.useMutation();

  const form = useForm<UserSettings>({
    resolver: zodResolver(UserSettingsSchema),
    defaultValues: settings,
  });

  const apiUtils = api.useUtils();
  async function onSubmit(data: UserSettings) {
    await updateSettings(data, {
      onSuccess: () => {
        apiUtils.user.getSettings.invalidate();
        onSubmitProp();
      },
    });
  }

  return (
    <DialogContent className="max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="profanityFilter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Profanity Filter</FormLabel>
                    <FormDescription>
                      Censor profanity in chat messages.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
