import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              var(--color-foreground) 35px,
              var(--color-foreground) 36px
            )`,
            }}
          />
        </div>

        {/* Gradient Orb */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, hsl(var(--brand-gradient-start)), hsl(var(--brand-gradient-end)))`,
          }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo/Brand */}
            <div
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="inline-block">
                <h1 className="text-7xl md:text-8xl font-bold tracking-tighter">
                  <span className="bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] bg-clip-text text-transparent">
                    GYM
                  </span>
                  <span className="text-foreground">TRACK</span>
                </h1>
              </div>
            </div>

            {/* Tagline */}
            <div
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: "0.3s" }}
            >
              <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
                Tu entrenamiento evoluciona. <br className="hidden md:block" />
                <span className="text-foreground font-medium">
                  La app que aprende de ti.
                </span>
              </p>
            </div>

            {/* Description */}
            <div
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: "0.5s" }}
            >
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Registra cada ejercicio, cada serie, cada progreso. GymTrack
                analiza tus patrones y te sugiere los entrenamientos perfectos
                para alcanzar tus objetivos.
              </p>
            </div>

            {/* CTA Buttons */}
            <div
              className="animate-fade-in-up opacity-0 flex flex-col sm:flex-row gap-4 justify-center pt-4"
              style={{ animationDelay: "0.7s" }}
            >
              <Link
                href="/register"
                className="group relative px-8 py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-lg font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50 hover:scale-105"
              >
                <span className="relative z-10">Comenzar ahora</span>
                <div className="absolute inset-0 bg-linear-to-r from-[hsl(var(--brand-gradient-end))] to-[hsl(var(--brand-gradient-start))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <Link
                href="/login"
                className="px-8 py-4 border-2 border-border text-foreground rounded-lg font-semibold text-lg transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-lg hover:scale-105"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-muted-foreground rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface-elevated">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Entrena más <span className="text-primary">inteligente</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Una herramienta diseñada para adaptarse a tu evolución
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 bg-card rounded-2xl border border-border transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1">
                <div className="w-12 h-12 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-primary-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Registro completo</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Documenta cada ejercicio con series, repeticiones, peso y
                  notas. Tu historial siempre disponible.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 bg-card rounded-2xl border border-border transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1">
                <div className="w-12 h-12 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-primary-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">IA que aprende</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Próximamente: recomendaciones personalizadas basadas en tus
                  patrones y preferencias de entrenamiento.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 bg-card rounded-2xl border border-border transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1">
                <div className="w-12 h-12 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-primary-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Progreso visible</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visualiza tu evolución con estadísticas detalladas y gráficos
                  que muestran tu mejora constante.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Diseñado para <span className="text-primary">deportistas</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Simple de usar, poderoso en resultados
              </p>
            </div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="shrink-0 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">
                    Registra tu entrenamiento
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Anota cada ejercicio que realizas, con las series,
                    repeticiones y peso que usaste.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="shrink-0 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">
                    La app analiza tus datos
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    GymTrack identifica patrones: qué grupos musculares trabajas
                    más, cuándo descansas, cómo progresas.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="shrink-0 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">
                    Recibe sugerencias personalizadas
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    &quot;Hace tiempo que no entrenas pierna. Te sugerimos estos
                    ejercicios que sueles hacer...&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 40px,
              var(--color-primary-foreground) 40px,
              var(--color-primary-foreground) 41px
            )`,
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Comienza tu transformación hoy
            </h2>
            <p className="text-xl opacity-90">
              Únete a GymTrack y lleva tu entrenamiento al siguiente nivel
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-background text-primary rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-opacity-90 hover:shadow-2xl hover:scale-105"
              >
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-surface-elevated border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              © 2026 GymTrack. Construido para deportistas que buscan
              evolucionar.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
