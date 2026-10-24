import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { PostLoader } from "./post-loader";

export default function PostPage({ params }: PageProps<"/[handle]/post/[id]">) {
  return <Suspense fallback={<LoadingState label="Loading post" />}><PostLoader params={params} /></Suspense>;
}
