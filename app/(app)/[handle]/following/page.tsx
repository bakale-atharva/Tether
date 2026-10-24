import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { PeopleLoader } from "../people-loader";

export default function FollowingPage({ params }: PageProps<"/[handle]/following">) {
  return (
    <Suspense fallback={<LoadingState label="Loading following" />}>
      <PeopleLoader params={params} kind="following" />
    </Suspense>
  );
}
