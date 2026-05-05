# Vitalis — Plano de Individualização (10 Pontos)

Documento de continuidade para implementar as 10 features de individualização baseadas no Plano Keto da Nazira (`Plano_Keto_Nazira.pdf`).

**Contexto**: A Vivianne criou manualmente um plano keto personalizado para uma cliente (Nazira, 40+, 96kg→75kg, perimenopausa). O plano tem um nível de individualização que a plataforma não consegue replicar. Este documento mapeia exactamente o que falta e como implementar.

**Branch**: `claude/check-errors-JKhje` (ou nova branch a criar)

---

## Estado Actual — Auditoria Completa

### Tabelas Relevantes

#### `vitalis_intake` (52 colunas)
- **Pessoal**: nome, email, whatsapp, idade, sexo
- **Corpo**: altura_cm, peso_actual, peso_meta, cintura_cm, anca_cm
- **Objectivo**: objectivo_principal, prazo, porque_importante
- **Abordagem**: abordagem_preferida (keto_if/low_carb/equilibrado/nao_sei), aceita_jejum (BOOLEAN), restricoes_alimentares (TEXT[])
- **Saude**: condicoes_saude (TEXT[]), medicacao (TEXT)
- **Hábitos**: refeicoes_dia, pequeno_almoco, onde_come, tipos_comida, agua_litros_dia, bebidas, freq_doces, freq_fritos
- **Emocional**: freq_cansaco/ansiedade/tristeza/raiva/vazio/solidao/negacao, emocao_dominante
- **Actividade**: nivel_actividade, faz_exercicio, tipo_exercicio
- **Sono/Stress**: horas_sono, qualidade_sono, nivel_stress
- **Contexto**: situacao_profissional, situacao_familiar, filhos_pequenos, quem_cozinha
- **Historico**: quantas_dietas, historico_dietas, maior_obstaculo, gatilhos_sair_plano
- **NÃO TEM**: fase_hormonal, janela_jejum_inicio, janela_jejum_fim, suplementos, condição_medica_detalhada

#### `vitalis_checkins` (10 colunas)
- peso, agua_litros, energia_nivel(1-5), humor_nivel(1-5), sono_qualidade(1-5), seguiu_plano, fez_exercicio, notas
- **NÃO TEM**: controlo_fome, clareza_mental, ajuste_roupa, qualidade_pele, sintomas_adaptacao

#### `vitalis_medidas_log` (6 colunas)
- cintura_cm, anca_cm
- **NÃO TEM**: coxa_cm, braco_cm, lembretes quinzenais

#### `vitalis_meal_plans` (12 colunas)
- fase, abordagem, calorias_alvo, proteina_g, carboidratos_g, gordura_g, receitas_incluidas (JSONB)
- **NÃO TEM**: janela_alimentar, suplementos_recomendados, regras_fase

#### `vitalis_agua_log`
- quantidade_ml por entrada, meta fixa 2L (hardcoded DashboardVitalis:839)
- **NÃO TEM**: meta_personalizada por abordagem (keto precisa 2.5-3L)

#### `vitalis_refeicoes_config`
- nome, hora_habitual, ordem, activo
- **NÃO TEM**: tipo_especial (bulletproof, shake)

### Geração de Plano (planoGenerator.js — 738 linhas)
- TMB: Mifflin-St Jeor (idade, sexo, peso, altura)
- TDEE: TMB × factor actividade (1.2/1.375/1.55/1.725)
- Deficit: ajustado por prontidao (13%/18%/25%)
- Macros: keto(70F/25P/5C), low_carb(30F/40P/30C), equilibrado(30F/30P/40C)
- Porções: palma=25g proteina, punho=legumes, mão=30g carbs, polegar=15g gordura
- **NÃO CONSIDERA**: fase hormonal, idade 40+ ajustes, eletrólitos, hidratação keto

### PlanoHTML.jsx (12 páginas PDF)
- Capa, Boas-vindas, Macros, Equivalências, Proteínas, Carbs/Gorduras, Legumes, Lista Compras, Regras da Fase, Guia App, Mentalidade, Contracapa
- Tem dicas por fase MAS genéricas (não adaptadas a hormonal/idade)
- **NÃO TEM**: sintomas de adaptação detalhados, regras de ouro personalizadas, alertas médicos, FAQ por abordagem

