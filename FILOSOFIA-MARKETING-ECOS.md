# Filosofia do Marketing Engine dos Sete Ecos
**Para a sessão Claude Code do repo os-sete-veus-site usar como inspiração**

---

Este documento não diz o que mudar. Descreve o que funciona nos Sete Ecos — com exemplos reais do código — para que possas aplicar onde julgares melhor.

---

## A Tese Central

O marketing dos Ecos não vende um produto. Constrói um ponto de vista.

A frase-âncora do engine diz tudo:

> *"A Sete Ecos não nasceu para te melhorar. Nasceu para integrar o que já és."*

Isso não é tagline. É posição filosófica. E toda a comunicação parte daí — conteúdo social, emails, WhatsApp, tudo diz a mesma coisa com palavras diferentes.

**O equivalente nos Véus seria:** qual é a tese que só os Véus dizem? Não "aprende a dançar" ou "liberta-te". Algo mais específico, mais verdadeiro, que nenhum outro produto no mercado diria.

---

## Princípio 1 — Observação inteligente, não motivação barata

O engine tem um princípio fundador explícito no código:

```
// Princípio: não motivação barata. Observação inteligente.
```

Vê a diferença na prática:

**Motivação barata (o que toda a gente faz):**
> "Acredita em ti! Tu consegues!"

**Observação inteligente (o que os Ecos fazem):**
> "Não te falta mais uma solução. Falta-te um sistema onde tudo converse."

> "Resolves o corpo numa app. A emoção noutra. O foco noutra. E depois? Depois continuas sem energia."

> "Sabotagem não é preguiça. É protecção."

O segundo tipo para o scroll porque reconhece algo que a pessoa sente mas nunca nomeou. Não promete — espelha.

Aplicado aos Véus: os hooks mais fracos são os que prometem ("descobre o teu potencial"). Os mais fortes são os que nomeiam o que a pessoa já sente mas não consegue articular.

---

## Princípio 2 — 15 categorias de conteúdo, não 1

O engine dos Ecos tem **15 pools de conteúdo distintos**. Cada um com 10-12 blocos {hook, corpo, cta}. Não é um tipo de post — são 15 ângulos diferentes sobre o mesmo produto:

| Categoria | O que aborda |
|-----------|-------------|
| `corpo` | A tese de integração (o "porquê" dos Ecos) |
| `emocional` | Para quem procura profundidade, não inspiração |
| `provocacao` | Posicionamento contra o wellness estético |
| `alimentacao_emocional` | O "porquê" por trás da compulsão alimentar |
| `distorcoes` | Imagem corporal e o espelho que mente |
| `ansiedade` | O impacto do stress no corpo e na alimentação |
| `autoestima` | Valor próprio ligado à relação com comida |
| `ciclo_recomecos` | Para quem já "desistiu 100 vezes" |
| `aurea` | Merecimento, culpa herdada, valor próprio |
| `serena` | Regulação emocional, respiração, ciclos |
| `ignis` | Foco, disciplina, o que cortar |
| `ventis` | Energia, burnout, ritmo |
| `ecoa` | Voz, silenciamento, expressão |
| `imago` | Identidade, essência, quem és além dos papéis |
| `lumina` | O diagnóstico gratuito como porta de entrada |

**Por que isto importa:** a mesma pessoa vê 15 ângulos diferentes sobre o mesmo produto. Nunca é repetitivo. Cada post pode ser o que finalmente a faz clicar.

Para os Véus: quantas categorias diferentes de conteúdo existem? Se for menos de 5, o feed fica homogéneo e as pessoas deixam de reparar.

---

## Princípio 3 — A estrutura do bloco {hook, corpo, cta}

Cada bloco de conteúdo tem 3 partes. Sempre.

```javascript
{
  hook: 'Não é fome. É solidão disfarçada de apetite.',
  corpo: 'Quando comes sem ter fome, o teu corpo não está a pedir comida. Está a pedir presença. Companhia. Conforto. A comida é o substituto mais acessível — está sempre disponível, não julga, não rejeita. Mas também não preenche. Porque a fome era de outra coisa.',
  cta: 'A próxima vez que quiseres comer sem fome, pára e pergunta: do que é que eu preciso mesmo? — Vivianne',
}
```

