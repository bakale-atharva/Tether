import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { PeopleLoader } from "../people-loader";

export default function FollowersPage({ params }: PageProps<"/[handle]/followers">) {
  return (
    <Suspense fallback={<LoadingState label="Loading followers" />}>
      <PeopleLoader params={params} kind="followers" />
    </Suspense>
  );
}
