"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function SearchError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState title="Search couldn't load" action={<Button variant="secondary" onClick={reset}>Try again</Button>}>
      Please try again in a moment.
    </ErrorState>
  );
}
