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
      <div aria-hidden="true" className="h-32 bg-gradient-to-br from-accent-soft via-surface-2 to-bg sm:h-40" style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
      <div className="px-4 pb-6 md:px-6">
        <div className="-mt-10 flex items-end justify-between gap-3">
          <span className="inline-flex rounded-full ring-4 ring-bg">
            <Avatar name={profile.displayName} src={profile.avatarUrl} size="lg" />
          </span>
          <FollowButton profile={profile} />
        </div>
        <ProfileIdentity profile={profile} />
        <p className="text-muted">@{profile.handle}</p>
        {profile.bio ? <p className="mt-3 whitespace-pre-wrap">{profile.bio}</p> : null}
        <p className="mt-3 text-sm text-muted">Joined {joined}</p>
        <FollowCounts profile={profile} />
      </div>
      <ProfilePosts authorId={profile._id} handle={profile.handle} />
    </>
  );
}
