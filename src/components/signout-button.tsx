"use client";

import { signOut, useSession } from "next-auth/react";

export default function SignOutButton() {
  const session = useSession();
  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors cursor-pointer"
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
