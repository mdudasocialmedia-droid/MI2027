
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: { display_name: name.trim() },
          },
        });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (!data.user) {
        setError("No pudimos crear tu cuenta. Inténtalo de nuevo.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error de conexión. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff7ed] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-xl border-4 border-[#f9a8d4]">
        <div className="text-center mb-7">
          <div className="text-5xl mb-3">🌈</div>
          <h1 className="text-4xl font-black text-[#ec4899]">Mi 2027</h1>
          <p className="mt-3 text-gray-600">
            ¡Tu mejor año empieza aquí!
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-5">
            <h2 className="text-2xl font-bold text-gray-800">
              ¡Revisa tu correo! 💌
            </h2>
            <p className="text-gray-600">
              Si se requiere confirmación, recibirás un enlace para
              verificar tu cuenta.
            </p>
            <Link
              href="/login"
              className="block rounded-2xl bg-[#ec4899] p-4 font-bold text-white"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Crear cuenta
            </h2>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="name" className="block font-semibold mb-2">
                  Tu nombre
                </label>
                <input
                  id="name"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border-2 border-pink-200 p-3"
                  placeholder="¿Cómo te llamas?"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-semibold mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border-2 border-pink-200 p-3"
                  placeholder="hola@ejemplo.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-semibold mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border-2 border-pink-200 p-3"
                  placeholder="Mínimo 8 caracteres"
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
                className="w-full rounded-2xl bg-[#ec4899] p-4 font-bold text-white disabled:opacity-60"
              >
                {loading ? "Creando cuenta..." : "Crear mi cuenta ✨"}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-bold text-pink-600">
                Iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
