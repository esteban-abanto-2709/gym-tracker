import type { Metadata } from "next";
import { Oswald, Space_Grotesk, Space_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

// Oswald: display condensado (títulos, números, botones). Space Grotesk:
// cuerpo/UI. Space Mono: etiquetas "kicker". Ver globals.css (@theme inline).
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Gym Tracker",
  description: "Registra tus entrenamientos sin fricción.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
        >
          <AuthProvider>{children}</AuthProvider>
        </GoogleOAuthProvider>
        <Toaster theme="dark" richColors position="top-center" />
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
