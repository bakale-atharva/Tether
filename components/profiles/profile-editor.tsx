"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { PublicProfile } from "@/convex/users";
import { BIO_MAX, bioProblem, characterCount } from "@/convex/lib/content";
import { DISPLAY_NAME_MAX, displayNameProblem } from "@/convex/lib/handles";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { useUploadBatch } from "@/components/posts/use-upload-batch";

export function ProfileEditor({ profile, onSaved }: { profile: PublicProfile; onSaved: () => void }) {
  const update = useMutation(api.users.updateProfile);
  const withUploads = useUploadBatch();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const problem = displayNameProblem(displayName) ?? bioProblem(bio);
    if (problem) { setError(problem); return; }
    setSaving(true); setError(null);
    try {
      await withUploads(async upload => {
        const avatarUploadId = avatar ? await upload(avatar, "avatar") : undefined;
        const bannerUploadId = banner ? await upload(banner, "banner") : undefined;
        await update({ displayName, bio, ...(avatarUploadId ? { avatarUploadId } : {}), ...(bannerUploadId ? { bannerUploadId } : {}) });
      });
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your profile couldn't be saved.");
    } finally { setSaving(false); }
  }

  return <form className="mt-6 rounded-[20px] bg-surface-2/60 p-4 sm:p-6" onSubmit={submit}>
    <fieldset disabled={saving} className="grid min-w-0 gap-5">
      <legend className="mb-4 text-base font-semibold text-ink">Edit your profile</legend>
      <Field id="profile-name" label="Display name" value={displayName} onChange={event => setDisplayName(event.target.value)} maxLength={DISPLAY_NAME_MAX} required />
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">Bio
        <textarea value={bio} onChange={event => setBio(event.target.value)} rows={3} className="min-w-0 rounded-xl border border-transparent bg-surface px-3.5 py-2.5 text-base leading-relaxed font-normal outline-none focus:outline-solid focus:outline-2 focus:outline-offset-2 focus:outline-ring" />
        <span className="text-xs font-normal tabular-nums text-muted">{BIO_MAX - characterCount(bio.trim())} characters remaining</span>
      </label>
      <label className="min-w-0 text-sm font-medium text-ink">Avatar<input className="mt-2 block min-h-11 w-full min-w-0 rounded-xl border border-transparent bg-surface text-sm font-normal text-muted focus:outline-2 focus:outline-offset-2 focus:outline-ring file:mr-3 file:min-h-11 file:cursor-pointer file:border-0 file:border-r file:border-line file:bg-surface-2 file:px-3 file:text-sm file:font-medium file:text-ink" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setAvatar(event.target.files?.[0] ?? null)} /></label>
      <label className="min-w-0 text-sm font-medium text-ink">Banner<input className="mt-2 block min-h-11 w-full min-w-0 rounded-xl border border-transparent bg-surface text-sm font-normal text-muted focus:outline-2 focus:outline-offset-2 focus:outline-ring file:mr-3 file:min-h-11 file:cursor-pointer file:border-0 file:border-r file:border-line file:bg-surface-2 file:px-3 file:text-sm file:font-medium file:text-ink" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setBanner(event.target.files?.[0] ?? null)} /></label>
      <div className="flex justify-end border-t border-line pt-4"><Button type="submit" loading={saving}>Save profile</Button></div>
      {error && <ErrorState title="Profile wasn't saved">{error}</ErrorState>}
    </fieldset>
  </form>;
}
