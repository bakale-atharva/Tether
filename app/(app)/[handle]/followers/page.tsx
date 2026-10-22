import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { PeopleList } from "../people-list";

export default function FollowersPage({ params }: PageProps<"/[handle]/followers">) {
  return (
    <Suspense fallback={<LoadingState label="Loading followers" />}>
      <FollowersLoader params={params} />
    </Suspense>
  );
}

async function FollowersLoader({ params }: { params: PageProps<"/[handle]/followers">["params"] }) {
  const { handle } = await params;
  return <PeopleList handle={decodeURIComponent(handle)} kind="followers" />;
}
