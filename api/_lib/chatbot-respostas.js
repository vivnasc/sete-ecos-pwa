/**
 * Chatbot Sete Ecos — Respostas e Detecção Partilhada
 *
 * A voz da Vivianne: calorosa, directa, motivadora, vendedora natural.
 * Conhece TODOS os 7 Ecos, bundles, promos e a Comunidade.
 *
 * Módulo reutilizável pelo webhook:
 * - Meta Cloud API (whatsapp-webhook.js)
 */

const COACH_NUMERO = '258851006473';

// ===== MENU PRINCIPAL =====

const MENU_PRINCIPAL = `Como te posso ajudar?

*Os 7 Ecos da Transformação:*
1️⃣ VITALIS — Nutrição e corpo
2️⃣ ÁUREA — Auto-valor e presença
3️⃣ SERENA — Emoções e fluidez
4️⃣ IGNIS — Vontade e foco
5️⃣ VENTIS — Energia e ritmo
6️⃣ ECOA — Voz e expressão
7️⃣ IMAGO — Identidade e espelho

*Mais opções:*
✨ *lumina* — Diagnóstico gratuito (5 min)
🌅 *aurora* — Integração final (grátis)
💰 *preços* — Ver todos os planos
🎁 *bundle* — Pacotes com desconto (até 40%!)
🆓 *trial* — Experimentar grátis 7 dias
💳 *pagar* — Formas de pagamento
👩 *vivianne* — Falar comigo directamente

Responde com o número ou escreve à vontade`;

const SAUDACAO = `Olá! Sou a *Vivianne*, criadora do Sete Ecos.

Este é um sistema de transformação feminina com *7 dimensões* — do corpo à alma. Começa por onde precisas, ao teu ritmo.

${MENU_PRINCIPAL}`;

// ===== RESPOSTAS COMPLETAS =====

const R = {};

// --- 1: VITALIS ---
R['1'] = `*VITALIS — Raiz da Transformação* 🌱

O VITALIS não é uma dieta. É uma mudança real na tua relação com a comida — feita com *comida moçambicana* que já conheces e amas.

*O que recebes:*
✅ Plano alimentar personalizado (xima, matapa, caril, feijão nhemba...)
✅ Receitas moçambicanas saudáveis
✅ Check-in diário (30 segundos — cria o hábito)
✅ Chat directo comigo, Vivianne
✅ Relatórios semanais de progresso
✅ Lista de compras automática
✅ Treinos adaptados (sem ginásio!)
✅ Espaço de Retorno — recaíste? Sem culpa. Voltamos juntas.
✅ Gamificação com XP, níveis e conquistas
✅ Acesso à Comunidade

*3 fases:*
1. *Indução* — primeiras mudanças, sem pressão
2. *Estabilização* — criar hábitos que ficam
3. *Reeducação* — transformação que dura para sempre

*Preços:*
Mensal — *2.500 MZN*/mês
Semestral — *12.500 MZN* (poupas 2.500!)
Anual — *21.000 MZN* (poupas 9.000!)

Experimenta *7 dias grátis* antes de decidir.

👉 Começa: app.seteecos.com/vitalis

Ou responde *preços* para comparar todos os planos`;

// --- LUMINA (não é Eco — é ferramenta de diagnóstico gratuita) ---
R['lumina'] = `*LUMINA — O Teu Primeiro Passo* ✨

Em *5 minutos* descobres coisas sobre ti que talvez nunca tenhas percebido.

*O LUMINA revela:*
🔮 O teu padrão emocional dominante
🍽️ Como a alimentação afecta o teu humor
💡 O que o teu corpo realmente precisa
📖 Leitura personalizada com orientações

São *23 padrões possíveis* — a tua leitura é única.

*Também avalia:*
- Relação com a comida
- Nível de energia e sono
- Estado emocional
- Fase do ciclo menstrual (opcional)

*100% gratuito · Sem registo · 5 minutos*

👉 Começa agora: app.seteecos.com/lumina

Depois do LUMINA, o passo natural é o *VITALIS* (responde *1*) ou a *SERENA* (responde *3*) — depende do que a tua leitura revelar`;

