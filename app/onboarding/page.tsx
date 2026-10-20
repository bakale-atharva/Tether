import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Set up your profile" };

export default function OnboardingPage() {
  return (
    <main id="main" tabIndex={-1} className="flex min-h-dvh flex-col items-center px-4 py-10 outline-none sm:justify-center">
      <Logo className="mb-8" />
      <OnboardingForm />
    </main>
  );
}
