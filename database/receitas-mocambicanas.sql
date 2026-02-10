-- Receitas Moçambicanas Autênticas para Vitalis
-- Execute este SQL no Supabase SQL Editor

-- Limpar receitas existentes (CUIDADO: remover em produção se quiser manter existentes)
-- DELETE FROM vitalis_receitas;

-- ===== PEQUENO-ALMOÇO =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Papas de Milho com Amendoim',
  'Pequeno-almoço tradicional moçambicano, nutritivo e reconfortante. Rica em proteína vegetal e energia para começar o dia.',
  'mocambicana',
  'pequeno_almoco',
  20,
  2,
  'facil',
  320,
  12,
  45,
  10,
  0,
  0,
  1,
  1,
  ARRAY['vegetariano', 'sem_lactose', 'economico', 'tradicional'],
  ARRAY['transicao', 'manutencao'],
  '[
    {"item": "Farinha de milho", "quantidade": "100g", "porcao_mao": "1 mão concha"},
    {"item": "Amendoim torrado moído", "quantidade": "30g", "porcao_mao": "1 polegar"},
    {"item": "Água", "quantidade": "500ml"},
    {"item": "Sal", "quantidade": "a gosto"},
    {"item": "Açúcar de coco (opcional)", "quantidade": "1 colher de chá"}
  ]'::jsonb,
  '1. Ferva a água numa panela média.
2. Adicione o sal e reduza o lume.
3. Vá adicionando a farinha de milho aos poucos, mexendo sempre para não formar grumos.
4. Cozinhe em lume brando durante 10-15 minutos, mexendo regularmente.
5. Junte o amendoim moído e misture bem.
6. Sirva quente, com açúcar de coco se desejar.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Ovos Mexidos com Coco e Coentros',
  'Versão moçambicana dos ovos mexidos, cremosos com leite de coco e aromáticos com coentros frescos. Perfeito para keto.',
  'mocambicana',
  'pequeno_almoco',
  10,
  1,
  'facil',
  280,
  18,
  3,
  22,
  1,
  0,
  0,
  1,
  ARRAY['keto', 'proteico', 'rapido', 'sem_gluten'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Ovos", "quantidade": "3 unidades", "porcao_mao": "1 palma"},
    {"item": "Leite de coco", "quantidade": "2 colheres de sopa"},
    {"item": "Coentros frescos", "quantidade": "1 molho pequeno"},
    {"item": "Sal e pimenta", "quantidade": "a gosto"},
    {"item": "Azeite ou óleo de coco", "quantidade": "1 colher de chá"}
  ]'::jsonb,
  '1. Bata os ovos com o leite de coco, sal e pimenta.
2. Aqueça o azeite ou óleo de coco numa frigideira em lume médio-baixo.
3. Verta os ovos e mexa suavemente com uma espátula.
4. Quando começar a solidificar mas ainda cremoso, retire do lume.
5. Finalize com os coentros picados.
6. Sirva imediatamente.',
  true
);

