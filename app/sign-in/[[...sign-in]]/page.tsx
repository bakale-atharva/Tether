import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/brand/auth-layout";
import { LoadingState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthLayout>
      {/* Clerk reads the pathname, which is request-time on this catch-all route. */}
      <Suspense fallback={<LoadingState />}>
        <SignIn />
      </Suspense>
    </AuthLayout>
  );
}
