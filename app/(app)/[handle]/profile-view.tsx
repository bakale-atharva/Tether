"use client";

import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { PublicProfile } from "@/convex/users";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { PostFeedList } from "@/components/posts/post-feed-list";
import { FollowButton } from "@/components/profiles/follow-button";
import { FollowCounts } from "@/components/profiles/follow-counts";
import { MissingProfile } from "@/components/profiles/missing-profile";
import { useImageUpload } from "@/components/posts/use-image-upload";
import { useViewer } from "@/hooks/use-viewer";

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


function ProfileIdentity({ profile }: { profile: PublicProfile }) {
  const viewer = useViewer();
  const isOwner = viewer.status === "ready" && viewer.profile._id === profile._id;
  const [editing, setEditing] = useState(false);
  return <><h2 className="mt-3 font-display text-2xl font-semibold">{profile.displayName}</h2>
    {isOwner ? <div className="mt-4"><Button variant="secondary" size="sm" onClick={() => setEditing(value => !value)}>{editing ? "Close editor" : "Edit profile"}</Button>{editing ? <ProfileEditor profile={profile} onSaved={() => setEditing(false)} /> : null}</div> : null}</>;
}

function ProfileEditor({ profile, onSaved }: { profile: PublicProfile; onSaved: () => void }) {
  const update = useMutation(api.users.updateProfile); const discard = useMutation(api.uploads.discard); const upload = useImageUpload();
  const [displayName, setDisplayName] = useState(profile.displayName); const [bio, setBio] = useState(profile.bio ?? ""); const [avatar, setAvatar] = useState<File | null>(null); const [banner, setBanner] = useState<File | null>(null); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  async function choose(event: React.ChangeEvent<HTMLInputElement>, purpose: "avatar" | "banner") { const file = event.target.files?.[0]; if (!file) return; if (purpose === "avatar") setAvatar(file); else setBanner(file); }
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setError(null); const fresh: Id<"uploads">[] = []; try { const avatarUploadId = avatar ? await upload(avatar, "avatar") : undefined; if (avatarUploadId) fresh.push(avatarUploadId); const bannerUploadId = banner ? await upload(banner, "banner") : undefined; if (bannerUploadId) fresh.push(bannerUploadId); const profileUpdate = { displayName, bio, ...(avatarUploadId ? { avatarUploadId } : {}), ...(bannerUploadId ? { bannerUploadId } : {}) }; await update(profileUpdate); onSaved(); } catch (cause) { await Promise.all(fresh.map(uploadId => discard({ uploadId }).catch(() => null))); setError(cause instanceof Error ? cause.message : "Your profile couldn't be saved."); } finally { setSaving(false); } }
  return <form className="mt-4 rounded-2xl border border-line bg-surface-2 p-4" onSubmit={submit}><div className="grid gap-3"><Field id="profile-name" label="Display name" value={displayName} onChange={event => setDisplayName(event.target.value)} maxLength={50} required /><label className="flex flex-col gap-1.5 text-sm font-medium text-ink">Bio<textarea value={bio} onChange={event => setBio(event.target.value)} rows={3} className="rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-base font-normal outline-none focus:border-ring" /><span className="text-xs font-normal text-muted">{160 - Array.from(bio).length} characters remaining</span></label><label className="text-sm font-medium text-ink">Avatar<input className="mt-1 block w-full text-sm font-normal" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => choose(event, "avatar")} /></label><label className="text-sm font-medium text-ink">Banner<input className="mt-1 block w-full text-sm font-normal" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => choose(event, "banner")} /></label><div className="flex justify-end"><Button type="submit" loading={saving}>Save profile</Button></div>{error ? <ErrorState title="Profile wasn't saved">{error}</ErrorState> : null}</div></form>;
}

function ProfilePosts({ authorId, handle }: { authorId: PublicProfile["_id"]; handle: string }) {
  const { results, status, loadMore } = usePaginatedQuery(api.posts.byAuthor, { authorId }, { initialNumItems: FEED_PAGE_SIZE });
  return <div className="border-t border-line"><PostFeedList results={results} status={status} loadMore={loadMore} empty={<EmptyState title="No posts yet">Posts from @{handle} will show up here.</EmptyState>} /></div>;
}
