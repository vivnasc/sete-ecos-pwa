-- FénixFit · 60 dias · Supabase schema
-- Aplica este ficheiro no SQL editor do teu projeto Supabase.

-- ===== HABILITAR EXTENSIONS =====
create extension if not exists "uuid-ossp";

-- ===== PROFILE =====
create table if not exists fenixfit_profile (
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

alter table fenixfit_profile enable row level security;
drop policy if exists "profile_owner" on fenixfit_profile;
create policy "profile_owner" on fenixfit_profile for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== DIA LOG =====
create table if not exists fenixfit_dias (
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

create index if not exists fenixfit_dias_user_date on fenixfit_dias (user_id, date desc);

alter table fenixfit_dias enable row level security;
drop policy if exists "dias_owner" on fenixfit_dias;
create policy "dias_owner" on fenixfit_dias for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== ÁLCOOL =====
create table if not exists fenixfit_alcool (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  unidades int not null default 0,
  emocao text not null default '',
  gatilho text not null default '',
  decidiu_beber boolean not null default false
);

create index if not exists fenixfit_alcool_user_ts on fenixfit_alcool (user_id, timestamp desc);

alter table fenixfit_alcool enable row level security;
drop policy if exists "alcool_owner" on fenixfit_alcool;
create policy "alcool_owner" on fenixfit_alcool for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== MEDIDAS =====
create table if not exists fenixfit_medidas (
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

create index if not exists fenixfit_medidas_user_date on fenixfit_medidas (user_id, date desc);

alter table fenixfit_medidas enable row level security;
drop policy if exists "medidas_owner" on fenixfit_medidas;
create policy "medidas_owner" on fenixfit_medidas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== DESABAFO =====
create table if not exists fenixfit_desabafo (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  texto text not null,
  emocao text not null default ''
);

create index if not exists fenixfit_desabafo_user_ts on fenixfit_desabafo (user_id, timestamp desc);

alter table fenixfit_desabafo enable row level security;
drop policy if exists "desabafo_owner" on fenixfit_desabafo;
create policy "desabafo_owner" on fenixfit_desabafo for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== INSIGHTS CACHE =====
create table if not exists fenixfit_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  texto text not null,
  gerado_em timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table fenixfit_insights enable row level security;
drop policy if exists "insights_owner" on fenixfit_insights;
create policy "insights_owner" on fenixfit_insights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== LEMBRETES =====
create table if not exists fenixfit_lembretes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  config jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table fenixfit_lembretes enable row level security;
drop policy if exists "lembretes_owner" on fenixfit_lembretes;
create policy "lembretes_owner" on fenixfit_lembretes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== STORAGE BUCKET para fotos de medidas =====
-- Executar na consola Storage:
-- 1. Criar bucket "fenixfit-fotos" privado
-- 2. Policy SELECT/INSERT/UPDATE/DELETE com expressão: bucket_id = 'fenixfit-fotos' AND (storage.foldername(name))[1] = auth.uid()::text

-- ===== PESO (pesagem diária) =====
create table if not exists fenixfit_peso (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  peso numeric(5,2) not null,
  hora time,
  notas text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists fenixfit_peso_user_date on fenixfit_peso (user_id, date desc);

alter table fenixfit_peso enable row level security;
drop policy if exists "peso_owner" on fenixfit_peso;
create policy "peso_owner" on fenixfit_peso for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== JEJUM (janela alimentar) =====
create table if not exists fenixfit_jejum (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  ultima_refeicao timestamptz,
  primeira_refeicao timestamptz,
  duracao_horas numeric(4,1),
  meta int not null default 14,
  completou boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists fenixfit_jejum_user_date on fenixfit_jejum (user_id, date desc);

alter table fenixfit_jejum enable row level security;
drop policy if exists "jejum_owner" on fenixfit_jejum;
create policy "jejum_owner" on fenixfit_jejum for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== CICLO MENSTRUAL =====
create table if not exists fenixfit_ciclo (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data_inicio date not null,
  duracao_ciclo int,
  duracao_menstruacao int,
  fluxo text check (fluxo in ('leve', 'moderado', 'intenso') or fluxo is null),
  sintomas text[] not null default '{}',
  cravings text[] not null default '{}',
  notas text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, data_inicio)
);

create index if not exists fenixfit_ciclo_user_data on fenixfit_ciclo (user_id, data_inicio desc);

alter table fenixfit_ciclo enable row level security;
drop policy if exists "ciclo_owner" on fenixfit_ciclo;
create policy "ciclo_owner" on fenixfit_ciclo for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== TRIGGER updated_at =====
create or replace function fenixfit_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists fenixfit_dias_touch on fenixfit_dias;
create trigger fenixfit_dias_touch before update on fenixfit_dias for each row execute function fenixfit_touch_updated_at();

drop trigger if exists fenixfit_profile_touch on fenixfit_profile;
create trigger fenixfit_profile_touch before update on fenixfit_profile for each row execute function fenixfit_touch_updated_at();

drop trigger if exists fenixfit_lembretes_touch on fenixfit_lembretes;
create trigger fenixfit_lembretes_touch before update on fenixfit_lembretes for each row execute function fenixfit_touch_updated_at();
