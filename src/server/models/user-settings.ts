import { z } from "zod";

export const UserSettingsSchema = z.object({
  profanityFilter: z.boolean(),
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;
