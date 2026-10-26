"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { LoadingState } from "@/components/ui/states";
import { FollowButton } from "@/components/profiles/follow-button";
import { FollowCounts } from "@/components/profiles/follow-counts";
import { MissingProfile } from "@/components/profiles/missing-profile";

import { ProfileIdentity } from "@/components/profiles/profile-identity";
import { ProfilePosts } from "@/components/profiles/profile-posts";

export function ProfileView({ handle }: { handle: string }) {
  const profile = useQuery(api.users.getByHandle, { handle });

  if (profile === undefined) return <LoadingState label="Loading profile" />;
  if (profile === null) return <MissingProfile />;

  const joined = new Date(profile._creationTime).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader title={profile.displayName} />
      <div className="px-3 pt-3 sm:px-6 sm:pt-4">
        <div aria-hidden="true" className="h-40 rounded-[20px] bg-surface-2 bg-[linear-gradient(135deg,var(--surface-2),var(--accent-soft))] sm:h-[200px] sm:rounded-[32px]" style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
      </div>
      <div className="relative flow-root px-5 pb-7 sm:px-8 sm:pb-9">
        <div className="relative -mt-12 flex flex-wrap items-end justify-between gap-4 sm:-mt-14">
          <span className="inline-flex shrink-0 rounded-full bg-surface ring-[5px] ring-surface">
            <Avatar name={profile.displayName} src={profile.avatarUrl} size="profile" />
          </span>
          <FollowButton profile={profile} />
        </div>
        <ProfileIdentity profile={profile} />
        <p className="mt-1.5 text-sm wrap-anywhere text-muted">@{profile.handle}</p>
        {profile.bio ? <p className="mt-5 max-w-[70ch] whitespace-pre-wrap text-base leading-relaxed wrap-anywhere text-ink">{profile.bio}</p> : null}
        <p className="mt-5 text-sm text-muted">Joined {joined}</p>
        <FollowCounts profile={profile} />
      </div>
      <ProfilePosts authorId={profile._id} handle={profile.handle} />
    </>
  );
}
