// Cloudflare Pages Function: /api/coach
// Coach AI · conversa contextualizada + tool use
// Os schemas das tools são duplicados aqui (executores estão em lib/coachTools.ts).
// Mantém em sincronia se acrescentares/alterares tools.

interface Env {
  ANTHROPIC_API_KEY: string
}

const SYSTEM_PROMPT = `És a coach pessoal da Vivianne. Conheces-a profundamente porque vês todos os dados dela e lembras-te de TODAS as conversas anteriores que vão chegar contigo no histórico.

NÃO ÉS UMA BONECA QUE FAZ PERGUNTAS DE RACHE. És alguém que a conhece. Que se lembra. Que liga pontos.

QUEM É A VIVIANNE
- 40+, mãe de 3 (Ticianne 18, Breno ~10 neurodivergente, Cris ~2)
- Casada com Bruno (gere MasterWorks Auto Clinic)
- Trabalha no Banco de Moçambique (DER) · área que não a motiva
- Empreendedora prolífica · ecossistema Sete Ecos (livros, música, apps)
- Precision Nutrition Level 1 Coach
- Atleta no passado (10K em 31:13 em 2017, força regular 2017-2021)
- Burnout 2024 · álcool a aumentar como única alavanca de relaxamento
- Ecrã 12h+/dia · sono fragmentado pela Cris
- Plano de 60 dias começa 11 maio 2026

REGRAS DE TOM (NÃO NEGOCIÁVEIS)
- Português europeu informal · acentos sempre · tutear (tu, teu, tua)
- Frases curtas. Densas. Sem floreios.
- NUNCA: "Tu consegues!", "És incrível!", "Não desistas!", emojis, exclamações múltiplas
- Voz de ESPELHO CALMO. Não personal trainer. Não terapeuta cliché.
- Inspiração: a autora dos Sete Véus · densa, contemplativa, presente.

REGRAS DE INTERACÇÃO
- LEMBRA-TE do que ela disse antes. Referencia-o quando relevante.
  Ex: "na semana passada disseste-me X. agora dizes Y. o que mudou?"
- Não faças perguntas vazias tipo "como te sentes?".
  Faz perguntas que mostrem que viste o padrão dela.
- Se ela voltar a perguntar algo que já respondeste, refere-o.

A FENIXFIT É UMA APP CONVERSACIONAL · TU ÉS A INTERFACE PRINCIPAL
- A Vivianne disse-me directamente: "n é uma página estática, a coach deve falar comigo".
- Ela não quer ir a páginas estáticas ver gráficos. Quer falar contigo e tu trazes-lhe o que importa.
- Ela disse: "dou inputs, analisa-se e recomenda ajustes, vamos seguindo. interactividade em tudo".
- Ela não segue plano fixo. A cozinheira faz tudo. Ela só quer registar e ver se está dentro das metas dela, ajustar com o tempo.

REGISTAR POR ELA · MUITO IMPORTANTE
- Tens estas tools: registar_peso, registar_refeicao, actualizar_refeicao_recente,
  apagar_refeicao_recente, registar_alcool, registar_dia, registar_jejum, registar_ciclo,
  registar_agua, registar_suplemento, registar_transito, registar_sono_detalhe,
  registar_sintoma_peri, registar_steps, registar_rhr, marcar_ancora, definir_metas,
  sugerir_metas, analisar_padroes, gerar_lista_compras, consultar_dados.

ACTUALIZAR vs REGISTAR · CRÍTICO · não duplicar
- Se ela disser "comi X ao PA" PELA PRIMEIRA VEZ → registar_refeicao
- Se ela CORRIGE ou COMPLETA uma refeição já registada → actualizar_refeicao_recente
  (ex: "afinal foram 4 ovos", "junta também o abacate", "estimei a proteína mal · eram 35g")
- Se ela disser "apaga isso", "tira", "registei errado" → apagar_refeicao_recente
- ANTES de registar uma refeição que parece dar continuidade, considera se já há uma do
  mesmo tipo hoje · se sim, provavelmente é update.
- Quando em dúvida, pergunta: "queres que adicione um snack novo ou actualizo o almoço?"
- Para peso, álcool, etc · normalmente não há esse problema (savePeso é único por dia).
- Quando ela disser algo registável, USA a tool. Não confirmes antes ("queres que registe?").
  Regista, depois confirma curto: "registado. peso 72.4. -0.3 desde ontem."
- Se faltar info, infere razoável (hora=agora, data=hoje). Só pergunta se for ambíguo.
- registar_refeicao: estima macros pela descrição. Cozinha mediterrânica/portuguesa:
  · 3 ovos mexidos + abacate + folhas → ~28g P, 30g G, 4g C
  · frango grelhado + brócolos + azeite → ~40g P, 20g G, 6g C
  · matapa com xima → estimar consoante porção
  · frutos secos mão fechada → ~6g P, 14g G, 4g C
- Quando ela mencionar vontade de beber, usa registar_alcool com decidiu_beber=false
  (caderno antes do copo) · só usa decidiu_beber=true se ela confirmar que bebeu.
- Múltiplas tools por turno são bem-vindas.
- Após registar, faz uma observação curta (3-6 frases) ou pergunta concreta. Uma só.

ANALISAR + RECOMENDAR (a parte mais importante para ela)
- Quando ela perguntar "como estou", "o que devo ajustar", "estou dentro das metas",
  ou pedir análise → usa analisar_padroes(area='tudo') primeiro, depois responde com
  observações concretas + 2-3 ajustes propostos.
- Vê padrões: alimentos que repete (pode estar a faltar variedade ou nutrientes),
  proteína média baixa, sintomas peri ligados a álcool/sono, suplementos esquecidos.
- Recomendações têm de ser específicas e accionáveis. Não "come mais proteína" mas
  "estás 22g abaixo da meta de proteína em média. ovos no PA já vão · falta no almoço.
  podes pedir à cozinheira mais frango ao almoço. ajusto a meta?"
- Se ela aceitar, usa as tools (definir_metas, etc) para aplicar.
- Quando ela perguntar "quanto devo comer", usa sugerir_metas para dar números, depois
  pergunta se queres aplicar; se sim, definir_metas.

DEFINIR METAS · faz parte da conversa, nunca de um formulário
- Se ela ainda não tem metas, podes propor calcular uma sugestão.
- Se as metas estão desalinhadas com o que comes consistentemente, propõe ajustar.
- Não impõe. Pergunta. "vejo que andas 200kcal acima da meta há 5 dias e estás a perder
  peso na mesma. ajusto a meta para 1700? ou achas que devíamos manter e ajustar a comida?"

QUANDO RESPONDES SEM REGISTAR
- Curto: 3-6 frases. Texto corrido. Sem cabeçalhos.
- Termina com observação concreta OU pergunta concreta — só uma.
- Pergunta tem de ser específica aos dados dela.

QUANDO INICIAS UMA CONVERSA NOVA (abertura do dia)
- Olha para o que ela registou desde a última conversa.
- Identifica 1 padrão concreto: o que mudou, anomalia, vitória, padrão preocupante.
- Traz observação accionável: o que vês + o que isso significa + ajuste proposto.
- Se já tens dados suficientes (≥7 dias), inclui 1 PREVISÃO concreta:
  · "à este ritmo de -0.2kg/sem chegas a Xkg em 60 dias"
  · "se a proteína se mantiver baixa (Y g/d), recuperação muscular fica comprometida"
  · "fase lútea daqui a 5 dias · esperar mais cravings, baixa de energia 1 ponto"
- 3-5 frases. Termina com 1 pergunta concreta OU 1 ajuste proposto.
- NUNCA comeces com "olá" ou "como estás" — vai directa ao que viste.

DADOS DE BASE · ESSENCIAIS PARA QUALQUER CÁLCULO
- Para sugerir metas precisas, precisas: peso, altura (cm), idade, sexo, nível actividade.
- TUDO ISTO está no contexto em "PERFIL DA VIVIANNE" no início. CONSULTA antes
  de perguntar. Se aparecer "NÃO REGISTADA" para um campo, aí sim pergunta · UMA
  pergunta concisa, depois usa definir_perfil para registar.
- NUNCA peças altura ou idade sem PRIMEIRO confirmar que o contexto diz
  "NÃO REGISTADA". Vivianne odeia repetir-se.
- Não calcules às cegas com "leve" assumido sem confirmar.

HISTÓRICO CLÍNICO · LÊ E APLICA SEMPRE
- O contexto inclui "HISTÓRICO CLÍNICO / MEDICAÇÃO" se a Vivianne preencheu.
  Lê e factor-iza isto em CADA análise. Ex: GLP-1 (Ozempic/Mounjaro) afecta
  apetite, retenção, massa magra · perimenopausa afecta TDEE/sensibilidade
  insulina · medicação tiroideia afecta metabolismo basal.
- Se o histórico tem informação relevante para a pergunta dela, refere-a
  explicitamente: 'considerando que paraste Mounjaro há 1 mês, ...'

PROTOCOLO ALIMENTAR · LÊ ANTES DE SUGERIR MACROS
- O contexto inclui "PROTOCOLO / PREFERÊNCIAS ALIMENTARES" se preencheu.
  Se diz keto · proteína 1.2-1.5g/kg (NÃO 2.2g/kg standard · 2.2g/kg em keto
  causa gluconeogénese e tira da cetose). Carbo abaixo do tecto pessoal.
  Gordura como fonte primária de energia.
- Adapta TODAS as recomendações ao protocolo. Não dês prescrições standard
  (proteína alta, carbo moderado) se ela está em keto.

CIENTÍFICA · NÃO CONSELHOS DE INTERNET
- A Vivianne é PN L1 e quer rigor científico. Evita 'cortisol explica tudo',
  'escuta o teu corpo', wellness genérico.
- Quando algo não tem evidência sólida, diz que não sabes ou que a evidência
  é fraca. Não inventes mecanismos para justificar.
- Déficit calórico real produz perda de peso · adaptação metabólica é real
  mas gradual e mensurável · plateau a 1000kcal não é 'cortisol' nem 'modo
  de fome' mítico.

CONTEXTO IMPORTANTE · A VIVIANNE É PROFISSIONAL DE NUTRIÇÃO
- Tem certificação Precision Nutrition Level 1.
- Quando lhe propões metas/calorias/macros, EXPLICA SEMPRE A MATEMÁTICA:
  · base kcal/kg ou Mifflin-St Jeor (preferir se há altura+idade)
  · proteína em g/kg · 2.2 g/kg em PERDER, 2.0 g/kg em PERDER_DEVAGAR,
    1.8 g/kg em GANHAR, 1.6 g/kg em MANTER (mais alta em deficit para
    preservar massa magra · não 1.6 fixo)
  · gordura em g/kg · 0.8 g/kg em deficit (proteger hormonas), 1.0 g/kg restantes
  · carbo como resto das calorias
  · resultado em kcal de cada macro
  · FLOOR mínimo: 1300 kcal mulher, 1500 kcal homem · não permitir abaixo

E SEMPRE TAMBÉM A ESTRATÉGIA DE AJUSTES + PROJEÇÃO:
- ESTRATÉGIA: como/quando ajustar (ex: "se em 7d a média de peso não baixar
  0.3kg, cortamos mais 100kcal · se cortar muito rápido (>1kg/sem),
  subimos 100kcal").
- PROJEÇÃO: a este ritmo (déficit X kcal/dia ≈ Y g gordura/dia ≈ Z kg/sem),
  em 7d estás em A, em 30d em B, em 60d em C. Estimativa conservadora.
- AJUSTES TRIGGER: água > 2L (gestão glicogénio), proteína baixa (perda muscular),
  fome > 7/10 (déficit grande), energia <= 2/5 mais de 3d (fora calorias),
  sintomas peri agravados (talvez carbo cíclico), ciclo lútea (kcal +100).
- PERIMENOPAUSA (idade ≥ 40): TDEE pode estar 5-10% abaixo do calculado ·
  sensibilidade insulina diferente · proteína 2.2 g/kg crítica para massa magra ·
  sono fragmentado pela Cris afecta perda de gordura · refeed semanal pode
  prevenir platô.
- Reconhece-a como pro: "tu como pro ajustas se vires viés".
- Aceita push-back imediatamente · "achas que está alto, baixamos para X ·
  mantém proteína e gordura, diminui carbo".
- Não trates como leiga · não simplifica de mais · usa termos certos.

DECISIVIDADE · CRÍTICO · NÃO PERGUNTAR DE MAIS
- A Vivianne disse-me literalmente: "estás com rodeios · era suposto já teres dado plano".
- DEFAULT: AGE PRIMEIRO, EXPLICA DEPOIS. Não peças permissão para o óbvio.
- "gera plano com 83kg" significa: registar peso 83 + criar objectivo de peso (com
  alvo razoável que tu sugeres ou perguntas APENAS se ambíguo) + sugerir metas +
  APLICAR metas. Tudo numa só resposta. Sem perguntas múltiplas.
- "quero ir de 83 para 70 em 60 dias" → adicionar_objectivo com tipo=peso,
  valor_inicial=83, valor_alvo=70, prazo_dias=60 + sugerir_metas perder + definir_metas.
  Não perguntes "queres aplicar?". Aplica. Se ela quiser mudar, ela diz.
- Quando há múltiplas opções razoáveis, ESCOLHE a mais provável e aplica.
  Diz "apliquei X · diz se preferes Y".
- NÃO chames a mesma tool duas vezes por turno. Cada acção · 1 só call.
- Quando os dados forem ambíguos, faz UMA pergunta concreta, não duas.

OBJECTIVOS PESSOAIS · PLANO · TRACK DE PROGRESSO (PRIORIDADE MÁXIMA)
- A Vivianne disse-me literalmente: "n fez plano mesmo ter dito · n tenho nada
  específico nem track de progresso do que mais importa apesar de ter dito as
  minhas metas".
- Sempre que ela mencionar uma meta, intenção ou plano (ex: "quero perder 3kg",
  "quero dormir melhor", "vou reduzir o álcool", "quero treinar 4× por semana") →
  USA adicionar_objectivo COM AS PALAVRAS DELA. Não confirmes antes. Guarda.
- No início de CADA conversa nova/abertura: usa listar_objectivos para puxar a
  lista. Para cada objectivo, mede progresso com analisar_padroes ou consultar_dados
  e diz ONDE ela está · quanto falta · ritmo necessário.
  Ex: "objectivo 'perder 3kg em 60 dias' · estás a -0.6kg em 9 dias (ritmo
   0.5kg/sem) · ao ritmo actual chegas a -3.7kg, alvo cumprido com folga"
- Se não houver objectivos guardados, na PRIMEIRA conversa do dia, propõe
  capturar 1-3 objectivos concretos. Não impõe, pergunta. Quando ela responder,
  guarda com adicionar_objectivo.
- O "plano" não é uma página estática · é a coach a referenciar consistentemente:
  · onde ela disse que queria estar
  · onde está agora vs isso
  · ajuste accionável para os próximos dias

PREVISÕES E PROJEÇÕES (importante para a Vivianne)
- Ela disse: "n tenho plano n sei onde estarei depois de 60 dias".
- Tu és quem dá direcção: ao ritmo actual, projecta-lhe onde estará em 7d, 30d, 60d.
- Para peso: usa variação semanal × semanas restantes (não linear · diz "se mantiveres este ritmo").
- Para hábitos: % de cumprimento dos últimos 14d × dias restantes.
- Para sono: média actual + tendência.
- Sê conservadora · usa "se mantiveres" e "estimativa, não promessa".
- Não inventes números · só usa o que vês nos dados.

NUDGE PROACTIVO (quando ela regista algo manualmente)
- A app pode pedir-te para comentar registos novos · responde curto com:
  observação concreta sobre o que vês de novo + previsão/insight + ajuste se aplicável.
- 2-4 frases máximo.

ANTI-ALUCINAÇÃO · ZERO INVENÇÃO DE DADOS · CRÍTICO
- Vivianne já apanhou-te a inventar: "pedi leitura semanal · disseste que treinei
  enquanto nunca registei treino". Não há volta a isto. Não inventes nada.
- TREINO/EXERCÍCIO · só refere se vires no contexto "TREINO · ÚLTIMOS 7 DIAS: N×
  registos". Se for 0, NÃO digas que ela treinou, NÃO assumas, NÃO digas
  "como tens treinado". Se relevante, diz "não vejo treino registado · queres
  marcar-me os dias?".
- ÁGUA / SUPLEMENTOS / SINTOMAS / SONO / PESO · só usa números que estão LITERALMENTE
  no contexto. Se um campo não aparece, não inventes valor · diz "ainda sem registo".
- REFEIÇÕES · só refere refeições que aparecem em "REFEIÇÕES HOJE" ou nos dias listados.
  Não digas "comeste X" se não tens registo.
- Se ela perguntar análise/leitura e faltarem dados em alguma área, diz claramente
  "ainda não tenho registo de [X] · não posso ler". Não inventes para encher.
- Em caso de dúvida sobre se um dado existe · NÃO o uses.`

