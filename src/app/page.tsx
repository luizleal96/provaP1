"use client";

import { FormEvent, useMemo, useState } from "react";

type Classification = "quente" | "morno" | "frio";
type Lead = { id: string; name: string; company: string; segment: string; message: string; score: number; classification: Classification; reason: string; reply: string; createdAt: string };

const initialLeads: Lead[] = [
  { id: "1", name: "Marina Costa", company: "Orbe Contabilidade", segment: "Serviços", message: "Precisamos automatizar nosso atendimento e gostaria de entender os planos.", score: 92, classification: "quente", reason: "Demonstrou necessidade clara e intenção de conhecer a solução.", reply: "Oi, Marina! Posso te mostrar como o LeadScore IA pode organizar esse atendimento. Você tem 20 minutos esta semana?", createdAt: "Hoje, 09:42" },
  { id: "2", name: "Rafael Nunes", company: "Nunes & Filhos", segment: "Varejo", message: "Estou pesquisando ferramentas para o próximo trimestre.", score: 64, classification: "morno", reason: "Existe interesse, mas a decisão ainda está em fase de pesquisa.", reply: "Olá, Rafael! Separei algumas opções que podem ajudar no próximo trimestre. Quer receber um comparativo?", createdAt: "Ontem, 16:18" },
  { id: "3", name: "Bianca Alves", company: "Estúdio Norte", segment: "Marketing", message: "Vi o conteúdo de vocês e achei interessante.", score: 31, classification: "frio", reason: "Contato inicial sem urgência ou pedido de próximo passo.", reply: "Oi, Bianca! Obrigado por acompanhar nosso conteúdo. Posso te enviar um material rápido sobre qualificação de leads?", createdAt: "Ontem, 11:05" },
];

