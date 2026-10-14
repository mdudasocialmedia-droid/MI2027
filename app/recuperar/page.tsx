
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleRecover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: recoverError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/redefinir`,
          }
        );

      if (recoverError) {
        setError("No pudimos enviar el correo. Inténtalo de nuevo.");
        return;
      }

      setSent(true);
    } catch {
      setError("Error de conexión. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f3e8ff_0,transparent_38%),radial-gradient(circle_at_bottom_right,#ffe4e6_0,transparent_42%)] bg-[#FFF9F0] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[32px] border border-white/90 bg-white/90 p-8 shadow-[0_24px_70px_rgba(121,84,246,.14)] backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💌</div>
          <h1 className="text-4xl font-black text-[#ec4899]">
            Luna Planner
          </h1>
          <p className="mt-3 text-gray-600">
            ¡Siempre hay una nueva oportunidad!
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-5">
            <h2 className="text-2xl font-bold text-gray-800">
              ¡Revisa tu correo! ✨
            </h2>

            <p className="text-gray-600">
              Si existe una cuenta con ese correo,
              recibirás un enlace para restablecer tu contraseña.
            </p>

            <Link
              href="/login"
              className="block rounded-2xl bg-[#ec4899] p-4 font-bold text-white"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              ¿Olvidaste tu contraseña?
            </h2>

            <p className="text-center text-gray-600 mb-7">
              No te preocupes. Escribe tu correo y
              te ayudaremos a recuperar el acceso.
            </p>

            <form onSubmit={handleRecover} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block font-semibold mb-2 text-gray-700"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border-2 border-pink-200 p-3 text-gray-900 focus:outline-none focus:border-pink-500"
                  placeholder="hola@ejemplo.com"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-[#7954F6] to-[#ec4899] p-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading
                  ? "Enviando..."
                  : "Enviar enlace de recuperación 💌"}
              </button>
            </form>

            <p className="mt-6 text-center">
              <Link
                href="/login"
                className="font-bold text-pink-600 hover:underline"
              >
                ← Volver a iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
