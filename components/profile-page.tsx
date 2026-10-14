"use client";

import { Camera, ChevronLeft, LoaderCircle, LogOut, Save, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { LanguageSelector, useI18n } from "@/components/i18n-provider";
import { initials, maskEmail, useUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase";

export function ProfilePage() {
  const { profile, loading, profileStorageReady, saveDisplayName, uploadAvatar } = useUserProfile();
  const { locale } = useI18n();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { setName(profile?.displayName ?? ""); }, [profile?.displayName]);

  async function saveName(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const profileError = await saveDisplayName(name);
      setMessage(profileError ? "Tu nombre se guardó en la cuenta. Falta configurar la tabla profiles para sincronizarlo allí." : "Cambios guardados correctamente.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible guardar los cambios."); }
    finally { setSaving(false); }
  }

  async function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const profileError = await uploadAvatar(file);
      setMessage(profileError ? "La imagen se guardó en tu cuenta, pero falta configurar la tabla profiles." : "Fotografía de perfil actualizada.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible actualizar la fotografía."); }
    finally { setSaving(false); event.target.value = ""; }
  }

  async function signOut() {
    setSaving(true); setError("");
    const { error: signOutError } = await createClient().auth.signOut();
    if (signOutError) { setError(signOutError.message); setSaving(false); return; }
    window.location.assign("/login");
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#FFF9F0]"><LoaderCircle className="animate-spin text-violet" size={30} /></main>;
  if (!profile) return <main className="grid min-h-screen place-items-center bg-[#FFF9F0] p-6 text-center"><div><p className="font-display text-xl font-extrabold">Tu sesión ha terminado.</p><Link href="/login" className="mt-4 inline-flex rounded-2xl bg-violet px-5 py-3 text-sm font-bold text-white">Iniciar sesión</Link></div></main>;

  return <main className="min-h-screen bg-[#FFF9F0] px-4 py-7 sm:px-6 lg:px-10"><div className="mx-auto max-w-3xl"><Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.16em] text-violet"><ChevronLeft size={16} /> Volver al inicio</Link><header className="mt-5"><p className="text-xs font-bold uppercase tracking-[.17em] text-violet">Luna Planner</p><h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">Mi perfil</h1><p className="mt-2 text-sm text-slate-500">Personaliza cómo apareces en tu espacio.</p></header>
    <section className="card mt-7 p-5 sm:p-7"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="relative size-24 shrink-0 overflow-hidden rounded-[30px] bg-gradient-to-br from-violet to-coral ring-4 ring-white shadow-soft">{profile.avatarUrl ? <Image src={profile.avatarUrl} alt="Fotografía de perfil" fill sizes="96px" className="object-cover" unoptimized /> : <span className="grid h-full place-items-center text-2xl font-extrabold text-white">{initials(profile.displayName)}</span>}</div><div className="min-w-0 flex-1"><p className="font-display text-xl font-extrabold">{profile.displayName}</p><p className="mt-1 text-sm text-slate-500">{maskEmail(profile.email)}</p><label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-violet/15 bg-violet/5 px-4 py-2.5 text-sm font-bold text-violet transition hover:bg-violet/10"><Camera size={17} /> Cambiar fotografía<input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseAvatar} className="sr-only" disabled={saving} /></label><p className="mt-2 text-xs text-slate-400">JPG, PNG o WebP · máximo 2 MB</p></div></div></section>
    {!profileStorageReady && <p className="mt-4 rounded-2xl border border-yellow/50 bg-yellow/15 p-4 text-sm text-[#805A00]">La configuración de perfiles o fotografías aún no está disponible en Supabase. Revisa el script de configuración antes de intentar guardar una imagen.</p>}
    <section className="card mt-5 p-5 sm:p-7"><form onSubmit={saveName}><label className="block"><span className="text-sm font-bold">Nombre visible</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} className="field mt-2" autoComplete="name" /></label><div className="mt-5"><p className="text-sm font-bold">Correo electrónico</p><p className="mt-2 rounded-xl bg-[#FFFCF8] px-4 py-3 text-sm text-slate-500">{maskEmail(profile.email)}</p><p className="mt-2 text-xs text-slate-400">El correo está asociado a la cuenta y no se puede modificar desde esta pantalla.</p></div><div className="mt-5"><p className="mb-2 text-sm font-bold">Idioma preferido</p><LanguageSelector /><p className="mt-2 text-xs text-slate-400">Idioma actual: {locale === "pt-PT" ? "Português (Portugal)" : "Español (España)"}</p></div>{error && <p role="alert" className="mt-5 rounded-xl bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p>}{message && <p role="status" className="mt-5 rounded-xl bg-mint/20 p-3 text-sm font-semibold text-[#24896F]">{message}</p>}<button disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Save size={17} /> {saving ? "Guardando..." : "Guardar cambios"}</button></form></section>
    <section className="card mt-5 border border-coral/20 p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-lg font-extrabold">Cerrar sesión</h2><p className="mt-1 text-sm text-slate-500">Cerrarás la sesión de Luna Planner en este dispositivo.</p></div><button onClick={signOut} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-coral/30 px-5 py-3 text-sm font-bold text-coral hover:bg-coral/10 disabled:opacity-60"><LogOut size={17} /> Terminar sesión</button></div></section>
  </div></main>;
}
