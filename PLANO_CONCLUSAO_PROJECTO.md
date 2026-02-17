# PLANO DE CONCLUSAO — SETE ECOS PWA

**Data**: Fevereiro 2026
**Versao**: 2.0 (com correccoes da Vivianne)
**Objectivo**: Concluir todos os 7 Ecos + Aurora, transformando a plataforma completa

---

## ESTADO ACTUAL DO PROJECTO

| Eco | Chakra | Foco | Estado | Componentes |
|-----|--------|------|--------|-------------|
| **VITALIS** | Muladhara | Corpo/Nutricao | Producao | 36 |
| **AUREA** | — | Valor/Presenca | Producao | 15 |
| **LUMINA** | Ajna | Visao/Diagnostico | Producao (gratuito) | 1 pagina |
| **COMUNIDADE** | — | Social/Autoconhecimento | Producao | 19 |
| **SERENA** | Svadhisthana | Emocao/Fluidez | Por construir | 0 |
| **IGNIS** | Manipura | Vontade/Direccao Consciente | Por construir | 0 |
| **VENTIS** | Anahata | Energia/Ritmo | Por construir | 0 |
| **ECOA** | Vishuddha | Voz/Desbloqueio do Silencio | Por construir | 0 |
| **IMAGO** | Sahasrara | Identidade/Espelho | Por construir | 0 |
| **AURORA** | — | Integracao Final | Por construir | 0 |

**Resumo**: 4 de 10 modulos prontos. Faltam 6 modulos + melhorias no Aurea.

---

## ABORDAGEM: CONSTRUCAO POR FASES

Cada modulo novo segue o mesmo padrao arquitectonico ja estabelecido pelo Vitalis e Aurea:

### Estrutura-padrao por modulo
```
src/components/[eco]/
  |- Dashboard[Eco].jsx       # Hub principal
  |- [Eco]AccessGuard.jsx     # Guarda de subscricao
  |- Pagamento[Eco].jsx       # Pagamento (PayPal + M-Pesa)
  |- Onboarding.jsx           # Setup inicial
  |- Chat[Eco].jsx            # Coach IA do eco
  |- Perfil[Eco].jsx          # Perfil do utilizador
  |- Notificacoes[Eco].jsx    # Configuracao de notificacoes
  |- Insights[Eco].jsx        # Analise semanal
  +-- [componentes especificos do eco]

src/lib/[eco]/
  |- subscriptions.js         # Gestao de subscricoes
  |- gamificacao.js            # Sistema de pontos/badges
  +-- [logica especifica]

supabase/
  +-- [eco]_tables.sql         # Tabelas do modulo
```

---

## FASE 0: FUNDACAO PARTILHADA

Antes de construir modulos novos, criar infraestrutura reutilizavel.

### 0.1 — Fabrica de Modulos (Module Factory)
- **`src/lib/shared/moduleFactory.js`** — funcoes genericas:
  - `createAccessGuard(eco, config)` — gera guarda de acesso
  - `createSubscriptionManager(eco, plans)` — gestao de subscricoes
  - `createGamificacaoBase(eco, levels, badges)` — base de gamificacao
  - `createChatBase(eco, personality)` — base do coach IA

- **`src/lib/shared/subscriptionPlans.js`** — planos de preco centralizados
- **`src/lib/shared/paymentFlow.js`** — fluxo PayPal + M-Pesa reutilizavel

### 0.2 — Componentes Genericos Partilhados
- `src/components/shared/ModuleHeader.jsx` — header reutilizavel
- `src/components/shared/ModuleDashboardShell.jsx` — shell de dashboard
- `src/components/shared/PaymentPage.jsx` — pagina de pagamento generica
- `src/components/shared/OnboardingShell.jsx` — wizard de onboarding reutilizavel
- `src/components/shared/GamificationSystem.jsx` — sistema de pontos/badges generico
  - Aceita: currency (joias/gotas/chamas/folhas/ecos/estrelas), levels, badges, tracking
