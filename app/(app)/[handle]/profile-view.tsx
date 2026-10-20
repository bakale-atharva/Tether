"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/shell/app-shell";
import { UserIcon } from "@/components/shell/icons";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";

// Minimal public profile; Phase 1 adds banners, bios, editing, and posts.
export function ProfileView({ handle }: { handle: string }) {
  const profile = useQuery(api.users.getByHandle, { handle });

  if (profile === undefined) return <LoadingState label="Loading profile" />;
  if (profile === null) {
    return (
      <>
        <PageHeader title="Profile" />
        <EmptyState
          icon={<UserIcon className="size-6" />}
          title="This account doesn't exist"
          action={
            <Link href="/" className={buttonStyles({ variant: "secondary" })}>
              Back to home
            </Link>
          }
        >
          Try searching for another handle.
        </EmptyState>
      </>
    );
  }

  const joined = new Date(profile._creationTime).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader title={profile.displayName} />
      <div aria-hidden="true" className="h-32 bg-gradient-to-br from-accent-soft via-surface-2 to-bg sm:h-40" />
      <div className="px-4 pb-6 md:px-6">
        <div className="-mt-10">
          <span className="inline-flex rounded-full ring-4 ring-bg">
            <Avatar name={profile.displayName} src={profile.avatarUrl} size="lg" />
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold">{profile.displayName}</h2>
        <p className="text-muted">@{profile.handle}</p>
        {profile.bio ? <p className="mt-3 whitespace-pre-wrap">{profile.bio}</p> : null}
        <p className="mt-3 text-sm text-muted">Joined {joined}</p>
      </div>
      <div className="border-t border-line">
        <EmptyState title="No posts yet">Posts from @{profile.handle} will show up here.</EmptyState>
      </div>
    </>
  );
}
