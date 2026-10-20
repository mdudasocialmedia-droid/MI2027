"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, Heart, LockKeyhole, Moon, Pause, Play, Sparkles, Target, Trophy, WalletCards } from "lucide-react";
import { LanguageSelector, useI18n } from "@/components/i18n-provider";

const checkoutUrl = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL ?? "https://pay.hotmart.com/T108034838B?off=fid256qe";
// The checkout URL can be configured without making sales public by accident.
// Sales open only through this explicit, production-only flag.
const salesEnabled = process.env.NEXT_PUBLIC_LUNA_SALES_ENABLED === "true";
const moduleIcons = [CalendarDays, Heart, Target, WalletCards, Moon, Trophy];

const content = {
  "pt-PT": {
    tag: "Luna Planner + presente digital", price: "9,90 €", priceNote: "Pagamento único · 365 dias de acesso",
    title: <>Planeia a tua vida.<br/><em>Sem deixares de a viver.</em></>,
    lead: "Agenda, hábitos, objetivos, dinheiro e um espaço só teu — numa experiência simples, bonita e feita para o teu ritmo.",
    cta: "Quero a Luna Planner", locked: "Compra disponível em breve", inside: "Vê a Luna por dentro",
    moduleNames: ["Agenda", "Hábitos", "Objetivos", "Finanças", "Diário", "Conquistas"],
    moduleCopy: ["Vê a tua semana e dá prioridade ao que importa.", "Transforma pequenos gestos numa rotina que te acompanha.", "Divide aquilo que queres em passos possíveis.", "Regista movimentos e toma decisões com mais clareza.", "Guarda os teus pensamentos num espaço pessoal.", "Reconhece os avanços que vais construindo."],
    bundleTag: "Incluído com a Luna", bundleTitle: "Um plano para o dia a dia. Um guia para começares.",
    bundleText: "Recebes a Luna Planner com acesso durante 365 dias e o guia digital “21 Dias para uma Vida Mais Leve” quando a entrega estiver validada após uma compra válida.",
    guide: "21 Dias para uma Vida Mais Leve", guideSub: "Organização, dinheiro e autocuidado em pequenos passos.",
    howTag: "Sem complicar", howTitle: "Começa com espaço para respirar.",
    steps: [["Escolhe a Luna", "A oferta ficará disponível assim que o acesso e o presente estiverem validados."], ["Cria a tua conta", "Receberás as instruções no fluxo de compra."], ["Faz da Luna tua", "Começa por uma rotina, uma meta ou um momento para ti."]],
    offerTag: "A tua nova rotina começa aqui", offerTitle: "Tudo o que precisas para te organizares com mais leveza.",
    availability: "A compra está temporariamente indisponível enquanto validamos o acesso e a entrega do presente.",
    faqTitle: "Antes de começares", finalTitle: "Um plano mais leve pode começar hoje.",
    faq: [["O que está incluído?", "A Luna Planner reúne agenda, hábitos, objetivos, finanças, diário e conquistas, com 365 dias de acesso."], ["Como recebo o guia de 21 dias?", "O guia será entregue após uma compra válida, assim que o respetivo material e o processo de entrega estiverem finalizados."], ["Posso usar no telemóvel?", "Sim. A Luna foi pensada primeiro para uma utilização confortável no telemóvel e também funciona no computador."], ["O Diário sincroniza entre dispositivos?", "Não. Atualmente, o Diário é guardado localmente por utilizador e não é anunciado como sincronizado."], ["A compra está disponível?", "Ainda não. Os botões permanecem bloqueados até validarmos o acesso pós-compra e a entrega do presente."]],
    footer: "Uma vida mais leve começa com um plano."
  },
  "es-ES": {
    tag: "Luna Planner + regalo digital", price: "9,90 €", priceNote: "Pago único · 365 días de acceso",
    title: <>Planifica tu vida.<br/><em>Sin dejar de vivirla.</em></>,
    lead: "Agenda, hábitos, metas, dinero y un espacio solo para ti — en una experiencia sencilla, bonita y hecha a tu ritmo.",
    cta: "Quiero Luna Planner", locked: "Compra disponible pronto", inside: "Descubre Luna por dentro",
    moduleNames: ["Agenda", "Hábitos", "Metas", "Finanzas", "Diario", "Logros"],
    moduleCopy: ["Ve tu semana y prioriza lo que importa.", "Convierte pequeños gestos en una rutina que te acompaña.", "Divide lo que quieres en pasos posibles.", "Registra movimientos y decide con más claridad.", "Guarda tus pensamientos en un espacio personal.", "Reconoce los avances que vas construyendo."],
    bundleTag: "Incluido con Luna", bundleTitle: "Un plan para tu día a día. Una guía para empezar.",
    bundleText: "Recibes Luna Planner con acceso durante 365 días y la guía digital “21 Días para una Vida Más Ligera” cuando la entrega esté validada tras una compra válida.",
    guide: "21 Días para una Vida Más Ligera", guideSub: "Organización, dinero y autocuidado en pequeños pasos.",
    howTag: "Sin complicaciones", howTitle: "Empieza con espacio para respirar.",
    steps: [["Elige Luna", "La oferta estará disponible cuando el acceso y el regalo estén validados."], ["Crea tu cuenta", "Recibirás las instrucciones en el flujo de compra."], ["Haz de Luna tu espacio", "Empieza por una rutina, una meta o un momento para ti."]],
    offerTag: "Tu nueva rutina empieza aquí", offerTitle: "Todo lo que necesitas para organizarte con más calma.",
    availability: "La compra está temporalmente desactivada mientras validamos el acceso y la entrega del regalo.",
    faqTitle: "Antes de empezar", finalTitle: "Un plan más ligero puede empezar hoy.",
    faq: [["¿Qué incluye?", "Luna Planner reúne agenda, hábitos, metas, finanzas, diario y logros, con 365 días de acceso."], ["¿Cómo recibo la guía de 21 días?", "La guía se entregará tras una compra válida, cuando el material y el proceso de entrega estén finalizados."], ["¿Puedo usarlo en el móvil?", "Sí. Luna se ha diseñado primero para una experiencia cómoda en móvil y también funciona en ordenador."], ["¿El Diario se sincroniza entre dispositivos?", "No. Actualmente, el Diario se guarda localmente por persona y no se anuncia como sincronizado."], ["¿La compra está disponible?", "Todavía no. Los botones permanecen bloqueados hasta validar el acceso posterior a la compra y la entrega del regalo."]],
    footer: "Una vida más ligera empieza con un plan."
  }
} as const;

