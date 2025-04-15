"use client";

import { signOut, useSession } from "next-auth/react";

export default function SignOutButton() {
  const session = useSession();
  return (
    <button
      className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
      onClick={() => {
        if (session.status === "authenticated") {
          signOut();
        }
      }}
    >
      Sign out
    </button>
  );
}
