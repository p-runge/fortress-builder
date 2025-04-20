import type { NextConfig } from "next";

import "./src/env";

import { seedDatabase } from "./src/server/db/seeding";
seedDatabase();

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