// --- 3: ÁUREA ---
R['3'] = `*ÁUREA — Valor e Presença* 👑

Quanto tempo passas a cuidar dos outros e esqueces de cuidar de ti? O ÁUREA muda isso.

*O que recebes:*
✅ 100+ micro-práticas diárias de auto-cuidado
✅ Espelho de Roupa — presença através do vestir
✅ Carteira de Merecimento — quanto investes em ti?
✅ Diário de Merecimento — escrita reflexiva
✅ 5 meditações guiadas em áudio
✅ Insights semanais e análise de padrões
✅ Chat comigo
✅ Acesso à Comunidade

*Sistema de Jóias (os teus níveis):*
🥉 Bronze (0-50) — Despertar
🥈 Prata (51-150) — Presença
🥇 Ouro (151-300) — Valor
💎 Diamante (301+) — Integração

*Preços:*
Mensal — *975 MZN*/mês
Semestral — *5.265 MZN* (poupas 585 MZN)
Anual — *9.945 MZN* (poupas 1.755 MZN)

Experimenta *7 dias grátis* com acesso total.

👉 Começa: app.seteecos.com/aurea

💡 _Combina com o VITALIS? Responde *bundle* para ver pacotes com até 40% desconto!_`;

// --- 4: SERENA ---
R['serena'] = `*SERENA — A Maré Interior* 🌊

Sentes que as emoções te controlam em vez de seres tu a controlá-las? O SERENA é para ti.

*O que recebes:*
✅ Diário emocional inteligente
✅ Botão SOS para momentos de crise
✅ Exercícios de respiração guiada
✅ Rituais de libertação emocional
✅ Biblioteca emocional completa
✅ Mapa das tuas emoções ao longo do tempo
✅ Correlação com o ciclo menstrual
✅ Detecção de padrões emocionais
✅ Chat comigo
✅ Acesso à Comunidade

O SERENA conecta o que sentes com o teu ciclo, a lua, e os teus hábitos. Não é para "controlar" emoções — é para *entendê-las*.

*Preços:*
Mensal — *750 MZN*/mês
Semestral — *3.825 MZN* (poupas 675 MZN)
Anual — *7.200 MZN* (poupas 1.800 MZN)

Experimenta *7 dias grátis*.

👉 Começa: app.seteecos.com/serena

💡 _Combina muito bem com o VITALIS — corpo e emoção juntos. Responde *bundle*._`;

// --- 5: IGNIS ---
R['ignis'] = `*IGNIS — O Fogo Interior* 🔥

Sabes aquela coisa que queres fazer mas nunca começas? O IGNIS acende esse fogo.

*O que recebes:*
✅ Exercícios de escolha consciente
✅ Atenção focada — treino de concentração
✅ Rastreador de distracções
✅ Exercício do Corte — aprender a dizer NÃO
✅ Bússola de Valores — o que realmente importa
✅ Diário de Conquistas
✅ Desafios de fogo semanais
✅ Plano de acção pessoal
✅ Chat comigo
✅ Acesso à Comunidade

O IGNIS não é sobre produtividade. É sobre *clareza de vontade* — saber o que queres e ter coragem de ir buscar.

*Preços:*
Mensal — *750 MZN*/mês
Semestral — *3.825 MZN* (poupas 675 MZN)
Anual — *7.200 MZN* (poupas 1.800 MZN)

Experimenta *7 dias grátis*.

👉 Começa: app.seteecos.com/ignis`;

// --- 6: VENTIS ---
R['ventis'] = `*VENTIS — O Fôlego Vital* 🍃

Cansada mesmo depois de dormir? A exaustão crónica tem solução. O VENTIS ajuda-te a encontrar o teu ritmo.

*O que recebes:*
✅ Monitor de energia diário
✅ Construtor de rotinas conscientes
✅ Pausas conscientes guiadas
✅ Fluxo de movimento (exercícios suaves)
✅ Conexão com a natureza
✅ Análise do teu ritmo pessoal
✅ Mapa de picos e vales de energia
✅ Detector de burnout
✅ Rituais vs. Rotinas — encontrar o equilíbrio
✅ Chat comigo
✅ Acesso à Comunidade

*Preços:*
Mensal — *750 MZN*/mês
Semestral — *3.825 MZN* (poupas 675 MZN)
Anual — *7.200 MZN* (poupas 1.800 MZN)

Experimenta *7 dias grátis*.

👉 Começa: app.seteecos.com/ventis`;

