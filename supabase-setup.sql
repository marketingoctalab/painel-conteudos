-- ============================================================
-- Setup do Supabase para o Painel de Conteúdos
-- Cole tudo isso no Supabase → SQL Editor → New query → Run
-- ============================================================

-- Tabela de avaliações (1 linha por conteúdo, id = "marca-indice", ex: "juspilot-0")
create table if not exists reviews (
  id text primary key,
  status text not null default 'pending',   -- pending | approved | reproved
  suggestion text default '',
  updated_at timestamptz not null default now()
);

-- Acesso livre (sem login): habilita RLS e libera leitura/escrita pública
alter table reviews enable row level security;

create policy "leitura publica"  on reviews for select using (true);
create policy "insert publico"   on reviews for insert with check (true);
create policy "update publico"   on reviews for update using (true) with check (true);

-- Sincronização em tempo real entre dispositivos
alter publication supabase_realtime add table reviews;
