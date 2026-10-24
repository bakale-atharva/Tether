import { BillingProvider } from "@/components/billing/billing-provider";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ToastProvider } from "@/components/ui/toast";
import { HeaderAccount, JoinCard, SidebarAccount } from "./account";
import { SidebarNav, SidebarNavFallback, TabNav, TabNavFallback } from "./nav";
import { OnboardingRedirect } from "./onboarding-redirect";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <BillingProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1000px] justify-center md:gap-4 md:px-4 lg:gap-6 lg:px-8">
        <OnboardingRedirect />

        {/* Desktop and tablet sidebar */}
        <header className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col py-6 md:flex lg:w-58">
          <Link
            href="/"
            aria-label="Tether home"
            className="mb-8 flex h-12 items-center rounded-xl px-3 md:justify-center lg:justify-start"
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
          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Link
              href="/pricing"
              className="flex min-h-11 items-center justify-center rounded-xl px-2 text-sm font-medium text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink lg:justify-start lg:px-3"
            >
              <span className="lg:hidden">Plans</span>
              <span className="hidden lg:inline">Free &amp; Pro plans</span>
            </Link>
            <div className="md:flex md:justify-center lg:block">
              <ThemeToggle showLabel />
            </div>
            <SidebarAccount />
          </div>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className="min-h-dvh w-full min-w-0 max-w-[680px] flex-1 border-line bg-surface pb-[calc(5rem+env(safe-area-inset-bottom))] outline-none md:border-x md:pb-0"
        >
          {/* Mobile header */}
          <div className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface px-4 md:hidden">
            <Link href="/" aria-label="Tether home" className="flex size-11 shrink-0 items-center">
              <LogoMark className="size-8" />
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <HeaderAccount />
            </div>
          </div>
          <ToastProvider>{children}</ToastProvider>
          <footer id="about-tether" className="border-t border-line px-4 py-6 text-sm text-muted sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
              <details className="group min-w-0 flex-1 basis-48">
                <summary className="min-h-11 cursor-pointer content-center rounded-lg font-medium text-ink transition-colors duration-150 hover:text-accent-text">
                  About Tether
                </summary>
                <div className="max-w-prose pt-2 pb-4 leading-relaxed">
                  <p>
                    A calm place for public conversations. Follow people, save posts
                    privately, and mention <span className="font-medium text-accent-text">@tether</span>{" "}
                    for an AI take on any thread.
                  </p>
                  <JoinCard />
                </div>
              </details>
              <Link href="/pricing" className="inline-flex min-h-11 items-center font-medium text-accent-text underline-offset-4 hover:underline">
                Explore Free &amp; Pro plans
              </Link>
            </div>
            <p className="mt-2 text-xs">Development preview · No live payments</p>
          </footer>
        </main>

        {/* Mobile bottom tab bar */}
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-30 h-[calc(4rem+env(safe-area-inset-bottom))] border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          <Suspense fallback={<TabNavFallback />}>
            <TabNav />
          </Suspense>
        </nav>
      </div>
    </BillingProvider>
  );
}
