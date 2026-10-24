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
      <div aria-hidden="true" className="h-32 border-b border-line bg-accent-soft sm:h-44" style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
      <div className="bg-surface px-4 pb-6 sm:px-6 sm:pb-8">
        <div className="relative -mt-10 flex flex-wrap items-end justify-between gap-3">
          <span className="inline-flex rounded-full ring-4 ring-surface">
            <Avatar name={profile.displayName} src={profile.avatarUrl} size="lg" />
          </span>
          <FollowButton profile={profile} />
        </div>
        <ProfileIdentity profile={profile} />
        <p className="mt-1 text-sm wrap-anywhere text-muted">@{profile.handle}</p>
        {profile.bio ? <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed wrap-anywhere text-ink">{profile.bio}</p> : null}
        <p className="mt-4 text-sm text-muted">Joined {joined}</p>
        <FollowCounts profile={profile} />
      </div>
      <ProfilePosts authorId={profile._id} handle={profile.handle} />
    </>
  );
}
