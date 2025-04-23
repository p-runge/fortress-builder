"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "./ui/button";

export function SignInButton() {
  return (
    <Suspense>
      <SignInButtonContent />
    </Suspense>
  );
}

function SignInButtonContent() {
  const searchParams = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const error = searchParams.get("error");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      setCallbackUrl(url.origin);
    }
  }, []);

  return (
    <>
      <Button
        className="bg-[#5865F2] text-white hover:bg-[#4752C4]"
        onClick={() => {
          if (!callbackUrl) {
            console.error("Callback URL is not set");
            return;
          }
          signIn("discord", {
            redirectTo: callbackUrl,
          });
        }}
      >
        Sign in with Discord
      </Button>
      {error && (
        <p className="mt-4 text-red-500">
          An error occurred while signing in. Please try again.
        </p>
      )}
    </>
  );
}

export function SignOutButton() {
  const session = useSession();
  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (session.status === "authenticated") {
          signOut();
        }
      }}
    >
      Sign out
    </Button>
  );
}
