import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "~/api/client";
import ThemeProvider from "./theme-provider";

export const GlobalProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ThemeProvider>
      <SessionProvider>
        <TRPCProvider>{children}</TRPCProvider>
      </SessionProvider>
    </ThemeProvider>
  );
};
