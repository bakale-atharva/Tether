"use client";

import { useState } from "react";
import type { PublicProfile } from "@/convex/users";
import { useViewer } from "@/hooks/use-viewer";
import { Button } from "@/components/ui/button";
import { ProfileEditor } from "./profile-editor";

export function ProfileIdentity({ profile }: { profile: PublicProfile }) {
  const viewer = useViewer();
  const isOwner = viewer.status === "ready" && viewer.profile._id === profile._id;
  const [editing, setEditing] = useState(false);
  return <>
    <div className="mt-4 flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <h2 className="min-w-0 flex-1 text-2xl leading-tight font-semibold tracking-tight wrap-anywhere text-ink sm:text-[1.75rem]">{profile.displayName}</h2>
      {isOwner ? <Button variant="secondary" size="sm" className="min-h-11 shrink-0 sm:min-h-9" aria-expanded={editing} onClick={() => setEditing(value => !value)}>{editing ? "Close editor" : "Edit profile"}</Button> : null}
    </div>
    {isOwner && editing ? <ProfileEditor profile={profile} onSaved={() => setEditing(false)} /> : null}
  </>;
}
