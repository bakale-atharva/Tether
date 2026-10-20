import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/app-shell";
import { SearchIcon } from "@/components/shell/icons";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <>
      <PageHeader title="Search" />
      <EmptyState icon={<SearchIcon className="size-6" />} title="Search is on its way">
        Soon you&apos;ll be able to find posts by what they say. Results open at a
        shareable link.
      </EmptyState>
    </>
  );
}
