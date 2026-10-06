import { NextResponse } from "next/server";
import { ensureSchema, getDatabase } from "@/db";

type Classification = "quente" | "morno" | "frio";
type LeadAnalysis = { score: number; classification: Classification; reason: string; reply: string };

type OpenAIResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

function classify(message: string): LeadAnalysis {
  const text = message.toLowerCase();
  const intent = ["preciso", "quero", "gostaria", "preço", "contratar", "urgente"].some((word) => text.includes(word));
  const score = intent ? 78 : text.length > 70 ? 62 : 36;
  const classification: Classification = score >= 75 ? "quente" : score >= 50 ? "morno" : "frio";
  return { score, classification, reason: intent ? "Demonstrou intenção clara de avançar e descreveu uma necessidade concreta." : "O contato ainda está em descoberta e precisa de uma abordagem educativa.", reply: classification === "quente" ? "Olá! Obrigado por compartilhar sua necessidade. Posso te mostrar como a solução funciona e entender o melhor próximo passo?" : "Olá! Obrigado pelo contato. Posso te enviar um material rápido para mostrar como ajudamos empresas com esse desafio?" };
}

async function analyzeWithOpenAI(body: { name: string; company: string; segment?: string; message: string }): Promise<LeadAnalysis> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Você é especialista em vendas B2B para pequenas empresas. Analise o lead e responda somente JSON válido com as chaves score (número de 0 a 100), classification (somente quente, morno ou frio), reason (string curta) e reply (resposta profissional em português)." },
        { role: "user", content: JSON.stringify({ nome: body.name, empresa: body.company, segmento: body.segment, mensagem: body.message }) },
      ],
    }),
  });

  if (!response.ok) throw new Error(`OpenAI respondeu com status ${response.status}`);
  const data = (await response.json()) as OpenAIResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("A OpenAI não retornou uma análise.");
  const analysis = JSON.parse(content) as Partial<LeadAnalysis>;
  if (typeof analysis.score !== "number" || !analysis.classification || !analysis.reason || !analysis.reply || !["quente", "morno", "frio"].includes(analysis.classification)) throw new Error("Formato de análise inválido.");
  return { score: Math.max(0, Math.min(100, Math.round(analysis.score))), classification: analysis.classification, reason: analysis.reason, reply: analysis.reply };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; email?: string; company?: string; segment?: string; message?: string };
  if (!body.name || !body.email || !body.company || !body.message) return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });
  try {
    let usingOpenAI = Boolean(process.env.OPENAI_API_KEY);
    let analysis: LeadAnalysis;
    if (usingOpenAI) {
      try {
        analysis = await analyzeWithOpenAI({ name: body.name, company: body.company, segment: body.segment, message: body.message });
      } catch (error) {
        console.error("OpenAI indisponível; usando análise local:", error);
        usingOpenAI = false;
        analysis = classify(body.message);
      }
    } else {
      analysis = classify(body.message);
    }
    const leadId = crypto.randomUUID();
    const analysisId = crypto.randomUUID();
    const sql = getDatabase();

    if (sql) {
      await ensureSchema();
      await sql`
        INSERT INTO leads (id, nome, email, empresa, segmento, mensagem, origem)
        VALUES (${leadId}, ${body.name}, ${body.email}, ${body.company}, ${body.segment ?? "Outro"}, ${body.message}, 'site')
      `;
      await sql`
        INSERT INTO analises (id, lead_id, score, classificacao, justificativa, resposta_sugerida, modelo)
        VALUES (${analysisId}, ${leadId}, ${analysis.score}, ${analysis.classification}, ${analysis.reason}, ${analysis.reply}, ${usingOpenAI ? "gpt-4o-mini" : "fallback-local"})
      `;
    }

    return NextResponse.json({ id: leadId, analysisId, name: body.name, email: body.email, company: body.company, segment: body.segment ?? "Outro", message: body.message, ...analysis, createdAt: "Agora", persisted: Boolean(sql) });
  } catch (error) {
    console.error("Falha ao analisar lead:", error);
    return NextResponse.json({ error: "Não foi possível analisar o lead agora." }, { status: 502 });
  }
}

export async function GET() {
  const sql = getDatabase();
  if (!sql) return NextResponse.json({ leads: [], persisted: false });

  try {
    await ensureSchema();
    const leads = await sql`
      SELECT
        l.id,
        l.nome AS name,
        l.email,
        l.empresa AS company,
        l.segmento AS segment,
        l.mensagem AS message,
        a.score,
        a.classificacao AS classification,
        a.justificativa AS reason,
        a.resposta_sugerida AS reply,
        l.created_at AS "createdAt"
      FROM leads l
      LEFT JOIN LATERAL (
        SELECT score, classificacao, justificativa, resposta_sugerida
        FROM analises
        WHERE lead_id = l.id
        ORDER BY created_at DESC
        LIMIT 1
      ) a ON true
      ORDER BY l.created_at DESC
    `;
    return NextResponse.json({ leads, persisted: true });
  } catch (error) {
    console.error("Falha ao carregar leads:", error);
    return NextResponse.json({ error: "Não foi possível carregar os leads." }, { status: 503 });
  }
}
