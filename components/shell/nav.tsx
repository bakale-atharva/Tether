"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useViewer } from "@/hooks/use-viewer";
import {
  BookmarkIcon,
  HomeIcon,
  type IconProps,
  SearchIcon,
  SparkIcon,
  UserIcon,
} from "./icons";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
};

function useNavItems(): NavItem[] {
  const viewer = useViewer();
  const items: NavItem[] = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/search", label: "Search", icon: SearchIcon },
    { href: "/bookmarks", label: "Bookmarks", icon: BookmarkIcon },
    { href: "/tether", label: "Tether AI", icon: SparkIcon },
  ];
  if (viewer.status === "ready") {
    items.push({ href: `/${viewer.profile.handle}`, label: "Profile", icon: UserIcon });
  }
  return items;
}

function isActive(pathname: string | null, href: string) {
  if (pathname === null) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLinks({ pathname }: { pathname: string | null }) {
  const items = useNavItems();
  return (
    <ul className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              title={label}
              className={`group flex h-12 items-center gap-3 rounded-xl px-3 text-[0.9375rem] transition-colors duration-150 md:justify-center lg:justify-start lg:pr-5 ${
                active ? "bg-accent-soft font-semibold text-accent-text" : "text-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icon filled={active} className="size-6 shrink-0" />
              <span className="md:sr-only lg:not-sr-only">{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function TabLinks({ pathname }: { pathname: string | null }) {
  const items = useNavItems();
  return (
    <ul className="flex h-full items-stretch justify-around">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href} className="flex-1">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className={`flex h-full min-h-14 flex-col items-center justify-center gap-0.5 text-[0.6875rem] transition-colors duration-150 hover:bg-surface-2 ${
                active ? "font-semibold text-accent-text" : "text-muted"
              }`}
            >
              <span className={`flex h-8 w-12 items-center justify-center rounded-xl ${active ? "bg-accent-soft" : ""}`}>
                <Icon filled={active} className="size-5" />
              </span>
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function PathnameAware({ Component }: { Component: ComponentType<{ pathname: string | null }> }) {
  return <Component pathname={usePathname()} />;
}

// usePathname suspends on routes with request-time params under Cache
// Components, so callers wrap these in Suspense with the pathname-free variant
// as the fallback.
export function SidebarNav() {
  return <PathnameAware Component={SidebarLinks} />;
}
export function SidebarNavFallback() {
  return <SidebarLinks pathname={null} />;
}
export function TabNav() {
  return <PathnameAware Component={TabLinks} />;
}
export function TabNavFallback() {
  return <TabLinks pathname={null} />;
}
