import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/app-shell";
import { BookmarkIcon } from "@/components/shell/icons";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Bookmarks" };

export default function BookmarksPage() {
  return (
    <>
      <PageHeader title="Bookmarks">Only you can see what you save.</PageHeader>
      <EmptyState icon={<BookmarkIcon className="size-6" />} title="Nothing saved yet">
        Bookmark posts to keep them here, privately. Saving arrives with likes and
        bookmarks.
      </EmptyState>
    </>
  );
}
