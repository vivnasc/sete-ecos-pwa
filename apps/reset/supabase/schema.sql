-- Reset · 60 dias · Supabase schema
-- Aplica este ficheiro no SQL editor do teu projeto Supabase.

-- ===== HABILITAR EXTENSIONS =====
create extension if not exists "uuid-ossp";

-- ===== PROFILE =====
create table if not exists reset_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default 'Vivianne',
  sexo char(1) not null default 'F' check (sexo in ('F', 'M', 'O')),
  peso_inicial numeric(5,2),
  cintura_inicial numeric(5,1),
  acorda_tipico time not null default '06:30',
  deita_tipico time not null default '22:30',
  treino_preferido text not null default 'manhã',
  gatilhos_alcool text[] not null default '{}',
  notificacoes_ativas boolean not null default false,
  onboarding_completo boolean not null default false,
  inicio_plano date not null default '2026-05-11',
  duracao_plano int not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table reset_profile enable row level security;
drop policy if exists "profile_owner" on reset_profile;
create policy "profile_owner" on reset_profile for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== DIA LOG =====
create table if not exists reset_dias (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  ancoras jsonb not null default '{}',
  treino_feito boolean not null default false,
  caminhada_min int,
  sono_horas numeric(3,1),
  energia int check (energia between 1 and 5),
  humor int check (humor between 1 and 5),
  notas text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists reset_dias_user_date on reset_dias (user_id, date desc);

alter table reset_dias enable row level security;
drop policy if exists "dias_owner" on reset_dias;
create policy "dias_owner" on reset_dias for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== ÁLCOOL =====
create table if not exists reset_alcool (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  unidades int not null default 0,
  emocao text not null default '',
  gatilho text not null default '',
  decidiu_beber boolean not null default false
);

create index if not exists reset_alcool_user_ts on reset_alcool (user_id, timestamp desc);

alter table reset_alcool enable row level security;
drop policy if exists "alcool_owner" on reset_alcool;
create policy "alcool_owner" on reset_alcool for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== MEDIDAS =====
create table if not exists reset_medidas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  cintura numeric(5,1),
  ancas numeric(5,1),
  coxa numeric(5,1),
  braco numeric(5,1),
  peso numeric(5,2),
  sentir text not null default '',
  mudou text not null default '',
  foto_frente_url text,
  foto_lado_url text,
  foto_costas_url text,
  created_at timestamptz not null default now()
);

create index if not exists reset_medidas_user_date on reset_medidas (user_id, date desc);

alter table reset_medidas enable row level security;
drop policy if exists "medidas_owner" on reset_medidas;
create policy "medidas_owner" on reset_medidas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== DESABAFO =====
create table if not exists reset_desabafo (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  texto text not null,
  emocao text not null default ''
);

create index if not exists reset_desabafo_user_ts on reset_desabafo (user_id, timestamp desc);

alter table reset_desabafo enable row level security;
drop policy if exists "desabafo_owner" on reset_desabafo;
create policy "desabafo_owner" on reset_desabafo for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== INSIGHTS CACHE =====
create table if not exists reset_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  texto text not null,
  gerado_em timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table reset_insights enable row level security;
drop policy if exists "insights_owner" on reset_insights;
create policy "insights_owner" on reset_insights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== LEMBRETES =====
create table if not exists reset_lembretes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  config jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table reset_lembretes enable row level security;
drop policy if exists "lembretes_owner" on reset_lembretes;
create policy "lembretes_owner" on reset_lembretes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== STORAGE BUCKET para fotos de medidas =====
-- Executar na consola Storage:
-- 1. Criar bucket "reset-fotos" privado
-- 2. Policy SELECT/INSERT/UPDATE/DELETE com expressão: bucket_id = 'reset-fotos' AND (storage.foldername(name))[1] = auth.uid()::text

-- ===== TRIGGER updated_at =====
create or replace function reset_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reset_dias_touch on reset_dias;
create trigger reset_dias_touch before update on reset_dias for each row execute function reset_touch_updated_at();

drop trigger if exists reset_profile_touch on reset_profile;
create trigger reset_profile_touch before update on reset_profile for each row execute function reset_touch_updated_at();

drop trigger if exists reset_lembretes_touch on reset_lembretes;
create trigger reset_lembretes_touch before update on reset_lembretes for each row execute function reset_touch_updated_at();
