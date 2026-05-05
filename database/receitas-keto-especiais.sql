-- Receitas Especiais Keto para Vitalis
-- Bulletproof Coffee, Shakes de Saciedade e Refeições Keto Tradicionais
-- Execute este SQL no Supabase SQL Editor

-- ===== BULLETPROOF COFFEE =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Bulletproof Coffee',
  'Café com gordura para saciedade de 4-5h e clareza mental. Ideal como 2ª refeição ou para abrir a janela alimentar em jejum intermitente.',
  'internacional',
  'snack',
  5,
  1,
  'facil',
  350,
  1,
  0,
  38,
  0,
  0,
  0,
  2.5,
  ARRAY['keto', 'jejum_friendly', 'rapido', 'sem_gluten', 'sem_lactose'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Café preto forte (espresso ou coado)", "quantidade": "250ml", "porcao_mao": "1 chávena"},
    {"item": "Óleo de coco virgem", "quantidade": "1 colher de sopa", "porcao_mao": "1 polegar"},
    {"item": "Manteiga sem sal (de pasto se possível)", "quantidade": "1 colher de sopa", "porcao_mao": "1 polegar"},
    {"item": "Canela em pó (opcional)", "quantidade": "1/2 colher de chá"}
  ]'::jsonb,
  '1. Prepara um café preto forte (250ml).
2. Coloca o café no liquidificador (NÃO uses só colher — precisas de criar emulsão).
3. Adiciona o óleo de coco e a manteiga.
4. Bate 30 segundos em velocidade alta até criar uma espuma cremosa.
5. Polvilha canela por cima se gostares.
6. Bebe quente. A saciedade dura 4-5h.

Dica: Se sentires desconforto digestivo no início, começa com 1 colher de chá de cada gordura e vai aumentando.',
  true
);

-- ===== SHAKE DE SACIEDADE =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Shake de Saciedade Keto',
  'Para dias difíceis ou jantar leve. Cremoso, doce sem açúcar, e a saciedade dura 3-4h. Bom também ao quebrar o jejum.',
  'internacional',
  'snack',
  5,
  1,
  'facil',
  400,
  8,
  5,
  35,
  0,
  0,
  0,
  2.5,
  ARRAY['keto', 'rapido', 'sem_gluten', 'vegetariano'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Leite de coco de lata (não a bebida)", "quantidade": "200ml", "porcao_mao": "1 chávena"},
    {"item": "Abacate maduro", "quantidade": "1/2 unidade", "porcao_mao": "1 polegar"},
    {"item": "Óleo de coco virgem", "quantidade": "1 colher de sopa", "porcao_mao": "1 polegar"},
    {"item": "Pasta de amendoim sem açúcar (100% amendoim)", "quantidade": "1 colher de sopa", "porcao_mao": "1 polegar"},
    {"item": "Cacau em pó sem açúcar", "quantidade": "1 colher de chá"},
    {"item": "Canela em pó", "quantidade": "1/2 colher de chá"},
    {"item": "Gelo", "quantidade": "3-4 cubos"}
  ]'::jsonb,
  '1. Coloca todos os ingredientes no liquidificador.
2. Bate 30-45 segundos até ficar cremoso e homogéneo.
3. Prova — se quiseres mais doce, junta canela (não açúcar nem mel).
4. Bebe devagar.

Variação: troca o cacau por 1 colher de chá de baunilha em pó.',
  true
);

-- ===== OVOS MEXIDOS COM ABACATE E BACON =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Ovos Mexidos com Abacate e Bacon',
  'Refeição keto clássica para abrir a janela alimentar. Saciedade de 5-6h, rica em gorduras saudáveis e proteína.',
  'internacional',
  'pequeno_almoco',
  10,
  1,
  'facil',
  520,
  28,
  6,
  42,
  1,
  0,
  0,
  2,
  ARRAY['keto', 'rapido', 'sem_gluten', 'sem_lactose'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Ovos", "quantidade": "3 unidades", "porcao_mao": "1 palma"},
    {"item": "Abacate maduro", "quantidade": "1/2 unidade", "porcao_mao": "1 polegar"},
    {"item": "Bacon (sem açúcar)", "quantidade": "2 fatias"},
    {"item": "Manteiga", "quantidade": "1 colher de chá"},
    {"item": "Sal e pimenta", "quantidade": "a gosto"},
    {"item": "Cebolinho fresco (opcional)", "quantidade": "1 colher de sopa"}
  ]'::jsonb,
  '1. Frita o bacon numa frigideira até ficar estaladiço. Reserva.
