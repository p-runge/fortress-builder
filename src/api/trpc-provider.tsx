"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "~/api/query-client";

const queryClient = makeQueryClient();

export default function TRPCProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
