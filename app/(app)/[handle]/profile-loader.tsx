import { ProfileView } from "./profile-view";

export async function ProfileLoader({ params }: { params: PageProps<"/[handle]">["params"] }) {
  const { handle } = await params;
  return <ProfileView handle={handle} />;
}
