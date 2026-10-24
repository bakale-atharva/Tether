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
    <div role="tablist" aria-label="Home feeds" onKeyDown={onKeyDown} className="flex gap-6 border-b border-line bg-surface px-4 sm:px-6">
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
            className={`min-h-12 border-b-2 px-1 py-3 text-sm font-semibold transition-colors duration-150 hover:text-accent-text focus-visible:bg-accent-soft ${active ? "border-accent text-accent-text" : "border-transparent text-muted"}`}
          >
            {feed.label}
          </button>
        );
      })}
    </div>
  );
}