### DashboardVitalis.jsx (1672 linhas)
- Header, PWA Banner, Trial Banner, Quick Actions (10 botões), Progresso Circular, Quick Trackers, Timer Jejum, Peso, Mini Calendário, Macros, Conquistas, Podcast
- **NÃO TEM**: Regras de Ouro, Sintomas/Adaptação, Vitórias além da balança, Conteúdo educativo por semana

### ListaCompras.jsx (596 linhas)
- Gera lista baseada no plano de macros + restrições
- 8 categorias, share WhatsApp/print
- **NÃO TEM**: geração a partir do Menu Semanal real

---

## Os 10 Pontos — Implementação Detalhada

---

### PONTO 1: Fase Hormonal no Intake

**O que falta**: O plano da Nazira diz "Mulher 40+ em perimenopausa" e adapta macros. O Vitalis tem `idade` e `sexo` mas não `fase_hormonal`.

**Implementação**:

#### 1A. Adicionar coluna à DB
```sql
ALTER TABLE vitalis_intake ADD COLUMN fase_hormonal TEXT;
-- Valores: 'pre_menopausa', 'perimenopausa', 'menopausa', 'pos_menopausa', 'nao_aplicavel'
-- Mostrar apenas se sexo = 'feminino' ou 'O'
```

#### 1B. Adicionar campo ao formulário intake
**Ficheiro**: `src/components/vitalis/IntakeForm.jsx`
- Após o campo `idade`, se `sexo !== 'masculino'`:
  - Mostrar select com opções: "Ciclo regular", "Perimenopausa (40-50, ciclo irregular)", "Menopausa (sem menstruação 12+ meses)", "Pós-menopausa", "Prefiro não dizer"
- Se `idade >= 35` e `sexo !== 'masculino'`, sugerir preenchimento

#### 1C. Ajustar planoGenerator.js
**Ficheiro**: `src/lib/vitalis/planoGenerator.js` (e `api/coach.js` linhas 405-423)

Após calcular TDEE (linha ~130), adicionar ajuste hormonal:
```javascript
// Ajuste hormonal para mulheres 40+
if (intake.sexo !== 'masculino' && intake.idade >= 40) {
  const faseH = intake.fase_hormonal;
  if (faseH === 'perimenopausa') {
    // Perimenopausa: metabolismo abranda ~5-10%, mais resistência à insulina
    calorias = Math.round(calorias * 0.95);
    // Aumentar proteína para preservar massa muscular
    if (abordagem === 'equilibrado') {
      // Shift: menos carbs, mais proteína
      proteinaPercent = 0.35; // era 0.30
      carbsPercent = 0.35;    // era 0.40
    }
  } else if (faseH === 'menopausa' || faseH === 'pos_menopausa') {
    calorias = Math.round(calorias * 0.92);
    proteinaPercent = Math.min(proteinaPercent + 0.05, 0.40);
  }
}
```

#### 1D. Incluir no PDF gerado
**Ficheiro**: `src/pages/PlanoHTML.jsx`
- Na página 2 (Boas-vindas), se `fase_hormonal` existe, adicionar parágrafo:
  - "Este plano foi adaptado para a tua fase de vida ({fase}). O metabolismo muda — o teu plano acompanha."
- Na página 9 (Regras), adicionar dicas específicas para perimenopausa (treino de força, sono, stress)

---

### PONTO 2: Janela de Jejum Específica

**O que falta**: O plano da Nazira diz "12h00 às 20h00". O Vitalis só tem `aceita_jejum: true/false`.

**Implementação**:

#### 2A. Adicionar colunas
```sql
ALTER TABLE vitalis_intake ADD COLUMN janela_jejum_inicio TIME;
ALTER TABLE vitalis_intake ADD COLUMN janela_jejum_fim TIME;
-- Ex: '12:00', '20:00' para janela 16:8
```

#### 2B. Formulário intake
**Ficheiro**: `src/components/vitalis/IntakeForm.jsx`
- Quando `aceita_jejum = true`, mostrar 2 selects de hora:
  - "A que horas começas a comer?" (default 12:00)
  - "A que horas paras de comer?" (default 20:00)
  - Protocolo calculado automaticamente: 24h - (fim - inicio) = horas jejum