- `src/components/shared/AICoach.jsx` — coach IA generico
  - Aceita: personality (calm/direct/gentle/creative/deep), responseStyle, prompts
- `src/components/shared/CheckInSystem.jsx` — check-ins generico
  - Aceita: frequency (daily/3x-day/weekly), questions, tracking
- `src/components/shared/InsightEngine.jsx` — relatorios generico
  - Aceita: period (weekly/monthly), metrics, visualizations
- `src/components/shared/NotificacoesModule.jsx` — notificacoes generico
  - Aceita: tone (gentle/motivating/neutral), frequency, templates

### 0.3 — Tabelas Base (Supabase)
Template SQL para cada modulo com colunas comuns.

### 0.4 — Lumina Integration Points
Actualizar `lumina-leituras.js` para activar links dos ecos conforme ficam prontos.

---

## FASE 1: SERENA — Emocao & Fluidez

**Chakra**: Svadhisthana (Sacral)
**Cor**: #6B8E9B
**Elemento**: Agua
**Objectivo**: Ajudar a regular e processar emocoes

### Componentes Especificos

| Componente | Descricao |
|------------|-----------|
| **DiarioEmocional.jsx** | Diario com roda de emocoes interactiva (toque/deslize). Registo diario de: emocao dominante, intensidade (1-10), trigger, onde sentiu no corpo, e reflexao livre. Padrao visual: ondas de agua. |
| **MapaEmocional.jsx** | Mapa de calor emocional ao longo do tempo. Visualizacao mensal (cores por emocao), correlacao com ciclo menstrual (se activo), identificacao de padroes recorrentes. Usa Recharts. |
| **RespiracaoGuiada.jsx** | 6 exercicios de respiracao guiada com animacao visual (circulo que expande/contrai). Tecnicas: 4-7-8, box breathing, respiracao oceanica, suspiro fisiologico, respiracao alternada, respiracao de coerencia cardiaca. Timer visual + haptic feedback. |
| **RituaisLibertacao.jsx** | Praticas de libertacao emocional: carta nao-enviada (escrever e "queimar" digitalmente), ritual de agua (visualizacao), sacudimento corporal (guia), danca livre (timer + playlist sugerida), vocalizacao (guia de sons). |
| **FluidezPraticas.jsx** | 50+ micro-praticas do elemento agua: banho consciente, beber agua com intencao, chorar sem julgar, deixar ir, fluir com mudancas. Organizadas por nivel. |
| **CicloEmocional.jsx** | Rastreio do ciclo emocional (independente do menstrual). Mapeia fases: acumulacao -> pico -> libertacao -> calma. Integra com dados do Lumina. |
| **SOSEmocional.jsx** | **NOVO** Botao de emergencia sempre visivel. 3 tecnicas rapidas de 2-3 min (respiracao box, 5-4-3-2-1 grounding, body scan). Sem registo obrigatorio — pode fazer e sair. |
| **DetectorPadroes.jsx** | **NOVO** Apos 2 semanas de uso: "Aos domingos a noite, a ansiedade sobe 60%", "Raiva aparece sempre depois de reunioes", "Tristeza aumenta nos dias sem exercicio". |
| **BibliotecaEmocoes.jsx** | **NOVO** Explicacao de cada emocao: o que e, para que serve, como lidar, diferenca entre emocoes parecidas (ex: tristeza vs melancolia). |
| **CicloMenstrual.jsx** | **NOVO** Opcional: correlacionar emocoes com fase do ciclo. "Fase lutea — irritabilidade e esperada". Ajustar expectativas de regulacao. |

### Coach IA: "Serena" (personalidade)
- Tom: Calmo, acolhedor, validador
- Nunca minimiza emocoes ("nao fiques triste" -> proibido)
- Valida primeiro, explora depois, sugere praticas
- Detecta: supressao emocional, alexitimia, overwhelm