2. Na mesma frigideira (com a gordura do bacon + manteiga), bate os ovos com sal e pimenta.
3. Cozinha em lume brando, mexendo devagar até ficarem cremosos (não secos).
4. Serve com fatias de abacate e o bacon por cima.
5. Polvilha cebolinho fresco.

Dica: Se estás em jejum 16:8, esta é a refeição perfeita para abrir a janela às 12h00.',
  true
);

-- ===== SALADA KETO COM FRANGO =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Salada Keto com Frango Grelhado',
  'Almoço keto completo: proteína moderada, vegetais verdes à vontade, gordura generosa. Saciedade de 4-5h.',
  'internacional',
  'almoco',
  20,
  1,
  'facil',
  580,
  35,
  10,
  44,
  1,
  1,
  0,
  3,
  ARRAY['keto', 'sem_gluten', 'sem_lactose'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Peito de frango", "quantidade": "120g", "porcao_mao": "1 palma"},
    {"item": "Folhas verdes (alface, rúcula, espinafre)", "quantidade": "100g", "porcao_mao": "2 punhos"},
    {"item": "Abacate", "quantidade": "1/2 unidade", "porcao_mao": "1 polegar"},
    {"item": "Pepino em rodelas", "quantidade": "1/2 unidade"},
    {"item": "Tomate cherry", "quantidade": "5 unidades"},
    {"item": "Azeite virgem extra", "quantidade": "2 colheres de sopa", "porcao_mao": "2 polegares"},
    {"item": "Vinagre de cidra ou limão", "quantidade": "1 colher de sopa"},
    {"item": "Sementes de abóbora", "quantidade": "1 colher de sopa"},
    {"item": "Sal, pimenta, ervas a gosto", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Tempera o frango com sal, pimenta e ervas. Grelha 5-6 min de cada lado.
2. Numa taça grande, dispõe as folhas verdes.
3. Junta o pepino, tomate, abacate em fatias.
4. Corta o frango em tiras e coloca por cima.
5. Tempera com azeite e vinagre/limão.
6. Polvilha sementes de abóbora.

Dica keto: A gordura é a tua amiga — não tenhas medo do azeite generoso.',
  true
);

-- ===== FAT BOMB DE COCO E CACAU =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Fat Bomb de Coco e Cacau',
  'Snack keto para emergências de fome ou vontade de doce. Faz uma fornada e congela. Cada bomba tem ~150 kcal.',
  'internacional',
  'snack',
  10,
  8,
  'facil',
  150,
  1,
  2,
  16,
  0,
  0,
  0,
  1,
  ARRAY['keto', 'sem_gluten', 'sem_lactose', 'vegetariano', 'preparacao_lote'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Óleo de coco virgem", "quantidade": "100ml", "porcao_mao": "tiras"},
    {"item": "Manteiga de amendoim sem açúcar", "quantidade": "3 colheres de sopa"},
    {"item": "Cacau em pó sem açúcar", "quantidade": "2 colheres de sopa"},
    {"item": "Coco ralado sem açúcar", "quantidade": "3 colheres de sopa"},
    {"item": "Stevia ou eritritol (opcional)", "quantidade": "1 colher de chá"},
    {"item": "Pitada de sal", "quantidade": "1 pitada"}
  ]'::jsonb,
  '1. Derrete o óleo de coco em banho-maria ou microondas (30s).
2. Mistura todos os ingredientes numa taça.
3. Verte para forminhas de silicone (ou forma de cubos de gelo).
4. Congela 30 minutos.
5. Desenforma e guarda no congelador.

Toma 1 fat bomb quando bater fome forte ou vontade de doce. Saciedade rápida.',
  true
);
