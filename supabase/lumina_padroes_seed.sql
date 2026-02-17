-- =====================================================
-- LUMINA - SEED DOS 23 PADRÕES DE DIAGNÓSTICO
-- =====================================================
-- Executar DEPOIS de lumina_tables.sql
-- Popula a tabela lumina_padroes com todos os padrões
-- e respectivos textos de leitura.
-- =====================================================

INSERT INTO lumina_padroes (codigo, categoria, nome, descricao, severidade, eco_recomendado, textos_leitura) VALUES

-- ===== CRÍTICOS (Severidade 5) =====
('crit_vid', 'critico', 'Vazio + Invisível + Decidir',
  'Energia zero, não se vê ao espelho, e quer decidir. Padrão de risco — não tomar decisões.',
  5, 'Vitalis',
  ARRAY[
    'Pára. Não é altura de decidir nada. Estás vazia, não te vês, e queres resolver. Protege-te de ti mesma. Espera até amanhã.',
    'Energia zero, espelho partido, e a querer agir. Não. Hoje não decides nada. Amanhã vês mais claro.',
    'Estás a funcionar no vazio e a forçar. Pára antes de te magoares com uma decisão que não é tua.'
  ]
),

('crit_pfm', 'critico', 'Passado + Futuro + Mente',
  'Passado pesa, futuro ameaça, mente ruidosa. Loop ruminativo — parar tudo.',
  5, 'Serena',
  ARRAY[
    'O passado puxa, o futuro assusta, a mente gira. Pára. Respira. Não tens de resolver nada disto agora. Só respirar.',
    'Estás presa entre o que foi e o que pode ser, e a cabeça não pára. Sai daí. Literalmente. Muda de divisão. Bebe água. Respira.',
    'Muito peso, muita projecção. Não vais resolver isto a pensar. Pára. Escreve três linhas. Depois larga.'
  ]
),

('crit_tba', 'critico', 'Tenso + Baixa + Apagada',
  'Corpo tenso, energia baixa, espelho mau. Dia de mínimos — só o essencial.',
  5, 'Vitalis',
  ARRAY[
    'Corpo tenso, energia em baixo, não te vês ao espelho. Dia difícil. Não tomes decisões importantes hoje. Cuida só do básico.',
    'O corpo está a gritar, a energia sumiu, e perdeste-te de vista. Hoje é dia de mínimos. Água. Descanso. Nada mais.',
    'Estás a operar no limite. Não é fraqueza – é sinal. Hoje fazes só o essencial. O resto espera.'
  ]
),

-- ===== MÁXIMOS (Severidade 1) =====
('forcaMax', 'maximo', 'Força Máxima',
  'Energia cheia, corpo solto, mente silenciosa, espelho luminoso. Dia de ouro.',
  1, NULL,
  ARRAY[
    'Isto é o teu melhor. Energia cheia, corpo solto, mente clara, e vês-te bem. O que fizeres agora vai ter raiz profunda. Usa este momento.',
    'Alinhamento raro. Estás presente, forte, e lúcida. Não desperdices isto em tarefas pequenas. Faz o que importa.',
    'Dia de ouro. Tudo está no sítio. Age. Cria. Decide. Hoje tens apoio interno total.'
  ]
),

('presencaRara', 'maximo', 'Presença Rara',
  'Alinhamento raro com 6+ dimensões positivas. Momento de acção.',
  1, NULL,
  ARRAY[
    'Momento raro: quase tudo alinhado. Presença real. Usa isto. Está aqui. O que fizeres agora tem peso.',
    'Estás aqui. Toda. Isso é raro. Não desperdices. Faz uma coisa importante. Agora.',
    'Presença quase total. Não deixes escapar. Este é o momento de agir, criar, ou simplesmente ser – completamente.'
  ]
),

-- ===== ALERTAS (Severidade 4) =====
('esgotamento', 'alerta', 'Esgotamento',
  'Energia baixa mas impulso de agir. Decisões no vazio são perigosas.',
  4, 'Vitalis',
  ARRAY[
    'Estás cansada e a querer resolver. Pára. Não decidas nada hoje. Deita-te 10 minutos antes de fazer o que quer que seja.',
    'A energia está em baixo mas o impulso quer agir. Cuidado. Decisões tomadas em vazio raramente são boas. Espera.',
    'Pouca energia, muita vontade de fazer. Essa combinação engana. Descansa primeiro. A clareza vem depois.'
  ]
),

