import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { PostDetail } from "./post-detail";

export default function PostPage({ params }: PageProps<"/[handle]/post/[id]">) {
  return <Suspense fallback={<LoadingState label="Loading post" />}><PostLoader params={params} /></Suspense>;
}

async function PostLoader({ params }: { params: PageProps<"/[handle]/post/[id]">["params"] }) {
  const { handle, id } = await params;
  return <PostDetail handle={decodeURIComponent(handle)} id={id} />;
}
