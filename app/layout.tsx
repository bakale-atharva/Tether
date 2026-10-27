import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tether",
    template: "%s · Tether",
  },
  description:
    "Public conversations, personalized discovery, private bookmarks, and an AI that joins the thread when you ask.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9eaed" },
    { media: "(prefers-color-scheme: dark)", color: "#101112" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="app-backdrop min-h-full">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-accent px-4 py-2 font-medium text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <ClerkProvider
          appearance={{
            variables: { fontFamily: "var(--font-body)" },
          }}
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
