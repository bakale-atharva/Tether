import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { HeaderAccount, JoinCard, SidebarAccount, ViewerCard } from "./account";
import { SidebarNav, SidebarNavFallback, TabNav, TabNavFallback } from "./nav";
import { OnboardingRedirect } from "./onboarding-redirect";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[80rem] justify-center">
      <OnboardingRedirect />

      {/* Desktop and tablet sidebar */}
      <header className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col px-3 py-4 md:flex lg:w-68 lg:px-4">
        <Link
          href="/"
          aria-label="Tether home"
          className="mb-6 flex h-12 items-center rounded-full px-2.5 md:justify-center lg:justify-start"
        >
          <span className="hidden lg:inline-flex">
            <Logo />
          </span>
          <span className="lg:hidden">
            <LogoMark />
          </span>
        </Link>
        <nav aria-label="Primary">
          <Suspense fallback={<SidebarNavFallback />}>
            <SidebarNav />
          </Suspense>
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <div className="md:flex md:justify-center lg:block">
            <ThemeToggle />
          </div>
          <SidebarAccount />
        </div>
      </header>

      <div className="flex min-w-0 flex-1 justify-center gap-8">
        <main
          id="main"
          tabIndex={-1}
          className="min-h-dvh w-full min-w-0 max-w-2xl border-line pb-20 outline-none md:border-x md:pb-0"
        >
          {/* Mobile header */}
          <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur md:hidden">
            <Link href="/" aria-label="Tether home">
              <LogoMark className="size-8" />
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <HeaderAccount />
            </div>
          </div>
          {children}
        </main>

        <aside
          aria-label="About Tether"
          className="sticky top-0 hidden h-dvh w-80 shrink-0 flex-col gap-4 py-4 pr-4 xl:flex"
        >
          <ViewerCard />
          <JoinCard />
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h2 className="font-display text-xl font-semibold">What&apos;s Tether?</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              A calm place for public conversations. Follow people, save posts
              privately, and mention <span className="font-medium text-accent-text">@tether</span>{" "}
              for an AI take on any thread.
            </p>
          </section>
          <p className="px-1 text-xs text-muted">Development preview · No live payments</p>
        </aside>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <Suspense fallback={<TabNavFallback />}>
          <TabNav />
        </Suspense>
      </nav>
    </div>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="sticky top-14 z-10 border-b border-line bg-bg/90 px-4 py-3.5 backdrop-blur md:top-0 md:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
      {children ? <div className="mt-0.5 text-sm text-muted">{children}</div> : null}
    </div>
  );
}
