# PLANO DE CONCLUSÃO — SETE ECOS PWA

**Data**: Fevereiro 2026
**Versão**: 1.0
**Objectivo**: Concluir todos os 7 Ecos + Aurora, transformando a plataforma completa

---

## ESTADO ACTUAL DO PROJECTO

| Eco | Chakra | Foco | Estado | Componentes |
|-----|--------|------|--------|-------------|
| **VITALIS** | Muladhara | Corpo/Nutrição | ✅ Produção | 36 |
| **ÁUREA** | — | Valor/Presença | ✅ Produção | 15 |
| **LUMINA** | Ajna | Visão/Diagnóstico | ✅ Produção (gratuito) | 1 página |
| **COMUNIDADE** | — | Social/Autoconhecimento | ✅ Produção | 19 |
| **SERENA** | Svadhisthana | Emoção/Fluidez | ❌ Por construir | 0 |
| **IGNIS** | Manipura | Vontade/Foco | ❌ Por construir | 0 |
| **VENTIS** | Anahata | Energia/Ritmo | ❌ Por construir | 0 |
| **ECOA** | Vishuddha | Voz/Expressão | ❌ Por construir | 0 |
| **IMAGO** | Sahasrara | Identidade/Essência | ❌ Por construir | 0 |
| **AURORA** | — | Integração Final | ❌ Por construir | 0 |

**Resumo**: 4 de 10 módulos prontos. Faltam 6 módulos + melhorias no Áurea.

---

## ABORDAGEM: CONSTRUÇÃO POR FASES

Cada módulo novo segue o mesmo padrão arquitectónico já estabelecido pelo Vitalis e Áurea:

### Estrutura-padrão por módulo
```
src/components/[eco]/
  ├── Dashboard[Eco].jsx       # Hub principal
  ├── [Eco]AccessGuard.jsx     # Guarda de subscrição
  ├── Pagamento[Eco].jsx       # Pagamento (PayPal + M-Pesa)
  ├── Onboarding.jsx           # Setup inicial
  ├── Chat[Eco].jsx            # Coach IA do eco
  ├── Perfil[Eco].jsx          # Perfil do utilizador
  ├── Notificacoes[Eco].jsx    # Configuração de notificações
  ├── Insights[Eco].jsx        # Análise semanal
  └── [componentes específicos do eco]

src/lib/[eco]/
  ├── subscriptions.js         # Gestão de subscrições
  ├── gamificacao.js           # Sistema de pontos/badges
  └── [lógica específica]

supabase/
  └── [eco]_tables.sql         # Tabelas do módulo
```

### O que cada módulo SEMPRE terá
1. **Landing page** — página de venda do eco
2. **Sistema de pagamento** — trial 7 dias + PayPal + M-Pesa
3. **Access guard** — protecção de rotas por subscrição
4. **Dashboard** — hub central com progresso diário
5. **Onboarding** — configuração inicial personalizada
6. **Coach IA** — chat com personalidade única do eco
7. **Gamificação** — sistema de recompensas temático
8. **Insights semanais** — relatório automático
9. **Perfil** — configurações do utilizador no eco
10. **Notificações** — lembretes personalizáveis

---

## FASE 0: FUNDAÇÃO PARTILHADA

Antes de construir módulos novos, criar infraestrutura reutilizável.

### 0.1 — Fábrica de Módulos (Module Factory)
Extrair padrões comuns do Vitalis e Áurea num kit reutilizável:

- **`src/lib/shared/moduleFactory.js`** — funções genéricas:
  - `createAccessGuard(eco, config)` — gera guarda de acesso
  - `createSubscriptionManager(eco, plans)` — gestão de subscrições
  - `createGamificacaoBase(eco, levels, badges)` — base de gamificação
  - `createChatBase(eco, personality)` — base do coach IA

