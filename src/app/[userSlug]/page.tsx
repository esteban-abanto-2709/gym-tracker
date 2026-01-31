"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { routes } from "@/lib/routes";

export default function UserHomePage() {
  const params = useParams();
  const userSlug = params.userSlug as string;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              var(--color-foreground) 35px,
              var(--color-foreground) 40px
            )`,
          }}
        />
      </div>

      {/* Gradient Orb */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full opacity-15 blur-3xl"
        style={{
          background: `radial-gradient(circle, hsl(var(--brand-gradient-start)), hsl(var(--brand-gradient-end)))`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href={routes.home} className="group">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">
              <span className="bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] bg-clip-text text-transparent">
                GYM
              </span>
              <span className="text-foreground">TRACK</span>
            </h1>
          </Link>

          {/* User Menu Placeholder */}
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base flex items-center justify-center hover:scale-110 transition-transform">
            {userSlug.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">
              Bienvenido de vuelta
            </h2>
            <p className="text-base md:text-xl text-muted-foreground">
              ¿Qué quieres hacer hoy?
            </p>
          </div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Tracker Card */}
            <Link href={routes.tracker(userSlug)} className="group relative">
              <div
                className="relative bg-card border-2 border-border rounded-3xl p-8 md:p-10 overflow-hidden transition-all duration-500 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon */}
                <div className="relative mb-6 md:mb-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 group-hover:text-primary transition-colors">
                    Tracker
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                    Registra tu entrenamiento en tiempo real. Rápido, simple y
                    optimizado para usar en el gym.
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs md:text-sm text-foreground">
                        Registro ultra-rápido
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs md:text-sm text-foreground">
                        Optimizado para mobile
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs md:text-sm text-foreground">
                        Sin distracciones
                      </span>
                    </li>
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm md:text-base group-hover:gap-4 transition-all">
                    Ir al Tracker
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Dashboard Card */}
            <Link href={routes.dashboard(userSlug)} className="group relative">
              <div
                className="relative bg-card border-2 border-border rounded-3xl p-8 md:p-10 overflow-hidden transition-all duration-500 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon */}
                <div className="relative mb-6 md:mb-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 group-hover:text-primary transition-colors">
                    Dashboard
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                    Analiza tu progreso, visualiza estadísticas y descubre
                    patrones en tu entrenamiento.
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs md:text-sm text-foreground">
                        Estadísticas detalladas
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs md:text-sm text-foreground">
                        Gráficos de progreso
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs md:text-sm text-foreground">
                        Historial completo
                      </span>
                    </li>
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm md:text-base group-hover:gap-4 transition-all">
                    Ver Dashboard
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Stats Preview (Optional - can be added later) */}
          <div
            className="mt-12 md:mt-16 text-center animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="text-xs md:text-sm text-muted-foreground">
              Esta semana:{" "}
              <span className="font-semibold text-foreground">
                3 entrenamientos
              </span>{" "}
              • <span className="font-semibold text-foreground">45 series</span>{" "}
              • <span className="font-semibold text-foreground">1,200 kg</span>{" "}
              volumen total
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
