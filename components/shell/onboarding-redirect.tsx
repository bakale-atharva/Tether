"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useViewer } from "@/hooks/use-viewer";

// Signed-in people without a profile finish onboarding before using Tether.
// Convex functions enforce the same rule server-side via requireViewer.
export function OnboardingRedirect() {
  const viewer = useViewer();
  const router = useRouter();

  useEffect(() => {
    if (viewer.status === "needsOnboarding") router.replace("/onboarding");
  }, [viewer.status, router]);

  return null;
}