#### 2C. Usar no planoGenerator
**Ficheiro**: `src/lib/vitalis/planoGenerator.js` (linhas 215-244)
- Em vez de hardcoded "12:00, 16:00, 20:00", usar os horários do intake
- Distribuir refeições dentro da janela: inicio, meio, fim-30min

#### 2D. Usar no Timer de Jejum
**Ficheiro**: `src/components/vitalis/DashboardVitalis.jsx` (linhas 766-825)
- `verificarJanelaAlimentar()` actualmente usa protocolo genérico
- Deve ler `janela_jejum_inicio/fim` do intake e mostrar countdown personalizado

#### 2E. Usar no RefeicoesCofig
- Ao criar config automática para keto_if, usar janela do intake para sugerir horas

---

### PONTO 3: Sintomas de Adaptação Tracker

**O que falta**: O plano da Nazira tem 3 níveis (Normal/Atenção/Parar). A plataforma não rastreia sintomas.

**Implementação**:

#### 3A. Nova tabela
```sql
CREATE TABLE vitalis_sintomas_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  sintoma TEXT NOT NULL,
  intensidade INTEGER CHECK (intensidade BETWEEN 1 AND 5),
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data, sintoma)
);

-- RLS
ALTER TABLE vitalis_sintomas_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own symptoms" ON vitalis_sintomas_log
  FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
```

#### 3B. Definir sintomas por abordagem
**Novo ficheiro**: `src/lib/vitalis/sintomasAdaptacao.js`
```javascript
export const SINTOMAS = {
  keto_if: {
    normais: [
      { chave: 'dor_cabeca', nome: 'Dor de cabeça', descricao: 'Normal nos primeiros 3-5 dias. Bebe mais água com sal.', dias: '1-5' },
      { chave: 'cansaco', nome: 'Cansaço', descricao: 'O corpo está a adaptar-se. Passa em 5-7 dias.', dias: '1-7' },
      { chave: 'boca_seca', nome: 'Boca seca / mau hálito', descricao: 'Sinal de cetose. Normal e temporário.', dias: '3-14' },
      { chave: 'fome', nome: 'Fome estranha', descricao: 'Passa com magnésio + paciência.', dias: '1-5' },
      { chave: 'vontade_doce', nome: 'Vontade de doce', descricao: 'O açúcar é viciante. Passa após 1 semana.', dias: '1-10' },
    ],
    atencao: [
      { chave: 'tonturas', nome: 'Tonturas frequentes', accao: 'Aumenta sal e água. Se persistir 3+ dias, contacta coach.' },
      { chave: 'caibras', nome: 'Cãibras musculares', accao: 'Toma magnésio à noite. Aumenta sal.' },
      { chave: 'sono_pior', nome: 'Sono pior', accao: 'Antecipa bulletproof para 14h. Magnésio à noite.' },
      { chave: 'obstipacao', nome: 'Obstipação', accao: 'Mais vegetais verdes, mais água, mais magnésio.' },
      { chave: 'fome_persistente', nome: 'Fome persistente (2+ semanas)', accao: 'Aumenta gordura nas refeições. Fala com a Vivianne.' },
    ],
    parar: [
      { chave: 'palpitacoes', nome: 'Palpitações fortes', accao: 'PÁRA e procura médico.' },
      { chave: 'vomitos', nome: 'Vómitos repetidos', accao: 'PÁRA e procura médico.' },
      { chave: 'confusao', nome: 'Confusão mental severa', accao: 'PÁRA e procura médico.' },
    ]
  },
  low_carb: { /* semelhante mas menos severo */ },
  equilibrado: { /* mínimo — só fome e cansaço inicial */ }
};
```

#### 3C. Novo componente
**Novo ficheiro**: `src/components/vitalis/SintomasTracker.jsx`
- Mostra lista de sintomas possíveis para a abordagem do utilizador
- Cada sintoma: toggle on/off + intensidade (1-5) + nota
- Nível de severidade com cores (verde/âmbar/vermelho)
- Se sintoma "parar" marcado: modal de alerta com link WhatsApp da Vivianne
- Guardar em `vitalis_sintomas_log`

