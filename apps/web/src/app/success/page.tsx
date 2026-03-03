"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 dark:bg-black font-sans flex items-center justify-center">
      <main className="w-full max-w-lg space-y-8 text-center px-4">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            ¡Set Guardado!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            ¿Qué sigue?
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Link
            href="/"
            className="block w-full py-4 px-6 bg-zinc-900 text-zinc-50 rounded-2xl font-semibold hover:bg-zinc-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-200 dark:shadow-none"
          >
            Registrar otro ejercicio
          </Link>

          <Link
            href="#"
            className="block w-full py-4 px-6 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-semibold hover:bg-zinc-50 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/50"
          >
            Ver resumen del día
          </Link>
        </div>
      </main>
    </div>
  );
}
