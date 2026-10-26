import Link from "next/link";
import type { PublicProfile } from "@/convex/users";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "./follow-button";

// One account in a people list: identity linking to the profile, plus Follow.
export function ProfileRow({ profile }: { profile: PublicProfile }) {
  return (
    <article className="flex min-w-0 flex-wrap items-start gap-x-4 gap-y-4 border-b border-line/70 px-4 py-6 sm:px-8 sm:py-7">
      <Link href={`/${profile.handle}`} className="flex min-w-0 flex-1 basis-32 items-start gap-3 rounded-xl sm:gap-4">
        <Avatar name={profile.displayName} src={profile.avatarUrl} />
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink hover:underline">{profile.displayName}</span>
          <span className="block truncate text-sm text-muted">@{profile.handle}</span>
          {profile.bio ? <span className="mt-2.5 line-clamp-2 block text-base leading-relaxed wrap-anywhere text-ink">{profile.bio}</span> : null}
        </span>
      </Link>
      <FollowButton profile={profile} />
    </article>
  );
}
