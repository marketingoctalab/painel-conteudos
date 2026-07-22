-- ============================================================
-- Setup do Supabase para o Painel de Conteúdos
-- Cole tudo isso no Supabase → SQL Editor → New query → Run
-- ============================================================

-- Tabela de avaliações (1 linha por conteúdo, id = "marca-indice", ex: "juspilot-0")
create table if not exists reviews (
  id text primary key,
  status text not null default 'pending',   -- pending | approved | reproved
  suggestion text default '',
  reviewer text default '',                  -- quem aprovou/reprovou (ALEX, MARCOS, ...)
  updated_at timestamptz not null default now()
);

-- Para bancos já existentes: adiciona a coluna reviewer se ainda não houver
alter table reviews add column if not exists reviewer text default '';

-- Acesso livre (sem login): habilita RLS e libera leitura/escrita pública
alter table reviews enable row level security;

create policy "leitura publica"  on reviews for select using (true);
create policy "insert publico"   on reviews for insert with check (true);
create policy "update publico"   on reviews for update using (true) with check (true);

-- Sincronização em tempo real entre dispositivos
alter publication supabase_realtime add table reviews;


-- ============================================================
-- Tabela de agendamentos do calendário (id = "marca-indice")
-- ============================================================
create table if not exists schedule (
  id text primary key,
  date text,                                 -- 'YYYY-MM-DD' do dia agendado
  updated_at timestamptz not null default now()
);

alter table schedule enable row level security;

create policy "leitura publica"  on schedule for select using (true);
create policy "insert publico"   on schedule for insert with check (true);
create policy "update publico"   on schedule for update using (true) with check (true);
create policy "delete publico"   on schedule for delete using (true);

alter publication supabase_realtime add table schedule;


-- ============================================================
-- Criativos subidos pelo admin (id = "marca-indice")
-- urls = lista de URLs públicas no Storage; 1 = capa única, vários = carrossel
-- ============================================================
create table if not exists creatives (
  id text primary key,
  urls jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table creatives enable row level security;

create policy "leitura publica"  on creatives for select using (true);
create policy "insert publico"   on creatives for insert with check (true);
create policy "update publico"   on creatives for update using (true) with check (true);
create policy "delete publico"   on creatives for delete using (true);

alter publication supabase_realtime add table creatives;


-- ============================================================
-- Posts criados pelo admin (conteúdos avulsos por marca)
-- ============================================================
create table if not exists posts (
  id text primary key,
  brand text not null,
  headline text default '',
  subtitle text default '',
  caption text default '',
  kind text default 'estatico',              -- video | carrossel | estatico
  tags jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table posts enable row level security;

drop policy if exists "leitura publica" on posts;
drop policy if exists "insert publico"  on posts;
drop policy if exists "update publico"  on posts;
drop policy if exists "delete publico"  on posts;
create policy "leitura publica" on posts for select using (true);
create policy "insert publico"  on posts for insert with check (true);
create policy "update publico"  on posts for update using (true) with check (true);
create policy "delete publico"  on posts for delete using (true);

alter publication supabase_realtime add table posts;


-- ============================================================
-- Status de postagem definido no admin (producao | agendado)
-- "postado" é derivado automaticamente quando o dia agendado chega
-- ============================================================
create table if not exists prodstatus (
  id text primary key,
  status text not null default 'producao',   -- producao | agendado
  updated_at timestamptz not null default now()
);

alter table prodstatus enable row level security;

drop policy if exists "leitura publica" on prodstatus;
drop policy if exists "insert publico"  on prodstatus;
drop policy if exists "update publico"  on prodstatus;
drop policy if exists "delete publico"  on prodstatus;
create policy "leitura publica" on prodstatus for select using (true);
create policy "insert publico"  on prodstatus for insert with check (true);
create policy "update publico"  on prodstatus for update using (true) with check (true);
create policy "delete publico"  on prodstatus for delete using (true);

alter publication supabase_realtime add table prodstatus;


-- ============================================================
-- Estratégia de conteúdo por marca (anotações + materiais/links)
-- ============================================================
create table if not exists strategy (
  brand text primary key,
  notes text default '',
  materials jsonb not null default '[]'::jsonb,   -- [{label, url, kind}]
  updated_at timestamptz not null default now()
);

alter table strategy enable row level security;

drop policy if exists "leitura publica" on strategy;
drop policy if exists "insert publico"  on strategy;
drop policy if exists "update publico"  on strategy;
drop policy if exists "delete publico"  on strategy;
create policy "leitura publica" on strategy for select using (true);
create policy "insert publico"  on strategy for insert with check (true);
create policy "update publico"  on strategy for update using (true) with check (true);
create policy "delete publico"  on strategy for delete using (true);

alter publication supabase_realtime add table strategy;


-- ============================================================
-- Decisões da estratégia (alternativas, manter/trocar) com autoria
-- ============================================================
create table if not exists decisions (
  id text primary key,
  value text,
  reviewer text default '',
  updated_at timestamptz not null default now()
);

alter table decisions enable row level security;

drop policy if exists "leitura publica" on decisions;
drop policy if exists "insert publico"  on decisions;
drop policy if exists "update publico"  on decisions;
drop policy if exists "delete publico"  on decisions;
create policy "leitura publica" on decisions for select using (true);
create policy "insert publico"  on decisions for insert with check (true);
create policy "update publico"  on decisions for update using (true) with check (true);
create policy "delete publico"  on decisions for delete using (true);

alter publication supabase_realtime add table decisions;


-- ============================================================
-- Estúdio: documentos do painel (quadro + calendário) em JSON
-- id = 'estudio:board' | 'estudio:calendar'
-- ============================================================
create table if not exists estudio_docs (
  id text primary key,
  value jsonb,
  client_id text,
  updated_at timestamptz not null default now()
);

alter table estudio_docs enable row level security;

drop policy if exists "leitura publica" on estudio_docs;
drop policy if exists "insert publico"  on estudio_docs;
drop policy if exists "update publico"  on estudio_docs;
drop policy if exists "delete publico"  on estudio_docs;
create policy "leitura publica" on estudio_docs for select using (true);
create policy "insert publico"  on estudio_docs for insert with check (true);
create policy "update publico"  on estudio_docs for update using (true) with check (true);
create policy "delete publico"  on estudio_docs for delete using (true);

alter publication supabase_realtime add table estudio_docs;


-- ============================================================
-- Storage: bucket público "creatives" para guardar as imagens
-- ============================================================
insert into storage.buckets (id, name, public)
values ('creatives', 'creatives', true)
on conflict (id) do update set public = true;

-- Acesso livre (sem login) ao bucket creatives
create policy "creatives leitura publica"
  on storage.objects for select using (bucket_id = 'creatives');
create policy "creatives upload publico"
  on storage.objects for insert with check (bucket_id = 'creatives');
create policy "creatives update publico"
  on storage.objects for update using (bucket_id = 'creatives') with check (bucket_id = 'creatives');
create policy "creatives delete publico"
  on storage.objects for delete using (bucket_id = 'creatives');
