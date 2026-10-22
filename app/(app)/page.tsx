import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/states";
import { HomeWelcome } from "./home-welcome";

export default function HomePage() {
  return (
    <>
      <PageHeader title="Home" />
      {/* The selected feed is read from the search params. */}
      <Suspense fallback={<LoadingState label="Loading your home" />}>
        <HomeWelcome />
      </Suspense>
    </>
  );
}
