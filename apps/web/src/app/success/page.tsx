"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              var(--foreground) 35px,
              var(--foreground) 36px
            )`,
          }}
        />
      </div>

      {/* Gradient Orb */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(var(--brand-gradient-start)), hsl(var(--brand-gradient-end)))`,
        }}
      />

      {/* Header - Fixed */}
      <header className="shrink-0 px-6 py-4 border-b border-border relative z-10 bg-background/50 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="w-6" />

          <h1 className="text-xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] bg-clip-text text-transparent">
              GYM
            </span>
            <span className="text-foreground">TRACK</span>
          </h1>

          <div className="w-6" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10 text-center animate-fade-in-up">
        <div className="max-w-md w-full space-y-8">
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-3xl flex items-center justify-center shadow-xl shadow-primary/20 animate-scale-in">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="space-y-2 animate-fade-in-up [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards]">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                ¡Set Guardado!
              </h1>
              <p className="text-muted-foreground text-lg">
                Tu progreso ha sido registrado correctamente.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-8 animate-fade-in-up [animation-delay:0.4s] opacity-0 [animation-fill-mode:forwards]">
            <Link
              href="/?repeat=true"
              className="group relative block w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">Repetir ejercicio</span>
              <div className="absolute inset-0 bg-linear-to-r from-[hsl(var(--brand-gradient-end))] to-[hsl(var(--brand-gradient-start))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              href="/"
              className="block w-full py-4 text-foreground bg-card/50 backdrop-blur-sm border-2 border-input rounded-2xl font-bold text-lg hover:bg-card hover:border-border transition-all active:scale-95"
            >
              Registrar otro
            </Link>
          </div>

          <p className="text-xs text-muted-foreground animate-fade-in-up [animation-delay:0.6s] opacity-0 [animation-fill-mode:forwards]">
            Sigue dándole duro, la constancia es la clave
          </p>
        </div>
      </main>
    </div>
  );
}
