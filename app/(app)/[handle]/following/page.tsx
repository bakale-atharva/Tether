import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { PeopleList } from "../people-list";

export default function FollowingPage({ params }: PageProps<"/[handle]/following">) {
  return (
    <Suspense fallback={<LoadingState label="Loading following" />}>
      <FollowingLoader params={params} />
    </Suspense>
  );
}

async function FollowingLoader({ params }: { params: PageProps<"/[handle]/following">["params"] }) {
  const { handle } = await params;
  return <PeopleList handle={decodeURIComponent(handle)} kind="following" />;
}