**O hook** — 1 frase. Para o scroll nos primeiros 2 segundos. Não descreve — provoca, nomeia, contradiz.

**O corpo** — 3-5 frases. Desenvolve sem ser vago. Usa factos, não metáforas. Exemplos concretos. Biologia, psicologia, histórias de clientes.

**O cta** — 1 frase + assinatura. Dá uma acção pequena OU convida a entrar no produto. Assina sempre com "— Vivianne".

Repara que o cta raramente é "clica aqui para comprar". É quase sempre uma micro-acção que a pessoa pode fazer agora, sem o produto. Isso constrói confiança. A venda vem depois.

---

## Princípio 4 — Calendário bissemanal com rotação de formato

O engine não escolhe conteúdo aleatoriamente. Tem um calendário estruturado por semana par/ímpar:

**Semana par (VITALIS + temas emocionais):**
| Dia | Tema | Formato |
|-----|------|---------|
| Domingo | Autoestima | Carrossel |
| Segunda | Alimentação emocional | Reel |
| Terça | Mito vs Realidade (corpo) | Carrossel |
| Quarta | Ansiedade e corpo | Stories |
| Quinta | Distorções corporais | Reel |
| Sexta | Para quem já desistiu | Carrossel |
| Sábado | Reflexão | Post |

**Semana ímpar (módulos específicos):**
| Dia | Tema | Formato |
|-----|------|---------|
| Domingo | SERENA (emoção) | Carrossel |
| Segunda | ÁUREA (valor próprio) | Reel |
| Terça | IGNIS (foco/coragem) | Stories |
| Quarta | VENTIS (energia) | Carrossel |
| Quinta | ECOA (voz) | Reel |
| Sexta | IMAGO (identidade) | Carrossel |
| Sábado | LUMINA (diagnóstico gratuito) | Post |

**O que isto resolve:** sem este calendário, o conteúdo acumula-se em temas repetidos (ex: sempre nutrição, nunca identidade). A rotação garante que a mesma pessoa vê ângulos diferentes ao longo do mês.

A seleção dentro de cada pool é determinística por seed (dia do ano + variante), o que significa que o conteúdo muda todos os dias sem esforço humano.

Para os Véus: existe algo equivalente? Se não, mesmo com bom conteúdo, o risco é de repetição e saturação do mesmo tema.

---

## Princípio 5 — Formatos diferentes para o mesmo conteúdo

O mesmo bloco de conteúdo é adaptado a 6 formatos de WhatsApp:

```javascript
// Dica educativa
dica: `${hook}\n\n${corpo}\n\n${cta}\n\nSe quiseres aprofundar:\n${link}`

// Voz pessoal
pessoal: `Olá 🤍\n\nHoje quero partilhar algo que aprendi:\n\n_${hook}_\n\n${corpo}\n\nSe te identificas, responde a esta mensagem.`

// Reflexão
reflexao: `💭 *Pergunta para hoje:*\n\n_${hook}_\n\nPára um momento e pensa nisto.\n\n${corpo}\n\nNão preciso que respondas agora.`

// Ciência
ciencia: `🔬 *Facto que pouca gente sabe:*\n\n${hook}\n\n${corpo}\n\nA ciência é clara. O problema é que ninguém traduz.`
```

O conteúdo é o mesmo. O tom muda. A Viv a dar uma dica soa diferente da Viv a fazer uma pergunta, que soa diferente da Viv a citar ciência.

Para os Véus: o mesmo post pode ser uma história pessoal, um dado científico, uma pergunta directa, um facto histórico. O ângulo muda — a substância é a mesma.

---

## Princípio 6 — A sequência de nurturing é educação pura, não venda

Os 7 emails nos 30 dias após registo não vendem o produto. Ensinam algo sobre o domínio do produto:

| Dia | Assunto | O que ensina |
|-----|---------|-------------|
| 0 | Bem-vinda | Apresentação + convite para o diagnóstico gratuito |
| 3 | Já experimentaste? | Benefícios concretos do diagnóstico, sem urgência |
| 7 | 3 sinais do corpo | Cortisol, comer emocional, efeito ioiô |
| 10 | Fome física vs emocional | Tabela comparativa com 4 critérios |
| 14 | Mitos da nutrição | 3 mitos desmontados com ciência |
| 21 | Ciclo menstrual e fome | As 4 fases hormonais e o impacto no apetite |
| 30 | Integrar corpo, emoção, mente | Apresentação dos 7 módulos como sistema |