### Gamificacao: "Gotas"
- Niveis: Nascente -> Riacho -> Rio -> Oceano
- Ganhar gotas: registar emocoes, respiracao, rituais, praticas
- Badges: "Primeira Lagrima" (chorar sem culpa), "7 Dias de Fluxo", etc.

### Tabelas Supabase
```
serena_clients          — subscricao, fase, gotas_total, nivel
serena_emocoes_log      — data, emocao, intensidade, trigger, corpo_zona, reflexao
serena_respiracao_log   — data, tecnica, duracao_minutos, sensacao_antes, sensacao_depois
serena_rituais_log      — data, tipo_ritual, reflexao
serena_praticas_log     — data, pratica_id, sentimento
serena_ciclo_emocional  — data, fase (acumulacao/pico/libertacao/calma)
serena_ciclo_menstrual  — data, fase_ciclo, emocao_correlacao
serena_chat_messages    — user_id, role, content, created_at
```

### Preco sugerido
- Mensal: 750 MZN (~$12 USD)
- Semestral: 3,825 MZN (15% desconto)
- Anual: 7,200 MZN (20% desconto)

---

## FASE 2: IGNIS — Vontade & Direccao Consciente

**Chakra**: Manipura (Plexo Solar)
**Cor**: #C1634A
**Elemento**: Fogo
**Objectivo**: Direccao consciente — escolher sem traicao interna, cortar o que dispersa

**NOTA**: IGNIS NAO e produtividade generica. E sobre vontade propria, escolha alinhada
com valores, e corte do que dispersa. Cada feature pergunta "isto serve-me ou serve
expectativas alheias?"

### Componentes Especificos

| Componente | Descricao |
|------------|-----------|
| **EscolhasConscientes.jsx** | (substituiu MissoesDiarias) 3 Escolhas Conscientes diarias. Nao sao tarefas — sao decisoes alinhadas. Pergunta: "Isto serve-me ou serve expectativas alheias?" Cada escolha com reflexao: "Porque escolhi isto?" Review nocturno. |
| **FocoConsciente.jsx** | (ajustado de FocoTimer) Timer com intencao. Antes: "Isto e realmente importante ou estou a evitar algo?" Depois: "Isto aproximou-me do que importa?" Sessoes 25/50/90 min. Animacao de chama. |
| **RastreadorDispersao.jsx** | (substituiu HabitTracker) O que te desvia do essencial? Quantas vezes disseste sim quando querias dizer nao? Onde gastas energia em coisas que nao importam? Tracking de dispersao, nao habitos. |
| **ExercicioCorte.jsx** | **NOVO** Pratica semanal: "Lista 10 coisas que fazes esta semana" -> "Risca 3 que nao sao tuas" -> "Qual foi a primeira vez que disseste sim a isto?" Ritual de corte consciente. |
| **BussolaValores.jsx** | **NOVO** Setup inicial: identificar 5 valores essenciais. Cada decisao e medida contra estes valores. "Esta escolha alinha com o teu valor X?" Bussola visual interactiva. |
| **DiarioConquistas.jsx** | Registo diario de 3 conquistas alinhadas. "Hoje consegui..." — foco no que FEZ com intencao. Biblioteca pessoal de vitorias conscientes. |
| **DesafiosFogo.jsx** | Desafios semanais de coragem e alinhamento. 4 categorias: Coragem, Corte, Alinhamento, Iniciativa Propria. |
| **PlanoAccao.jsx** | Planeamento de objectivos com decomposicao em passos. Cada objectivo verificado contra a Bussola de Valores. Timeline visual. Review semanal. |

### Coach IA: "Ignis" (personalidade)
- Tom: Directo, sem paternalismo, respeitoso
- Estilo: "Isto e teu ou e de alguem?" (foco em escolha consciente)
- Detecta: procrastinacao, perfeccionismo paralisante, auto-sabotagem, people-pleasing
- Nunca aceita desculpas sem explorar o que esta por tras
- Questiona motivacoes externas: "Queres isto para ti ou para provar algo?"

