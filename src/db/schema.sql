CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  empresa TEXT,
  segmento TEXT,
  mensagem TEXT NOT NULL,
  origem TEXT DEFAULT 'site',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE analises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  score INT CHECK (score BETWEEN 0 AND 100),
  classificacao TEXT CHECK (classificacao IN ('quente','morno','frio')),
  justificativa TEXT,
  resposta_sugerida TEXT,
  modelo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