('dissociacao', 'alerta', 'Dissociação',
  'Não se vê ao espelho e energia baixa ou mente ruidosa. Desconexão.',
  4, 'Imago',
  ARRAY[
    'Não te estás a ver bem e a energia está em baixo. Afasta-te do espelho hoje. Não te julgues. Não é verdade o que estás a ver.',
    'Estás desligada de ti. Isso acontece. Não forces conexão. Faz uma coisa sensorial: duche quente, chá, música. Volta ao corpo.',
    'O espelho hoje mente. E tu não tens energia para o confrontar. Deixa estar. Amanhã vês diferente.'
  ]
),

('passadoComanda', 'alerta', 'Passado Comanda',
  'Passado pesa e mente ruidosa. Loop ruminativo activo.',
  4, 'Serena',
  ARRAY[
    'O passado está a comandar o presente. A mente não pára de revisitar. Pára o ciclo. Escreve o que te pesa numa folha. Depois fecha a folha.',
    'Estás presa no que já foi. A ruminação não resolve – alimenta. Muda de cenário. Faz uma tarefa física. Quebra o loop.',
    'O ontem não larga. E a cabeça não ajuda. Não vais resolver isto a pensar. Movimento, água, ar. Depois vês.'
  ]
),

('falsaClareza', 'alerta', 'Falsa Clareza',
  'Mente clara mas corpo fechado. Decisões sem raiz corporal.',
  4, 'Ventis',
  ARRAY[
    'A mente parece clara mas o corpo está fechado. Cuidado com decisões que parecem certas mas não têm raiz. Espera pelo corpo.',
    'Tens clareza mental mas o corpo discorda. Não avances. Quando cabeça e corpo alinham, sabes. Agora, ainda não.',
    'Parece que sabes o que fazer, mas há tensão. Essa tensão é informação. Espera. Clareza real inclui o corpo.'
  ]
),

('fugaFrente', 'alerta', 'Fuga para a Frente',
  'Futuro ameaça e impulso de agir. Ansiedade disfarçada de acção.',
  4, 'Serena',
  ARRAY[
    'Estás a fugir para a frente. O futuro assusta e a resposta é agir. Mas agir agora é evitar. Pára. Olha para o medo. Não o contornes.',
    'Medo do que vem e vontade de resolver já. Essa urgência é alarme falso. Não precisas decidir agora. Respira.',
    'A ansiedade com o futuro está a empurrar-te. Cuidado. Decisões de fuga não são decisões – são reacções. Pára.'
  ]
),

('menteSabota', 'alerta', 'Mente Sabota',
  'Corpo disponível mas mente ruidosa a sabotar.',
  3, 'Ecoa',
  ARRAY[
    'O corpo está bem, mas a mente não pára. Ignora a cabeça hoje. Segue o corpo. Ele sabe o que fazer.',
    'Ruído mental com corpo disponível. Não deixes a mente comandar. Move-te. O corpo resolve o que a mente baralha.',
    'A mente está a sabotar um dia que podia ser bom. Não lhe dês ouvidos. Age a partir do corpo.'
  ]
),

('corpoGrita', 'alerta', 'Corpo Grita',
  'Corpo fechado mas mente calma. O corpo carrega algo que a mente ignora.',
  3, 'Vitalis',
  ARRAY[
    'A mente está calma mas o corpo pede atenção. Ouve-o. O que precisas fisicamente agora? Movimento? Descanso? Comida? Atende.',
    'Corpo a gritar, mente a ignorar. Não faças isso. O corpo fala primeiro. Pára e pergunta-lhe o que precisa.',
    'Tensão física com mente serena. O corpo está a carregar algo que a mente ainda não viu. Atende ao corpo primeiro.'
  ]
),

('futuroRouba', 'alerta', 'Futuro Rouba',
  'Futuro ameaça mas energia alta. Preocupação a drenar recursos.',
  3, 'Ventis',
  ARRAY[
    'O futuro está a roubar o presente. Tens energia mas ela está a ir toda para preocupação. Pára. Volta ao agora. O futuro não existe ainda.',
    'Energia boa a ser drenada por ansiedade futura. Desperdício. Traz a atenção para aqui. O que podes fazer agora? Só isso importa.',
    'Estás presente no amanhã e ausente no hoje. A energia está a escapar. Volta. Faz uma coisa. Só uma.'
  ]
),