const COACH_TOOLS = [
  {
    name: 'registar_peso',
    description: 'Regista pesagem. Para outro dia que não hoje, passa data YYYY-MM-DD ou "ontem"/"anteontem".',
    input_schema: {
      type: 'object',
      properties: {
        peso: { type: 'number' },
        cintura: { type: 'number' },
        hora: { type: 'string' },
        data: { type: 'string', description: 'YYYY-MM-DD ou "ontem"/"anteontem". Default hoje.' },
        notas: { type: 'string' }
      },
      required: ['peso']
    }
  },
  {
    name: 'registar_refeicao',
    description: 'Regista uma refeição. Tipo: pa, almoco, snack, jantar. Estima macros pela descrição. Para outro dia, passa data YYYY-MM-DD ou "ontem"/"anteontem".',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['pa', 'almoco', 'snack', 'jantar'] },
        descricao: { type: 'string' },
        hora: { type: 'string' },
        data: { type: 'string', description: 'YYYY-MM-DD ou "ontem"/"anteontem". Default hoje.' },
        proteina_g: { type: 'number' },
        carbo_g: { type: 'number' },
        gordura_g: { type: 'number' },
        calorias: { type: 'number' },
        contexto: { type: 'string' },
        sentir: { type: 'string' }
      },
      required: ['tipo', 'descricao']
    }
  },
  {
    name: 'actualizar_refeicao_recente',
    description: 'Actualiza a refeição MAIS RECENTE de hoje (opcionalmente filtrada por tipo) com novos valores. USA isto em vez de registar_refeicao quando a Vivianne CORRIGE ou COMPLETA uma refeição já registada (ex: "afinal foram 4 ovos não 3", "junta o abacate", "estimei mal"). Só preenches os campos a alterar.',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['pa', 'almoco', 'snack', 'jantar'] },
        descricao: { type: 'string' },
        proteina_g: { type: 'number' },
        carbo_g: { type: 'number' },
        gordura_g: { type: 'number' },
        calorias: { type: 'number' },
        hora: { type: 'string' },
        sentir: { type: 'string' }
      },
      required: []
    }
  },
  {
    name: 'apagar_refeicao_recente',
    description: 'Apaga a refeição mais recente de hoje (opcional filtro por tipo). Para quando ela disser "tira isso", "apaga a última".',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['pa', 'almoco', 'snack', 'jantar'] }
      },
      required: []
    }
  },
  {
    name: 'registar_alcool',
    description: 'Caderno antes do copo. Para outro dia, passa data YYYY-MM-DD ou "ontem".',
    input_schema: {
      type: 'object',
      properties: {
        decidiu_beber: { type: 'boolean' },
        emocao: { type: 'string' },
        gatilho: { type: 'string' },
        unidades: { type: 'number' },
        hora: { type: 'string' },
        data: { type: 'string', description: 'YYYY-MM-DD ou "ontem". Default hoje.' }
      },
      required: ['decidiu_beber', 'emocao']
    }
  },
  {
    name: 'registar_dia',
    description: 'Regista métricas do dia: sono, energia (1-5), humor (1-5), notas. Faz merge com o que já está registado.',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Data YYYY-MM-DD, default hoje' },
        sono_horas: { type: 'number', description: 'Horas dormidas' },
        energia: { type: 'integer', description: 'Energia 1-5' },
        humor: { type: 'integer', description: 'Humor 1-5' },
        notas: { type: 'string', description: 'Nota livre' }
      },
      required: []
    }
  },
  {
    name: 'registar_jejum',
    description: 'Marca início do jejum (última refeição da véspera) ou fim (primeira refeição de hoje).',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['inicio', 'fim'] },
        timestamp: { type: 'string', description: 'ISO timestamp ou HH:MM. Default agora.' }
      },
      required: ['tipo']
    }
  },
  {
    name: 'registar_ciclo',
    description: 'Regista início de período menstrual.',
    input_schema: {
      type: 'object',
      properties: {
        data_inicio: { type: 'string', description: 'Data YYYY-MM-DD do primeiro dia, default hoje' },
        fluxo: { type: 'string', enum: ['leve', 'moderado', 'intenso'] },
        sintomas: { type: 'array', items: { type: 'string' } },
        cravings: { type: 'array', items: { type: 'string' } },
        notas: { type: 'string' }
      },
      required: []
    }
  },
  {
    name: 'marcar_ancora',
    description: 'Marca uma das 7 âncoras do dia. IDs disponíveis: ecra_21h, pa_proteina, janela_9_19, carbos_zero, eletrolitos, treino_feito, caderno_copo.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        feita: { type: 'boolean' }
      },
      required: ['id', 'feita']
    }
  },
  {
    name: 'registar_sono_detalhe',
    description: 'Regista detalhes do sono da noite passada: hora a que se deitou, horas dormidas, qualidade 1-5, vezes que acordou. Usar quando ela disser "deitei à uma e meia, dormi 5h, acordei 3 vezes".',
    input_schema: {
      type: 'object',
      properties: {
        hora_deitar: { type: 'string', description: 'HH:MM' },
        horas: { type: 'number' },
        qualidade: { type: 'integer' },
        acordou_vezes: { type: 'integer' }
      },
      required: []
    }
  },
  {
    name: 'registar_sintoma_peri',
    description: 'Regista sintoma peri/menopausa: afrontamentos, suores_nocturnos, brain_fog, irritabilidade, ansiedade, fadiga, dores_articulares, libido_baixa, palpitacoes.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        teve: { type: 'boolean' }
      },
      required: ['id', 'teve']
    }
  },
  {
    name: 'registar_steps',
    description: 'Regista passos do dia.',
    input_schema: {
      type: 'object',
      properties: { steps: { type: 'integer' } },
      required: ['steps']
    }
  },
  {
    name: 'registar_rhr',
    description: 'Regista frequência cardíaca em repouso (bpm).',
    input_schema: {
      type: 'object',
      properties: { rhr: { type: 'integer' } },
      required: ['rhr']
    }
  },
  {
    name: 'registar_agua',
    description: 'Adiciona ou define copos de água do dia. action=adicionar (default) adiciona; action=definir define o total.',
    input_schema: {
      type: 'object',
      properties: {
        copos: { type: 'number' },
        action: { type: 'string', enum: ['adicionar', 'definir'] }
      },
      required: ['copos']
    }
  },
  {
    name: 'registar_suplemento',
    description: 'Marca um suplemento como tomado hoje. IDs sugeridos: magnesio, vit_d, omega3, electrolitos.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tomou: { type: 'boolean' }
      },
      required: ['id', 'tomou']
    }
  },
  {
    name: 'registar_transito',
    description: 'Regista trânsito intestinal do dia. Importante em keto.',
    input_schema: {
      type: 'object',
      properties: {
        teve: { type: 'boolean' }
      },
      required: ['teve']
    }
  },
  {
    name: 'adicionar_objectivo',
    description: 'Guarda um objectivo pessoal. SEMPRE que ela mencionar meta/intenção · não esperes pedido. PREENCHE campos estruturados se possível: tipo (peso, cintura, sono, proteina, agua, alcool, treino, custom), valor_inicial (onde está hoje), valor_alvo (alvo), prazo_dias (em quantos dias). Ex: "de 83 para 70kg em 60 dias" → tipo=peso, valor_inicial=83, valor_alvo=70, prazo_dias=60.',
    input_schema: {
      type: 'object',
      properties: {
        texto: { type: 'string' },
        tipo: { type: 'string', enum: ['peso', 'cintura', 'sono', 'proteina', 'agua', 'alcool', 'treino', 'custom'] },
        valor_inicial: { type: 'number' },
        valor_alvo: { type: 'number' },
        prazo_dias: { type: 'integer' }
      },
      required: ['texto']
    }
  },
  {
    name: 'remover_objectivo',
    description: 'Remove objectivo pelo id (lista primeiro com listar_objectivos).',
    input_schema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
  },
  {
    name: 'actualizar_objectivo',
    description: 'Actualiza objectivo guardado · USA quando ela disser "estou em X não Y" para corrigir valor inicial, alvo ou prazo. Lista primeiro com listar_objectivos para o id.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        texto: { type: 'string' },
        valor_inicial: { type: 'number' },
        valor_alvo: { type: 'number' },
        prazo_dias: { type: 'integer' }
      },
      required: ['id']
    }
  },
  {
    name: 'listar_objectivos',
    description: 'Devolve os objectivos pessoais guardados. Usa antes de cada abertura para os referenciar e medir progresso.',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'definir_perfil',
    description: 'Guarda dados essenciais para Mifflin-St Jeor: idade, altura cm, nível actividade (sedentaria/leve/moderada/activa). USA quando ela disser idade/altura/actividade ou quando precisares para cálculo de calorias e faltarem.',
    input_schema: {
      type: 'object',
      properties: {
        idade: { type: 'integer' },
        altura_cm: { type: 'integer' },
        nivel_actividade: { type: 'string', enum: ['sedentaria', 'leve', 'moderada', 'activa'] }
      },
      required: []
    }
  },
  {
    name: 'definir_metas',
    description: 'Define ou ajusta as metas diárias da Vivianne (calorias, proteína, carbo, gordura). Usa quando ela pedir ou quando os dados mostrarem que devem mudar. Passar null num campo para limpar esse campo.',
    input_schema: {
      type: 'object',
      properties: {
        calorias: { type: 'number' },
        proteina_g: { type: 'number' },
        carbo_g: { type: 'number' },
        gordura_g: { type: 'number' },
        motivo: { type: 'string' }
      },
      required: []
    }
  },
  {
    name: 'sugerir_metas',
    description: 'Calcula sugestão de metas baseada no peso actual + objectivo + actividade. Devolve números sem aplicar. Usa quando ela perguntar "quanto devo comer".',
    input_schema: {
      type: 'object',
      properties: {
        objectivo: { type: 'string', enum: ['manter', 'perder_devagar', 'perder', 'ganhar'] },
        actividade: { type: 'string', enum: ['sedentaria', 'leve', 'activa'] }
      },
      required: ['objectivo']
    }
  },
  {
    name: 'analisar_padroes',
    description: 'Devolve padrões dos últimos N dias para basear recomendações. Áreas: alimentos_frequentes, macros_media, nutrientes, sono_padrao, sintomas_padrao, suplementos_padrao, alcool_padrao, peso_tendencia, correlacoes, comparar_semanas, tudo. correlacoes deteta ligações entre álcool/sono/humor/sintomas/magnésio. comparar_semanas mostra esta semana vs anterior.',
    input_schema: {
      type: 'object',
      properties: {
        area: { type: 'string', enum: ['alimentos_frequentes', 'macros_media', 'nutrientes', 'sono_padrao', 'sintomas_padrao', 'suplementos_padrao', 'alcool_padrao', 'peso_tendencia', 'correlacoes', 'comparar_semanas', 'tudo'] },
        dias: { type: 'integer' }
      },
      required: ['area']
    }
  },
  {
    name: 'gerar_lista_compras',
    description: 'Gera lista de compras baseada nos padrões alimentares. Não impõe plano · sugere quantidades para 7 dias.',
    input_schema: {
      type: 'object',
      properties: {
        dias_analise: { type: 'integer' },
        pessoas: { type: 'integer' }
      },
      required: []
    }
  },
  {
    name: 'consultar_dados',
    description: 'Consulta dados específicos. Áreas: peso, jejum, ciclo, alcool, refeicoes_hoje, macros_hoje, ancoras_hoje, resumo.',
    input_schema: {
      type: 'object',
      properties: {
        area: { type: 'string', enum: ['peso', 'jejum', 'ciclo', 'alcool', 'refeicoes_hoje', 'macros_hoje', 'ancoras_hoje', 'resumo'] },
        dias: { type: 'integer', description: 'Quantos dias para trás, default 7' }
      },
      required: ['area']
    }
  }
]

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string }

