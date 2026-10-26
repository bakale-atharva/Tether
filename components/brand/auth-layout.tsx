import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./logo";

export const authAppearance = {
  variables: { borderRadius: "0.75rem" },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full rounded-2xl border border-line shadow-none",
    card: "w-full bg-surface p-6 shadow-none sm:p-8",
    footer: "bg-surface-2",
  },
};

// Shared frame for Clerk's sign-in and sign-up pages.
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="flex min-h-dvh items-center bg-bg px-4 py-8 outline-none sm:px-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
        <section className="mx-auto w-full max-w-md lg:mx-0">
          <Link href="/" aria-label="Tether home" className="inline-flex rounded-xl">
            <Logo />
          </Link>
          <div className="mt-10 hidden lg:block">
            <p className="text-4xl leading-tight font-semibold tracking-tight text-balance text-ink">
              Stay close to the conversations that matter.
            </p>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted">
              Post, reply, and follow threads wherever they lead — with Tether AI
              ready when you ask.
            </p>
          </div>
        </section>
        <section className="mx-auto w-full min-w-0 max-w-md">
          {children}
        </section>
      </div>
    </main>
  );
}
