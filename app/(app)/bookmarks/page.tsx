import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SavedPosts } from "./saved-posts";

export const metadata: Metadata = { title: "Bookmarks" };

export default function BookmarksPage() {
  return (
    <>
      <PageHeader title="Bookmarks">Only you can see what you save.</PageHeader>
      <SavedPosts />
    </>
  );
}
