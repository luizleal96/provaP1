"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lead = { id: string; name: string; company: string; segment: string; score: number | null; classification: string | null; message: string; reply: string | null };

const sampleLeads: Lead[] = [
  { id: "1", name: "Marina Costa", company: "Orbe Contabilidade", segment: "Serviços", score: 92, classification: "Quente", message: "Precisamos automatizar nosso atendimento.", reply: "Posso te mostrar como o LeadScore IA pode organizar esse atendimento?" },
  { id: "2", name: "Rafael Nunes", company: "Nunes & Filhos", segment: "Varejo", score: 64, classification: "Morno", message: "Estou pesquisando ferramentas para o próximo trimestre.", reply: "Quer receber um comparativo de opções para o próximo trimestre?" },
  { id: "3", name: "Bianca Alves", company: "Estúdio Norte", segment: "Marketing", score: 31, classification: "Frio", message: "Vi o conteúdo de vocês e achei interessante.", reply: "Posso te enviar um material rápido sobre qualificação de leads?" },
];

export default function PanelPage() {
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);
  const [databaseStatus, setDatabaseStatus] = useState("Verificando banco...");

  useEffect(() => {
    fetch("/api/analisar")
      .then((response) => response.json() as Promise<{ leads?: Lead[]; persisted?: boolean }>)
      .then((data) => {
        if (data.persisted && data.leads) {
          setLeads(data.leads);
          setDatabaseStatus("Dados carregados do NeonDB");
        } else {
          setDatabaseStatus("Modo demonstração: configure o NeonDB");
        }
      })
      .catch(() => setDatabaseStatus("Não foi possível consultar o NeonDB"));
  }, []);

  return (
    <main className="min-h-screen bg-[var(--paper)] px-6 py-8 text-[var(--ink)] lg:px-10">
      <header className="mx-auto flex max-w-5xl items-center justify-between border-b border-slate-200 pb-6"><Link href="/" className="text-lg font-bold">LeadScore <i className="not-italic text-[var(--mint)]">IA</i></Link><Link href="/" className="rounded-full bg-[var(--ink)] px-4 py-2 font-sans text-sm text-white">+ Captar lead</Link></header>
      <section className="mx-auto max-w-5xl py-12"><p className="font-sans text-xs font-bold uppercase tracking-[.2em] text-[var(--coral)]">visão geral</p><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="mt-2 text-5xl font-bold">Seus leads</h1><p className="mt-2 font-sans text-sm text-slate-500">{databaseStatus}</p></div><p className="font-sans text-sm text-slate-500">{leads.length} contatos analisados</p></div><div className="mt-8 space-y-4">{leads.map((lead) => <article key={lead.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">{lead.name}</h2><p className="font-sans text-sm text-slate-500">{lead.company} · {lead.segment}</p></div><div className="flex items-center gap-3 font-sans"><span className={`rounded-full px-3 py-1 text-xs font-bold ${lead.classification === "Quente" || lead.classification === "quente" ? "bg-red-100 text-red-700" : lead.classification === "Morno" || lead.classification === "morno" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{lead.classification ?? "Sem análise"}</span><strong className="text-3xl">{lead.score ?? "-"}</strong></div></div><p className="mt-5 text-slate-600">{lead.message}</p><div className="mt-5 border-t border-slate-100 pt-4"><p className="font-sans text-xs font-bold uppercase tracking-wider text-slate-400">Resposta sugerida</p><p className="mt-2 text-slate-700">{lead.reply ?? "Análise pendente"}</p></div></article>)}</div></section>
    </main>
  );
}