#### 3D. Rota e navegação
**Ficheiro**: `src/App.jsx`
- Adicionar rota: `/vitalis/sintomas` → `SintomasTracker`
**Ficheiro**: `src/components/vitalis/DashboardVitalis.jsx`
- Adicionar ao Quick Actions grid: `{ to: '/vitalis/sintomas', emoji: '🌡️', label: 'Adaptação', ... }`

#### 3E. Alertas para coach
- Se sintoma de "parar" marcado → criar alerta em `vitalis_alerts` com prioridade 'critica'
- Se sintoma "atenção" persiste 3+ dias → criar alerta prioridade 'alta'

---

### PONTO 4: Regras de Ouro por Abordagem

**O que falta**: O plano da Nazira tem "7 Regras de Ouro" específicas para keto. O PlanoHTML.jsx tem regras genéricas por fase mas não são visíveis no dia-a-dia.

**Implementação**:

#### 4A. Definir regras por abordagem
**Novo ficheiro**: `src/lib/vitalis/regrasOuro.js`
```javascript
export const REGRAS_OURO = {
  keto_if: [
    { titulo: 'Janela alimentar', descricao: 'Não comes nada fora da tua janela. Água, chá e café preto são livres.' },
    { titulo: 'Açúcar e farinha = ZERO', descricao: 'Sem pão, arroz, massas, batata, fruta (excepto frutos vermelhos pontualmente).' },
    { titulo: 'Gordura é amiga', descricao: 'Azeite, manteiga, óleo de coco, abacate. A gordura é o teu combustível.' },
    { titulo: 'Proteína moderada', descricao: 'Uma palma por refeição. Suficiente para manter, não tanto que tire a cetose.' },
    { titulo: 'Vegetais verdes à vontade', descricao: 'Couve, alface, espinafre, brócolos, pepino. Evita cenoura, beterraba, batata-doce.' },
    { titulo: 'Sal, água e eletrólitos', descricao: 'Bebe 2.5-3L de água. Sal generoso na comida. Magnésio à noite.' },
    { titulo: 'Mede além da balança', descricao: 'Cintura e ancas a cada 2 semanas. A fita métrica não mente.' },
  ],
  low_carb: [
    { titulo: 'Reduz hidratos, não elimines', descricao: 'Uma mão por refeição no máximo. Prefere arroz integral, batata-doce.' },
    { titulo: 'Proteína em cada refeição', descricao: 'Uma palma de proteína sempre. Frango, peixe, ovos, feijão.' },
    { titulo: 'Legumes primeiro', descricao: 'Começa pelo prato de legumes. Enche o estômago com fibra.' },
    { titulo: 'Açúcar processado = mínimo', descricao: 'Elimina refrigerantes, sumos, bolos. Fruta inteira está OK.' },
    { titulo: 'Gordura com medida', descricao: 'Um polegar por refeição. Azeite, abacate, nozes.' },
    { titulo: 'Água: 2L mínimo', descricao: 'Bebe ao longo do dia. Sede confunde-se com fome.' },
  ],
  equilibrado: [
    { titulo: 'Método da mão', descricao: 'Cada refeição: 1 palma proteína + 1 punho legumes + 1 mão hidratos + 1 polegar gordura.' },
    { titulo: 'Come devagar', descricao: '20 minutos mínimo por refeição. Mastiga bem.' },
    { titulo: 'Sem saltar refeições', descricao: 'Mantém horários regulares. Jejum prolongado não faz parte deste plano.' },
    { titulo: 'Fruta: 2-3 porções/dia', descricao: 'Prefere fruta inteira, não sumos. Varia as cores.' },
    { titulo: 'Água: 2L mínimo', descricao: 'Garrafa sempre contigo. Meta: 8 copos.' },
  ]
};
```

#### 4B. Card no Dashboard
**Ficheiro**: `src/components/vitalis/DashboardVitalis.jsx`
- Após o Quick Actions grid, adicionar card colapsável "As Tuas Regras de Ouro"
- Mostra as regras da abordagem activa do utilizador
- Cada regra com ícone numerado, título em bold, descrição em cinza
- Lê abordagem de `vitalis_meal_plans` (já carregado no dashboard)

#### 4C. Incluir no PDF
**Ficheiro**: `src/pages/PlanoHTML.jsx`
- Página 4 (ou nova página): adicionar secção "Regras de Ouro" com as regras da abordagem
- Substituir as dicas genéricas por estas regras específicas