-- ===== ALMOÇO =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Matapa',
  'Prato emblemático moçambicano feito com folhas de mandioca, amendoim e leite de coco. Sabor único e muito nutritivo.',
  'mocambicana',
  'almoco',
  60,
  4,
  'medio',
  320,
  15,
  18,
  22,
  1,
  2,
  0,
  1,
  ARRAY['tradicional', 'sem_gluten', 'sem_lactose'],
  ARRAY['transicao', 'manutencao'],
  '[
    {"item": "Folhas de mandioca (ou espinafres)", "quantidade": "500g", "porcao_mao": "2 punhos"},
    {"item": "Amendoim pilado", "quantidade": "150g", "porcao_mao": "1 polegar grande"},
    {"item": "Leite de coco", "quantidade": "400ml"},
    {"item": "Camarão seco ou fresco (opcional)", "quantidade": "100g", "porcao_mao": "1 palma"},
    {"item": "Alho", "quantidade": "3 dentes"},
    {"item": "Cebola", "quantidade": "1 média"},
    {"item": "Sal", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Lave bem as folhas de mandioca e pique finamente.
2. Cozinhe as folhas em água por 30-40 minutos (muito importante para remover toxinas).
3. Escorra bem as folhas.
4. Numa panela, refogue a cebola e o alho.
5. Adicione o amendoim pilado e o camarão (se usar).
6. Junte as folhas cozidas e o leite de coco.
7. Cozinhe em lume brando por 15-20 minutos.
8. Tempere com sal e sirva com xima ou arroz.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Frango à Zambeziana',
  'Frango grelhado no estilo da Zambézia com molho de coco e piripiri. Aromático e picante na medida certa.',
  'zambeziana',
  'almoco',
  45,
  4,
  'medio',
  380,
  35,
  8,
  24,
  1.5,
  1,
  0,
  1,
  ARRAY['proteico', 'sem_gluten', 'picante', 'tradicional'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Coxas de frango", "quantidade": "600g", "porcao_mao": "1.5 palmas"},
    {"item": "Leite de coco", "quantidade": "200ml"},
    {"item": "Piripiri fresco", "quantidade": "2-3 unidades"},
    {"item": "Limão", "quantidade": "2 unidades"},
    {"item": "Alho", "quantidade": "4 dentes"},
    {"item": "Gengibre fresco", "quantidade": "2cm"},
    {"item": "Coentros", "quantidade": "1 molho"},
    {"item": "Sal e pimenta", "quantidade": "a gosto"},
    {"item": "Azeite", "quantidade": "2 colheres de sopa"}
  ]'::jsonb,
  '1. Marine o frango com sumo de limão, alho picado, gengibre ralado, sal e pimenta por 2 horas.
2. Grelhe o frango até dourar e cozinhar bem (cerca de 25-30 min).
3. Enquanto isso, prepare o molho: aqueça o azeite e refogue o piripiri.
4. Adicione o leite de coco e deixe reduzir ligeiramente.
5. Sirva o frango regado com o molho de coco e piripiri.
6. Decore com coentros frescos.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Caril de Camarão à Moçambicana',
  'Camarões suculentos em molho de coco aromático com especiarias indianas e africanas. Herança da rota das especiarias.',
  'mocambicana',
  'almoco',
  35,
  4,
  'medio',
  290,
  28,
  10,
  16,
  1,
  1,
  0,
  1,
  ARRAY['marisco', 'proteico', 'sem_gluten', 'omega3'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Camarão médio limpo", "quantidade": "500g", "porcao_mao": "1 palma"},
    {"item": "Leite de coco", "quantidade": "400ml"},
    {"item": "Tomate maduro", "quantidade": "2 unidades", "porcao_mao": "1 punho"},
    {"item": "Cebola", "quantidade": "1 grande"},
    {"item": "Alho", "quantidade": "3 dentes"},
    {"item": "Caril em pó", "quantidade": "2 colheres de chá"},
    {"item": "Açafrão", "quantidade": "1/2 colher de chá"},
    {"item": "Coentros frescos", "quantidade": "1 molho"},
    {"item": "Óleo de coco", "quantidade": "2 colheres de sopa"}
  ]'::jsonb,
  '1. Aqueça o óleo de coco e refogue a cebola até dourar.
2. Adicione o alho e refogue por 1 minuto.
3. Junte o tomate picado e cozinhe até formar um molho.
4. Adicione o caril e o açafrão, mexa bem.
5. Verta o leite de coco e deixe ferver suavemente.
6. Adicione os camarões e cozinhe por 5-7 minutos.
7. Finalize com coentros frescos picados.
8. Sirva com arroz ou xima.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Caçarola de Peixe da Beira',
  'Peixe fresco cozido em panela de barro com tomate, cebola e especiarias locais. Simples e delicioso.',
  'mocambicana',
  'almoco',
  40,
  4,
  'facil',
  250,
  32,
  12,
  8,
  1,
  1,
  0,
  0.5,
  ARRAY['proteico', 'sem_gluten', 'omega3', 'economico'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Peixe inteiro (robalo, corvina ou carapau)", "quantidade": "800g", "porcao_mao": "1 palma"},
    {"item": "Tomates maduros", "quantidade": "4 unidades", "porcao_mao": "1 punho"},
    {"item": "Cebolas", "quantidade": "2 médias"},
    {"item": "Pimento verde", "quantidade": "1 unidade"},
    {"item": "Limão", "quantidade": "2 unidades"},
    {"item": "Alho", "quantidade": "4 dentes"},
    {"item": "Folha de louro", "quantidade": "2 folhas"},
    {"item": "Azeite", "quantidade": "3 colheres de sopa"},
    {"item": "Sal e pimenta", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Limpe o peixe, tempere com sumo de limão, sal e pimenta. Reserve por 30 minutos.
2. Corte os tomates, cebolas e pimento em rodelas.
3. Numa caçarola, faça camadas: cebola, tomate, pimento.
4. Coloque o peixe por cima.
5. Cubra com mais camadas de legumes.
6. Regue com azeite, adicione o alho e louro.
7. Tape e cozinhe em lume brando por 25-30 minutos.
8. Não mexa durante a cozedura.',
  true
);

-- ===== JANTAR =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Chamussas de Legumes',
  'Pastéis triangulares fritos recheados com legumes temperados. Influência indiana adaptada aos sabores moçambicanos.',
  'mocambicana',
  'jantar',
  50,
  12,
  'medio',
  120,
  3,
  15,
  5,
  0,
  1,
  0.5,
  0.5,
  ARRAY['vegetariano', 'economico', 'tradicional'],
  ARRAY['manutencao'],
  '[
    {"item": "Batata", "quantidade": "300g"},
    {"item": "Cenoura ralada", "quantidade": "100g", "porcao_mao": "1 punho"},
    {"item": "Ervilhas", "quantidade": "100g"},
    {"item": "Cebola", "quantidade": "1 média"},
    {"item": "Caril em pó", "quantidade": "1 colher de chá"},
    {"item": "Coentros", "quantidade": "1 molho"},
    {"item": "Massa filo ou folhas para chamussa", "quantidade": "12 folhas"},
    {"item": "Óleo para fritar", "quantidade": "para frigir"}
  ]'::jsonb,
  '1. Coza as batatas e esmague-as grosseiramente.
2. Refogue a cebola, adicione a cenoura e ervilhas.
3. Tempere com caril, sal e coentros picados.
4. Misture com a batata esmagada e deixe arrefecer.
5. Corte as folhas de massa em tiras e dobre em triângulos com o recheio.
6. Frite em óleo quente até dourar.
7. Escorra em papel absorvente.
8. Sirva com molho de manga ou piripiri.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Mucapata',
  'Feijão-nhemba cozido com coco ralado, um prato reconfortante e proteico da tradição moçambicana.',
  'mocambicana',
  'jantar',
  90,
  6,
  'facil',
  280,
  14,
  38,
  8,
  0.5,
  0,
  1,
  0.5,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'economico', 'tradicional'],
  ARRAY['transicao', 'manutencao'],
  '[
    {"item": "Feijão-nhemba (ou feijão frade)", "quantidade": "400g", "porcao_mao": "1 mão concha"},
    {"item": "Coco ralado fresco", "quantidade": "100g"},
    {"item": "Cebola", "quantidade": "1 média"},
    {"item": "Alho", "quantidade": "2 dentes"},
    {"item": "Sal", "quantidade": "a gosto"},
    {"item": "Óleo de coco", "quantidade": "2 colheres de sopa"}
  ]'::jsonb,
  '1. Demolhe o feijão durante a noite.
