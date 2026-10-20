"use client";

import { PageHeader } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function ConversationError({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PageHeader title="Post" />
      <ErrorState
        title="This conversation couldn't load"
        action={<Button variant="secondary" size="sm" onClick={reset}>Try again</Button>}
      >
        Check your connection and try again.
      </ErrorState>
    </>
  );
}