---

### PONTO 5: Hidratação com Meta por Abordagem

**O que falta**: Meta fixa 2L (hardcoded). Keto precisa 2.5-3L.

**Implementação**:

#### 5A. Definir metas por abordagem
**Ficheiro**: `src/components/vitalis/DashboardVitalis.jsx` (linha 839)
```javascript
// ANTES: const metaAgua = 2;
// DEPOIS:
const metaAguaPorAbordagem = { keto_if: 3, low_carb: 2.5, equilibrado: 2 };
const metaAgua = metaAguaPorAbordagem[abordagemActual] || 2;
```

#### 5B. Mostrar contexto
- Junto ao tracker de água, se keto: mostrar nota "Em keto perdes mais água — bebe 3L/dia"

#### 5C. Incluir no check-in
- Se `agua_litros < metaAgua * 0.7`, mostrar alerta amarelo: "Estás abaixo da meta de hidratação"

---

### PONTO 6: Medidas Expandidas + Lembretes

**O que falta**: Só cintura e anca. Falta coxa, braço. Sem lembretes quinzenais.

**Implementação**:

#### 6A. Adicionar colunas
```sql
ALTER TABLE vitalis_medidas_log ADD COLUMN coxa_cm NUMERIC(5,1);
ALTER TABLE vitalis_medidas_log ADD COLUMN braco_cm NUMERIC(5,1);
```

#### 6B. Actualizar formulário
**Ficheiro**: `src/components/vitalis/MedidasForm.jsx` (ou componente de medidas)
- Adicionar campos: Coxa (10cm acima do joelho), Braço (parte mais larga)
- Manter cintura e anca obrigatórios, coxa e braço opcionais

#### 6C. Lembretes quinzenais
**Ficheiro**: `api/_lib/tarefas-agendadas.js`
- Na função de tarefas diárias, verificar se passaram 14 dias desde última medida
- Se sim: enviar push notification + email "Hora de medir! A fita métrica não mente."

#### 6D. Gráfico de evolução
- Adicionar à secção de tendências: gráfico com 4 linhas (cintura, anca, coxa, braço)

---

### PONTO 7: Vitórias Além da Balança no Check-in

**O que falta**: Check-in tem peso/energia/humor mas falta: roupa, pele, sono, fome, clareza.

**Implementação**:

#### 7A. Adicionar ao check-in semanal
**Ficheiro**: `src/components/vitalis/CheckinDiario.jsx`
- Após os sliders existentes, adicionar secção "Vitórias além da balança":
  ```
  □ A roupa está mais folgada
  □ Tenho mais energia ao acordar
  □ Durmo melhor
  □ A fome está controlada
  □ A pele está mais limpa
  □ Sinto mais clareza mental
  □ Disposição mais estável
  ```
- Checkboxes simples, guardar como JSONB em `notas` ou nova coluna

#### 7B. Mostrar no Dashboard
- Se alguma vitória marcada esta semana, mostrar badge motivacional
- "Esta semana já notaste 3 vitórias além da balança!"

#### 7C. Incluir nos relatórios
**Ficheiro**: `src/lib/relatorios-pdf.js`
- Secção "Vitórias Não-Balança" com contagem cumulativa ao longo das semanas

---

### PONTO 8: Lista de Compras do Menu Semanal

**O que falta**: ListaCompras.jsx gera lista genérica por macros. Devia gerar a partir das receitas reais do menu.

**Implementação**:

#### 8A. Extrair ingredientes do menu
**Ficheiro**: `src/components/vitalis/CalendarioRefeicoes.jsx`
- As receitas do calendário têm `receitaId` que mapeia para `vitalis_receitas`
- `vitalis_receitas` tem `ingredientes` (JSONB): `[{item, quantidade, porcao_mao}]`

#### 8B. Novo botão no Menu Semanal
- Já existe link para `/vitalis/lista-compras`
- Adicionar query param: `/vitalis/lista-compras?semana=2026-05-05`
- Ou guardar ingredientes do menu em localStorage para a ListaCompras ler

