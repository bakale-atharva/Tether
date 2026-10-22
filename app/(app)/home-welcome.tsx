"use client";

import { SignUpButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { FeatherIcon } from "@/components/shell/icons";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useViewer } from "@/hooks/use-viewer";
import { FeedTabs, feedPanelId, feedTabId } from "@/components/posts/feed-tabs";
import { FollowingFeed } from "@/components/posts/following-feed";
import { PostComposer } from "@/components/posts/post-composer";
import { PublicFeed } from "@/components/posts/public-feed";
import { HOME_FEEDS, type HomeFeed } from "@/lib/constants";

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
        </EmptyState><HomeFeeds /></>
    );
  }

  return <><PostComposer /><HomeFeeds /></>;
}

// The selected feed lives in the URL (`?feed=following`), so it survives
// reloads and can be shared. Feeds stay mounted once opened, keeping their
// loaded pages, and each tab restores its own scroll position.
function HomeFeeds() {
  const router = useRouter();
  const selected: HomeFeed = useSearchParams().get("feed") === "following" ? "following" : "everyone";
  const [opened, setOpened] = useState<ReadonlySet<HomeFeed>>(() => new Set([selected]));
  const scrollPositions = useRef<Record<HomeFeed, number>>({ everyone: 0, following: 0 });
  if (!opened.has(selected)) setOpened(new Set([...opened, selected]));

  function select(feed: HomeFeed) {
    if (feed === selected) return;
    scrollPositions.current[selected] = window.scrollY;
    router.replace(feed === "following" ? "/?feed=following" : "/", { scroll: false });
  }

  useLayoutEffect(() => {
    window.scrollTo({ top: scrollPositions.current[selected] });
  }, [selected]);

  return (
    <>
      <FeedTabs selected={selected} onSelect={select} />
      {HOME_FEEDS.map(({ id }) => opened.has(id) ? (
        <div key={id} role="tabpanel" id={feedPanelId(id)} aria-labelledby={feedTabId(id)} hidden={id !== selected}>
          {id === "following" ? <FollowingFeed onExplore={() => select("everyone")} /> : <PublicFeed />}
        </div>
      ) : null)}
    </>
  );
}
