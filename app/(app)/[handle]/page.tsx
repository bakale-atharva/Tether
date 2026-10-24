import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { ProfileLoader } from "./profile-loader";

export default function ProfilePage({ params }: PageProps<"/[handle]">) {
  return (
    <Suspense fallback={<LoadingState label="Loading profile" />}>
      <ProfileLoader params={params} />
    </Suspense>
  );
}
