"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";

const THEME_COLORS = { light: "#EDEBE4", dark: "#09090B" } as const;

function ThemedChrome() {
  const { resolvedTheme } = useTheme();
  const resolved = resolvedTheme === "light" ? "light" : "dark";

  useEffect(() => {
    if (!resolvedTheme) return;
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => (meta.content = THEME_COLORS[resolved]));
  }, [resolvedTheme, resolved]);

  return (
    <>
      <meta
        name="theme-color"
        media="(prefers-color-scheme: light)"
        content={THEME_COLORS.light}
      />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: dark)"
        content={THEME_COLORS.dark}
      />
      <Toaster
        theme={resolvedTheme ? resolved : "system"}
        richColors
        position="top-center"
        mobileOffset={{ top: "calc(env(safe-area-inset-top) + 16px)" }}
      />
    </>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <ThemedChrome />
    </NextThemesProvider>
  );
}
