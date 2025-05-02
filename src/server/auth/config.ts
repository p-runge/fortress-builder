import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client/extension";
import { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "~/env";
import { db } from "../db";
import { ResourceType } from "../db/client";
import { FORTRESS_SIZE, getCoordinatesForSize } from "../models/fortress";

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
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  events: {
    async createUser({ user }) {
      const userId = user.id;
      if (!userId) return;

      // Create default resources for the new user
      await db.resource.createMany({
        data: Object.values(ResourceType).map((type) => ({
          type,
          userId,
        })),
      });

      //  Create fortress for the new user
      await db.fortress.create({
        data: {
          userId,
          fields: {
            createMany: {
              data: getCoordinatesForSize(FORTRESS_SIZE).map(({ x, y }) => ({
                x,
                y,
              })),
            },
          },
        },
      });
    },
  },
};

export default authConfig;
