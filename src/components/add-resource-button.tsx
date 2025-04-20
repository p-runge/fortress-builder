"use client";

import { useRouter } from "next/navigation";
import { api } from "~/api/client";
import { cn } from "~/lib/utils";
import { ResourceType } from "~/server/db/client";
import { Button } from "./ui/button";

export default function AddResourceButton({
  type,
  amount,
  className,
}: {
  type: ResourceType;
  amount: number;
  className?: string;
}) {
  const router = useRouter();
  const { mutateAsync: addResource } = api.resource.add.useMutation();

  return (
    <Button
      className={cn("bg-gray-200 p-2 rounded", className)}
      onClick={async () => {
        await addResource({
          type,
          amount,
        });
        router.refresh();
      }}
    >
      +{amount}
    </Button>
  );
}
