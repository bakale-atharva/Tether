"use client";

import { useRef, type KeyboardEvent } from "react";
import { HOME_FEEDS, type HomeFeed } from "@/lib/constants";

export function feedTabId(feed: HomeFeed) {
  return `feed-tab-${feed}`;
}

export function feedPanelId(feed: HomeFeed) {
  return `feed-panel-${feed}`;
}

// The home feed switcher, following the ARIA tabs pattern: one tab stop, with
// arrow keys, Home, and End moving between tabs and activating them.
export function FeedTabs({ selected, onSelect }: { selected: HomeFeed; onSelect: (feed: HomeFeed) => void }) {
  const tabs = useRef(new Map<HomeFeed, HTMLButtonElement>());

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = HOME_FEEDS.findIndex(feed => feed.id === selected);
    const last = HOME_FEEDS.length - 1;
    const target =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (target === null) return;
    event.preventDefault();
    const next = HOME_FEEDS[target].id;
    onSelect(next);
    tabs.current.get(next)?.focus();
  }

  return (
    <div role="tablist" aria-label="Home feeds" onKeyDown={onKeyDown} className="flex border-b border-line">
      {HOME_FEEDS.map(feed => {
        const active = feed.id === selected;
        return (
          <button
            key={feed.id}
            ref={element => {
              if (element) tabs.current.set(feed.id, element);
              else tabs.current.delete(feed.id);
            }}
            type="button"
            role="tab"
            id={feedTabId(feed.id)}
            aria-selected={active}
            aria-controls={feedPanelId(feed.id)}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(feed.id)}
            className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 ${active ? "border-accent text-ink" : "border-transparent text-muted"}`}
          >
            {feed.label}
          </button>
        );
      })}
    </div>
  );
}