2. Coza o feijão em água até ficar macio (cerca de 1 hora).
3. Numa panela, refogue a cebola e o alho no óleo de coco.
4. Adicione o feijão cozido com um pouco da água da cozedura.
5. Junte o coco ralado e mexa bem.
6. Cozinhe em lume brando por 15-20 minutos.
7. O prato deve ficar cremoso mas não líquido.
8. Tempere com sal e sirva quente.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Peixe Grelhado com Molho de Coco e Manga',
  'Peixe fresco grelhado com um molho tropical de coco e manga verde. Sabores frescos da costa moçambicana.',
  'mocambicana',
  'jantar',
  30,
  2,
  'facil',
  320,
  35,
  15,
  14,
  1,
  0,
  0,
  1,
  ARRAY['proteico', 'sem_gluten', 'omega3', 'tropical'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Filetes de peixe (tilápia, robalo)", "quantidade": "400g", "porcao_mao": "1 palma"},
    {"item": "Manga verde", "quantidade": "1 pequena"},
    {"item": "Leite de coco", "quantidade": "100ml"},
    {"item": "Piripiri", "quantidade": "1 pequeno"},
    {"item": "Limão", "quantidade": "1 unidade"},
    {"item": "Coentros", "quantidade": "1 molho"},
    {"item": "Sal e pimenta", "quantidade": "a gosto"},
    {"item": "Azeite", "quantidade": "2 colheres de sopa"}
  ]'::jsonb,
  '1. Tempere o peixe com sumo de limão, sal e pimenta.
2. Grelhe o peixe em lume médio-alto, 4-5 minutos de cada lado.
3. Para o molho: rale a manga verde finamente.
4. Misture com leite de coco, piripiri picado e coentros.
5. Tempere o molho com sal.
6. Sirva o peixe quente com o molho frio por cima.
7. Decore com rodelas de limão.',
  true
);

-- ===== SNACKS E BEBIDAS =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Sumo de Baobá (Ucanhi)',
  'Bebida tradicional feita com fruto do embondeiro, rica em vitamina C e antioxidantes. Refrescante e nutritiva.',
  'mocambicana',
  'snack',
  15,
  4,
  'facil',
  80,
  2,
  18,
  0,
  0,
  0,
  0,
  0,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'jejum_friendly', 'diuretico', 'tradicional'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Polpa de baobá seca", "quantidade": "50g"},
    {"item": "Água", "quantidade": "1 litro"},
    {"item": "Mel ou stevia (opcional)", "quantidade": "a gosto"},
    {"item": "Gelo", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Demolhe a polpa de baobá em água morna por 10 minutos.
2. Coe para remover as fibras e sementes.
3. Adicione o resto da água e misture bem.
4. Adoce a gosto se desejar.
5. Sirva bem fresco com gelo.
6. Pode guardar no frigorífico até 3 dias.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Batido de Papaia e Coco',
  'Batido cremoso tropical com papaia madura e leite de coco. Perfeito para pequeno-almoço rápido ou snack.',
  'mocambicana',
  'snack',
  5,
  2,
  'facil',
  180,
  3,
  25,
  8,
  0,
  0,
  0,
  0.5,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'rapido', 'tropical'],
  ARRAY['transicao', 'manutencao'],
  '[
    {"item": "Papaia madura", "quantidade": "200g"},
    {"item": "Leite de coco", "quantidade": "200ml"},
    {"item": "Banana (opcional)", "quantidade": "1 pequena"},
    {"item": "Mel", "quantidade": "1 colher de chá"},
    {"item": "Gelo", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Corte a papaia em cubos, removendo as sementes.
2. Coloque no liquidificador com o leite de coco.
3. Adicione a banana se usar.
4. Bata até ficar cremoso.
5. Adicione gelo e bata novamente.
6. Sirva imediatamente.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Amendoim Torrado com Piripiri',
  'Snack proteico tradicional moçambicano - amendoins torrados com um toque de piripiri. Viciante!',
  'mocambicana',
  'snack',
  15,
  4,
  'facil',
  170,
  7,
  6,
  14,
  0,
  0,
  0,
  1,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'keto', 'picante', 'economico'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Amendoim cru com casca", "quantidade": "200g", "porcao_mao": "1 polegar"},
    {"item": "Piripiri em pó", "quantidade": "1/2 colher de chá"},
    {"item": "Sal marinho", "quantidade": "1 colher de chá"},
    {"item": "Azeite", "quantidade": "1 colher de chá"}
  ]'::jsonb,
  '1. Pré-aqueça o forno a 180°C.