- **`src/lib/shared/subscriptionPlans.js`** — planos de preço centralizados
- **`src/lib/shared/paymentFlow.js`** — fluxo PayPal + M-Pesa reutilizável
- **`src/components/shared/`**:
  - `ModuleHeader.jsx` — header reutilizável (baseado no VitalisHeader)
  - `ModuleDashboardShell.jsx` — shell de dashboard com sidebar/grid
  - `PaymentPage.jsx` — página de pagamento genérica
  - `OnboardingShell.jsx` — wizard de onboarding reutilizável
  - `NotificacoesModule.jsx` — config de notificações reutilizável

### 0.2 — Tabelas Base (Supabase)
Template SQL para cada módulo:
```sql
-- Template: [eco]_clients, [eco]_checkins, [eco]_log, [eco]_chat_messages
-- Cada módulo estende este template com colunas específicas
```

### 0.3 — Lumina Integration Points
Actualizar `lumina-leituras.js` para activar links dos ecos conforme ficam prontos:
```javascript
Serena: { link: '/serena/dashboard', disponivel: true }  // activar quando pronto
```

**Estimativa**: ~10 componentes partilhados + 3 ficheiros lib

---

## FASE 1: SERENA — Emoção & Fluidez 🌊

**Chakra**: Svadhisthana (Sacral)
**Cor**: #6B8E9B
**Elemento**: Água
**Objectivo**: Ajudar a regular e processar emoções

### Componentes Específicos

| Componente | Descrição |
|------------|-----------|
| **DiarioEmocional.jsx** | Diário com roda de emoções interactiva (toque/deslize). Registo diário de: emoção dominante, intensidade (1-10), trigger, onde sentiu no corpo, e reflexão livre. Padrão visual: ondas de água. |
| **MapaEmocional.jsx** | Mapa de calor emocional ao longo do tempo. Visualização mensal (cores por emoção), correlação com ciclo menstrual (se activo), identificação de padrões recorrentes. Usa Recharts. |
| **RespiracaoGuiada.jsx** | 6 exercícios de respiração guiada com animação visual (círculo que expande/contrai). Técnicas: 4-7-8, box breathing, respiração oceânica, suspiro fisiológico, respiração alternada, respiração de coerência cardíaca. Timer visual + haptic feedback. |
| **RituaisLibertacao.jsx** | Práticas de libertação emocional: carta não-enviada (escrever e "queimar" digitalmente), ritual de água (visualização), sacudimento corporal (guia), dança livre (timer + playlist sugerida), vocalização (guia de sons). |
| **FluidezPraticas.jsx** | 50+ micro-práticas do elemento água: banho consciente, beber água com intenção, chorar sem julgar, deixar ir, fluir com mudanças. Organizadas por nível (como Áurea). |
| **CicloEmocional.jsx** | Rastreio do ciclo emocional (independente do menstrual). Mapeia fases: acumulação → pico → libertação → calma. Integra com dados do Lumina para correlações. |

### Coach IA: "Serena" (personalidade)
- Tom: Calmo, acolhedor, validador
- Nunca minimiza emoções ("não fiques triste" → proibido)
- Valida primeiro, explora depois, sugere práticas
- Detecta: supressão emocional, alexitimia, overwhelm

### Gamificação: "Gotas" 💧
- Níveis: Nascente → Riacho → Rio → Oceano
- Ganhar gotas: registar emoções, respiração, rituais, práticas
- Badges: "Primeira Lágrima" (chorar sem culpa), "7 Dias de Fluxo", etc.

### Tabelas Supabase
```
serena_clients         — subscrição, fase, gotas_total, nivel
serena_emocoes_log     — data, emocao, intensidade, trigger, corpo_zona, reflexao
serena_respiracao_log  — data, tecnica, duracao_minutos, sensacao_antes, sensacao_depois
serena_rituais_log     — data, tipo_ritual, reflexao
serena_praticas_log    — data, pratica_id, sentimento_culpa
serena_ciclo_emocional — data, fase (acumulacao/pico/libertacao/calma)
serena_chat_messages   — user_id, role, content, created_at
```

