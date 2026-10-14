
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError("No pudimos iniciar sesión. Revisa tu correo y contraseña.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Ocurrió un error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f3e8ff_0,transparent_38%),radial-gradient(circle_at_bottom_right,#ffe4e6_0,transparent_42%)] bg-[#FFF9F0] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[32px] border border-white/90 bg-white/90 p-8 shadow-[0_24px_70px_rgba(121,84,246,.14)] backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌙</div>
          <h1 className="text-4xl font-black text-[#ec4899]">
            Luna Planner
          </h1>
          <p className="mt-3 text-gray-600">
            ¡Qué alegría tenerte aquí!
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Iniciar sesión
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block font-semibold mb-2 text-gray-700">
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

          <div>
            <label htmlFor="password" className="block font-semibold mb-2 text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border-2 border-pink-200 p-3 text-gray-900 focus:outline-none focus:border-pink-500"
              placeholder="Tu contraseña"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#7954F6] to-[#ec4899] p-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar a Luna Planner ✨"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p>
            <Link href="/recuperar" className="text-pink-600 font-semibold hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
          <p className="text-gray-600">
            ¿Todavía no tienes cuenta?{" "}
            <Link href="/registro" className="text-pink-600 font-bold hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