function CheckoutButton({ label, note }: { label: string; note: string }) {
  const noteId = useId();

  return <div className="luna-v2-cta" data-checkout-configured={String(Boolean(checkoutUrl))}>
    {salesEnabled ? (
      <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"><LockKeyhole size={17}/>{label}</a>
    ) : (
      <><button type="button" disabled aria-describedby={noteId}><LockKeyhole size={17}/>{label}</button><small id={noteId}>{note}</small></>
    )}
  </div>;
}

function ProductScreen({ active, labels, spanish }: { active: number; labels: readonly string[]; spanish: boolean }) {
  const Icon = moduleIcons[active];
  const accent = ["#f4c8d7", "#d7d0f7", "#f7dfb7", "#b9e2d7", "#ead1df", "#f5cb82"][active];
  const panel = spanish
    ? ["Plan de hoy", "Revisar prioridades", "Días de constancia", "Objetivo en progreso", "Resumen del mes", "Un momento para ti", "Una semana de constancia"]
    : ["Plano para hoje", "Rever prioridades", "Dias de consistência", "Objetivo em progresso", "Resumo do mês", "Um momento para ti", "Uma semana de constância"];
  return <div className="luna-v2-screen">
    <div className="screen-bar"><span><Moon size={14}/> luna</span><small>{spanish ? "Hola, Sofía" : "Olá, Sofia"}</small></div>
    <div className="screen-layout"><aside>{moduleIcons.map((Item, index) => <i key={index} className={active === index ? "selected" : ""}><Item size={15}/></i>)}</aside>
      <div className="screen-main"><p>{spanish ? "Tu espacio" : "O teu espaço"}</p><h3>{labels[active]}</h3>
        <div className="screen-feature" style={{ backgroundColor: accent }}><Icon size={25}/><strong>{active === 3 ? "1 240,00 €" : active === 2 ? "72%" : active === 1 ? "4 / 7" : active === 4 ? (spanish ? "Hoy agradezco…" : "Hoje agradeço…") : active === 5 ? "240 XP" : panel[0]}</strong><span>{active === 3 ? panel[4] : active === 2 ? panel[3] : active === 1 ? panel[2] : active === 4 ? panel[5] : active === 5 ? panel[6] : panel[1]}</span></div>
        <div className="screen-lines"><i/><i/><i/></div>
      </div>
    </div>
  </div>;
}

