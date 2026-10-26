"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { PublicProfile } from "@/convex/users";

// Live follower/following counts linking to each list.
export function FollowCounts({ profile }: { profile: PublicProfile }) {
  const state = useQuery(api.follows.state, { userId: profile._id });
  const links = [
    { href: `/${profile.handle}/following`, count: state?.followingCount, label: "Following" },
    { href: `/${profile.handle}/followers`, count: state?.followerCount, label: state?.followerCount === 1 ? "Follower" : "Followers" },
  ];
  return (
    <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
      {links.map(link => (
        <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-muted underline-offset-4 hover:text-accent-text hover:underline focus-visible:underline">
          <span className="font-semibold tabular-nums text-ink">{link.count ?? "–"}</span> {link.label}
        </Link>
      ))}
    </p>
  );
}