// --- 7: ECOA ---
R['ecoa'] = `*ECOA — Voz e Desbloqueio do Silêncio* 🗣️

Quantas vezes engoliste o que querias dizer? O ECOA devolve-te a voz.

*O que recebes:*
✅ Mapa do silenciamento — onde te calaste?
✅ Micro-exercícios de voz diários
✅ Biblioteca de frases assertivas
✅ Registo de vozes recuperadas
✅ Diário de voz — o que disseste e não disseste
✅ Cartas não enviadas — escreve o que nunca disseste
✅ Afirmações diárias personalizadas
✅ Exercícios de expressão e comunicação assertiva
✅ Chat comigo
✅ Acesso à Comunidade

O ECOA é para todas as mulheres que foram silenciadas — pela cultura, pela família, por um parceiro. A tua voz importa.

*Preços:*
Mensal — *750 MZN*/mês
Semestral — *3.825 MZN* (poupas 675 MZN)
Anual — *7.200 MZN* (poupas 1.800 MZN)

Experimenta *7 dias grátis*.

👉 Começa: app.seteecos.com/ecoa`;

// --- 8: IMAGO ---
R['imago'] = `*IMAGO — Identidade e Espelho* 🪞

Quem és tu quando ninguém está a ver? O IMAGO é o eco mais profundo — a integração de tudo o que és.

*O que recebes:*
✅ Espelho Triplo — auto-reflexão guiada
✅ Arqueologia de Si — escavar as camadas da identidade
✅ Cerimónia de Nomeação — dar nome ao que sentes
✅ Mapa de Identidade pessoal
✅ Valores essenciais — o teu norte
✅ Roupa como identidade — o que comunicas ao vestir
✅ Linha do tempo da jornada
✅ Integração com todos os outros Ecos
✅ Meditações de essência em áudio
✅ Visão do futuro
✅ Chat comigo
✅ Acesso à Comunidade

*Preços:*
Mensal — *975 MZN*/mês
Semestral — *4.972 MZN* (poupas 878 MZN)
Anual — *9.360 MZN* (poupas 2.340 MZN)

Experimenta *7 dias grátis*.

👉 Começa: app.seteecos.com/imago`;

// --- AURORA (módulo bónus gratuito) ---
R['aurora'] = `*AURORA — Integração Final* 🌅

O AURORA é o *presente* que recebes ao completar os 7 Ecos. Não se compra — conquista-se.

*O que inclui:*
🎓 Cerimónia de graduação
📊 Comparação antes/depois da tua transformação
📖 Resumo completo da jornada
🔄 Modo de manutenção — continuar sem recomeçar
🤝 Mentoria — ajudar outras mulheres
🌀 Ritual de renovação anual
💡 Insights de integração

*Preço:* GRÁTIS — desbloqueia automaticamente quando completares Vitalis, Áurea, Serena, Ignis, Ventis, Ecoa e Imago.

É a coroa da tua transformação. 👑

Queres começar? Responde *lumina* para o diagnóstico gratuito ou *preços* para ver os planos.`;

// --- PREÇOS ---
R['precos'] = `*Planos e Preços — Sete Ecos 2026*

━━━━━━━━━━━━━━━━━━
*VITALIS* (Nutrição) ⭐ Mais popular
━━━━━━━━━━━━━━━━━━
Mensal — *2.500 MZN*/mês
Semestral — *12.500 MZN* (poupas 2.500!)
Anual — *21.000 MZN* (poupas 9.000!)

━━━━━━━━━━━━━━━━━━
*ÁUREA* (Auto-Valor) · *IMAGO* (Identidade)
━━━━━━━━━━━━━━━━━━
Mensal — *975 MZN*/mês cada
Semestral — a partir de *4.972 MZN*
Anual — a partir de *9.360 MZN*

━━━━━━━━━━━━━━━━━━
*SERENA · IGNIS · VENTIS · ECOA*
━━━━━━━━━━━━━━━━━━
Mensal — *750 MZN*/mês cada
Semestral — *3.825 MZN* cada
Anual — *7.200 MZN* cada

━━━━━━━━━━━━━━━━━━
*BUNDLES* (Quanto mais, mais poupas!)
━━━━━━━━━━━━━━━━━━
DUO (2 Ecos) — *15% desconto*
TRIO (3 Ecos) — *25% desconto*
JORNADA (5+ Ecos) — *35% desconto*
TUDO (7 Ecos) — *40% desconto* 🔥
Ex: Todos os 7 = *2.800 MZN/mês* (em vez de 7.400!)

━━━━━━━━━━━━━━━━━━
*GRÁTIS*
━━━━━━━━━━━━━━━━━━
LUMINA — Diagnóstico gratuito (sempre)
AURORA — Desbloqueia ao completar os 7 Ecos

Todos incluem: *7 dias grátis* + Comunidade + chat comigo.

Responde *pagar* para saber como pagar ou *bundle* para mais detalhes`;