### Preço sugerido
- Mensal: 750 MZN (~$12 USD)
- Semestral: 3,825 MZN (15% desconto)
- Anual: 7,200 MZN (20% desconto)

---

## FASE 2: IGNIS — Vontade & Foco 🔥

**Chakra**: Manipura (Plexo Solar)
**Cor**: #C1634A
**Elemento**: Fogo
**Objectivo**: Construir disciplina, foco e capacidade de acção

### Componentes Específicos

| Componente | Descrição |
|------------|-----------|
| **MissoesDiarias.jsx** | 3 missões diárias personalizadas (pequena/média/grande). Sistema de comprometimento matinal: escolher 3 missões + hora limite. Review nocturno: completou? o que aprendeu? Streak de missões cumpridas. |
| **FocoTimer.jsx** | Timer tipo Pomodoro com temática de fogo. Sessões de foco: 25min/50min/90min. Animação de chama que cresce com o tempo. Registo: o que fez, nível de foco (1-10), distrações. Sons opcionais (crepitar de fogueira). |
| **PlanoAccao.jsx** | Planeamento de objectivos com decomposição em passos. Objectivo → 3-5 marcos → tarefas diárias. Timeline visual (tipo Gantt simplificado). Review semanal de progresso. Ajuste de plano quando necessário. |
| **HabitTracker.jsx** | Rastreio de hábitos com grid visual (tipo GitHub contributions). Até 7 hábitos simultâneos. Streak tracking por hábito. Correlação: quais hábitos se reforçam mutuamente. |
| **DiarioConquistas.jsx** | Registo diário de 3 conquistas (por mais pequenas que sejam). "Hoje consegui..." — foco no que FEZ, não no que falhou. Biblioteca pessoal de vitórias para consultar em dias difíceis. |
| **DesafiosFogo.jsx** | Desafios semanais de crescimento pessoal. 4 categorias: Coragem, Disciplina, Persistência, Iniciativa. Progressão: Faísca → Chama → Fogueira → Vulcão. |

### Coach IA: "Ignis" (personalidade)
- Tom: Directo, motivador, sem paternalismo
- Estilo: "O que vais fazer AGORA?" (foco em acção)
- Detecta: procrastinação, perfeccionismo paralisante, auto-sabotagem
- Nunca aceita desculpas sem explorar o que está por trás

### Gamificação: "Chamas" 🔥
- Níveis: Faísca → Brasa → Chama → Fogueira
- Ganhar chamas: missões, foco, hábitos, conquistas
- Badges: "Primeiro Fogo" (1a missão), "Semana de Ferro" (7 dias), etc.

### Tabelas Supabase
```
ignis_clients           — subscrição, fase, chamas_total, nivel
ignis_missoes           — data, missao_pequena/media/grande, completou, reflexao
ignis_foco_sessions     — data, duracao, tipo, foco_nivel, distraccoes, notas
ignis_objectivos        — titulo, descricao, marcos, prazo, status
ignis_habitos           — nome, frequencia, cor, criado_em
ignis_habitos_log       — habito_id, data, completou
ignis_conquistas_log    — data, conquista_1/2/3
ignis_desafios_log      — data, desafio_id, completou
ignis_chat_messages     — user_id, role, content, created_at
```

### Preço sugerido
- Mensal: 750 MZN
- Semestral: 3,825 MZN
- Anual: 7,200 MZN

---

## FASE 3: VENTIS — Energia & Ritmo 🍃

**Chakra**: Anahata (Coração)
**Cor**: #5D9B84
**Elemento**: Ar
**Objectivo**: Encontrar ritmo sustentável e gestão de energia

### Componentes Específicos

