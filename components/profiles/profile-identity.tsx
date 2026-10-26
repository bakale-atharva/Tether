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
    <div className="mt-6 min-w-0 sm:mt-7">
      <h2 className="min-w-0 text-[1.75rem] leading-tight font-semibold tracking-tight wrap-anywhere text-ink sm:text-[2rem]">{profile.displayName}</h2>
      {isOwner ? <Button variant="secondary" size="sm" className="absolute top-4 right-5 min-h-11 shrink-0 bg-transparent sm:top-5 sm:right-8" aria-expanded={editing} onClick={() => setEditing(value => !value)}>{editing ? "Close editor" : "Edit profile"}</Button> : null}
    </div>
    {isOwner && editing ? <ProfileEditor profile={profile} onSaved={() => setEditing(false)} /> : null}
  </>;
}