// --- PAGAMENTO ---
R['pagar'] = `*Como Pagar — Sete Ecos*

*1. PayPal / Cartão (acesso imediato!)*
Visa, Mastercard ou PayPal directo na app.
👉 app.seteecos.com/vitalis/pagamento

*2. M-Pesa*
Envia para: *85 100 6473*
Nome: Vivianne Santos
Depois envia-me o comprovativo aqui neste chat!

*3. Transferência Bancária*
Contacta-me para os dados bancários.
Depois envia o comprovativo aqui.

*Prazos de activação:*
⚡ PayPal/cartão: acesso *imediato*
📱 M-Pesa: activação em menos de *1 hora*
🏦 Transferência: até 24 horas

Já pagaste? Envia-me o comprovativo aqui que activo o teu acesso!

💡 _Não tens a certeza? Experimenta *7 dias grátis* primeiro — responde *trial*_`;

// --- TRIAL ---
R['trial'] = `*Experimenta Grátis — 7 Dias* 🎁

Podes experimentar *qualquer Eco* durante *7 dias grátis* antes de decidir. Sem compromisso, sem cartão.

*O que tens acesso no trial:*
✅ Dashboard completo
✅ Check-in diário
✅ Práticas e exercícios
✅ Espaço de Retorno
✅ Desafios semanais
✅ Chat comigo directamente

*No trial do VITALIS, ficas sem:*
- Plano alimentar completo
- Lista de compras
- Relatórios detalhados
- Fotos de progresso

Nos outros Ecos o trial tem *acesso total*.

Para activar o trial:
👉 app.seteecos.com (escolhe o Eco e clica "Experimentar grátis")

Ou responde *vivianne* e eu activo-te manualmente!`;

// --- FALAR COM VIVIANNE ---
R['vivianne_contacto'] = `*Falar com a Vivianne* 💬

A tua mensagem foi recebida! Vou responder-te pessoalmente assim que puder.

*Horário:* Seg-Sex, 9h-18h (hora de Maputo)

Enquanto esperas, experimenta:
🔮 Diagnóstico gratuito: app.seteecos.com/lumina
📖 Catálogo completo: app.seteecos.com/catalogo

Obrigada pela paciência — falo contigo em breve!`;

// --- BUNDLE ---
R['bundle'] = `*BUNDLES — Quanto mais Ecos, mais poupas!* 🎁

A transformação é mais poderosa quando trabalhas várias dimensões juntas. E eu recompenso isso com descontos sérios.

━━━━━━━━━━━━━━━━━━
*DUO* — 2 Ecos (15% desc.)
━━━━━━━━━━━━━━━━━━
Escolhe qualquer 2. Exemplo: Vitalis + Serena
A partir de *1.275 MZN/mês*

━━━━━━━━━━━━━━━━━━
*TRIO* — 3 Ecos (25% desc.)
━━━━━━━━━━━━━━━━━━
Escolhe qualquer 3. Exemplo: Vitalis + Áurea + Ignis
A partir de *1.687 MZN/mês*

━━━━━━━━━━━━━━━━━━
*JORNADA* — 5+ Ecos (35% desc.)
━━━━━━━━━━━━━━━━━━
Para quem quer transformação profunda.
A partir de *2.437 MZN/mês*

━━━━━━━━━━━━━━━━━━
*TUDO* — Todos os 7 Ecos (40% desc.) 🔥
━━━━━━━━━━━━━━━━━━
*2.800 MZN/mês* (em vez de 7.400!)
Poupas *4.600 MZN por mês*!
+ AURORA desbloqueia GRÁTIS ao completar tudo

Todos os bundles incluem Comunidade + chat comigo.

Responde *pagar* para saber como pagar, ou *vivianne* e monto o teu pacote à medida!`;

// --- COMUNIDADE ---
R['comunidade'] = `*Comunidade Sete Ecos* 🤝

Um espaço seguro. Sem julgamento. De mulheres para mulheres.

*4 espaços únicos:*

*🏞️ O Rio* — Reflexões guiadas por prompts diários. Partilha os teus pensamentos, lê os de outras mulheres.

*⭕ Círculos de Eco* — Grupos de 7-12 mulheres que exploram o mesmo tema juntas, com apoio mútuo.

*🔥 Fogueira* — Espaço efémero de 24h. Todas se reúnem num tema. Conversas honestas que desaparecem.

*💌 Sussurros* — Mensagens privadas de apoio e encorajamento entre mulheres.

Isto *não é* uma rede social. É um espaço de cura colectiva.

Incluída em *todos* os planos pagos.

Queres experimentar? Responde *trial* para 7 dias grátis.`;

