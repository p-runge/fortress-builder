import { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "~/env";

const authConfig: NextAuthConfig = {
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "identify email",
        },
      },
    }),
  ],
};
export default authConfig;
