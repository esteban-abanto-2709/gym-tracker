import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            hsl(var(--foreground)) 35px,
            hsl(var(--foreground)) 36px
          )`
        }} />
      </div>

      {/* Gradient Orb */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{
          background: `radial-gradient(circle, hsl(var(--brand-gradient-start)), hsl(var(--brand-gradient-end)))`
        }} />

      <div className="w-full max-w-md mx-auto px-6 relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Link href="/" className="inline-block mb-6 group">
            <h1 className="text-4xl font-bold tracking-tighter">
              <span className="bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] bg-clip-text text-transparent">
                GYM
              </span>
              <span className="text-foreground">TRACK</span>
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-foreground mb-2">Crea tu cuenta</h2>
          <p className="text-muted-foreground">Comienza tu viaje de transformación</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl animate-scale-in">
          <form className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground block">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder="Juan Pérez"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground block">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground block">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-foreground block">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 w-4 h-4 border-input rounded focus:ring-2 focus:ring-ring"
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                Acepto los términos y condiciones de servicio
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.02]"
            >
              Crear cuenta
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">O continúa con</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="py-3 px-4 border border-border rounded-lg font-medium text-sm transition-all hover:bg-muted hover:border-primary"
            >
              Google
            </button>
            <button
              type="button"
              className="py-3 px-4 border border-border rounded-lg font-medium text-sm transition-all hover:bg-muted hover:border-primary"
            >
              GitHub
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