// --- REFERRAL ---
R['referral'] = `*Programa de Referência* 🎉

Partilha o Sete Ecos com amigas e *ambas ganham*!

*Como funciona:*
1. Recebes o teu código único (formato ECOS-XXXXXX)
2. Partilha com amigas
3. Quando ela subscreve, tu ganhas *+7 dias grátis*
4. Ela também ganha *7 dias de trial*

Podes convidar até *10 pessoas*.

Para receber o teu código, regista-te em app.seteecos.com e vai ao teu perfil.

Ou responde *vivianne* e eu envio-te o código directamente!`;

// --- CATÁLOGO ---
R['catalogo'] = `*Catálogo Sete Ecos 2026* 📖

Tudo sobre os nossos 7 Ecos num só lugar:

👉 app.seteecos.com/catalogo

Inclui: LUMINA, VITALIS, ÁUREA, SERENA, IGNIS, VENTIS, ECOA, IMAGO, Comunidade, preços e formas de pagamento.

Tens dúvidas? Escreve aqui ou responde *vivianne* para falar comigo directamente.`;

// --- FAQ ---
R['faq'] = `*Perguntas Frequentes* ❓

*O que é o Sete Ecos?*
Um sistema de transformação feminina com 7 dimensões (Ecos) — do corpo à identidade. Cada Eco trabalha uma parte de ti.

*É uma dieta?*
O VITALIS trabalha nutrição, mas não é dieta. É reeducação alimentar com comida moçambicana real (xima, matapa, caril...).

*Preciso de ginásio?*
Não. Os treinos são adaptados para fazer em casa.

*Por onde começo?*
Pelo LUMINA — é gratuito e em 5 minutos descobres o teu padrão. Depois eu recomendo o melhor Eco para ti.

*Posso experimentar antes de pagar?*
Sim! 7 dias grátis em qualquer Eco pago.

*Funciona sem internet?*
Sim! A app funciona offline (é uma PWA).

*Posso cancelar?*
Sim, a qualquer momento.

*A coach é real?*
Sim! Eu, Vivianne, respondo pessoalmente. Não sou um bot (mas este WhatsApp é automático — para falar comigo responde *vivianne*).

*Posso pagar por M-Pesa?*
Sim! M-Pesa, PayPal, cartão e transferência bancária.

*Quanto custa tudo junto?*
Com o Bundle TUDO (7 Ecos), pagas *2.800 MZN/mês* em vez de 7.400. São 40% de desconto!

Mais dúvidas? Responde *vivianne* e eu esclareço tudo.`;

// --- OBRIGADA ---
R['obrigada'] = `De nada! Estou aqui para ti, sempre.

Se precisares de alguma coisa:
🔮 Diagnóstico gratuito: app.seteecos.com/lumina
📖 Catálogo: app.seteecos.com/catalogo
💬 Falar comigo: responde *vivianne*

Boa transformação! ✨`;

// --- MENSAGEM GENÉRICA ---
const GENERICA = `Obrigada pela tua mensagem!

Posso ajudar-te com os *7 Ecos*:

1 VITALIS · 2 ÁUREA · 3 SERENA · 4 IGNIS
5 VENTIS · 6 ECOA · 7 IMAGO

Ou escreve: *lumina* (grátis), *aurora*, *preços*, *bundle*, *trial*, *pagar*, *faq*

Ou responde *vivianne* para falar comigo directamente.`;

// ===== DETECÇÃO POR PALAVRAS-CHAVE =====