-- ===== PROTECÇÃO (Severidade 2) =====
('recolhimento', 'proteccao', 'Recolhimento',
  'Impulso de esconder com corpo concordante. Sabedoria, não fraqueza.',
  2, NULL,
  ARRAY[
    'Queres esconder-te e o corpo concorda. Honra isso. Hoje não é dia de exposição. Recolhe. Protege. Está tudo bem.',
    'O impulso é desaparecer. E o corpo apoia. Não lutes contra isto. É sabedoria, não fraqueza. Recolhe e cuida de ti.',
    'Dia de não. Não aparecer, não forçar, não fingir. Está bem. Amanhã será diferente. Hoje, honra o não.'
  ]
),

-- ===== FERTILIDADE (Severidade 2) =====
('vazioFertil', 'fertilidade', 'Vazio Fértil',
  'Energia baixa mas silêncio e abertura. Incubação, não vazio.',
  2, NULL,
  ARRAY[
    'A energia está em baixo mas há silêncio e abertura. Este vazio não é mau. É fértil. Não o preenchas. Deixa-o estar.',
    'Cansada mas calma. Sem ruído. Este vazio pode ser incubação. Não forces nada. Confia no processo.',
    'Parece que não há nada, mas há espaço. E espaço é raro. Não o ocupes com preocupação. Descansa nele.'
  ]
),

('silencioCura', 'fertilidade', 'Silêncio Cura',
  'Mente silenciosa com corpo e energia neutros/bons. Equilíbrio raro.',
  2, NULL,
  ARRAY[
    'Mente silenciosa, corpo neutro, energia estável. Protege este estado. Não metas barulho. Este silêncio cura.',
    'Raro: paz interior. Não faças nada para a perturbar. Saboreia. Este é o teu estado natural a lembrar-te que existe.',
    'Equilíbrio delicado. Não mexas. Respira aqui. Este momento é suficiente.'
  ]
),

-- ===== ALINHAMENTO (Severidade 1) =====
('alinhamento', 'alinhamento', 'Alinhamento',
  'Energia alta, corpo aberto, mente clara. Dia de agir.',
  1, NULL,
  ARRAY[
    'Energia, corpo e mente alinhados. Bom dia para fazer o que importa. Não percas isto em tarefas pequenas.',
    'Alinhamento presente. Usa bem. Fala, cria, decide. Tens suporte interno.',
    'Dia de clareza e capacidade. Faz o que tens adiado. Hoje tens recursos.'
  ]
),

('aberturaSemDirecao', 'alinhamento', 'Abertura sem Direcção',
  'Corpo disponível mas sem impulso claro. Disponibilidade pura.',
  2, NULL,
  ARRAY[
    'Corpo disponível mas sem impulso claro. Está bem. Não precisas saber para onde. Só estar disponível já é muito.',
    'Abertura sem direcção. Não forces um rumo. Às vezes o caminho aparece quando paramos de o procurar.',
    'Pronta mas sem destino. Fica assim. A direcção vem. Por agora, só presença.'
  ]
),

('corpoLidera', 'alinhamento', 'Corpo Lidera',
  'Corpo quer agir e tem energia. Impulso físico saudável.',
  1, 'Vitalis',
  ARRAY[
    'O corpo quer ir e tem energia para isso. Segue-o. Não penses demais. Age.',
    'Impulso físico com energia. Combinação poderosa. Deixa o corpo liderar. A mente que siga.',
    'Dia de acção física. Não analises. Move-te. O corpo sabe.'
  ]
),

-- ===== CONVITE (Severidade 1) =====
('futuroConvite', 'convite', 'Futuro Convite',
  'Futuro positivo com energia. Momento de planear e avançar.',
  1, NULL,
  ARRAY[
    'O futuro parece bom e tens energia para ele. Aceita o convite. Planeia, sonha, age em direcção ao que vem.',
    'Abertura ao futuro com recursos presentes. Raro. Usa para preparar, decidir, avançar.',
    'Energia e esperança juntas. Boa altura para compromissos, planos, inícios.'
  ]
),