2. Misture o amendoim com azeite, sal e piripiri.
3. Espalhe numa assadeira em camada única.
4. Torre por 12-15 minutos, mexendo na metade.
5. Deixe arrefecer completamente - ficará mais crocante.
6. Guarde num recipiente hermético.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Chá de Capim-Limão',
  'Infusão calmante e digestiva com capim-limão fresco. Muito popular em Moçambique após as refeições.',
  'mocambicana',
  'snack',
  10,
  4,
  'facil',
  5,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'jejum_friendly', 'calmante', 'diuretico'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Capim-limão fresco", "quantidade": "4 talos"},
    {"item": "Água", "quantidade": "1 litro"},
    {"item": "Gengibre fresco (opcional)", "quantidade": "2cm"},
    {"item": "Mel (opcional)", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Corte o capim-limão em pedaços de 5cm.
2. Esmague ligeiramente para libertar os óleos.
3. Ferva a água e adicione o capim-limão.
4. Se usar gengibre, adicione fatiado.
5. Deixe em infusão por 5-10 minutos.
6. Coe e sirva quente ou frio.
7. Adoce com mel se desejar.',
  true
);

-- ===== PRATOS DA ZAMBÉZIA =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Sopa de Peixe Zambeziana',
  'Sopa reconfortante da região da Zambézia com peixe fresco, mandioca e folhas verdes. Nutritiva e saborosa.',
  'zambeziana',
  'almoco',
  45,
  6,
  'medio',
  220,
  25,
  18,
  6,
  1,
  1,
  0.5,
  0,
  ARRAY['proteico', 'sem_gluten', 'sem_lactose', 'omega3', 'tradicional'],
  ARRAY['transicao', 'manutencao'],
  '[
    {"item": "Peixe fresco (carapau ou tilápia)", "quantidade": "500g", "porcao_mao": "1 palma"},
    {"item": "Mandioca", "quantidade": "200g"},
    {"item": "Couve ou folhas verdes", "quantidade": "200g", "porcao_mao": "1 punho"},
    {"item": "Tomate", "quantidade": "2 unidades"},
    {"item": "Cebola", "quantidade": "1 grande"},
    {"item": "Alho", "quantidade": "3 dentes"},
    {"item": "Limão", "quantidade": "1 unidade"},
    {"item": "Sal e pimenta", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Corte a mandioca em cubos e coza até ficar macia.
2. Limpe o peixe e tempere com limão e sal.
3. Refogue cebola, alho e tomate até formar um molho.
4. Adicione água (cerca de 1.5 litros) e a mandioca.
5. Quando ferver, adicione o peixe.
6. Cozinhe por 15 minutos em lume brando.
7. Nos últimos 5 minutos, adicione as folhas verdes.
8. Sirva quente com uma fatia de limão.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Galinha à Cafreal',
  'Prato icónico moçambicano: frango marinado em piripiri, alho, limão e ervas, depois grelhado. Intenso e aromático.',
  'mocambicana',
  'jantar',
  180,
  4,
  'medio',
  350,
  38,
  5,
  20,
  1.5,
  0,
  0,
  1,
  ARRAY['proteico', 'sem_gluten', 'sem_lactose', 'picante', 'tradicional'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Frango inteiro cortado", "quantidade": "1.2kg", "porcao_mao": "1.5 palmas"},
    {"item": "Piripiri fresco", "quantidade": "5-6 unidades"},
    {"item": "Alho", "quantidade": "1 cabeça inteira"},
    {"item": "Limão", "quantidade": "3 unidades"},
    {"item": "Coentros", "quantidade": "1 molho grande"},
    {"item": "Salsa", "quantidade": "1 molho"},
    {"item": "Azeite", "quantidade": "100ml"},
    {"item": "Sal grosso", "quantidade": "2 colheres de sopa"}
  ]'::jsonb,
  '1. Prepare a marinada: triture piripiri, alho, ervas, sumo de limão, azeite e sal.
2. Faça cortes no frango e esfregue bem a marinada.
3. Marine no frigorífico por pelo menos 4 horas (ideal: noite toda).
4. Retire do frio 30 minutos antes de grelhar.
5. Grelhe em lume médio, virando regularmente, por 40-50 minutos.
6. Pincele com a marinada durante a grelha.
7. O frango está pronto quando os sucos saírem claros.
8. Sirva com batata frita ou salada.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Xima com Caril de Amendoim',
  'O prato base moçambicano: papa de milho branco servida com caril cremoso de amendoim. Comfort food por excelência.',
  'mocambicana',
  'almoco',
  40,
  4,
  'medio',
  420,
  15,
  55,
  18,
  0.5,
  1,
  1.5,
  1,
  ARRAY['vegetariano', 'sem_lactose', 'economico', 'tradicional'],
  ARRAY['manutencao'],
  '[
    {"item": "Farinha de milho branco", "quantidade": "300g", "porcao_mao": "1.5 mãos concha"},
    {"item": "Amendoim torrado moído", "quantidade": "150g", "porcao_mao": "1 polegar"},
    {"item": "Tomate", "quantidade": "3 unidades", "porcao_mao": "1 punho"},
    {"item": "Cebola", "quantidade": "1 grande"},
    {"item": "Couve", "quantidade": "200g"},
    {"item": "Alho", "quantidade": "2 dentes"},
    {"item": "Óleo", "quantidade": "3 colheres de sopa"},
    {"item": "Sal", "quantidade": "a gosto"}
  ]'::jsonb,
  'XIMA:
