import { PostDetail } from "./post-detail";

export async function PostLoader({ params }: { params: PageProps<"/[handle]/post/[id]">["params"] }) {
  const { handle, id } = await params;
  return <PostDetail handle={handle} id={id} />;
}