-- ===== NEUTROS (Severidade 2) =====
('neutralidade', 'neutro', 'Neutralidade',
  'Dia neutro, maioria normal. Manutenção.',
  2, NULL,
  ARRAY[
    'Dia neutro. Nada a puxar muito. Faz o básico. Não forces brilho. Nem tudo tem de ser intenso.',
    'Tudo no meio. Sem drama, sem euforia. Dia de manutenção. Cuida do que precisa de cuidado. Só isso.',
    'Equilíbrio cinzento. Não é mau. É descanso disfarçado. Aceita a normalidade.'
  ]
),

('transicao', 'neutro', 'Transição',
  'Mistura de sinais. Mudança em curso.',
  2, NULL,
  ARRAY[
    'Estás entre estados. Algo está a mudar. Não forces clareza. Deixa a transição acontecer.',
    'Mistura de sinais. Normal em mudança. Não interpretes demais. Observa. Espera. Move-se devagar.',
    'Nem cá nem lá. Transição. Incomoda mas é necessária. Confia no processo.'
  ]
),

-- ===== INDEFINIDO (Severidade 2) =====
('diaSemNome', 'indefinido', 'Dia sem Nome',
  'Estado não catalogável. Mistério.',
  2, NULL,
  ARRAY[
    'Há mistério em ti que não se decifra. E está bem. Não precisas de respostas hoje. Só de continuares.',
    'Estado indefinido. Não catalogável. Às vezes somos isso. Aceita o não-saber.',
    'Hoje não tens rótulo. E não precisas. Vive o dia sem o nomear. A clareza nem sempre é necessária.'
  ]
),

-- ===== ÁUREA - AUTO-SACRIFÍCIO (Severidade 4) =====
('aurea_corpoTenso', 'aurea', 'Áurea: Corpo Tenso',
  'Auto-sacrifício com corpo tenso. O corpo carrega o que dá aos outros.',
  4, 'Áurea',
  ARRAY[
    'Estás em modo de serviço constante. O corpo sente mas tu ignoras. ÁUREA pode ajudar-te a recuperar o que é teu.',
    'O teu corpo carrega o peso do que dás aos outros. Tens reservado pouco para ti. ÁUREA ensina-te a receber também.',
    'Tensão física e entrega total aos outros. O corpo grita o que tu não dizes. ÁUREA ajuda-te a existir para ti.'
  ]
),

('aurea_energiaBaixa', 'aurea', 'Áurea: Energia Baixa',
  'Auto-sacrifício com energia drenada. Esvazia-se nos outros.',
  4, 'Áurea',
  ARRAY[
    'A tua energia vai toda para fora. Nada fica para ti. ÁUREA ensina-te a reservar quota de presença.',
    'Estás vazia porque te esvaziaste nos outros. ÁUREA pode ajudar-te a guardar algo só teu.',
    'Drenaste-te em serviço. A energia que dás não volta porque não a reclamas. ÁUREA mostra-te como.'
  ]
),

('aurea_espelhoInvisivel', 'aurea', 'Áurea: Espelho Invisível',
  'Auto-sacrifício com espelho invisível. Apagou-se à força de servir.',
  4, 'Áurea',
  ARRAY[
    'Não te vês porque não te tratas como visível. ÁUREA ajuda-te a ocupar o teu lugar sem culpa.',
    'Tornaste-te invisível à força de servir. ÁUREA ensina-te a ser vista — por ti mesma primeiro.',
    'O espelho está vazio porque te apagaste. ÁUREA ajuda-te a reaparecer na tua própria vida.'
  ]
),

('aurea_isolado', 'aurea', 'Áurea: Isolado',
  'Sistema equilibrado mas não se prioriza. Ferida invisível.',
  3, 'Áurea',
  ARRAY[
    'O sistema está equilibrado, mas há uma ferida: não te colocas na lista. ÁUREA ajuda-te a ser prioridade também.',
    'Tudo parece bem — mas e tu? Quando foi a última vez que fizeste algo só para ti? ÁUREA trabalha isso.',
    'Equilibrada para fora, esquecida por dentro. ÁUREA ajuda-te a existir na tua própria agenda.'
  ]
)

ON CONFLICT (codigo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  severidade = EXCLUDED.severidade,
  eco_recomendado = EXCLUDED.eco_recomendado,
  textos_leitura = EXCLUDED.textos_leitura,
  updated_at = NOW();
