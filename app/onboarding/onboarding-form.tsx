"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/convex/_generated/api";
import {
  DISPLAY_NAME_MAX,
  HANDLE_MAX,
  HANDLE_PROBLEM_MESSAGES,
  displayNameProblem,
  handleProblem,
  normalizeHandle,
} from "@/convex/lib/handles";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Card, LoadingState } from "@/components/ui/states";
import { useViewer } from "@/hooks/use-viewer";
import { errorMessage } from "@/lib/errors";

export function OnboardingForm() {
  const viewer = useViewer();
  const router = useRouter();

  useEffect(() => {
    if (viewer.status === "signedOut") router.replace("/sign-in?redirect_url=/onboarding");
    if (viewer.status === "ready") router.replace("/");
  }, [viewer.status, router]);

  if (viewer.status !== "needsOnboarding") {
    return <LoadingState label="Checking your account" />;
  }
  return (
    <ProfileSetup
      defaultDisplayName={viewer.suggestedDisplayName}
      defaultHandle={viewer.suggestedHandle}
    />
  );
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function ProfileSetup({
  defaultDisplayName,
  defaultHandle,
}: {
  defaultDisplayName: string;
  defaultHandle: string;
}) {
  const router = useRouter();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [handle, setHandle] = useState(defaultHandle);
  const [touched, setTouched] = useState({ handle: false, displayName: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const normalized = normalizeHandle(handle);
  const localProblem = normalized.length > 0 ? handleProblem(normalized) : null;
  const debouncedHandle = useDebounced(normalized, 300);
  const availability = useQuery(
    api.users.checkHandle,
    debouncedHandle.length > 0 && handleProblem(debouncedHandle) === null
      ? { handle: debouncedHandle }
      : "skip",
  );
  const checking =
    normalized.length > 0 &&
    localProblem === null &&
    (debouncedHandle !== normalized || availability === undefined);

  const handleError =
    normalized.length === 0
      ? touched.handle
        ? "Choose a handle."
        : null
      : localProblem
        ? HANDLE_PROBLEM_MESSAGES[localProblem]
        : !checking && availability && !availability.available
          ? availability.message
          : null;
  const nameError = touched.displayName ? displayNameProblem(displayName) : null;
  const handleOk = !checking && availability?.available === true && localProblem === null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ handle: true, displayName: true });
    setSubmitError(null);
    if (displayNameProblem(displayName) || normalized.length === 0 || localProblem) return;

    setSubmitting(true);
    try {
      await completeOnboarding({ handle: normalized, displayName: displayName.trim() });
      router.replace("/");
    } catch (error) {
      setSubmitError(errorMessage(error, "We couldn't save your profile. Check your connection and try again."));
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Make it yours</h1>
      <p className="mt-2 text-muted">
        Pick the name people see and a unique handle. You can change your name
        later; your handle is how others find you.
      </p>

      <form noValidate onSubmit={onSubmit} className="mt-7 flex flex-col gap-5">
        <Field
          id="displayName"
          label="Display name"
          autoComplete="name"
          maxLength={DISPLAY_NAME_MAX}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, displayName: true }))}
          error={nameError}
          required
        />
        <Field
          id="handle"
          label="Handle"
          prefix="@"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={HANDLE_MAX + 1}
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, handle: true }))}
          error={handleError}
          required
          hint={
            <span aria-live="polite">
              {checking
                ? "Checking availability…"
                : handleOk
                  ? <span className="text-success">@{normalized} is available.</span>
                  : "3–20 letters, numbers, or underscores."}
            </span>
          }
        />

        {submitError ? (
          <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
            {submitError}
          </p>
        ) : null}

        <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
          {submitting ? "Saving…" : "Continue to Tether"}
        </Button>
      </form>
    </Card>
  );
}