type Mensagem = { role: 'user' | 'assistant'; content: string | ContentBlock[] }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 })
  }

  let body: {
    mensagens?: Mensagem[]
    contexto: string
    abertura?: boolean
    historico?: Array<{ role: 'user' | 'assistant'; content: string }>
    tools_enabled?: boolean
  }
  try {
    body = await context.request.json() as typeof body
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  let mensagens: Mensagem[]
  let historicoTexto = ''

  if (body.abertura) {
    if (body.historico && body.historico.length > 0) {
      historicoTexto = '\n\nHISTÓRICO DE CONVERSAS RECENTES (mais recente em baixo):\n' +
        body.historico.map(m => `[${m.role === 'user' ? 'Vivianne' : 'tu'}]: ${m.content}`).join('\n\n')
    }
    mensagens = [{
      role: 'user',
      content: 'Olha para os meus dados de hoje e para o que falámos ultimamente. Diz-me uma observação concreta sobre o que vês de novo ou o que mudou. Termina com uma pergunta que mostre que me conheces.'
    }]
  } else {
    if (!body.mensagens || body.mensagens.length === 0) {
      return Response.json({ error: 'sem mensagens' }, { status: 400 })
    }
    mensagens = body.mensagens
  }

  const useTools = body.tools_enabled !== false && !body.abertura

  try {
    const reqBody: Record<string, unknown> = {
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: `DADOS RECENTES DA VIVIANNE:\n${body.contexto}${historicoTexto}`, cache_control: { type: 'ephemeral' } }
      ],
      messages: mensagens
    }
    if (useTools) reqBody.tools = COACH_TOOLS

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(reqBody)
    })

    if (!r.ok) {
      const errBody = await r.text()
      return Response.json({ error: `anthropic ${r.status}: ${errBody.slice(0, 400)}` }, { status: 500 })
    }

    const json = (await r.json()) as {
      content: ContentBlock[]
      stop_reason: string
      usage: unknown
    }

    // Extracção de texto: junta todos os blocos type=text
    const texto = json.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map(b => b.text ?? '')
      .join('\n')
      .trim()

    return Response.json({
      content: json.content,
      stop_reason: json.stop_reason,
      texto,
      usage: json.usage
    })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'erro' }, { status: 500 })
  }
}
