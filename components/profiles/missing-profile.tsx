import Link from "next/link";
import { UserIcon } from "@/components/shell/icons";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";

// Shown wherever a URL handle doesn't match an account.
export function MissingProfile() {
  return (
    <>
      <PageHeader title="Profile" />
      <div className="px-2 py-8 sm:px-4">
        <EmptyState
          icon={<UserIcon className="size-6" />}
          title="This account doesn't exist"
          action={<Link href="/" className={buttonStyles({ variant: "secondary" })}>Back to home</Link>}
        >
          Try searching for another handle.
        </EmptyState>
      </div>
    </>
  );
}
