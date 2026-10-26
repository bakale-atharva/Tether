import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/states";
import { PrivateChat } from "@/components/agent/private-chat";

export const metadata: Metadata = { title: "Tether AI" };

export default function TetherAiPage() {
  return (
    <>
      <PageHeader title="Tether AI">Private conversations with Tether, for Pro members.</PageHeader>
      <div className="min-w-0 bg-surface">
        <Suspense fallback={<LoadingState label="Loading conversations" />}><PrivateChat /></Suspense>
      </div>
    </>
  );
}
