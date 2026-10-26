import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout, authAppearance } from "@/components/brand/auth-layout";
import { LoadingState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <AuthLayout>
      {/* Clerk reads the pathname, which is request-time on this catch-all route. */}
      <Suspense fallback={<LoadingState />}>
        <SignUp forceRedirectUrl="/onboarding" appearance={authAppearance} />
      </Suspense>
    </AuthLayout>
  );
}