### Gamificacao: "Chamas"
- Niveis: Faisca -> Brasa -> Chama -> Fogueira
- Ganhar chamas: escolhas conscientes, foco, cortes, conquistas alinhadas
- Badges: "Primeiro Nao" (1o corte), "Semana Alinhada" (7 dias), etc.

### Tabelas Supabase
```
ignis_clients           — subscricao, fase, chamas_total, nivel
ignis_escolhas          — data, escolha_1/2/3, reflexao, alinhamento_valores
ignis_foco_sessions     — data, duracao, intencao_antes, reflexao_depois, foco_nivel
ignis_dispersao_log     — data, situacao, disse_sim_queria_nao, energia_gasta
ignis_corte_semanal     — data, lista_10, cortadas_3, reflexao
ignis_valores           — user_id, valores_top_5 (JSON), updated_at
ignis_conquistas_log    — data, conquista_1/2/3, alinhada_com_valor
ignis_desafios_log      — data, desafio_id, categoria, completou
ignis_chat_messages     — user_id, role, content, created_at
```

### Preco sugerido
- Mensal: 750 MZN
- Semestral: 3,825 MZN
- Anual: 7,200 MZN

---

## FASE 3: VENTIS — Energia & Ritmo

**Chakra**: Anahata (Coracao)
**Cor**: #5D9B84
**Elemento**: Ar
**Objectivo**: Encontrar ritmo sustentavel e gestao de energia

### Componentes Especificos

| Componente | Descricao |
|------------|-----------|
| **MonitorEnergia.jsx** | Check-in de energia 3x/dia (manha/tarde/noite). Escala visual de bateria (0-100%). Correlacao: sono, alimentacao, actividade, emocoes. Grafico de energia ao longo do dia/semana. |
| **RotinasBuilder.jsx** | Construtor de rotinas matinais e nocturnas. Blocos arrastaveis. Timer para cada bloco. Acompanhamento de aderencia. Diferencia rotinas (automaticas) de rituais (conscientes, significativas). |
| **PausasConscientes.jsx** | Scheduler de pausas ao longo do dia. Micro-pausas de 2-5 min com exercicios guiados. Notificacoes inteligentes baseadas no padrao de energia. |
| **MovimentoFlow.jsx** | Sequencias de movimento suave: yoga, tai chi, alongamentos, caminhada consciente. 3 niveis de intensidade. Guias visuais. Duracao: 5/15/30 min. |
| **NaturezaConexao.jsx** | Actividades de conexao com a natureza. Desafios: descalca na terra, observar o ceu, ouvir passaros, banho de sol consciente. Registo fotografico opcional. |
| **RitmoAnalise.jsx** | Dashboard analitico do ritmo pessoal. Graficos de energia semanal, aderencia as rotinas, qualidade do sono, pausas feitas. |
| **MapaPicosVales.jsx** | **NOVO** Apos 2 semanas: "Teu pico: 10h-12h", "Teu vale: 15h-16h". Sugestao: reunioes dificeis de manha, tarefas leves a tarde. Personalizacao do dia com base nos picos. |
| **DetectorBurnout.jsx** | **NOVO** Se energia baixa > 5 dias seguidos: "Ha 5 dias em modo esforco. Isto nao e sustentavel." Sugestao de pausa obrigatoria. Alerta preventivo. |
| **RituaisVsRotinas.jsx** | **NOVO** Transformar rotina em ritual: ex: cafe de manha -> 5 min sentada, saboreando, sem telemovel. Diferencia automatismo de presenca. |

### Coach IA: "Ventis" (personalidade)
- Tom: Gentil, ritmado, como uma brisa
- Estilo: "Nao apresses. Encontra o teu ritmo."
- Detecta: burnout, overwork, desconexao do corpo, insonia
- Foco em sustentabilidade, nao performance