1. Ferva 1 litro de água com sal.
2. Reduza o lume e vá adicionando a farinha aos poucos.
3. Mexa vigorosamente com colher de pau para não formar grumos.
4. Continue a mexer até ficar uma massa consistente e soltar da panela.
5. Molde em forma de bola.

CARIL:
1. Refogue a cebola e alho no óleo.
2. Adicione o tomate picado e cozinhe até virar molho.
3. Junte o amendoim moído e misture bem.
4. Adicione água (200ml) e cozinhe por 15 minutos.
5. A couve cozida pode ser servida ao lado.
6. Sirva a xima com o caril por cima.',
  true
);

-- ===== BATIDOS PROTEICOS =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Batido Verde Tropical',
  'Batido verde refrescante com espinafres, abacaxi e coco. Perfeito para desintoxicar e energizar.',
  'internacional',
  'snack',
  5,
  1,
  'facil',
  150,
  5,
  20,
  6,
  0,
  1,
  0,
  0.5,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'rapido', 'detox', 'jejum_friendly'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Espinafres frescos", "quantidade": "1 punhado", "porcao_mao": "1 punho"},
    {"item": "Abacaxi", "quantidade": "100g"},
    {"item": "Leite de coco", "quantidade": "200ml"},
    {"item": "Gengibre fresco", "quantidade": "1cm"},
    {"item": "Gelo", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Coloque os espinafres e leite de coco no liquidificador.
2. Bata até os espinafres estarem triturados.
3. Adicione o abacaxi e o gengibre.
4. Bata novamente até ficar homogéneo.
5. Adicione gelo e bata brevemente.
6. Sirva imediatamente.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Batido Proteico de Amendoim',
  'Batido cremoso e saciante com amendoim, banana e cacau. Ideal para pós-treino ou pequeno-almoço rápido.',
  'internacional',
  'snack',
  5,
  1,
  'facil',
  320,
  15,
  30,
  18,
  0.5,
  0,
  0.5,
  1,
  ARRAY['vegetariano', 'sem_lactose', 'rapido', 'alta_proteina', 'pos_treino', 'energetico'],
  ARRAY['transicao', 'manutencao'],
  '[
    {"item": "Banana madura", "quantidade": "1 média"},
    {"item": "Manteiga de amendoim", "quantidade": "2 colheres de sopa", "porcao_mao": "1 polegar"},
    {"item": "Leite de amêndoa ou coco", "quantidade": "250ml"},
    {"item": "Cacau em pó", "quantidade": "1 colher de sopa"},
    {"item": "Proteína em pó (opcional)", "quantidade": "1 dose"},
    {"item": "Gelo", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Coloque todos os ingredientes no liquidificador.
2. Bata em velocidade alta por 1-2 minutos.
3. Ajuste a consistência com mais leite se necessário.
4. Sirva imediatamente.
5. Pode adicionar um fio de mel se preferir mais doce.',
  true
);

-- Receita adicional para ter 20 receitas
INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Salada de Feijão-Verde com Coco',
  'Salada simples e nutritiva com feijão-verde fresco e coco ralado. Acompanhamento perfeito.',
  'mocambicana',
  'almoco',
  20,
  4,
  'facil',
  120,
  4,
  12,
  7,
  0,
  2,
  0,
  0.5,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'rapido', 'economico'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Feijão-verde fresco", "quantidade": "400g", "porcao_mao": "2 punhos"},
    {"item": "Coco ralado fresco", "quantidade": "50g"},
    {"item": "Tomate cereja", "quantidade": "100g"},
    {"item": "Cebola roxa", "quantidade": "1/2 média"},
    {"item": "Sumo de limão", "quantidade": "2 colheres de sopa"},
    {"item": "Azeite", "quantidade": "2 colheres de sopa"},
    {"item": "Sal e pimenta", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Coza o feijão-verde em água com sal por 5-7 minutos (deve ficar al dente).
2. Escorra e passe por água fria para parar a cozedura.
3. Corte os tomates ao meio e a cebola em meias-luas finas.
4. Misture o feijão-verde, tomate e cebola numa saladeira.
5. Tempere com limão, azeite, sal e pimenta.
6. Finalize com o coco ralado por cima.
7. Sirva fresca.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Camarão Grelhado com Manteiga de Alho',
  'Camarões frescos grelhados com manteiga de alho e piripiri. Simples mas irresistível.',
  'mocambicana',
  'jantar',
  20,
  2,
  'facil',
  280,
  30,
  2,
  16,
  1,
  0,
  0,
  1,
  ARRAY['marisco', 'proteico', 'sem_gluten', 'keto', 'rapido', 'omega3'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Camarão tigre grande", "quantidade": "400g", "porcao_mao": "1 palma"},
    {"item": "Manteiga", "quantidade": "50g", "porcao_mao": "1 polegar"},
    {"item": "Alho", "quantidade": "4 dentes"},
    {"item": "Piripiri", "quantidade": "1 pequeno"},
    {"item": "Salsa fresca", "quantidade": "1 molho"},
    {"item": "Limão", "quantidade": "1 unidade"},
    {"item": "Sal", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Limpe os camarões, deixando a casca se preferir.
2. Tempere com sal e sumo de meio limão.
3. Derreta a manteiga e adicione o alho picado finamente.
4. Adicione o piripiri picado e cozinhe por 1 minuto.
5. Grelhe os camarões por 2-3 minutos de cada lado.
6. Regue com a manteiga de alho.
7. Finalize com salsa picada e rodelas de limão.',
  true
);

-- ===== NOVAS RECEITAS: CASTANHA DE CAJU (Moçambique é grande produtor mundial) =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Frango com Molho de Castanha de Caju',
  'Prato que celebra a castanha de caju moçambicana. O molho cremoso transforma um simples frango grelhado numa experiência gastronómica.',
  'mocambicana',
  'almoco',
  40,
  4,
  'medio',
  420,
  38,
  12,
  26,
  1.5,
  1,
  0,
  1.5,
  ARRAY['proteico', 'sem_gluten', 'sem_lactose', 'tradicional'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Peitos de frango", "quantidade": "600g", "porcao_mao": "1.5 palmas"},
    {"item": "Castanha de caju crua", "quantidade": "100g", "porcao_mao": "1 polegar grande"},
    {"item": "Leite de coco", "quantidade": "200ml"},
    {"item": "Cebola", "quantidade": "1 média"},
    {"item": "Alho", "quantidade": "3 dentes"},
    {"item": "Gengibre fresco", "quantidade": "2cm"},
    {"item": "Piripiri", "quantidade": "1 pequeno"},
    {"item": "Coentros frescos", "quantidade": "1 molho"},
    {"item": "Azeite", "quantidade": "2 colheres de sopa"},
    {"item": "Sal e pimenta", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Tempere o frango com sal, pimenta, alho e gengibre ralado. Reserve 15 minutos.
2. Toste ligeiramente as castanhas de caju numa frigideira seca por 3-4 minutos.
3. Triture metade das castanhas com o leite de coco até obter um molho cremoso.
4. Grelhe o frango em azeite até dourar (6-7 min por lado).
5. Na mesma frigideira, refogue a cebola e o piripiri picado.
6. Adicione o molho de castanha e cozinhe por 5 minutos em lume brando.
7. Corte o frango em fatias e cubra com o molho.
8. Decore com as castanhas restantes e coentros frescos.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Salada Tropical de Castanha de Caju',
  'Salada fresca e crocante com castanha de caju, manga e abacate. Perfeita para dias quentes em Maputo.',
  'mocambicana',
  'almoco',
  15,
  2,
  'facil',
  280,
  8,
  22,
  20,
  0,
  2,
  0.5,
  1.5,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'rapido', 'tropical'],
  ARRAY['transicao', 'manutencao'],
  '[
    {"item": "Folhas verdes mistas", "quantidade": "200g", "porcao_mao": "2 punhos"},
    {"item": "Castanha de caju torrada", "quantidade": "60g", "porcao_mao": "1 polegar"},
    {"item": "Manga madura", "quantidade": "1 pequena"},
    {"item": "Abacate", "quantidade": "1/2 unidade", "porcao_mao": "1 polegar"},
    {"item": "Tomate cereja", "quantidade": "100g"},
    {"item": "Sumo de limão", "quantidade": "2 colheres de sopa"},
    {"item": "Azeite", "quantidade": "1 colher de sopa"},
    {"item": "Sal e piripiri", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Lave e seque bem as folhas verdes.
2. Corte a manga e o abacate em cubos.
3. Corte os tomates ao meio.
4. Numa saladeira, misture as folhas, manga, abacate e tomates.
5. Prepare o molho: sumo de limão, azeite, sal e um toque de piripiri.
6. Regue a salada e misture delicadamente.
7. Polvilhe com as castanhas de caju por cima para manter crocante.',
  true
);

-- ===== NOVAS RECEITAS: ARROZ (staple moçambicano) =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Arroz de Coco Moçambicano',
  'Arroz aromático cozido em leite de coco, um acompanhamento clássico da costa moçambicana que eleva qualquer prato de peixe ou frango.',
  'mocambicana',
  'almoco',
  30,
  4,
  'facil',
  280,
  5,
  42,
  10,
  0,
  0,
  1.5,
  0.5,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'economico', 'tradicional'],
  ARRAY['manutencao'],
  '[
    {"item": "Arroz de grão longo", "quantidade": "300g", "porcao_mao": "1.5 mãos concha"},
    {"item": "Leite de coco", "quantidade": "400ml"},
    {"item": "Água", "quantidade": "200ml"},
    {"item": "Cebola", "quantidade": "1 pequena"},
    {"item": "Sal", "quantidade": "1 colher de chá"},
    {"item": "Folha de louro", "quantidade": "1 folha"}
  ]'::jsonb,
  '1. Lave o arroz em água corrente até a água sair limpa.
2. Refogue a cebola picada finamente em lume médio.
3. Adicione o arroz e mexa por 1 minuto para envolver.
4. Junte o leite de coco, a água, o sal e a folha de louro.
5. Quando ferver, reduza para lume brando e tape.
6. Cozinhe 18-20 minutos sem destampar.
7. Desligue o lume e deixe repousar 5 minutos com a tampa.
8. Solte com um garfo antes de servir.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Arroz com Feijão-Nhemba',
  'Combinação clássica moçambicana de arroz com feijão-nhemba (feijão frade). Proteína completa e económica, perfeita para o dia-a-dia.',
  'mocambicana',
  'almoco',
  50,
  4,
  'facil',
  350,
  14,
  55,
  6,
  0.5,
  0,
  2,
  0.5,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'economico', 'tradicional', 'alta_proteina'],
  ARRAY['manutencao'],
  '[
    {"item": "Arroz", "quantidade": "200g", "porcao_mao": "1 mão concha"},
    {"item": "Feijão-nhemba cozido", "quantidade": "200g", "porcao_mao": "1 mão concha"},
    {"item": "Cebola", "quantidade": "1 média"},
    {"item": "Tomate", "quantidade": "2 unidades"},
    {"item": "Alho", "quantidade": "2 dentes"},
    {"item": "Azeite", "quantidade": "2 colheres de sopa"},
    {"item": "Sal e pimenta", "quantidade": "a gosto"},
    {"item": "Coentros frescos", "quantidade": "1 molho"}
  ]'::jsonb,
  '1. Se usar feijão seco, demolhe durante a noite e cozinhe até ficar macio (1h).