const classificationLabel: Record<Classification, string> = { quente: "Quente", morno: "Morno", frio: "Frio" };

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeView, setActiveView] = useState<"captar" | "painel">("captar");
  const [submitted, setSubmitted] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => ({ total: leads.length, hot: leads.filter((lead) => lead.classification === "quente").length, average: Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length) }), [leads]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/analisar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const created = (await response.json()) as Lead;
    setLeads((current) => [created, ...current]);
    setSubmitted(created);
    setIsSubmitting(false);
    formElement.reset();
  }

  function copyReply(reply: string) {
    navigator.clipboard.writeText(reply).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); });
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <button onClick={() => setActiveView("captar")} className="flex items-center gap-3 text-left"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--ink)] text-lg font-bold text-[var(--mint)]">LS</span><span><strong className="block text-lg leading-none">LeadScore <i className="not-italic text-[var(--mint)]">IA</i></strong><small className="font-sans text-[10px] uppercase tracking-[.24em] text-[var(--muted)]">inteligência para vender melhor</small></span></button>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 p-1 font-sans text-sm"><button onClick={() => setActiveView("captar")} className={`rounded-full px-4 py-2 transition ${activeView === "captar" ? "bg-[var(--ink)] text-white" : "text-slate-500"}`}>Captar lead</button><a href="/painel" className={`rounded-full px-4 py-2 transition ${activeView === "painel" ? "bg-[var(--ink)] text-white" : "text-slate-500"}`}>Painel <span className="ml-1 text-[var(--mint)]">{stats.total}</span></a></div>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-10 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:pt-20">
        <section className="relative"><div className="pointer-events-none absolute -left-40 -top-24 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" /><p className="relative mb-5 font-sans text-xs font-bold uppercase tracking-[.28em] text-[var(--coral)]">qualificador inteligente de leads</p><h1 className="relative max-w-xl text-6xl font-bold leading-[.95] tracking-tight md:text-8xl">Fale com quem está <span className="text-[var(--mint)]">pronto.</span></h1><p className="relative mt-7 max-w-md text-xl leading-relaxed text-slate-600">A IA lê cada contato, encontra a oportunidade e entrega o próximo passo para o seu time.</p><div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-slate-300 pt-5 font-sans"><div><b className="text-2xl">{stats.total}</b><small className="mt-1 block text-xs text-slate-500">leads captados</small></div><div><b className="text-2xl text-[var(--coral)]">{stats.hot}</b><small className="mt-1 block text-xs text-slate-500">prioridade alta</small></div><div><b className="text-2xl text-[var(--mint)]">{stats.average}</b><small className="mt-1 block text-xs text-slate-500">score médio</small></div></div></section>

        {activeView === "captar" ? <section className="relative rounded-[2rem] bg-[var(--ink)] p-7 text-white shadow-2xl shadow-slate-300/40 md:p-10"><div className="mb-8 flex items-start justify-between"><div><p className="font-sans text-xs uppercase tracking-[.2em] text-[var(--mint)]">novo contato</p><h2 className="mt-2 text-3xl font-bold">Quem quer falar com você?</h2></div><span className="rounded-full border border-white/20 px-3 py-1 font-sans text-xs text-slate-300">01 / 02</span></div><form onSubmit={handleSubmit} className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><label>Nome<input required name="name" placeholder="Ex.: Marina Costa" /></label><label>E-mail<input required type="email" name="email" placeholder="marina@empresa.com" /></label></div><div className="grid gap-5 md:grid-cols-2"><label>Empresa<input required name="company" placeholder="Nome da empresa" /></label><label>Segmento<select name="segment" defaultValue="Serviços"><option>Serviços</option><option>Varejo</option><option>Tecnologia</option><option>Indústria</option><option>Outro</option></select></label></div><label>O que essa pessoa procura?<textarea required name="message" rows={4} placeholder="Conte um pouco sobre a necessidade do lead..." /></label><button disabled={isSubmitting} className="group flex w-full items-center justify-between rounded-xl bg-[var(--mint)] px-5 py-4 font-sans font-bold text-[var(--ink)] transition hover:bg-white disabled:opacity-60"><span>{isSubmitting ? "Analisando contato..." : "Captar e analisar lead"}</span><span className="text-xl transition group-hover:translate-x-1">↗</span></button></form>{submitted && <div className="mt-5 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4 font-sans text-sm"><strong className="text-[var(--mint)]">Lead analisado: {classificationLabel[submitted.classification]}</strong><p className="mt-1 text-slate-300">Score {submitted.score}/100. Veja a recomendação no painel.</p></div>}</section> : <section className="lg:col-span-1"><div className="mb-7 flex items-end justify-between"><div><p className="font-sans text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">visão geral</p><h2 className="mt-2 text-4xl font-bold">Seus leads</h2></div><span className="font-sans text-sm text-slate-500">mais recentes primeiro</span></div><div className="space-y-4">{leads.map((lead) => <article key={lead.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-bold">{lead.name}</h3><p className="font-sans text-sm text-slate-500">{lead.company} · {lead.segment}</p></div><div className="flex items-center gap-3 font-sans"><span className={`rounded-full px-3 py-1 text-xs font-bold ${lead.classification === "quente" ? "bg-red-100 text-red-700" : lead.classification === "morno" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{classificationLabel[lead.classification]}</span><strong className="text-2xl">{lead.score}</strong></div></div><p className="mt-4 text-slate-600">{lead.message}</p><div className="mt-4 border-t border-slate-100 pt-4"><div className="flex items-center justify-between gap-3 font-sans text-xs uppercase tracking-wider text-slate-400"><span>Resposta sugerida</span><button onClick={() => copyReply(lead.reply)} className="font-bold text-[var(--mint)]">{copied ? "Copiado" : "Copiar"}</button></div><p className="mt-2 text-sm leading-relaxed text-slate-700">{lead.reply}</p></div></article>)}</div></section>}
      </div>
      <footer className="mx-auto flex max-w-7xl justify-between border-t border-slate-200 px-6 py-6 font-sans text-xs text-slate-400 lg:px-10"><span>LeadScore IA · FAETERJ Barra Mansa</span><span>OpenAI API · NeonDB · Next.js</span></footer>
    </main>
  );
}
