"use client";

import { SignUpButton } from "@clerk/nextjs";
import { FeatherIcon } from "@/components/shell/icons";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useViewer } from "@/hooks/use-viewer";
import { PostComposer } from "@/components/posts/post-composer";
import { PublicFeed } from "@/components/posts/public-feed";

export function HomeWelcome() {
  const viewer = useViewer();

  if (viewer.status === "loading" || viewer.status === "needsOnboarding") {
    return <LoadingState label="Loading your home" />;
  }

  if (viewer.status === "signedOut") {
    return (
      <><EmptyState
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
        </EmptyState><PublicFeed /></>
    );
  }

  return <><PostComposer /><PublicFeed /></>;
}
