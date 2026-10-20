import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./logo";

// Shared frame for Clerk's sign-in and sign-up pages.
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="grid min-h-dvh outline-none lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-surface-2 p-12 lg:flex lg:flex-col">
        <Link href="/" aria-label="Tether home" className="w-fit">
          <Logo />
        </Link>
        <div className="mt-auto max-w-md">
          <p className="font-display text-4xl leading-tight font-semibold tracking-tight">
            Stay close to the conversations that matter.
          </p>
          <p className="mt-4 text-lg text-muted">
            Post, reply, and follow threads wherever they lead — with Tether AI
            ready when you ask.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-accent-soft blur-3xl"
        />
      </section>
      <section className="flex flex-col items-center justify-center gap-8 px-4 py-10">
        <Link href="/" aria-label="Tether home" className="lg:hidden">
          <Logo />
        </Link>
        {children}
      </section>
    </main>
  );
}
