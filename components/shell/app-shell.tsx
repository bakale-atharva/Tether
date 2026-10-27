import { BillingProvider } from "@/components/billing/billing-provider";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ToastProvider } from "@/components/ui/toast";
import { HeaderAccount, JoinCard, SidebarAccount } from "./account";
import { SidebarNav, SidebarNavFallback, TabNav, TabNavFallback } from "./nav";
import { OnboardingRedirect } from "./onboarding-redirect";
import { RightSidebar } from "./right-sidebar";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <BillingProvider>
      <div className="mx-auto grid min-h-dvh w-full max-w-[1440px] grid-cols-[minmax(0,1fr)] items-start gap-0 px-2 pt-2 md:grid-cols-[72px_minmax(0,760px)] md:justify-center md:gap-6 md:px-8 md:py-8 lg:grid-cols-[216px_minmax(0,760px)] xl:grid-cols-[232px_minmax(0,760px)_288px]">
        <OnboardingRedirect />

        {/* Desktop and tablet sidebar */}
        <header className="shell-panel sticky top-8 hidden h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] min-h-0 flex-col overflow-y-auto p-2 md:flex lg:p-4">
          <Link
            href="/"
            aria-label="Tether home"
            className="mb-6 flex min-h-12 shrink-0 items-center justify-center rounded-full lg:justify-start lg:px-3"
          >
            <span className="hidden lg:inline-flex">
              <Logo />
            </span>
            <span className="lg:hidden">
              <LogoMark />
            </span>
          </Link>
          <nav aria-label="Primary" className="shrink-0">
            <Suspense fallback={<SidebarNavFallback />}>
              <SidebarNav />
            </Suspense>
          </nav>
          <div className="mt-auto flex shrink-0 flex-col gap-2 pt-8">
            <Link
              href="/pricing"
              className="flex min-h-11 items-center justify-center rounded-full px-2 text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink lg:justify-start lg:px-3 lg:text-sm"
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
          className="shell-panel min-h-[calc(100dvh-16px)] w-full min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom))] outline-none md:min-h-[calc(100dvh-64px)] md:pb-0"
        >
          {/* Mobile header */}
          <div className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 rounded-t-[20px] border-b border-line bg-surface px-3 md:hidden">
            <Link href="/" aria-label="Tether home" className="flex size-11 shrink-0 items-center">
              <LogoMark className="size-8" />
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <HeaderAccount />
            </div>
          </div>
          <ToastProvider>{children}</ToastProvider>
          <footer id="about-tether" className="border-t border-line px-4 py-6 text-sm text-muted sm:px-6 xl:hidden">
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

        <RightSidebar />

        {/* Mobile bottom tab bar */}
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-30 h-[calc(4rem+env(safe-area-inset-bottom))] rounded-t-[20px] border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          <Suspense fallback={<TabNavFallback />}>
            <TabNav />
          </Suspense>
        </nav>
      </div>
    </BillingProvider>
  );
}
