import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/states";
import { SearchContent } from "./search-content";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <PageHeader title="Search" />
      <Suspense fallback={<LoadingState label="Loading search" />}>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