A venda só aparece no dia 30 — e mesmo assim, é suave. O produto é apresentado como resposta natural ao problema que os 6 emails anteriores educaram.

**O padrão:** educa → educa → educa → educa → educa → educa → apresenta.

Para os Véus: se existe um fluxo de nurturing, qual é o rácio entre educação e venda? Se a venda aparece cedo, a pessoa ainda não confia.

O email do dia 14 sobre "Mitos da Nutrição" menciona a xima e o arroz como exemplos — comida moçambicana específica, não genérica. Isso é o equivalente dos Véus usar referências ao dancehall, à Semana da Moda de Maputo, ao repertório cultural que o público conhece.

---

## Princípio 7 — A camada de automação diária (o motor invisível)

Além do conteúdo social e da sequência de email, existe uma terceira camada: 10 tarefas automáticas que correm todos os dias às 21h:

1. **Resumo diário para a coach** — quem fez check-in, quem não fez, progressos de peso (via Telegram + email)
2. **Alertas de trials a expirar** — a coach tem 24h para enviar mensagem pessoal de retenção
3. **Alertas de super-engajadas** — identificar quem está a usar muito o produto (oportunidade de upsell)
4. **Alertas de clientes inactivas** — quem está a desengajar (janela de intervenção)
5. **Lembretes escalonados** — 2 dias sem check-in → lembrete suave; 7 dias → lembrete mais directo
6. **Avisos de expiração** — 7 dias antes do fim da subscrição
7. **Marcos de consistência** — 7, 30, 90 dias de check-ins recebem mensagem de parabéns (WA)
8. **Marcos de peso** — cada 5kg perdidos recebe celebração automática
9. **Win-back** — clientes expiradas há 3-30 dias recebem convite suave para voltar (1x/semana)
10. **Curiosidade insana** — toda a quarta-feira, quem fez o Lumina mas não subscreveu recebe um email com um facto surpreendente sobre nutrição

Este último é particularmente interessante:

```javascript
// Curiosidade sobre a xima
{
  assunto: 'A verdade sobre a xima que ninguém te diz',
  hook: 'Disseram-te a vida inteira que a xima engorda. É mentira.',
  corpo: 'Uma mão fechada de xima + uma palma de caril de peixe + um punho de matapa = a refeição perfeita. Sem contar calorias.',
  cta: 'No VITALIS ensinamos o Método da Mão — medir porções com o que já tens.'
}
```

É conteúdo local, específico, que desfaz um mito que o público moçambicano tem. Não é genérico. É sobre a vida real dessa pessoa.

Para os Véus: o equivalente seria uma curiosidade sobre um mito que existe no contexto do produto dos Véus — algo que o público acredita errado e que o produto desfaz.

---

## Princípio 8 — Histórias de clientes como espelho, não como prova

Os Ecos não usam testemunhos. Usam histórias de clientes anonimizadas como espelhos. A diferença:

**Testemunho (venda):**
> "Perdi 10kg em 3 meses! Recomendo!"

**Espelho (identificação):**
> "Uma cliente disse-me: 'Só como à noite, quando todos dormem.' Reconheces-te?"

> "Uma cliente descobriu que vivia a vida da mãe. Aos 38 anos. Mesma profissão. Mesmo tipo de parceiro. Mesma relação com comida. Quando percebeu, chorou. Depois perguntou: 'E agora, quem sou eu?' Essa pergunta é o início do IMAGO."

> "Uma pessoa fez o LUMINA 'por curiosidade'. Chorou quando leu o resultado. Não porque o resultado era mau. Porque pela primeira vez alguém nomeou o que ela sentia."

A pessoa que lê não pensa "que boa cliente". Pensa "sou eu". Isso é muito mais poderoso que qualquer prova social.

---

## Princípio 9 — A voz é sempre a Vivianne, nunca a empresa

Toda a comunicação é assinada "— Vivianne". Não "Sete Ecos". Não "A equipa".

Os CTAs falam na primeira pessoa:

> "O medo de conseguir é mais real do que o medo de falhar. Vamos falar sobre isto. — Vivianne"

> "Diz-me o que te fez parar e eu digo-te o que fazer diferente. É isso que fazemos no VITALIS. — Vivianne"