| Componente | Descrição |
|------------|-----------|
| **MonitorEnergia.jsx** | Check-in de energia 3x/dia (manhã/tarde/noite). Escala visual de bateria (0-100%). Correlação: sono, alimentação, actividade, emoções. Gráfico de energia ao longo do dia/semana. |
| **RotinasBuilder.jsx** | Construtor de rotinas matinais e nocturnas. Blocos arrastáveis: meditação, movimento, higiene, alimentação, gratidão. Timer para cada bloco. Acompanhamento de aderência. |
| **PausasConscientes.jsx** | Scheduler de pausas ao longo do dia. Micro-pausas de 2-5 min com exercícios guiados: alongamento, respiração, grounding, olhar pela janela. Notificações inteligentes baseadas no padrão de energia. |
| **MovimentoFlow.jsx** | Sequências de movimento suave: yoga, tai chi, alongamentos, caminhada consciente. 3 níveis de intensidade. Guias visuais (sem vídeo — ilustrações/animações). Duração: 5/15/30 min. |
| **NaturezaConexao.jsx** | Actividades de conexão com a natureza. Desafios: descalça na terra, observar o céu, ouvir pássaros, banho de sol consciente. Registo fotográfico opcional. Correlação com níveis de energia. |
| **RitmoAnalise.jsx** | Dashboard analítico do ritmo pessoal. Gráficos: energia semanal, aderência às rotinas, qualidade do sono, pausas feitas. Identificação do "ritmo ideal" pessoal. Recomendações baseadas nos dados. |

### Coach IA: "Ventis" (personalidade)
- Tom: Gentil, ritmado, como uma brisa
- Estilo: "Não apresses. Encontra o teu ritmo."
- Detecta: burnout, overwork, desconexão do corpo, insónia
- Foco em sustentabilidade, não performance

### Gamificação: "Folhas" 🍃
- Níveis: Semente → Broto → Árvore → Floresta
- Ganhar folhas: check-ins de energia, rotinas, pausas, movimento
- Badges: "Primeiro Amanhecer" (1a rotina matinal), "Raízes" (7 dias), etc.

### Tabelas Supabase
```
ventis_clients          — subscrição, fase, folhas_total, nivel
ventis_energia_log      — data, periodo (manha/tarde/noite), nivel (0-100), notas
ventis_rotinas          — tipo (matinal/nocturna), blocos (JSON), criada_em
ventis_rotinas_log      — rotina_id, data, blocos_completados, duracao
ventis_pausas_log       — data, hora, tipo_pausa, duracao, sensacao
ventis_movimento_log    — data, tipo, duracao, intensidade, sensacao
ventis_natureza_log     — data, actividade, foto_url, reflexao
ventis_chat_messages    — user_id, role, content, created_at
```

### Preço sugerido
- Mensal: 750 MZN
- Semestral: 3,825 MZN
- Anual: 7,200 MZN

---

## FASE 4: ECOA — Voz & Expressão 🗣️

**Chakra**: Vishuddha (Garganta)
**Cor**: #4A90A4
**Elemento**: Éter/Som
**Objectivo**: Encontrar e expressar a voz autêntica

### Componentes Específicos

| Componente | Descrição |
|------------|-----------|
| **DiarioVoz.jsx** | Diário com opção de gravação de áudio (Web Audio API). Falar em vez de escrever. Transcrição automática opcional. Biblioteca de áudios pessoais. Prompts de voz: "Diz em voz alta o que precisas." |
| **CartasNaoEnviadas.jsx** | Espaço seguro para escrever cartas a pessoas/situações. Categorias: perdão, raiva, gratidão, despedida, verdade. Opção de "enviar ao universo" (animação de libertação). Nunca são enviadas — são para processamento. |
| **AfirmacoesDiarias.jsx** | 3 afirmações diárias personalizadas. Baseadas nos padrões detectados. Opção de gravar em áudio (ouvir a própria voz). Rotação inteligente. Lembrete de manhã. |
| **ExpressaoExercicios.jsx** | Exercícios de expressão: escrita livre (5 min sem parar), desenho emocional (canvas simples), lista de verdades, carta ao eu do futuro, manifesto pessoal. |
| **ComunicacaoAssertiva.jsx** | Treino de comunicação assertiva. Templates: "Eu sinto X quando Y porque Z. Preciso de W." Cenários práticos com exemplos. Diário de situações: como comuniquei vs como gostaria. |
| **PadroesExpressao.jsx** | Análise de padrões de expressão. Tracking: quantas vezes se expressou, meios usados (voz/escrita/arte), temas recorrentes, evolução da assertividade. |

