import type { NextConfig } from "next";

import "./src/env";

import { seedDatabase } from "./src/server/db/seeding";
seedDatabase();

import { ensureRelationalIntegrity } from "./src/server/db/relational-integrity";
ensureRelationalIntegrity();

// start the worker to handle jobs in dev mode
import "~/server/jobs";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/avatars/**",
      },
    ],
  },
};

export default nextConfig;
