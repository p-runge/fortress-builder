import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client/extension";
import { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "~/env";
import { db } from "../db";

const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db as PrismaClient),
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
};

export default authConfig;
