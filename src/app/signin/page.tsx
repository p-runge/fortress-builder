// app/signin/page.tsx
"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  useEffect(() => {
    const callbackUrl = new URL(window.location.href);

    signIn("discord", {
      redirectTo: callbackUrl.origin,
    });
  }, []);

  return <p>Redirecting to Discord login...</p>;
}