### Coach IA: "Ecoa" (personalidade)
- Tom: Encorajador, curioso, criativo
- Estilo: "O que é que a tua voz quer dizer hoje?"
- Detecta: silenciamento, people-pleasing, medo de julgamento
- Incentiva expressão genuína, sem filtros

### Gamificação: "Ecos" 🔊
- Níveis: Sussurro → Voz → Canto → Ressonância
- Ganhar ecos: gravar áudio, escrever cartas, afirmações, exercícios
- Badges: "Primeira Palavra" (1a gravação), "Sem Filtro" (escrita livre 7 dias), etc.

### Tabelas Supabase
```
ecoa_clients            — subscrição, fase, ecos_total, nivel
ecoa_diario_voz         — data, tipo (texto/audio), conteudo, audio_url, duracao
ecoa_cartas             — data, destinatario, categoria, conteudo, libertada
ecoa_afirmacoes_log     — data, afirmacao_1/2/3, gravou_audio
ecoa_exercicios_log     — data, tipo_exercicio, conteudo, reflexao
ecoa_comunicacao_log    — data, situacao, como_comuniquei, como_gostaria, aprendizado
ecoa_chat_messages      — user_id, role, content, created_at
```

### Preço sugerido
- Mensal: 750 MZN
- Semestral: 3,825 MZN
- Anual: 7,200 MZN

---

## FASE 5: IMAGO — Identidade & Essência 🪞

**Chakra**: Sahasrara (Coroa)
**Cor**: #8B7BA5
**Elemento**: Consciência
**Objectivo**: Integrar todos os ecos e descobrir quem realmente é

### Componentes Específicos

| Componente | Descrição |
|------------|-----------|
| **MapaIdentidade.jsx** | Mapa visual interactivo de "Quem sou eu?". 7 dimensões (uma por eco): corpo, valor, emoção, vontade, energia, voz, essência. Preenchido com dados reais dos outros ecos (se o utilizador os tem). Evolução ao longo do tempo. |
| **ValoresEssenciais.jsx** | Descoberta de valores pessoais. Exercício interactivo: 50 valores → reduzir a 10 → reduzir a 5 → top 3. Reflexão sobre cada valor: "Como vivo este valor?" Revisão trimestral. |
| **TimelineJornada.jsx** | Timeline visual completa da jornada em TODOS os ecos. Marcos, conquistas, transformações. Vista de: 1 mês, 3 meses, 6 meses, 1 ano. Exportável como PDF/imagem. |
| **IntegracaoEcos.jsx** | Dashboard cruzado com insights de todos os ecos activos. "Quando a tua energia (Ventis) está alta, as tuas emoções (Serena) tendem a..." Correlações automáticas entre módulos. Recomendações personalizadas. |
| **MeditacoesEssencia.jsx** | Meditações guiadas profundas focadas em identidade. Temas: "Quem sou sem rótulos?", "O meu eu essencial", "Integração dos 7 ecos". Scripts completos em português. |
| **VisaoFuturo.jsx** | Quadro de visão digital (vision board). Upload de imagens, textos, afirmações. Organizado por área da vida. Review mensal: "Estou a caminhar para esta visão?" Objectivos de longo prazo. |