#### 8C. Modo na ListaCompras
**Ficheiro**: `src/components/vitalis/ListaCompras.jsx`
- Detectar se vem com `?semana=` ou se tem menu semanal guardado
- Se sim: extrair ingredientes de todas as receitas da semana (via `vitalis_receitas.ingredientes`)
- Agregar quantidades iguais (ex: 3 receitas com frango → somar quantidades)
- Se não: manter comportamento actual (lista genérica por macros)

---

### PONTO 9: Receitas Especiais Keto (Bulletproof, Shakes)

**O que falta**: Bulletproof coffee e shakes de saciedade são fundamentais em keto mas não existem como receitas.

**Implementação**:

#### 9A. Seed de receitas keto especiais
```sql
INSERT INTO vitalis_receitas (
  titulo, descricao, origem, tipo_refeicao, tempo_preparo_min, porcoes, dificuldade,
  calorias, proteina_g, carboidratos_g, gordura_g,
  porcoes_proteina, porcoes_legumes, porcoes_hidratos, porcoes_gordura,
  tags, fases_recomendadas, ingredientes, modo_preparo, ativo
) VALUES
-- Bulletproof Coffee
(
  'Bulletproof Coffee',
  'Café com gordura para saciedade de 4-5h e clareza mental. Ideal como 2ª refeição ou para abrir a janela alimentar.',
  'internacional', 'snack', 5, 1, 'facil',
  350, 1, 0, 38,
  0, 0, 0, 2.5,
  ARRAY['keto', 'jejum_friendly', 'rapido', 'sem_gluten', 'sem_lactose'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Café preto forte", "quantidade": "250ml", "porcao_mao": "1 chávena"},
    {"item": "Óleo de coco virgem", "quantidade": "1 colher de sopa"},
    {"item": "Manteiga sem sal", "quantidade": "1 colher de sopa"},
    {"item": "Canela (opcional)", "quantidade": "1 colher de chá"}
  ]'::jsonb,
  'Bate tudo no liquidificador 30 segundos até criar espuma cremosa. Não mexas só com colher.',
  true
),
-- Shake de Saciedade
(
  'Shake de Saciedade',
  'Para dias difíceis ou jantar leve. Saciedade dura 3-4h.',
  'internacional', 'snack', 5, 1, 'facil',
  400, 8, 5, 35,
  0, 0, 0, 2.5,
  ARRAY['keto', 'rapido', 'sem_gluten'],
  ARRAY['inducao', 'transicao', 'manutencao'],
  '[
    {"item": "Leite de coco (de lata)", "quantidade": "200ml"},
    {"item": "Abacate maduro", "quantidade": "1/2"},
    {"item": "Óleo de coco", "quantidade": "1 colher de sopa"},
    {"item": "Pasta de amendoim (sem açúcar)", "quantidade": "1 colher de sopa"},
    {"item": "Cacau em pó (sem açúcar)", "quantidade": "1 colher de chá"},
    {"item": "Gelo + canela", "quantidade": "a gosto"}
  ]'::jsonb,
  'Bate tudo no liquidificador. Bebe devagar.',
  true
);
```

#### 9B. Sugestão no RefeicoesCofig
- Quando abordagem = keto_if, sugerir "Bulletproof" e "Shake" como refeições tipo
- Adicionar às quick suggestions: "Bulletproof (14:00-16:00)", "Shake"

---

### PONTO 10: Conteúdo Educativo por Semana/Fase

**O que falta**: O plano da Nazira tem expectativas por semana (1ª: perda de água, 2ª: energia estável, 4ª: composição muda). A plataforma não mostra conteúdo contextual.

**Implementação**:

#### 10A. Definir conteúdo por semana
**Novo ficheiro**: `src/lib/vitalis/conteudoFase.js`
```javascript
export const CONTEUDO_SEMANAL = {
  keto_if: {
    1: {
      titulo: 'Semana 1 — A Adaptação',
      mensagem: 'O teu corpo está a trocar de combustível. É normal sentir cansaço e dor de cabeça nos dias 3-5.',
      expectativa: 'Perda rápida de 2-4kg (água, não gordura). Possível "keto flu".',
      dica: 'Sal generoso na comida e 3L de água. Magnésio à noite.',
    },
    2: {
      titulo: 'Semana 2 — A Estabilização',
      mensagem: 'A fome começa a desaparecer. A energia estabiliza.',
      expectativa: 'Energia mais constante. Cintura visivelmente reduzida.',
      dica: 'Mede a cintura hoje. Compara com o início.',
    },
    3: { titulo: 'Semana 3 — O Ritmo', ... },
    4: {
      titulo: 'Semana 4 — A Transformação',
      mensagem: 'Composição corporal muda visivelmente.',
      expectativa: 'Mais energia, sono melhor, pele mais limpa. A roupa começa a folgar.',
      dica: 'Tira foto de progresso. Compara com a semana 1.',
    },
    // ... até semana 12
  },
  low_carb: { /* semelhante mas adaptado */ },
  equilibrado: { /* semelhante mas mais gradual */ }
};
```

