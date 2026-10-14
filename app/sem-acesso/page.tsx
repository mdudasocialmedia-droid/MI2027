import Link from "next/link";
import { LockKeyhole, MoonStar } from "lucide-react";

export default function NoAccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#FFF9F0] px-5 py-12">
      <section className="w-full max-w-lg rounded-[36px] border border-white bg-white/90 p-8 text-center shadow-soft sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] bg-gradient-to-br from-violet to-coral text-white shadow-soft"><MoonStar size={32} fill="currentColor" /></span>
        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-coral/10 px-4 py-2 text-sm font-bold text-coral"><LockKeyhole size={16} /> Acceso restringido</div>
        <h1 className="mt-5 font-display text-3xl font-extrabold text-navy">Luna Planner</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Tu cuenta no tiene acceso a Luna Planner.</p>
        <Link href="/login" className="mt-7 inline-flex rounded-2xl bg-violet px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2">Volver a iniciar sesión</Link>
      </section>
    </main>
  );
}