### Coach IA: "Imago" (personalidade)
- Tom: Profundo, sábio, filosófico mas acessível
- Estilo: "Quem és tu para além de tudo o que já disseram que eras?"
- Detecta: crise de identidade, viver para os outros, desconexão do eu
- Integra insights de todos os outros ecos

### Gamificação: "Estrelas" ⭐
- Níveis: Reflexo → Clareza → Sabedoria → Luminosidade
- Ganhar estrelas: reflexões profundas, meditações, integração entre ecos
- Badges: "Primeiro Reflexo", "Valores Definidos", "Jornada Completa", etc.

### Tabelas Supabase
```
imago_clients           — subscrição, fase, estrelas_total, nivel
imago_identidade        — user_id, dimensao, conteudo, updated_at
imago_valores           — user_id, valores_top (JSON), reflexoes (JSON), revisao_data
imago_meditacoes_log    — data, meditacao_id, duracao, reflexao
imago_visao_board       — user_id, items (JSON), updated_at
imago_integracoes_log   — data, eco_1, eco_2, insight, reflexao
imago_chat_messages     — user_id, role, content, created_at
```

### Preço sugerido
- Mensal: 975 MZN (~$15 USD) — preço premium por ser módulo de integração
- Semestral: 4,972 MZN
- Anual: 9,360 MZN

### Pré-requisito
O Imago funciona melhor com pelo menos 2-3 outros ecos activos. Sugerir aos utilizadores que completem Serena + 1 eco antes de entrar no Imago.

---

## FASE 6: AURORA — Integração Final ✨

**Cor**: #D4A5A5
**Elemento**: Luz
**Objectivo**: Celebrar a jornada completa e manter as transformações

### Componentes Específicos

| Componente | Descrição |
|------------|-----------|
| **CerimoniaGraduacao.jsx** | Experiência imersiva de "graduação". Resume toda a jornada: conquistas por eco, transformação medida (peso Vitalis, emoções Serena, hábitos Ignis, etc.). Certificado digital personalizado. Animação especial de aurora/nascer do sol. |
| **ResumoJornada.jsx** | Relatório completo da jornada. Dados de todos os ecos activos. Gráficos de evolução. Antes vs Agora em cada dimensão. Exportável como PDF premium. |
| **ModoManutencao.jsx** | Modo de manutenção pós-graduação. Check-ins mensais em vez de diários. Alertas quando padrões negativos reaparecem. Acesso a todas as ferramentas dos ecos que completou. |
| **Mentoria.jsx** | Sistema de mentoria entre utilizadoras. Graduadas podem mentorizar novas. Chat de mentoria com templates. Gamificação: "Guia de Luz" badges. |
| **RitualAurora.jsx** | Ritual matinal integrado: combina respiração (Serena), movimento (Ventis), afirmação (Ecoa), missão (Ignis), e check-in emocional. Personalizado com base nos ecos que completou. |

### Gamificação: "Raios de Aurora" 🌅
- Não tem níveis — é o nível final
- Conquistas especiais: "Aurora Completa", "Mentora", "1 Ano de Manutenção"

### Preço sugerido
- Incluído gratuitamente para quem completou 5+ ecos
- Ou: 500 MZN/mês standalone

### Pré-requisito
Completar pelo menos 5 dos 7 ecos (excluindo Lumina que é gratuito).

---

## MELHORIAS NO ÁUREA (paralelo às fases)

| Melhoria | Descrição | Prioridade |
|----------|-----------|------------|
| **Áudio real** | Integrar ElevenLabs para gerar os 8 áudios de meditação | Alta |
| **Partilha social** | Permitir partilhar badges/conquistas na comunidade | Média |
| **Dashboard v2** | Redesign com gráficos de evolução (como Vitalis) | Média |
| **Integração Lumina** | Mostrar recomendações do Lumina no dashboard Áurea | Baixa |
| **A/B testing** | Testar diferentes mensagens de onboarding | Baixa |

---

## MELHORIAS TRANSVERSAIS