function detectarResposta(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Números diretos (1-7 = os 7 Ecos)
  if (t === '1') return { chave: '1' };        // Vitalis
  if (t === '2') return { chave: '3' };        // Áurea
  if (t === '3') return { chave: 'serena' };   // Serena
  if (t === '4') return { chave: 'ignis' };    // Ignis
  if (t === '5') return { chave: 'ventis' };   // Ventis
  if (t === '6') return { chave: 'ecoa' };     // Ecoa
  if (t === '7') return { chave: 'imago' };    // Imago

  // Palavras-chave directas (módulos escritos por nome)
  if (t === 'bundle' || t === 'pacote' || t === 'bundles' || t === 'pacotes')
    return { chave: 'bundle' };

  if (t === 'catalogo' || t === 'brochura')
    return { chave: 'catalogo' };

  if (t === 'faq' || t === 'perguntas')
    return { chave: 'faq' };

  // Bundle multi-eco
  if (t.includes('bundle') || t.includes('pacote') || t.includes('combo') ||
      t.includes('duo') || t.includes('trio') || t.includes('jornada') ||
      t.includes('tudo junto') || t.includes('todos os ecos') || t.includes('todos juntos'))
    return { chave: 'bundle' };

  // Aurora
  if (t.includes('aurora') || t.includes('integracao final') || t.includes('graduacao'))
    return { chave: 'aurora' };

  // Comunidade
  if (t.includes('comunidade') || t.includes('rio') || t.includes('circulo') ||
      t.includes('fogueira') || t.includes('sussurro'))
    return { chave: 'comunidade' };

  // Referral
  if (t.includes('referral') || t.includes('referencia') || t.includes('convidar') ||
      t.includes('codigo') || t.includes('indicar') || t.includes('convite'))
    return { chave: 'referral' };

  // Pagamento
  if (t.includes('pagar') || t.includes('pagamento') || t.includes('mpesa') ||
      t.includes('m-pesa') || t.includes('paypal') || t.includes('transferencia') ||
      t.includes('comprovativo') || t.includes('cartao') || t.includes('visa') ||
      t.includes('mastercard') || t.includes('recibo'))
    return { chave: 'pagar' };

  // Preços
  if (t.includes('preco') || t.includes('quanto custa') || t.includes('valor') ||
      t.includes('quanto') || t.includes('plano') || t.includes('custos') ||
      t.includes('mensalidade') || t.includes('assinatura') || t.includes('barato') ||
      t.includes('caro') || t.includes('desconto') || t.includes('promocao'))
    return { chave: 'precos' };

  // Trial
  if (t.includes('gratis') || t.includes('gratuito') || t.includes('trial') ||
      t.includes('experimentar') || t.includes('teste') || t.includes('sem pagar') ||
      t.includes('sem compromisso'))
    return { chave: 'trial' };

  // FAQ
  if (t.includes('faq') || t.includes('pergunta') || t.includes('duvida') ||
      t.includes('como funciona') || t.includes('o que e'))
    return { chave: 'faq' };

  // --- MÓDULOS POR TEMA ---

  // SERENA (emoções)
  if (t.includes('serena') || t.includes('emocao') || t.includes('emocoes') ||
      t.includes('emocional') || t.includes('ansiedade') || t.includes('ansiosa') ||
      t.includes('triste') || t.includes('tristeza') || t.includes('choro') ||
      t.includes('chorar') || t.includes('deprimida') || t.includes('stress') ||
      t.includes('stressada') || t.includes('angustia') || t.includes('mare') ||
      t.includes('ciclo emocional') || t.includes('sentir'))
    return { chave: 'serena' };

  // IGNIS (vontade, foco)
  if (t.includes('ignis') || t.includes('foco') || t.includes('vontade') ||
      t.includes('motivacao') || t.includes('preguica') || t.includes('procrastin') ||
      t.includes('disciplina') || t.includes('objetivo') || t.includes('meta') ||
      t.includes('desistir') || t.includes('comecar') || t.includes('coragem') ||
      t.includes('determinacao') || t.includes('forca de vontade'))
    return { chave: 'ignis' };

  // VENTIS (energia, ritmo)
  if (t.includes('ventis') || t.includes('energia') || t.includes('cansada') ||
      t.includes('cansaco') || t.includes('exausta') || t.includes('exaustao') ||
      t.includes('burnout') || t.includes('dormir') || t.includes('sono') ||
      t.includes('insonia') || t.includes('rotina') || t.includes('ritmo') ||
      t.includes('respirar') || t.includes('respiracao') || t.includes('descanso') ||
      t.includes('pausa'))
    return { chave: 'ventis' };

  // ECOA (voz, expressão)
  if (t.includes('ecoa') || t.includes('voz') || t.includes('silencio') ||
      t.includes('silenciada') || t.includes('calada') || t.includes('calar') ||
      t.includes('expressao') || t.includes('expressar') || t.includes('comunicacao') ||
      t.includes('assertiv') || t.includes('falar') || t.includes('dizer') ||
      t.includes('opiniao') || t.includes('nao consigo dizer'))
    return { chave: 'ecoa' };

  // IMAGO (identidade)
  if (t.includes('imago') || t.includes('identidade') || t.includes('quem sou') ||
      t.includes('auto-conhecimento') || t.includes('autoconhecimento') ||
      t.includes('espelho') || t.includes('essencia') || t.includes('proposito') ||
      t.includes('valores') || t.includes('perdida') || t.includes('nao sei quem sou'))
    return { chave: 'imago' };

  // LUMINA (não é Eco — ferramenta gratuita)
  if (t.includes('lumina') || t.includes('diagnostico') || t.includes('leitura') ||
      t.includes('padrao'))
    return { chave: 'lumina' };

  // ÁUREA
  if (t.includes('aurea') || t.includes('auto-valor') || t.includes('autovalor') ||
      t.includes('merecimento') || t.includes('presenca') || t.includes('meditac') ||
      t.includes('autoestima') || t.includes('auto estima') || t.includes('nao mereco') ||
      t.includes('nao valho'))
    return { chave: '3' };

  // VITALIS (mais amplo — por último entre os módulos)
  if (t.includes('vitalis') || t.includes('nutri') || t.includes('coaching') ||
      t.includes('receita') || t.includes('plano alimentar') || t.includes('emagrecer') ||
      t.includes('peso') || t.includes('dieta') || t.includes('comida') ||
      t.includes('alimenta') || t.includes('xima') || t.includes('matapa') ||
      t.includes('engordar') || t.includes('gordo') || t.includes('gorda') ||
      t.includes('magra') || t.includes('barriga') || t.includes('corpo'))
    return { chave: '1' };

  // Saudações
  if (/^(ola|oi|bom dia|boa tarde|boa noite|hello|hi|hey|boa|epa|yo|hola)/.test(t))
    return { chave: 'saudacao' };

  // Falar com Vivianne (humana)
  if (t.includes('vivianne') || t.includes('coach') || t.includes('ajuda') ||
      t.includes('suporte') || t.includes('problema') || t.includes('reclamar') ||
      t.includes('nao funciona') || t.includes('erro') || t.includes('falar contigo') ||
      t.includes('pessoa real') || t.includes('humana') || t.includes('atendimento'))
    return { chave: 'vivianne_contacto', notificarCoach: true };

  // Agradecimento
  if (t.includes('obrigad') || t.includes('thanks') || t.includes('brigada') ||
      t.includes('agradec') || t.includes('valeu') || t.includes('fixe'))
    return { chave: 'obrigada' };

  // Catálogo
  if (t.includes('catalogo') || t.includes('brochura') || t.includes('informacao') ||
      t.includes('saber mais'))
    return { chave: 'catalogo' };

  return { chave: null, notificarCoach: true };
}

