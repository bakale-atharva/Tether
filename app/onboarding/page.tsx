import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Set up your profile" };

export default function OnboardingPage() {
  return (
    <main id="main" tabIndex={-1} className="flex min-h-dvh flex-col items-center px-4 py-8 outline-none sm:justify-center sm:px-8 sm:py-12">
      <div className="w-full max-w-lg">
        <Logo className="mb-8" />
        <OnboardingForm />
      </div>
    </main>
  );
}