> "Eu criei isto porque me recusei a continuar a trabalhar a vida por pedaços. — Vivianne"

E há posts onde ela admite a sua própria fragmentação:

> "Intelectual. Espiritual. Profissional. Criativa. Corporal. Todas profundas. Todas sérias. Todas separadas. A Sete Ecos nasceu como resposta."

> "Eu recusei-me a continuar a trabalhar a vida por pedaços. E criei isto."

Isso constrói confiança antes de construir audiência. A criadora é a prova viva do produto.

---

## Princípio 10 — A pergunta directa como gancho

Muitos dos melhores hooks são perguntas. Mas não perguntas retóricas — perguntas que a pessoa responde mentalmente e a resposta já a move:

> "Há quanto tempo procuras algo que não sabes nomear?"

> "Responde honestamente: quando foi a última vez que comeste com prazer e sem culpa?"

> "Uma pergunta incómoda: se tirasses todos os papéis, ficava o quê?"

> "De 0 a 10, como te sentes AGORA no teu corpo?"

> "Quantas fotos apagaste porque 'não estavas bem'?"

A pergunta não pede para comprar. Pede para parar e pensar. E o pensamento gera intenção.

---

## Sobre o conteúdo de áudio nos Ecos

O engine menciona que os blocos de conteúdo são "inspirados nos áudios" de cada módulo. Cada eco tem meditações guionadas com títulos específicos:

- ÁUREA: "O Teu Valor Não Se Ganha", "A Culpa Que Não Te Pertence", "Abundância e Merecimento"
- SERENA: "Respiração 4-7-8", "Coerência Cardíaca"
- IGNIS: "Acende a Chama", "O Corte Que Liberta", "Foco Máximo"
- VITALIS: "Gratidão ao Corpo", "Relação com Comida", "Nutrir com Amor", "Corpo Sagrado"

Os posts de conteúdo são extensões escritas desses áudios. O mesmo tema aparece no áudio dentro do produto e no post para quem ainda não é cliente. É coerência entre canal e produto.

Para os Véus: se existe conteúdo de áudio ou vídeo no produto, pode ser a fonte de inspiração directa para os posts. O que se ensina dentro do produto, explica-se (resumidamente) fora. Quem vê o post quer o completo.

---

## O que diferencia um post que funciona de um que não funciona

Nos Ecos, a diferença é visível na estrutura:

**Não funciona:**
> "Descobrindo o teu potencial interno através da jornada dos Véus. Há mais para ti."

**Funciona:**
> "Ninguém te ensinou a habitar o teu corpo. Ensinaram-te a corrigi-lo. Desde criança: 'estás gorda', 'come menos', 'fecha a boca'. Cresceste a achar que o teu corpo era um problema a resolver. Não era. Era — e é — a tua casa. Não se destrói uma casa. Renova-se."

A diferença:
- O primeiro fala do produto. O segundo fala da pessoa.
- O primeiro usa palavras vazias ("potencial", "jornada"). O segundo usa palavras concretas ("estás gorda", "fecha a boca").
- O primeiro promete algo vago. O segundo nomeia uma dor específica.
- O primeiro poderia ser qualquer produto. O segundo só pode ser um produto que entende este problema específico.

---

## Resumo dos princípios

1. Constrói um ponto de vista antes de construir audiência
2. Observação inteligente > motivação barata
3. 15 categorias > 1 tema repetido
4. Estrutura {hook, corpo, cta} em cada bloco
5. Calendário bissemanal com rotação de formatos
6. Mesma substância, 6 tons diferentes (dica, pessoal, reflexão, ciência...)
7. Sequência de nurturing: educa 6x antes de vender 1x
8. Automação diária: marcos, win-back, curiosidades, alertas
9. Histórias de clientes como espelho, não como prova
10. Voz da criadora, não da empresa
11. Perguntas directas que a pessoa responde mentalmente
12. Referências locais e culturais do público real
13. O produto é a extensão do conteúdo gratuito, não a alternativa

---

*Este documento foi escrito a partir da leitura directa do código dos Sete Ecos (`src/lib/marketing-engine.js`, `api/_lib/email-sequencia.js`, `api/_lib/tarefas-agendadas.js`). Todos os exemplos são reais.*

*— para a sessão Claude Code do os-sete-veus-site*