// ===== MEMÓRIA DE CONTEXTO =====
// Guarda últimas interações por telefone (in-memory, 30 min TTL)

const sessoes = new Map();
const SESSAO_TTL = 30 * 60 * 1000; // 30 minutos
const MAX_HISTORICO = 5;

function getSessao(telefone) {
  if (!telefone) return null;
  const s = sessoes.get(telefone);
  if (s && Date.now() - s.ultimaAtividade < SESSAO_TTL) return s;
  sessoes.delete(telefone);
  return null;
}

function atualizarSessao(telefone, chaveIn, chaveOut) {
  if (!telefone) return;
  const existente = getSessao(telefone) || { historico: [], ultimaAtividade: 0 };
  existente.historico.push({ in: chaveIn, out: chaveOut, ts: Date.now() });
  if (existente.historico.length > MAX_HISTORICO) existente.historico.shift();
  existente.ultimaAtividade = Date.now();
  existente.ultimaChave = chaveOut;
  sessoes.set(telefone, existente);

  // Limpar sessões expiradas (max 500 em memória)
  if (sessoes.size > 500) {
    const agora = Date.now();
    for (const [k, v] of sessoes) {
      if (agora - v.ultimaAtividade > SESSAO_TTL) sessoes.delete(k);
    }
  }
}

