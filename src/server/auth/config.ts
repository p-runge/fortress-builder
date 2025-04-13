import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "~/env";
import { db } from "../db";

const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
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
