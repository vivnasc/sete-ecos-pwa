-- Vitalis: Calendário de Refeições Semanal
-- Tabela para persistir o planeamento semanal (substitui localStorage)
-- Execute no Supabase SQL Editor

-- Criar tabela
CREATE TABLE IF NOT EXISTS vitalis_calendario_refeicoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data date NOT NULL,
  tipo_refeicao text NOT NULL, -- pequeno_almoco, almoco, jantar, snack
  receita_id uuid REFERENCES vitalis_receitas(id) ON DELETE SET NULL,
  nome text NOT NULL,
  icone text DEFAULT '🍽️',
  proteina numeric(4,1) DEFAULT 0,
  hidratos numeric(4,1) DEFAULT 0,
  gordura numeric(4,1) DEFAULT 0,
  kcal integer DEFAULT 0,
  tempo integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),

  -- Um user só pode ter uma refeição por tipo por dia
  UNIQUE(user_id, data, tipo_refeicao)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vitalis_cal_user_data ON vitalis_calendario_refeicoes(user_id, data);

-- RLS
ALTER TABLE vitalis_calendario_refeicoes ENABLE ROW LEVEL SECURITY;

-- Users podem ver e gerir as suas próprias refeições
CREATE POLICY "Users can manage own calendar" ON vitalis_calendario_refeicoes
  FOR ALL USING (auth.uid() = user_id);

-- Templates semanais (para guardar/reutilizar semanas tipo)
CREATE TABLE IF NOT EXISTS vitalis_templates_semana (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text DEFAULT 'Meu Template',
  template jsonb NOT NULL, -- {0: {almoco: {...}, jantar: {...}}, 1: {...}, ...}
  created_at timestamptz DEFAULT now(),

  -- Um user pode ter vários templates
  UNIQUE(user_id, nome)
);

ALTER TABLE vitalis_templates_semana ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own templates" ON vitalis_templates_semana
  FOR ALL USING (auth.uid() = user_id);