### Gamificacao: "Folhas"
- Niveis: Semente -> Broto -> Arvore -> Floresta
- Ganhar folhas: check-ins de energia, rotinas, pausas, movimento
- Badges: "Primeiro Amanhecer" (1a rotina matinal), "Raizes" (7 dias), etc.

### Tabelas Supabase
```
ventis_clients          — subscricao, fase, folhas_total, nivel
ventis_energia_log      — data, periodo (manha/tarde/noite), nivel (0-100), notas
ventis_rotinas          — tipo (matinal/nocturna), blocos (JSON), e_ritual (bool)
ventis_rotinas_log      — rotina_id, data, blocos_completados, duracao
ventis_pausas_log       — data, hora, tipo_pausa, duracao, sensacao
ventis_movimento_log    — data, tipo, duracao, intensidade, sensacao
ventis_natureza_log     — data, actividade, foto_url, reflexao
ventis_burnout_alertas  — data, dias_consecutivos, nivel_medio, accao_tomada
ventis_chat_messages    — user_id, role, content, created_at
```

### Preco sugerido
- Mensal: 750 MZN
- Semestral: 3,825 MZN
- Anual: 7,200 MZN

---

## FASE 4: ECOA — Voz & Desbloqueio do Silencio

**Chakra**: Vishuddha (Garganta)
**Cor**: #4A90A4
**Elemento**: Eter/Som
**Objectivo**: Desbloquear o silenciamento — encontrar e usar a voz autentica

**NOTA**: ECOA e sobre mulheres silenciadas. O core e trabalhar onde/quando/porque
se calam. Nao e expressao generica — e recuperacao de voz.

### Componentes Especificos

| Componente | Descricao |
|------------|-----------|
| **MapaSilenciamento.jsx** | **CORE** Setup inicial + tracking: "Onde te calas mais?" (casa, trabalho, familia, amigos). "Com quem?" (marido, mae, chefe, amigas). "Que tipo de verdades nao dizes?" (desacordo, desejo, limite, dor). Mapa visual das zonas de silencio. |
| **MicroVoz.jsx** | **CORE** Exercicios progressivos de recuperacao de voz: Semana 1: Preferencia pequena ("Prefiro cafe, nao cha"). Semana 2: Opiniao neutra. Semana 3: Dizer nao sem explicar. Semana 4: Expressar desacordo. Semana 8: Nomear ferida antiga. |
| **BibliotecaFrases.jsx** | **NOVO** Como dizer coisas dificeis: "Nao, nao posso" (sem justificar), "Isso magoou-me", "Nao concordo", "Preciso de espaco", "Isto nao funciona para mim". Cada frase com: contexto, variacoes, o que esperar como resposta. |
| **RegistoVozRecuperada.jsx** | **NOVO** Tracking: "Hoje disse algo que normalmente calaria". "Com quem?" "Sobre o que?" "Como correu?" Celebracao de pequenas coragens. Biblioteca de vitorias de voz. |
| **DiarioVoz.jsx** | Diario com opcao de gravacao de audio (Web Audio API). Falar em vez de escrever. Biblioteca de audios pessoais. Prompts: "Diz em voz alta o que precisas." |
| **CartasNaoEnviadas.jsx** | Espaco seguro para escrever cartas a pessoas/situacoes. Categorias: perdao, raiva, gratidao, despedida, verdade. Opcao de "enviar ao universo" (animacao de libertacao). |
| **AfirmacoesDiarias.jsx** | Afirmacoes personalizadas ao padrao de silenciamento: Se padrao = "Nao mereco ser ouvida" -> "A minha voz importa". Se padrao = "Vou magoar alguem" -> "Posso ser honesta e gentil". Opcao de gravar em audio. |
| **ExpressaoExercicios.jsx** | Exercicios de expressao: escrita livre (5 min sem parar), desenho emocional, lista de verdades, carta ao eu do futuro, manifesto pessoal. |
| **ComunicacaoAssertiva.jsx** | Templates: "Eu sinto X quando Y porque Z. Preciso de W." Cenarios praticos. Diario de situacoes: como comuniquei vs como gostaria. |
| **PadroesExpressao.jsx** | Analise: quantas vezes se expressou, meios usados, temas recorrentes, evolucao da assertividade, zonas de silencio que estao a abrir. |

