import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { THEME_COLORS } from "@/lib/theme";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

// Oswald: display condensado (títulos, números, botones). Space Grotesk:
// cuerpo/UI. Space Mono: etiquetas "kicker". Ver globals.css (@theme inline).
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

export const metadata: Metadata = {
  title: "Gym Tracker",
  description: "Registra tus entrenamientos sin fricción.",
  appleWebApp: {
    capable: true,
    title: "GymTrack",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${oswald.variable} ${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
      >
        <ThemeProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
          >
            <AuthProvider>{children}</AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
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
          <p>Rota el celular para continuar</p>
        </div>
      </body>
    </html>
  );
}