export default function LunaLanding() {
  const { locale } = useI18n();
  const c = content[locale];
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const touchStart = useRef<number | null>(null);
  const setModule = (next: number) => { setActive(next); setPlaying(false); };
  useEffect(() => {
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % c.moduleNames.length), 4200);
    return () => window.clearInterval(timer);
  }, [playing, c.moduleNames.length]);

  return <main className="luna-v2">
    <header className="luna-v2-nav"><Link href="/luna" className="luna-v2-brand"><Moon size={18}/>Luna Planner</Link><LanguageSelector compact /></header>
    <section className="luna-v2-hero">
      <div className="hero-orbit orbit-a"/><div className="hero-orbit orbit-b"/>
      <div className="luna-v2-hero-copy"><p className="luna-v2-tag"><Sparkles size={14}/>{c.tag}</p><h1>{c.title}</h1><p>{c.lead}</p>
        <div className="luna-v2-price"><strong>{c.price}</strong><span>{c.priceNote}</span></div><CheckoutButton label={c.cta} note={c.locked}/></div>
      <div className="luna-v2-hero-product"><div className="hero-moon">☾</div><div className="hero-phone"><ProductScreen active={0} labels={c.moduleNames} spanish={locale === "es-ES"}/></div><div className="hero-card"><span>✦</span><b>{c.guide}</b><small>{locale === "es-ES" ? "Incluido" : "Incluído"}</small></div></div>
    </section>
    <section className="luna-v2-modules" id="luna">
      <div className="luna-v2-heading"><p className="luna-v2-tag">{locale === "pt-PT" ? "Uma só experiência" : "Una sola experiencia"}</p><h2>{c.inside}</h2><p>{c.moduleCopy[active]}</p></div>
      <div className="module-picker" role="tablist">{c.moduleNames.map((name, index) => { const Icon = moduleIcons[index]; return <button key={name} role="tab" aria-selected={active === index} className={active === index ? "active" : ""} onClick={() => setModule(index)}><Icon size={16}/><span>{name}</span></button>; })}</div>
      <div className="module-demo" onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientX; }} onTouchEnd={(event) => { if (touchStart.current === null) return; const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 35) setModule((active + (distance < 0 ? 1 : c.moduleNames.length - 1)) % c.moduleNames.length); touchStart.current = null; }}>
        <ProductScreen active={active} labels={c.moduleNames} spanish={locale === "es-ES"}/><div className="module-caption"><span>0{active + 1}</span><div><b>{c.moduleNames[active]}</b><small>{c.moduleCopy[active]}</small></div><div className="module-controls"><button onClick={() => setModule((active + c.moduleNames.length - 1) % c.moduleNames.length)} aria-label="Anterior"><ArrowLeft size={17}/></button><button onClick={() => setPlaying(!playing)} aria-label={playing ? (locale === "es-ES" ? "Pausar" : "Pausar") : (locale === "es-ES" ? "Reproducir" : "Reproduzir")}>{playing ? <Pause size={16}/> : <Play size={16}/>}</button><button onClick={() => setModule((active + 1) % c.moduleNames.length)} aria-label={locale === "es-ES" ? "Siguiente" : "Seguinte"}><ArrowRight size={17}/></button></div></div>
      </div>
    </section>
    <section className="luna-v2-bundle">
      <div className="bundle-book"><Moon/><b>21</b><strong>{c.guide}</strong><small>Luna Planner</small></div>
      <div><p className="luna-v2-tag">{c.bundleTag}</p><h2>{c.bundleTitle}</h2><p>{c.bundleText}</p><div className="bundle-list"><span><Check size={16}/>{locale === "pt-PT" ? "Planner digital completo" : "Planner digital completo"}</span><span><Check size={16}/>{locale === "pt-PT" ? "Guia digital de 21 dias" : "Guía digital de 21 días"}</span><span><Check size={16}/>{c.priceNote}</span></div></div>
    </section>
    <section className="luna-v2-how"><p className="luna-v2-tag">{c.howTag}</p><h2>{c.howTitle}</h2><div>{c.steps.map(([title, text], index) => <article key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="luna-v2-offer"><div><p className="luna-v2-tag">{c.offerTag}</p><h2>{c.offerTitle}</h2><p>{c.availability}</p></div><aside><span>Luna Planner</span><strong>{c.price}</strong><small>{c.priceNote}</small><CheckoutButton label={c.cta} note={c.locked}/></aside></section>
    <section className="luna-v2-faq" id="faq"><p className="luna-v2-tag">FAQ</p><h2>{c.faqTitle}</h2><div>{c.faq.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={18}/></summary><p>{answer}</p></details>)}</div></section>
    <footer className="luna-v2-footer"><div className="luna-v2-brand"><Moon size={18}/>Luna Planner</div><p>{c.footer}</p></footer>
    <div className="luna-v2-sticky"><span><b>{c.price}</b><small>{c.priceNote}</small></span><CheckoutButton label={c.cta} note={c.locked}/></div>
  </main>;
}
