"use client";

import { SignUpButton } from "@clerk/nextjs";
import { FeatherIcon } from "@/components/shell/icons";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useViewer } from "@/hooks/use-viewer";

// The feed arrives in Phase 1; until then Home greets people by state.
export function HomeWelcome() {
  const viewer = useViewer();

  if (viewer.status === "loading" || viewer.status === "needsOnboarding") {
    return <LoadingState label="Loading your home" />;
  }

  if (viewer.status === "signedOut") {
    return (
      <EmptyState
        icon={<FeatherIcon className="size-6" />}
        title="Conversations worth staying for"
        action={
          <SignUpButton mode="modal">
            <button type="button" className={buttonStyles({ size: "lg" })}>
              Join Tether
            </button>
          </SignUpButton>
        }
      >
        Tether is a calm place for public threads. Create an account to post,
        reply, and save what matters.
      </EmptyState>
    );
  }

  return (
    <EmptyState icon={<FeatherIcon className="size-6" />} title={`Welcome, ${viewer.profile.displayName}`}>
      You&apos;re all set as <span className="font-medium text-ink">@{viewer.profile.handle}</span>.
      Posting and the public feed are coming next.
    </EmptyState>
  );
}
