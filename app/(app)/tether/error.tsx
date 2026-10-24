"use client";
import { ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
export default function ChatError({ reset }: { reset: () => void }) {
  return <>
    <PageHeader title="Tether AI">Private conversations with Tether, for Pro members.</PageHeader>
    <ErrorState title="Couldn't load your conversations" action={<Button onClick={reset}>Try again</Button>}>Your saved history is still there. Please try reconnecting.</ErrorState>
  </>;
}