### Coach IA: "Ecoa" (personalidade)
- Tom: Encorajador, curioso, gentil mas firme
- Estilo: "O que e que a tua voz quer dizer hoje?"
- Detecta: silenciamento, people-pleasing, medo de julgamento, auto-censura
- Incentiva expressao genuina, celebra cada micro-voz
- Nunca forca — respeita o ritmo de cada uma

### Gamificacao: "Ecos"
- Niveis: Sussurro -> Voz -> Canto -> Ressonancia
- Ganhar ecos: gravar audio, escrever cartas, micro-vozes, frases dificeis
- Badges: "Primeira Palavra" (1a gravacao), "Primeiro Nao", "Sem Filtro" (7 dias), etc.

### Tabelas Supabase
```
ecoa_clients            — subscricao, fase, ecos_total, nivel
ecoa_silenciamento      — user_id, zonas (JSON), pessoas (JSON), verdades_nao_ditas (JSON)
ecoa_micro_voz_log      — data, nivel_semana, exercicio, completou, reflexao
ecoa_voz_recuperada     — data, o_que_disse, com_quem, sobre_o_que, como_correu
ecoa_diario_voz         — data, tipo (texto/audio), conteudo, audio_url, duracao
ecoa_cartas             — data, destinatario, categoria, conteudo, libertada
ecoa_afirmacoes_log     — data, afirmacoes, padrao_silenciamento, gravou_audio
ecoa_exercicios_log     — data, tipo_exercicio, conteudo, reflexao
ecoa_comunicacao_log    — data, situacao, como_comuniquei, como_gostaria, aprendizado
ecoa_chat_messages      — user_id, role, content, created_at
```

### Preco sugerido
- Mensal: 750 MZN
- Semestral: 3,825 MZN
- Anual: 7,200 MZN

---

## FASE 5: IMAGO — Identidade & Espelho

**Chakra**: Sahasrara (Coroa)
**Cor**: #8B7BA5
**Elemento**: Consciencia
**Objectivo**: Quem sou vs. quem mostro — integrar identidade autentica

**NOTA**: IMAGO nao e so "quem sou" — e "quem sou vs. quem mostro vs. quem quero ser".
Trabalha mascaras, versoes antigas, e a descoberta da essencia.

### Componentes Especificos

| Componente | Descricao |
|------------|-----------|
| **EspelhoTriplo.jsx** | **CORE** 3 perguntas centrais: "Quem sou realmente?" (essencia), "Quem mostro ao mundo?" (mascara), "Quem quero ser?" (aspiracao). Praticas: identificar gaps entre os 3, reconhecer mascaras (onde/quando/porque), soltar versoes antigas. |
| **ArqueologiaDeSi.jsx** | **CORE** Exploracao de camadas: "Quem era antes de X acontecer?", "Que versao minha ficou presa no passado?", "Que identidade assumi que nao e minha?" Escavacao profunda de identidade. |
| **Nomeacao.jsx** | **NOVO** Ritual de auto-nomeacao: "Como me nomeio agora?" Ex: "A que escolhe", "A que habita fronteira", "A indomavel". Pode mudar ao longo da jornada. Evolucao dos nomes ao longo do tempo. |
| **MapaIdentidade.jsx** | Mapa visual interactivo com 7 dimensoes (uma por eco): corpo, valor, emocao, vontade, energia, voz, essencia. Preenchido com dados reais dos outros ecos. Evolucao ao longo do tempo. |
| **ValoresEssenciais.jsx** | Descoberta de valores pessoais. 50 valores -> 10 -> 5 -> top 3. Reflexao: "Como vivo este valor?" Revisao trimestral. |
| **RoupaComoIdentidade.jsx** | **NOVO** (mais profundo que Aurea) "O que visto comunica quem?", "Que identidade projeto vs. que identidade habito?" Pratica: vestir-se como expressao (nao funcao). |
| **TimelineJornada.jsx** | Timeline visual completa da jornada em TODOS os ecos. Marcos, conquistas, transformacoes. Vista: 1/3/6/12 meses. Exportavel como PDF. |
| **IntegracaoEcos.jsx** | Dashboard cruzado: "Quando a tua energia (Ventis) esta alta, as tuas emocoes (Serena) tendem a..." Correlacoes automaticas. Recomendacoes personalizadas. |
| **MeditacoesEssencia.jsx** | Meditacoes guiadas: "Quem sou sem rotulos?", "O meu eu essencial", "Integracao dos 7 ecos". Scripts em portugues. |
| **VisaoFuturo.jsx** | Quadro de visao digital — nao Pinterest generico: imagens + palavras + simbolos pessoais. Revisao trimestral: "Ainda ressoa?" Evolucao do quadro (nao fixo). |