### Sistema de Bundles
Actualizar `LandingBundle.jsx` com combos dinâmicos:
- **Duo**: 2 ecos à escolha — 15% desconto
- **Trio**: 3 ecos — 25% desconto
- **Jornada Completa**: 5+ ecos — 35% desconto
- **Tudo**: Todos os ecos — 40% desconto

### Lumina Upgrades
À medida que cada eco fica pronto, activar:
1. Recomendações directas (link para o eco)
2. Tracking de "já experimentou o eco recomendado"
3. Comparação antes/depois (leitura do dia em que começou vs agora)

### Comunidade Cross-Eco
- Círculos por eco (já preparado em `comunidade.js`)
- Reflexões tagadas por eco
- Desafios comunitários transversais
- Mentoria entre utilizadoras de ecos diferentes

### Coach Dashboard
Actualizar `/coach` para mostrar clientes de todos os ecos, não só Vitalis.

### i18n
Traduzir os novos módulos para EN e FR (usando a estrutura existente em `i18n.js`).

---

## ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

```
FASE 0: Fundação Partilhada
  └── Componentes shared, factory, templates SQL

FASE 1: SERENA 🌊
  └── Módulo emocional completo
  └── (mais pedido pelo público-alvo)

FASE 2: IGNIS 🔥
  └── Módulo de acção/foco
  └── (complementa Serena — emoção → acção)

FASE 3: VENTIS 🍃
  └── Módulo de energia/ritmo
  └── (completa o trio corpo-emoção-acção)

FASE 4: ECOA 🗣️
  └── Módulo de expressão/voz
  └── (requer confiança dos módulos anteriores)

FASE 5: IMAGO 🪞
  └── Módulo de identidade (integração)
  └── (precisa de dados dos outros ecos)

FASE 6: AURORA ✨
  └── Graduação e manutenção
  └── (último — requer ecos completos)
```

---

## RESUMO TÉCNICO POR FASE

| Fase | Módulo | Componentes | Lib Files | Tabelas SQL | Rotas |
|------|--------|-------------|-----------|-------------|-------|
| 0 | Shared | ~10 | ~5 | template | 0 |
| 1 | Serena | ~14 | ~3 | 7 | ~12 |
| 2 | Ignis | ~14 | ~3 | 8 | ~12 |
| 3 | Ventis | ~14 | ~3 | 7 | ~12 |
| 4 | Ecoa | ~14 | ~3 | 7 | ~12 |
| 5 | Imago | ~14 | ~3 | 7 | ~12 |
| 6 | Aurora | ~10 | ~2 | 4 | ~8 |
| — | **TOTAL** | **~90** | **~22** | **~47** | **~68** |

### Total final do projecto completo
- **Componentes actuais**: 88 (Vitalis 36 + Áurea 15 + Lumina 1 + Comunidade 19 + Pages 17)
- **Novos componentes**: ~90
- **Total**: ~178 componentes JSX
- **Novas tabelas**: ~47 tabelas Supabase

---

## NOTAS IMPORTANTES

1. **Texto adaptativo de género** — TODOS os novos módulos devem usar `g()` e `gx()` para texto gendered. Sem excepções.

2. **Padrão de qualidade** — Cada módulo deve ter o nível de qualidade do Vitalis: validação robusta, error handling, loading states, empty states.

3. **Mobile-first** — Tudo desenhado para telemóvel primeiro (PWA). Desktop é secundário.

4. **Build check** — `npm run build` obrigatório antes de cada commit.

5. **Testes** — Adicionar testes unitários para lógica core (generators, calculators, subscriptions).

6. **Acessibilidade** — Manter WCAG 2.2 AA em todos os novos componentes.

7. **Performance** — Lazy loading obrigatório. Cada eco é um chunk separado.

---

*Este plano serve como guia de referência. Cada fase será detalhada na implementação com especificações técnicas concretas.*
