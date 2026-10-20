"use client";

import Link from "next/link";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useState } from "react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/shell/app-shell";
import { UserIcon } from "@/components/shell/icons";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { PostCard } from "@/components/posts/post-card";
import { useImageUpload } from "@/components/posts/use-image-upload";
import { useViewer } from "@/hooks/use-viewer";

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
      <div aria-hidden="true" className="h-32 bg-gradient-to-br from-accent-soft via-surface-2 to-bg sm:h-40" style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
      <div className="px-4 pb-6 md:px-6">
        <div className="-mt-10">
          <span className="inline-flex rounded-full ring-4 ring-bg">
            <Avatar name={profile.displayName} src={profile.avatarUrl} size="lg" />
          </span>
        </div>
        <ProfileIdentity profile={profile} />
        <p className="text-muted">@{profile.handle}</p>
        {profile.bio ? <p className="mt-3 whitespace-pre-wrap">{profile.bio}</p> : null}
        <p className="mt-3 text-sm text-muted">Joined {joined}</p>
      </div>
      <ProfilePosts authorId={profile._id} handle={profile.handle} />
    </>
  );
}

type Profile = NonNullable<FunctionReturnType<typeof api.users.getByHandle>>;

function ProfileIdentity({ profile }: { profile: Exclude<Profile, null> }) {
  const viewer = useViewer();
  const isOwner = viewer.status === "ready" && viewer.profile._id === profile._id;
  const [editing, setEditing] = useState(false);
  return <><h2 className="mt-3 font-display text-2xl font-semibold">{profile.displayName}</h2>
    {isOwner ? <div className="mt-4"><Button variant="secondary" size="sm" onClick={() => setEditing(value => !value)}>{editing ? "Close editor" : "Edit profile"}</Button>{editing ? <ProfileEditor profile={profile} onSaved={() => setEditing(false)} /> : null}</div> : null}</>;
}

function ProfileEditor({ profile, onSaved }: { profile: Exclude<Profile, null>; onSaved: () => void }) {
  const update = useMutation(api.users.updateProfile); const discard = useMutation(api.uploads.discard); const upload = useImageUpload();
  const [displayName, setDisplayName] = useState(profile.displayName); const [bio, setBio] = useState(profile.bio ?? ""); const [avatar, setAvatar] = useState<File | null>(null); const [banner, setBanner] = useState<File | null>(null); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  async function choose(event: React.ChangeEvent<HTMLInputElement>, purpose: "avatar" | "banner") { const file = event.target.files?.[0]; if (!file) return; if (purpose === "avatar") setAvatar(file); else setBanner(file); }
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setError(null); const fresh: string[] = []; try { const avatarUploadId = avatar ? await upload(avatar, "avatar") : undefined; if (avatarUploadId) fresh.push(avatarUploadId); const bannerUploadId = banner ? await upload(banner, "banner") : undefined; if (bannerUploadId) fresh.push(bannerUploadId); await update({ displayName, bio, avatarUploadId: avatarUploadId as never, bannerUploadId: bannerUploadId as never }); onSaved(); } catch (cause) { await Promise.all(fresh.map(uploadId => discard({ uploadId: uploadId as never }).catch(() => null))); setError(cause instanceof Error ? cause.message : "Your profile couldn't be saved."); } finally { setSaving(false); } }
  return <form className="mt-4 rounded-2xl border border-line bg-surface-2 p-4" onSubmit={submit}><div className="grid gap-3"><Field id="profile-name" label="Display name" value={displayName} onChange={event => setDisplayName(event.target.value)} maxLength={50} required /><label className="flex flex-col gap-1.5 text-sm font-medium text-ink">Bio<textarea value={bio} onChange={event => setBio(event.target.value)} maxLength={161} rows={3} className="rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-base font-normal outline-none focus:border-ring" /><span className="text-xs font-normal text-muted">{160 - Array.from(bio).length} characters remaining</span></label><label className="text-sm font-medium text-ink">Avatar<input className="mt-1 block w-full text-sm font-normal" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => choose(event, "avatar")} /></label><label className="text-sm font-medium text-ink">Banner<input className="mt-1 block w-full text-sm font-normal" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => choose(event, "banner")} /></label><div className="flex justify-end"><Button type="submit" loading={saving}>Save profile</Button></div>{error ? <ErrorState title="Profile wasn't saved">{error}</ErrorState> : null}</div></form>;
}

function ProfilePosts({ authorId, handle }: { authorId: Exclude<Profile, null>["_id"]; handle: string }) {
  const { results, status, loadMore } = usePaginatedQuery(api.posts.byAuthor, { authorId }, { initialNumItems: 12 });
  if (status === "LoadingFirstPage") return <LoadingState label="Loading posts" />;
  if (status === "Exhausted" && results.length === 0) return <EmptyState title="No posts yet">Posts from @{handle} will show up here.</EmptyState>;
  return <div className="border-t border-line">{results.map(post => <PostCard key={post._id} post={post} />)}{status === "CanLoadMore" ? <div className="p-5 text-center"><Button variant="secondary" onClick={() => loadMore(12)}>Load more</Button></div> : null}</div>;
}
