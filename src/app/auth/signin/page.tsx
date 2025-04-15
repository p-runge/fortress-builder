"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  const callbackUrl =
    (typeof window !== "undefined" && new URL(window.location.href).origin) ||
    "";

  // useEffect(() => {
  //   const callbackUrl = new URL(window.location.href);

  //   signIn("discord", {
  //     redirectTo: callbackUrl,
  //   });
  // }, []);

  return (
    <div className="flex justify-center items-center min-h-screen p-8">
      <main className="text-center">
        <h1 className="text-3xl mb-4">Fortress Builder</h1>
        <button
          onClick={() => {
            signIn("discord", {
              redirectTo: callbackUrl,
            });
          }}
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Sign in with Discord
        </button>
        <div className="mt-4 max-w-[300px] mx-auto text-xs">
          <p className="mb-1">
            This is a private project for me to play around with, so I would not
            recommend creating an account if your data matters to you. God knows
            that I&apos;m doing with it.
          </p>
          <p className="mb-1">
            If you like to live dangerously, go ahead but be warned – it has:
          </p>
          <p>✨ Privacy level: Trust me bro ✨</p>
        </div>
      </main>
    </div>
  );
}
