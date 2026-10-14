
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";

export default function RedefinirPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
          setError("");
        }
      }
    );

    async function checkRecoveryLink() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setError("El enlace no es válido o ha caducado. Solicita uno nuevo.");
        } else {
          setReady(true);
        }
        return;
      }

      // Em links com tokens no fragmento, o cliente Supabase
      // pode processar a sessão e emitir PASSWORD_RECOVERY.
      // Não habilitamos a troca de senha apenas por haver
      // uma sessão normal de login.
      setTimeout(() => {
        setError((current) =>
          current || "Si el enlace no funciona, solicita uno nuevo."
        );
      }, 2500);
    }

    void checkRecoveryLink();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!ready) {
      setError("Abre el enlace de recuperación enviado a tu correo.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError("No pudimos cambiar tu contraseña. Solicita otro enlace.");
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f3e8ff_0,transparent_38%),radial-gradient(circle_at_bottom_right,#ffe4e6_0,transparent_42%)] bg-[#FFF9F0] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[32px] border border-white/90 bg-white/90 p-8 shadow-[0_24px_70px_rgba(121,84,246,.14)] backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-4xl font-black text-[#ec4899]">
            Luna Planner
          </h1>
          <p className="mt-3 text-gray-600">
            ¡Un nuevo comienzo!
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-5">
            <h2 className="text-2xl font-bold text-gray-800">
              ¡Contraseña actualizada! 🎉
            </h2>
            <p className="text-gray-600">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link
              href="/login"
              className="block rounded-2xl bg-[#ec4899] p-4 font-bold text-white"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Crear nueva contraseña
            </h2>

            {ready ? (
              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block font-semibold mb-2">
                    Nueva contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border-2 border-pink-200 p-3"
                  />
                </div>

                <div>
                  <label htmlFor="confirm" className="block font-semibold mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border-2 border-pink-200 p-3"
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
                  {loading ? "Guardando..." : "Guardar nueva contraseña ✨"}
                </button>
              </form>
            ) : (
              <p className="text-center text-gray-600">
                Verificando tu enlace de recuperación...
              </p>
            )}

            {!ready && error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <p className="mt-6 text-center">
              <Link href="/recuperar" className="font-bold text-pink-600">
                Solicitar otro enlace
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