2. Refogue a cebola e o alho no azeite até dourar.
3. Adicione o tomate picado e cozinhe 5 minutos.
4. Junte o arroz lavado e mexa 1 minuto.
5. Adicione água (2x o volume do arroz), sal e pimenta.
6. Quando ferver, adicione o feijão-nhemba cozido.
7. Tape e cozinhe em lume brando 20 minutos.
8. Finalize com coentros frescos picados.',
  true
);

-- ===== NOVAS RECEITAS: MAIS MARISCO (costa moçambicana) =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Lulas Grelhadas à Moçambicana',
  'Lulas frescas da costa grelhadas com molho piripiri e limão. Simples, rápido e delicioso — como se come nas barracas de praia em Tofo.',
  'mocambicana',
  'jantar',
  25,
  2,
  'facil',
  220,
  28,
  4,
  10,
  1,
  1,
  0,
  0.5,
  ARRAY['marisco', 'proteico', 'sem_gluten', 'sem_lactose', 'rapido', 'omega3'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Lulas limpas", "quantidade": "400g", "porcao_mao": "1 palma"},
    {"item": "Piripiri fresco", "quantidade": "2 unidades"},
    {"item": "Limão", "quantidade": "2 unidades"},
    {"item": "Alho", "quantidade": "3 dentes"},
    {"item": "Azeite", "quantidade": "2 colheres de sopa"},
    {"item": "Salsa fresca", "quantidade": "1 molho"},
    {"item": "Sal marinho", "quantidade": "a gosto"},
    {"item": "Salada verde", "quantidade": "200g", "porcao_mao": "1 punho"}
  ]'::jsonb,
  '1. Limpe as lulas e faça cortes em losango na superfície (para não enrolar).