### Coach IA: "Imago" (personalidade)
- Tom: Profundo, sabio, filosofico mas acessivel
- Estilo: "Quem es tu para alem de tudo o que ja disseram que eras?"
- Detecta: crise de identidade, viver para os outros, desconexao do eu, mascaras rigidas
- Integra insights de todos os outros ecos

### Gamificacao: "Estrelas"
- Niveis: Reflexo -> Clareza -> Sabedoria -> Luminosidade
- Ganhar estrelas: reflexoes profundas, meditacoes, integracao entre ecos, nomeacao
- Badges: "Primeiro Reflexo", "Mascara Reconhecida", "Valores Definidos", "Jornada Completa"

### Tabelas Supabase
```
imago_clients           — subscricao, fase, estrelas_total, nivel
imago_espelho_triplo    — user_id, essencia, mascara, aspiracao, gaps, updated_at
imago_arqueologia       — user_id, camada, antes_de_x, versao_presa, identidade_alheia
imago_nomeacao          — user_id, nome_actual, historico_nomes (JSON), data
imago_identidade        — user_id, dimensao, conteudo, updated_at
imago_valores           — user_id, valores_top (JSON), reflexoes (JSON), revisao_data
imago_roupa_identidade  — data, o_que_visto, que_identidade, reflexao
imago_meditacoes_log    — data, meditacao_id, duracao, reflexao
imago_visao_board       — user_id, items (JSON), updated_at, revisao_trimestral
imago_integracoes_log   — data, eco_1, eco_2, insight, reflexao
imago_chat_messages     — user_id, role, content, created_at
```

### Preco sugerido
- Mensal: 975 MZN (~$15 USD) — preco premium por ser modulo de integracao
- Semestral: 4,972 MZN
- Anual: 9,360 MZN

### Pre-requisito
Funciona melhor com pelo menos 2-3 outros ecos activos.

---

## FASE 6: AURORA — Integracao Final

**Cor**: #D4A5A5
**Elemento**: Luz
**Objectivo**: Celebrar a jornada completa e manter as transformacoes

### Componentes Especificos

| Componente | Descricao |
|------------|-----------|
| **CerimoniaGraduacao.jsx** | Experiencia imersiva: musica especial, animacao visual (subida do sol, abertura de flor), revisao de momentos-chave, certificado bonito (partilhavel), mensagem pessoal da Vivianne. Resume toda a jornada por eco. |
| **AntesDepois.jsx** | **NOVO** Nao so metricas — narrativa: "Quem eras quando comecaste?", "Que feridas carregavas?", "O que soltaste?", "Quem es agora?" Video/carta para si mesma (antes) vs. agora. |
| **ResumoJornada.jsx** | Relatorio completo. Dados de todos os ecos activos. Graficos de evolucao. Antes vs Agora em cada dimensao. Exportavel como PDF premium. |
| **ModoManutencao.jsx** | Check-ins mensais em vez de diarios. Alertas quando padroes negativos reaparecem. Acesso a todas as ferramentas dos ecos completados. |
| **Mentoria.jsx** | Sistema de mentoria (anonimo). Graduadas podem mentorizar novas. Partilhar 1 frase de sabedoria por semana. Ver progresso de outras (sem identidade). |
| **RitualAurora.jsx** | Ritual matinal integrado: respiracao (Serena) + movimento (Ventis) + afirmacao (Ecoa) + escolha consciente (Ignis) + check-in emocional. Personalizado com base nos ecos completados. |
| **RenovacaoAnual.jsx** | **NOVO** 1x por ano: refazer jornada condensada (1 mes), ver o que mudou, actualizar intencoes, nova cerimonia. |

