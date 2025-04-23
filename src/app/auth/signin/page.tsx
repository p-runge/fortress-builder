import { SignInButton } from "~/components/auth-buttons";

export default async function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <main className="text-center">
        <h1 className="mb-4 text-3xl">Fortress Builder</h1>
        <SignInButton />
        <div className="mx-auto mt-4 max-w-[300px] text-xs">
          <p className="mb-1">
            This is a private project for me to play around with, so I would not
            recommend creating an account if your data matters to you. God knows
            what I&apos;m doing with it.
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
