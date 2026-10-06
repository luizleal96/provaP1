import { neon } from "@neondatabase/serverless";

let schemaReady: Promise<void> | undefined;

export function getDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function ensureSchema() {
  if (schemaReady) return schemaReady;
  const sql = getDatabase();
  if (!sql) return;

  schemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        empresa TEXT,
        segmento TEXT,
        mensagem TEXT NOT NULL,
        origem TEXT DEFAULT 'site',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS analises (
        id UUID PRIMARY KEY,
        lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        score INT CHECK (score BETWEEN 0 AND 100),
        classificacao TEXT CHECK (classificacao IN ('quente','morno','frio')),
        justificativa TEXT,
        resposta_sugerida TEXT,
        modelo TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
  })();

  try {
    await schemaReady;
  } catch (error) {
    schemaReady = undefined;
    throw error;
  }
}