### Gamificacao: "Raios de Aurora"
- Nao tem niveis — e o nivel final
- Conquistas especiais: "Aurora Completa", "Mentora", "1 Ano de Manutencao", "Renovacao"

### Preco sugerido
- Incluido gratuitamente para quem completou 5+ ecos
- Ou: 500 MZN/mes standalone

### Pre-requisito
Completar pelo menos 5 dos 7 ecos (excluindo Lumina).

---

## MELHORIAS NO AUREA (paralelo as fases)

| Melhoria | Descricao | Prioridade |
|----------|-----------|------------|
| **Audio real** | Integrar ElevenLabs para gerar os 8 audios de meditacao | Alta |
| **Partilha social** | Permitir partilhar badges/conquistas na comunidade | Media |
| **Dashboard v2** | Redesign com graficos de evolucao (como Vitalis) | Media |
| **Integracao Lumina** | Mostrar recomendacoes do Lumina no dashboard Aurea | Baixa |

---

## MELHORIAS TRANSVERSAIS

### Sistema de Bundles
- **Duo**: 2 ecos a escolha — 15% desconto
- **Trio**: 3 ecos — 25% desconto
- **Jornada Completa**: 5+ ecos — 35% desconto
- **Tudo**: Todos os ecos — 40% desconto

### Lumina Upgrades
- Recomendacoes directas (link para o eco)
- Tracking de "ja experimentou o eco recomendado"
- Comparacao antes/depois

### Comunidade Cross-Eco
- Circulos por eco
- Reflexoes tagadas por eco
- Desafios comunitarios transversais
- Mentoria entre utilizadoras de ecos diferentes

### Coach Dashboard
Actualizar `/coach` para mostrar clientes de todos os ecos.

### i18n
Traduzir novos modulos para EN e FR.

---

## RESUMO TECNICO POR FASE

| Fase | Modulo | Componentes | Lib Files | Tabelas SQL | Rotas |
|------|--------|-------------|-----------|-------------|-------|
| 0 | Shared | ~10 | ~5 | template | 0 |
| 1 | Serena | ~18 | ~3 | 8 | ~14 |
| 2 | Ignis | ~16 | ~3 | 9 | ~14 |
| 3 | Ventis | ~17 | ~3 | 9 | ~14 |
| 4 | Ecoa | ~18 | ~3 | 10 | ~14 |
| 5 | Imago | ~18 | ~3 | 11 | ~14 |
| 6 | Aurora | ~12 | ~2 | 5 | ~10 |
| — | **TOTAL** | **~109** | **~22** | **~52** | **~80** |

---

## NOTAS IMPORTANTES

1. **Texto adaptativo de genero** — TODOS os novos modulos usam `g()` e `gx()`. Sem excepcoes.
2. **Padrao de qualidade** — Nivel Vitalis: validacao robusta, error handling, loading/empty states.
3. **Mobile-first** — PWA. Desktop secundario.
4. **Build check** — `npm run build` obrigatorio antes de cada commit.
5. **Testes** — Testes unitarios para logica core.
6. **Acessibilidade** — WCAG 2.2 AA em todos os novos componentes.
7. **Performance** — Lazy loading obrigatorio. Cada eco e um chunk separado.