2. Prepare a marinada: azeite, alho picado, piripiri, sumo de 1 limão e sal.
3. Marine as lulas por 15 minutos.
4. Aqueça a grelha ou frigideira em lume alto.
5. Grelhe 2-3 minutos de cada lado (não cozinhe demais para não ficar borrachudo).
6. Sirva imediatamente com limão cortado e salada verde.
7. Regue com o resto da marinada por cima.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Caldeirada de Peixe e Marisco',
  'Guisado rico de peixe com camarão e lulas, cozinhado em molho de tomate e coco. Prato de celebração da costa moçambicana.',
  'mocambicana',
  'jantar',
  45,
  4,
  'medio',
  340,
  35,
  15,
  16,
  1.5,
  1,
  0,
  1,
  ARRAY['marisco', 'proteico', 'sem_gluten', 'sem_lactose', 'omega3', 'tradicional'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Filetes de peixe (robalo ou corvina)", "quantidade": "300g", "porcao_mao": "1 palma"},
    {"item": "Camarão médio", "quantidade": "200g"},
    {"item": "Lulas cortadas", "quantidade": "100g"},
    {"item": "Tomate maduro", "quantidade": "3 unidades", "porcao_mao": "1 punho"},
    {"item": "Leite de coco", "quantidade": "200ml"},
    {"item": "Cebola", "quantidade": "1 grande"},
    {"item": "Pimento verde", "quantidade": "1 unidade"},
    {"item": "Alho", "quantidade": "4 dentes"},
    {"item": "Piripiri", "quantidade": "1 unidade"},
    {"item": "Coentros", "quantidade": "1 molho"},
    {"item": "Azeite", "quantidade": "3 colheres de sopa"}
  ]'::jsonb,
  '1. Tempere o peixe e o camarão com sal, limão e alho. Reserve.
2. Refogue a cebola e o pimento no azeite até amolecer.
3. Adicione o tomate picado e cozinhe 10 minutos.
4. Junte o leite de coco e o piripiri, mexa bem.
5. Coloque o peixe no molho e cozinhe 8 minutos em lume brando.
6. Adicione as lulas e o camarão nos últimos 4 minutos.
7. Não mexa para não desfazer o peixe.
8. Finalize com coentros frescos. Sirva com arroz de coco ou salada.',
  true
);