// Nomes legíveis das chaves para contexto
const NOMES_CHAVES = {
  '1': 'Vitalis',
  '3': 'Áurea',
  'lumina': 'Lumina',
  'serena': 'Serena',
  'ignis': 'Ignis',
  'ventis': 'Ventis',
  'ecoa': 'Ecoa',
  'imago': 'Imago',
  'aurora': 'Aurora',
  'precos': 'Preços',
  'pagar': 'Pagamento',
  'trial': 'Trial',
  'bundle': 'Bundles',
  'comunidade': 'Comunidade',
  'faq': 'FAQ',
  'referral': 'Referência',
  'catalogo': 'Catálogo',
};

// Follow-ups contextuais baseados na última interação
const FOLLOW_UPS = {
  '1': '\n\n💡 _Já viste os preços? Responde *preços*. Ou experimenta grátis: *trial*_',
  'lumina': '\n\n💡 _O LUMINA é gratuito! Depois experimenta o VITALIS (*1*) ou a SERENA (*3*)_',
  '3': '\n\n💡 _Queres combinar Ecos? Responde *bundle* para ver descontos até 40%!_',
  'serena': '\n\n💡 _Combina bem com VITALIS (corpo + emoção). Responde *bundle* para descontos!_',
  'ignis': '\n\n💡 _O IGNIS + VENTIS juntos são perfeitos. Responde *bundle*!_',
  'ventis': '\n\n💡 _Tens problemas de energia E emoção? Experimenta VENTIS + SERENA. Responde *bundle*!_',
  'ecoa': '\n\n💡 _O ECOA + ÁUREA são transformadores juntos. Responde *bundle*!_',
  'imago': '\n\n💡 _O IMAGO é o eco mais profundo. Combina com tudo. Responde *bundle* para descontos!_',
  'precos': '\n\n💡 _Para saber como pagar responde *pagar*. Ou experimenta grátis: *trial*_',
  'pagar': '\n\n💡 _Já tens comprovativo? Envia a foto aqui!_',
  'trial': '\n\n💡 _Para activar o trial vai a app.seteecos.com e escolhe o teu Eco!_',
  'bundle': '\n\n💡 _Queres que eu monte o teu pacote? Responde *vivianne*!_',
};

// ===== GERAR RESPOSTA =====

function gerarResposta(msgBody, nome, telefone) {
  // ANTI-LOOP: Se o telefone é o número da coach/negócio, nunca notificar coach
  const isCoach = telefone === COACH_NUMERO;

  const { chave } = detectarResposta(msgBody);
  // SEMPRE notificar a coach sobre TODAS as interações (excepto as da própria coach)
  const notificarCoach = !isCoach;
  const sessao = getSessao(telefone);

  let resposta;

  if (chave === 'saudacao') {
    if (sessao && sessao.historico.length > 0) {
      // Utilizador/a já falou antes — saudação mais curta
      const primeiroNome = nome ? nome.split(' ')[0] : '';
      resposta = `Olá de novo${primeiroNome ? `, ${primeiroNome}` : ''}! Em que posso ajudar?\n\n${MENU_PRINCIPAL}`;
    } else {
      resposta = nome
        ? `Olá ${nome.split(' ')[0]}! Sou a *Vivianne*, criadora do Sete Ecos.\n\nBem-vindo/a a um sistema de transformação feminina com *7 dimensões* — do corpo à alma.\n\n${MENU_PRINCIPAL}`
        : SAUDACAO;
    }
  } else if (chave === 'obrigada') {
    resposta = R['obrigada'];
  } else if (R[chave]) {
    resposta = R[chave];
    // Adicionar follow-up contextual se não é repetição da mesma chave
    if (FOLLOW_UPS[chave] && (!sessao || sessao.ultimaChave !== chave)) {
      resposta += FOLLOW_UPS[chave];
    }
  } else {
    // Mensagem não reconhecida — se tem contexto, sugerir com base no último tema
    if (sessao && sessao.ultimaChave && NOMES_CHAVES[sessao.ultimaChave]) {
      resposta = `Não percebi essa mensagem, mas vi que estavas a ver sobre *${NOMES_CHAVES[sessao.ultimaChave]}*. Precisas de mais informação?\n\nOu escolhe uma opção:\n${MENU_PRINCIPAL}`;
    } else {
      resposta = GENERICA;
    }
  }

  // Atualizar sessão
  atualizarSessao(telefone, msgBody, chave);

  return { resposta, chave, notificarCoach };
}

export {
  COACH_NUMERO,
  MENU_PRINCIPAL,
  SAUDACAO,
  GENERICA,
  R,
  NOMES_CHAVES,
  detectarResposta,
  gerarResposta
};
