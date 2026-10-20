import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { ProfileView } from "./profile-view";

export default function ProfilePage({ params }: PageProps<"/[handle]">) {
  return (
    <Suspense fallback={<LoadingState label="Loading profile" />}>
      <ProfileLoader params={params} />
    </Suspense>
  );
}

async function ProfileLoader({ params }: { params: PageProps<"/[handle]">["params"] }) {
  const { handle } = await params;
  return <ProfileView handle={decodeURIComponent(handle)} />;
}