#### 10B. Card no Dashboard
**Ficheiro**: `src/components/vitalis/DashboardVitalis.jsx`
- Calcular semana actual: `Math.ceil((hoje - data_inicio) / 7)`
- Mostrar card com o conteúdo da semana correspondente
- Título, mensagem motivacional, expectativa, dica do dia

#### 10C. Notificação semanal
**Ficheiro**: `api/_lib/tarefas-agendadas.js`
- Cada segunda-feira, enviar push/email com o conteúdo da nova semana
- "Semana 3 no teu plano keto! Aqui está o que esperar..."

---

## Dependências entre Pontos

```
Ponto 1 (Hormonal) → independente, começa com SQL + intake form
Ponto 2 (Janela jejum) → independente, começa com SQL + intake form
Ponto 3 (Sintomas) → depende de ter abordagem (já existe), nova tabela + componente
Ponto 4 (Regras) → independente, novo ficheiro lib + card dashboard
Ponto 5 (Hidratação) → independente, só mudar constante no dashboard
Ponto 6 (Medidas) → independente, SQL + form update
Ponto 7 (Vitórias) → independente, expandir check-in
Ponto 8 (Compras menu) → depende do CalendarioRefeicoes actual (já funciona)
Ponto 9 (Receitas keto) → independente, SQL seed
Ponto 10 (Conteúdo semanal) → depende de data_inicio nos clients (já existe)
```

## Ordem Sugerida de Implementação

1. **Pontos 4 + 5** (Regras + Hidratação) — impacto imediato, esforço mínimo
2. **Pontos 9** (Receitas keto) — SQL seed, sem código novo
3. **Pontos 1 + 2** (Hormonal + Janela jejum) — SQL + intake form
4. **Ponto 7** (Vitórias) — expandir check-in existente
5. **Ponto 6** (Medidas) — SQL + form + lembretes
6. **Ponto 3** (Sintomas) — novo componente completo
7. **Ponto 10** (Conteúdo semanal) — novo ficheiro lib + card + notificações
8. **Ponto 8** (Compras menu) — integração mais complexa

## Ficheiros Chave a Modificar

| Ficheiro | Pontos |
|----------|--------|
| `supabase/vitalis_tables.sql` | 1, 2, 3, 6 (ALTER TABLE) |
| `src/components/vitalis/IntakeForm.jsx` | 1, 2 |
| `src/lib/vitalis/planoGenerator.js` | 1, 2 |
| `api/coach.js` (linhas 405-423) | 1, 2 |
| `src/components/vitalis/DashboardVitalis.jsx` | 3, 4, 5, 7, 10 |
| `src/components/vitalis/CheckinDiario.jsx` | 7 |
| `src/components/vitalis/CalendarioRefeicoes.jsx` | 8 |
| `src/components/vitalis/ListaCompras.jsx` | 8 |
| `src/pages/PlanoHTML.jsx` | 1, 4 |
| `src/lib/relatorios-pdf.js` | 7 |
| `api/_lib/tarefas-agendadas.js` | 6, 10 |
| `src/App.jsx` | 3 (nova rota) |
| `database/receitas-mocambicanas.sql` | 9 (seed) |

## Novos Ficheiros a Criar

| Ficheiro | Ponto |
|----------|-------|
| `src/lib/vitalis/sintomasAdaptacao.js` | 3 |
| `src/lib/vitalis/regrasOuro.js` | 4 |
| `src/lib/vitalis/conteudoFase.js` | 10 |
| `src/components/vitalis/SintomasTracker.jsx` | 3 |

---

*Documento gerado a 5 de Maio de 2026, baseado na auditoria completa do codebase e no Plano Keto da Nazira.*