-- ===== NOVAS RECEITAS: LEGUMES E ACOMPANHAMENTOS =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Couve Refogada com Coco e Amendoim',
  'Acompanhamento tradicional moçambicano que transforma uma simples couve numa explosão de sabor com coco ralado e amendoim pilado.',
  'mocambicana',
  'jantar',
  20,
  4,
  'facil',
  130,
  6,
  10,
  8,
  0,
  2,
  0,
  0.5,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'economico', 'tradicional', 'rapido'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Couve portuguesa ou couve galega", "quantidade": "500g", "porcao_mao": "2 punhos"},
    {"item": "Coco ralado fresco", "quantidade": "30g"},
    {"item": "Amendoim pilado", "quantidade": "30g"},
    {"item": "Cebola", "quantidade": "1 pequena"},
    {"item": "Tomate", "quantidade": "1 médio"},
    {"item": "Alho", "quantidade": "2 dentes"},
    {"item": "Sal", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Lave e corte a couve em tiras finas.
2. Refogue a cebola e o alho até dourar.
3. Adicione o tomate picado e cozinhe 3 minutos.
4. Junte a couve e mexa bem.
5. Tape e cozinhe 8-10 minutos até murchar.
6. Adicione o coco ralado e o amendoim pilado.
7. Mexa e sirva quente como acompanhamento.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Caril de Legumes da Zambézia',
  'Caril rico e aromático de legumes da região da Zambézia. Perfeito como prato principal vegetariano ou acompanhamento.',
  'zambeziana',
  'jantar',
  35,
  4,
  'facil',
  180,
  6,
  22,
  8,
  0,
  2,
  0.5,
  0.5,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'economico', 'tradicional'],
  ARRAY['transicao', 'manutencao'],
  '[
    {"item": "Abóbora cortada em cubos", "quantidade": "200g", "porcao_mao": "1 punho"},
    {"item": "Mandioca descascada", "quantidade": "150g"},
    {"item": "Feijão-verde", "quantidade": "100g", "porcao_mao": "1 punho"},
    {"item": "Tomate", "quantidade": "2 unidades"},
    {"item": "Cebola", "quantidade": "1 grande"},
    {"item": "Leite de coco", "quantidade": "200ml"},
    {"item": "Caril em pó", "quantidade": "1 colher de sopa"},
    {"item": "Açafrão", "quantidade": "1/2 colher de chá"},
    {"item": "Sal e piripiri", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Cozinhe a mandioca em água com sal por 15 minutos até amolecer.
2. Refogue a cebola até translúcida.
3. Adicione o caril e o açafrão, mexa 1 minuto para libertar aromas.
4. Junte o tomate picado e cozinhe 5 minutos.
5. Adicione a abóbora e o leite de coco.
6. Cozinhe 10 minutos até a abóbora amolecer.
7. Junte a mandioca cozida e o feijão-verde.
8. Cozinhe mais 5 minutos. Ajuste sal e piripiri a gosto.',
  true
);

-- ===== NOVAS RECEITAS: SNACKS E BEBIDAS MOÇAMBICANAS =====

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Castanha de Caju Torrada com Especiarias',
  'Snack premium moçambicano. As castanhas de caju frescas torradas com piripiri, sal marinho e um toque de limão são irresistíveis.',
  'mocambicana',
  'snack',
  15,
  4,
  'facil',
  190,
  6,
  10,
  15,
  0,
  0,
  0,
  1,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'keto', 'rapido', 'economico'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Castanha de caju crua", "quantidade": "200g", "porcao_mao": "1 polegar por porção"},
    {"item": "Piripiri em pó", "quantidade": "1/4 colher de chá"},
    {"item": "Sal marinho", "quantidade": "1 colher de chá"},
    {"item": "Raspa de limão", "quantidade": "1 limão"},
    {"item": "Azeite", "quantidade": "1 colher de chá"}
  ]'::jsonb,
  '1. Pré-aqueça o forno a 170°C.
2. Misture as castanhas com azeite, sal, piripiri e raspa de limão.
3. Espalhe numa bandeja de forno em camada única.
4. Torre por 10-12 minutos, mexendo a meio.
5. Retire quando douradas (atenção: continuam a tostar fora do forno).
6. Deixe arrefecer completamente — ficam mais crocantes ao arrefecer.
7. Guarde em recipiente hermético até 1 semana.',
  true
);

INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES (
  'Batido de Caju e Banana',
  'Smoothie cremoso e natural feito com leite de castanha de caju caseiro. Rico em gorduras boas e energia — perfeito para pós-treino.',
  'mocambicana',
  'snack',
  10,
  1,
  'facil',
  280,
  8,
  28,
  16,
  0,
  0,
  1,
  1,
  ARRAY['vegetariano', 'sem_gluten', 'sem_lactose', 'rapido', 'pos_treino', 'energetico'],
  ARRAY['transicao', 'manutencao'],
  '[
    {"item": "Castanha de caju", "quantidade": "50g", "porcao_mao": "1 polegar"},
    {"item": "Banana madura", "quantidade": "1 média"},
    {"item": "Água de coco ou água", "quantidade": "250ml"},
    {"item": "Mel ou tâmaras", "quantidade": "1 colher de chá"},
    {"item": "Canela", "quantidade": "pitada"},
    {"item": "Gelo", "quantidade": "a gosto"}
  ]'::jsonb,
  '1. Demolhe as castanhas de caju em água quente por 10 minutos (ou 2h em água fria).
2. Escorra e coloque no liquidificador com a água de coco.
3. Bata até ficar liso (leite de caju caseiro).
4. Adicione a banana, mel e canela.
5. Adicione gelo e bata novamente.
6. Sirva imediatamente.',
  true
);
