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
  return <><h2 className="mt-3 font-display text-2xl font-semibold">{profile.displayName}</h2>
    {isOwner ? <div className="mt-4"><Button variant="secondary" size="sm" onClick={() => setEditing(value => !value)}>{editing ? "Close editor" : "Edit profile"}</Button>{editing ? <ProfileEditor profile={profile} onSaved={() => setEditing(false)} /> : null}</div> : null}</>;
}
