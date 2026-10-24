import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { HomeWelcome } from "./home-welcome";

export default function HomePage() {
  return (
    <>
      <header className="border-b border-line px-4 py-7 sm:px-6 sm:py-8">
        <p className="mb-2 text-sm font-medium text-muted">Home</p>
        <h1 className="max-w-lg text-[1.75rem] leading-tight font-semibold tracking-tight text-ink sm:text-[2rem]">A little time to catch up.</h1>
      </header>
      {/* The selected feed is read from the search params. */}
      <Suspense fallback={<LoadingState label="Loading your home" />}>
        <HomeWelcome />
      </Suspense>
    </>
  );
}
