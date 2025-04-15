import { auth, signIn, signOut } from "~/server/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>Fortress Builder</h1>
        {!session ? (
          <form
            action={async () => {
              "use server";
              await signIn("discord");
            }}
          >
            <button className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
              Sign in
            </button>
          </form>
        ) : (
          <div>
            <h2>Welcome, {session.user?.name}</h2>
            <p>Email: {session.user?.email}</p>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200">
                Sign out
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
