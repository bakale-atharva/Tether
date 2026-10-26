import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-12 outline-none">
      <div className="w-full max-w-md">
        <Logo className="mb-8" />
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight text-balance sm:text-3xl">This thread came loose</h1>
          <p className="mt-3 leading-relaxed text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className={buttonStyles({ className: "mt-6" })}>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
