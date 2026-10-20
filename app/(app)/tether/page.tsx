import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SparkIcon } from "@/components/shell/icons";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Tether AI" };

export default function TetherAiPage() {
  return (
    <>
      <PageHeader title="Tether AI">Private conversations with Tether, for Pro members.</PageHeader>
      <EmptyState icon={<SparkIcon className="size-6" />} title="Your AI companion is coming">
        Pro members will be able to chat privately with Tether and mention{" "}
        <span className="font-medium text-accent-text">@tether</span> in any thread.
      </EmptyState>
    </>
  );
}
