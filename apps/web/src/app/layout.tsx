import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { QueryProvider } from "@/lib/query";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const oswald = localFont({
  src: "./fonts/oswald.woff2",
  variable: "--font-oswald",
  weight: "200 700",
});

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
});

const spaceMono = localFont({
  src: [
    { path: "./fonts/space-mono-400.woff2", weight: "400" },
    { path: "./fonts/space-mono-700.woff2", weight: "700" },
  ],
  variable: "--font-space-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");
  return {
    title: { default: "Gym Tracker", template: "%s · Gym Tracker" },
    description: t("description"),
    appleWebApp: {
      capable: true,
      title: "GymTrack",
      statusBarStyle: "black-translucent",
    },
  };
}

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const t = await getTranslations("app");

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          oswald.variable,
          spaceGrotesk.variable,
          spaceMono.variable,
          "antialiased",
        )}
      >
        <NextIntlClientProvider>
          <ThemeProvider>
            <GoogleOAuthProvider
              clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
              locale={locale}
            >
              <QueryProvider>
                <AuthProvider>{children}</AuthProvider>
              </QueryProvider>
            </GoogleOAuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <div className="portrait-lock" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="7" y="2" width="10" height="19" rx="2" />
            <path d="M11 18h2" />
            <path d="M2 9l3-3 3 3" />
            <path d="M5 6v6a4 4 0 0 0 4 4h2" />
          </svg>
          <p>{t("rotatePhone")}</p>
        </div>
      </body>
    </html>
  );
}
