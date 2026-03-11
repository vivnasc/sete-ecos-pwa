/**
 * Marketing Engine v3 - Motor de conteúdo com SUBSTÂNCIA
 *
 * Princípios fundadores (palavras da Vivianne):
 * - A Sete Ecos nasceu de excesso, não de falta. Nasceu de alguém que vivia muitas
 *   camadas ao mesmo tempo — intelectual, espiritual, profissional, criativa, corporal —
 *   e tudo estava separado.
 * - Não é mais uma solução. É um sistema onde as partes conversam entre si.
 * - Resolver só o corpo não muda identidade. Resolver só emoção não muda disciplina.
 *   Resolver só produtividade não muda valor próprio.
 * - Arquitectura de integração. Humana. Não corporativa. Não mística performativa.
 * - Não vender esperança. Oferecer coerência.
 * - Criar respeito antes de criar empatia.
 *
 * Frase-âncora: "A Sete Ecos não nasceu para te melhorar. Nasceu para integrar o que já és."
 *
 * Tom: inteligente, denso, directo. Frases curtas. Sem slogans motivacionais vazios.
 * Assinar: "— Vivianne". Máximo 1-2 emojis. Máximo 1 exclamação por parágrafo.
 */

import { buildUTMUrl, UTM_TEMPLATES } from '../utils/utm';

const BASE_URL = 'https://app.seteecos.com';

// ============================================================
// HOOKS - Frases que param o scroll (primeiros 3 segundos)
// Princípio: não motivação barata. Observação inteligente.
// ============================================================

const HOOKS_PROVOCADORES = [
  'Tens profundidade. Tens disciplina. Tens visão. Mas não tens integração.',
  'Resolves o corpo. Depois a emoção. Depois o foco. E nunca juntam.',
  'O problema não é falta de conhecimento. É excesso de fragmentação.',
  'Há anos que trabalhas em ti. Mas cada pedaço separado do resto.',
  'Sabes o que comer, como respirar, como meditar. Mas continuas sem energia.',
  'Não te falta mais uma solução. Falta-te um sistema onde tudo converse.',
  'A Sete Ecos não nasceu para te melhorar. Nasceu para integrar o que já és.',
  'Se tratas partes isoladas, vais continuar a viver em ciclos.',
  'Isto nasceu de excesso, não de falta. De alguém que vivia muitas camadas separadas.',
  'Resolver só o corpo não muda identidade. Resolver só emoção não muda disciplina.',
  'Enquanto cada dimensão da tua vida falar uma língua diferente, não há coerência.',
  'Já percebeste que soluções isoladas não funcionam. E agora?',
  'Não quero vender-te esperança. Quero oferecer-te coerência.',
  'Isto não é wellness estético. É arquitectura de integração.',
  'Eu recusei-me a continuar a trabalhar a vida por pedaços. E criei isto.',
];

// ============================================================
// CONTEUDO POR CATEGORIA
// Eixo: fragmentação → integração → coerência
// ============================================================

// INTEGRAÇÃO — a tese central da Sete Ecos
const CONTEUDO_CORPO = [
  {
    hook: 'Tens profundidade em cada área da tua vida. Mas nenhuma fala com a outra.',
    corpo: 'Sabes sobre nutrição. Leste sobre emoções. Experimentaste meditação. Fizeste terapia. Mas cada conhecimento vive num compartimento estanque. A Sete Ecos é a arquitectura que liga tudo.',
    cta: 'Não é mais uma solução. É um sistema. — Vivianne',
  },
  {
    hook: 'Resolves o corpo numa app. A emoção noutra. O foco noutra. E depois?',
    corpo: 'Depois continuas sem energia. Porque o problema nunca foi falta de ferramentas. Foi falta de integração. 7 apps separadas nunca vão funcionar como 1 sistema desenhado para conversar.',
    cta: '7 ecos. 1 sistema. As partes conversam entre si.',
  },
  {
    hook: 'A Sete Ecos nasceu de excesso. Não de falta.',
    corpo: 'Não nasceu porque faltava algo. Nasceu porque havia demasiado — camadas intelectuais, espirituais, profissionais, criativas, corporais — tudo a viver separado dentro da mesma pessoa.',
    cta: 'Isto é estrutura com consciência. — Vivianne',
  },
  {
    hook: 'Já tens disciplina. Já tens visão. O que te falta é coerência.',
    corpo: 'Coerência é quando o que comes, o que sentes, o que dizes, o que decides e quem és estão alinhados. Não perfeitos — alinhados. A Sete Ecos constrói esse alinhamento.',
    cta: 'Descobre o teu ponto de partida com o LUMINA. Grátis.',
  },
  {
    hook: 'Não construí mais uma app de bem-estar. Construí um sistema de integração.',
    corpo: 'Corpo (Vitalis). Valor (Áurea). Emoção (Serena). Vontade (Ignis). Energia (Ventis). Voz (Ecoa). Identidade (Imago). 7 dimensões que finalmente conversam entre si.',
    cta: 'Arquitectura humana. Não corporativa. Não mística performativa.',
  },
  {
    hook: 'A fragmentação cansa. E ninguém fala nisso.',
    corpo: 'Fazes tudo bem. Mas no fim do dia, algo não encaixa. Porque viver por pedaços — um para o trabalho, outro para a família, outro para ti — gasta mais energia do que qualquer rotina.',
    cta: 'A Sete Ecos existe para quem percebeu isto.',
  },
  {
    hook: 'Eu vivia muitas camadas ao mesmo tempo. E nenhuma se tocava.',
    corpo: 'Intelectual. Espiritual. Profissional. Criativa. Corporal. Todas profundas. Todas sérias. Todas separadas. A Sete Ecos nasceu como resposta: um sistema onde as partes conversam.',
    cta: 'A minha história é provavelmente a tua também. — Vivianne',
  },
  {
    hook: 'Se tratas cada dimensão da vida por separado, nunca sais dos ciclos.',
    corpo: 'Resolves o corpo — a emoção sabota. Resolves a emoção — a identidade bloqueia. Resolves a identidade — falta energia. É um ciclo. A Sete Ecos é a saída do ciclo.',
    cta: 'Não é melhorar partes. É integrar o todo.',
  },
  {
    hook: 'Pergunta incómoda: se tirasses todos os papéis, ficava o quê?',
    corpo: 'Mãe, profissional, esposa, filha, amiga. Tira tudo. O que fica? Se a resposta te assusta, é porque nunca tiveste espaço para a descobrir. A Sete Ecos começa aí — na essência, não nos papéis.',
    cta: 'O LUMINA mostra-te onde estás. O sistema mostra-te quem és. — Vivianne',
  },
  {
    hook: 'Não tens de escolher entre corpo e mente. Isso é uma falsa escolha.',
    corpo: 'A indústria separou: ou cuidas do corpo (ginásio, dieta) ou cuidas da mente (terapia, meditação). Como se fosses duas pessoas. Não és. E enquanto tratares partes, perdes energia na fragmentação.',
    cta: 'Um sistema. Todas as dimensões. Começa com o LUMINA.',
  },
  {
    hook: 'Uma pessoa escreveu-me: "Finalmente algo que não me subestima."',
    corpo: 'Ela tinha tentado apps de hábitos, planners, bullet journals, terapia, coaching. Tudo funcionava parcialmente. Porque tudo tratava uma fatia. Ela não precisava de mais fatias. Precisava do bolo inteiro.',
    cta: 'Se já tentaste tudo por partes, experimenta por inteiro. — Vivianne',
  },
  {
    hook: 'A coerência é o luxo que mais falta nesta era de excesso.',
    corpo: 'Tens acesso a tudo: informação, apps, cursos, podcasts. E quanto mais acesso tens, mais fragmentada ficas. Porque acumular recursos sem integração é coleccionar ferramentas sem casa.',
    cta: 'A Sete Ecos não te dá mais. Organiza o que já tens. — Vivianne',
  },
];

// PROFUNDIDADE — para quem já fez muita coisa e procura algo com substância
const CONTEUDO_EMOCIONAL = [
  {
    hook: 'Isto não é para quem quer motivação. É para quem quer coerência.',
    corpo: 'Se procuras frases inspiradoras e promessas de transformação em 21 dias, isto não é para ti. A Sete Ecos é para quem já percebeu que a resposta não está numa frase bonita. Está na estrutura.',
    cta: 'Inteligência. Não inspiração. — Vivianne',
  },
  {
    hook: 'A maioria do wellness vende-te a versão fácil. Eu recusei-me.',
    corpo: 'Recusei-me a simplificar o que é complexo. A vida não tem uma dimensão. Tu não tens um problema. Tens camadas. E cada camada merece ser tratada com respeito, não com slogans.',
    cta: 'Estrutura com consciência. Não espuma.',
  },
  {
    hook: 'Se já percebeste que soluções isoladas não funcionam, esta conta é tua.',
    corpo: 'Esta conta é para gente que pensa. Que sente. Que já experimentou. Que sabe que a próxima app de hábitos não vai resolver o que falta. O que falta é integração.',
    cta: 'Começa pelo LUMINA. Grátis. 2 minutos. Sem promessas vazias.',
  },
  {
    hook: 'Não quero que me sigas por inspiração. Quero que me sigas por reconhecimento.',
    corpo: 'Se olhas para isto e pensas "alguém finalmente percebe a forma como eu funciono" — é isso. Não vim resolver o teu problema. Vim organizar o que já sabes.',
    cta: 'Isto foi pensado por quem vive profundidade. Não é raso.',
  },
  {
    hook: 'A Sete Ecos não nasceu para te melhorar. Nasceu para integrar o que já és.',
    corpo: 'Não és um projecto a corrigir. És uma pessoa com muitas dimensões que nunca tiveram espaço para se encontrar. Este sistema é esse espaço.',
    cta: 'Sem guru. Sem milagre. Só arquitectura humana.',
  },
  {
    hook: 'Eu criei isto porque me recusei a continuar a trabalhar a vida por pedaços.',
    corpo: 'Nutrição por um lado. Emoções por outro. Produtividade numa app. Meditação noutra. Identidade em lado nenhum. Chega. A vida é uma. O sistema que a suporta também devia ser.',
    cta: 'Sete Ecos. Porque as partes precisam de conversar.',
  },
  {
    hook: 'Há quanto tempo procuras algo que não sabes nomear? Talvez seja isto.',
    corpo: 'Não é falta de motivação. Não é preguiça. Não é depressão. É fragmentação. A sensação de que cada parte da tua vida está a funcionar — mas não juntas. Eu conheço essa sensação.',
    cta: 'O LUMINA é o primeiro passo. 2 minutos. Para ti.',
  },
  {
    hook: 'Não é mais uma conta de desenvolvimento pessoal. É um sistema.',
    corpo: 'Não vou publicar citações de outras pessoas. Não vou fazer danças no Reels. Não vou vender sonhos em 3 passos. Vou mostrar-te um sistema construído por alguém que vive profundidade — para pessoas que vivem profundidade.',
    cta: 'Se isto ressoa, fica. Se não, tudo bem. Não é para todos. — Vivianne',
  },
  {
    hook: 'A sabedoria sem estrutura é apenas informação acumulada.',
    corpo: 'Sabes muito. Leste livros, fizeste cursos, tiveste insights. Mas saber e integrar são coisas diferentes. A Sete Ecos transforma conhecimento disperso em acção coerente.',
    cta: 'A diferença entre saber e ser é a integração. Essa é a promessa.',
  },
  {
    hook: 'Fizeste terapia e ajudou. Mas não ligou o que aprendeste ao corpo.',
    corpo: 'A terapia deu-te consciência. Mas a consciência sozinha não muda hábitos. Precisas de ligar o que entendes mentalmente ao que o corpo faz automaticamente. Essa ponte é o que falta. A Sete Ecos é essa ponte.',
    cta: 'Consciência + estrutura = mudança real. — Vivianne',
  },
  {
    hook: 'Perfeição é uma armadilha. Integração é liberdade.',
    corpo: 'Não te peço para seres perfeita. Peço-te para seres inteira. Inteira é quando podes ser forte e vulnerável. Disciplinada e flexível. Profunda e leve. Sem contradição. Sem culpa.',
    cta: 'A Sete Ecos não te quer perfeita. Quer-te inteira.',
  },
  {
    hook: 'Uma pergunta: estás a viver ou a funcionar?',
    corpo: 'Levantar, trabalhar, comer, dormir, repetir. Se a tua vida se resume a uma sequência funcional, estás a sobreviver. Não a viver. A diferença é a presença. A intenção. A escolha.',
    cta: 'Passa de funcionar a viver. O LUMINA mostra-te onde começas. — Vivianne',
  },
];

// POSIÇÃO — o que torna a Sete Ecos diferente de tudo o resto
const CONTEUDO_PROVOCACAO = [
  {
    hook: 'Enquanto tratares partes isoladas, vais continuar a viver em ciclos.',
    corpo: 'Corpo sem emoção: recaída. Emoção sem identidade: instabilidade. Identidade sem voz: frustração. A indústria do bem-estar lucra com pedaços. A Sete Ecos recusa-se.',
    cta: '7 dimensões. 1 sistema. As partes conversam.',
  },
  {
    hook: 'Não sou guru. Não sou influencer. Sou alguém que construiu o que precisava.',
    corpo: 'Construí um sistema porque o que existia não servia. Nenhuma app tratava o corpo E a identidade. Nenhuma ligava a voz à emoção. Nenhuma via a pessoa inteira. Agora existe.',
    cta: 'E se te identificas, é para ti. — Vivianne',
  },
  {
    hook: 'O mercado do wellness vende esperança. Eu quero oferecer coerência.',
    corpo: 'Esperança é bonita. Mas sem estrutura, é vazio. Coerência é quando o que comes, sentes, dizes e decides estão alinhados. Isso não se compra numa frase motivacional.',
    cta: 'Descobre por onde começar. LUMINA — gratuito.',
  },
  {
    hook: '7 perguntas. 23 padrões. 8 dimensões da tua vida mapeadas.',
    corpo: 'Corpo. Energia. Mente. Emoção. Passado. Futuro. Conexão. Espelho. O LUMINA não mede peso. Mede como estás. De verdade. E é gratuito.',
    cta: 'Experimenta: app.seteecos.com/lumina',
  },
  {
    hook: 'Isto não é wellness estético. É arquitectura de integração.',
    corpo: 'Não vai ser bonito no Instagram. Não vai parecer fácil. Não vou prometer transformação em 21 dias. Vou prometer que cada dimensão da tua vida passa a ter um lugar. E que esses lugares conversam.',
    cta: 'Se isso te faz sentido, estás no sítio certo.',
  },
  {
    hook: 'Criar respeito antes de criar empatia. Essa é a posição.',
    corpo: 'Não quero que chores com os meus posts. Quero que pares e penses "isto foi pensado por alguém que sabe do que fala." O respeito vem antes. A confiança constrói-se depois.',
    cta: 'Sete Ecos. Estrutura com consciência. — Vivianne',
  },
  {
    hook: 'Pagaste terapia, coaching, curso de meditação. E ainda estás fragmentada.',
    corpo: 'Não porque não funcionaram. Mas porque cada um trabalhou uma parte. E ninguém te ajudou a ligar as partes. É como ter 7 especialistas que nunca se falam. A Sete Ecos é a reunião que faltava.',
    cta: 'Para de pagar por pedaços. Investe no sistema. — Vivianne',
  },
  {
    hook: 'O que distingue a Sete Ecos de tudo o resto? Uma palavra: arquitectura.',
    corpo: 'Não é inspiração — é estrutura. Não é motivação — é sistema. Cada eco conversa com os outros. O corpo influencia a emoção. A emoção influencia a voz. A voz influencia a identidade. Nada está isolado.',
    cta: 'Arquitectura humana. Esse é o diferencial.',
  },
  {
    hook: 'Três tipos de pessoas seguem esta conta. Tu és uma delas.',
    corpo: '1) Quem já fez muita coisa e procura profundidade. 2) Quem sente que algo não encaixa mas não sabe o quê. 3) Quem está cansada de soluções rasas. Se te reconheces em qualquer uma, ficaste no sítio certo.',
    cta: 'Faz o LUMINA e descobre qual é o teu ponto de partida. Grátis. — Vivianne',
  },
  {
    hook: 'A transformação mais difícil não é mudar de peso. É mudar de identidade.',
    corpo: 'Podes perder 20kg e continuar a viver como a pessoa que tinhas de ser. Podes ganhar músculos e continuar a esconder-te. A mudança real não é no corpo — é em quem acreditas ser. E isso, nenhuma dieta resolve.',
    cta: 'A Sete Ecos começa no corpo e acaba na essência. Essa é a jornada.',
  },
  {
    hook: 'Se quisesse vender fácil, prometia transformação em 21 dias. Recusei-me.',
    corpo: 'Porque respeito quem me segue. Não vou mentir sobre o tempo que leva mudar. Não vou simplificar o que é profundo. Não vou vender urgência para criar dependência. Vou dar-te estrutura e respeitar o teu ritmo.',
    cta: 'Respeito antes de empatia. Essa é a minha posição. — Vivianne',
  },
  {
    hook: 'Responde: o que tentarias se soubesses que não ias falhar?',
    corpo: 'Provavelmente já sabes a resposta. E provavelmente o medo de falhar é maior do que o medo de ficar onde estás. Mas ficar onde estás também tem um custo — e esse custo é invisível até ser tarde.',
    cta: 'Começa pelo mais simples: o LUMINA. 2 minutos. Sem risco. Sem compromisso. — Vivianne',
  },
];

// ============================================================
// CONTEUDO EDUCATIVO — Alimentação emocional, distorções, ansiedade, auto-estima
// Inspirado nos áudios do VITALIS: gratidão ao corpo, relação com comida,
// corpo sagrado, nutrir com amor, enraizamento
// Objectivo: educar sobre padrões emocionais que sabotam a nutrição
// ============================================================

// ALIMENTAÇÃO EMOCIONAL — o "porquê" por trás da compulsão
const CONTEUDO_ALIMENTACAO_EMOCIONAL = [
  {
    hook: 'Não é fome. É solidão disfarçada de apetite.',
    corpo: 'Quando comes sem ter fome, o teu corpo não está a pedir comida. Está a pedir presença. Companhia. Conforto. A comida é o substituto mais acessível — está sempre disponível, não julga, não rejeita. Mas também não preenche. Porque a fome era de outra coisa.',
    cta: 'A próxima vez que quiseres comer sem fome, pára e pergunta: do que é que eu preciso mesmo? — Vivianne',
  },
  {
    hook: 'Comer por emoção não é fraqueza. É o teu sistema nervoso a pedir ajuda.',
    corpo: 'Quando o stress activa o modo de sobrevivência, o cérebro pede energia rápida — açúcar, gordura, sal. Não é falta de força de vontade. É biologia. A diferença é que agora sabes o que está a acontecer. E saber é o primeiro passo para escolher diferente.',
    cta: 'Não lutes contra o impulso. Observa-o. O padrão revela o que precisas curar. — Vivianne',
  },
  {
    hook: 'A culpa depois de comer faz mais dano do que a comida em si.',
    corpo: 'Comeste demais. Acontece. Mas o que vem a seguir é que destrói: a culpa, a vergonha, o "amanhã começo de novo", o jejum compensatório, o exercício punitivo. Este ciclo de restrição-compulsão-culpa é mais tóxico do que qualquer refeição isolada.',
    cta: 'Comeste. Está feito. O que fazes a seguir importa mais do que o que fizeste antes. — Vivianne',
  },
  {
    hook: 'A comida tornou-se a tua forma de amor próprio. Mas não era para ser assim.',
    corpo: 'Quando ninguém te ensinou a cuidar das tuas emoções, encontraste uma forma. A comida acalmava. Premiava. Protegia. Não te culpes por isso — funcionou durante anos. Mas agora precisas de mais ferramentas, não de menos compaixão.',
    cta: 'Não tires a comida sem colocar algo no lugar. Senão vais voltar a ela. — Vivianne',
  },
  {
    hook: 'Diz-me quando comes e eu digo-te o que sentes.',
    corpo: 'À noite, quando a casa está quieta e o dia pesa — é solidão ou cansaço emocional. Depois de uma discussão — é raiva não expressa. Ao domingo à tarde — é vazio existencial. Os gatilhos são previsíveis. E quando são previsíveis, podes preparar-te.',
    cta: 'Mapear os gatilhos é mais poderoso do que qualquer plano alimentar. — Vivianne',
  },
  {
    hook: 'O problema nunca foi saber o que comer. Foi saber o que sentir.',
    corpo: 'Sabes as calorias do abacate. Sabes que açúcar faz mal. Sabes a diferença entre macro e micro. Mas quando a ansiedade aperta, nada disso importa. Porque o conhecimento nutricional não resolve a iliteracia emocional.',
    cta: 'Antes de mudar o prato, muda a relação com o que sentes. — Vivianne',
  },
  {
    hook: 'Se a comida fosse o problema, já o tinhas resolvido. Sabes comer. Não sabes parar.',
    corpo: 'Não é ignorância. É automático. O cérebro aprendeu: stress → come. Tristeza → come. Tédio → come. É um circuito neurológico, não uma falha moral. Reprogramar circuitos leva tempo, gentileza e repetição — não vergonha.',
    cta: 'Cada vez que pausas antes de comer, estás a reescrever o padrão. Mesmo que depois comas. — Vivianne',
  },
  {
    hook: 'Uma cliente disse-me: "Só como à noite, quando todos dormem." Reconheces-te?',
    corpo: 'Comer às escondidas é mais comum do que pensas. Não é vergonha — é um sinal de que a comida carrega algo que não queres que ninguém veja. Um consolo privado. Uma recompensa secreta. Um momento só teu num dia inteiro vivido para os outros.',
    cta: 'Não precisas de esconder o que sentes. Precisas de um espaço seguro para sentir. O VITALIS tem esse espaço. — Vivianne',
  },
  {
    hook: '3 sinais de que a tua fome é emocional (e não física):',
    corpo: '1) Aparece de repente, sem aviso — a fome real cresce devagar. 2) Queres algo específico (chocolate, pão, salgados) — a fome real aceita qualquer comida. 3) Não desaparece depois de comer — porque nunca foi fome.',
    cta: 'Antes de comer, pára 2 minutos e pergunta: isto é fome ou é outra coisa? — Vivianne',
  },
  {
    hook: 'Responde honestamente: quando foi a última vez que comeste com prazer e sem culpa?',
    corpo: 'Se não te lembras, o problema não é a comida. É a relação. Transformaste algo que deveria ser nutritivo e prazeroso num campo de batalha. Cada refeição é um julgamento. Cada garfada tem um veredito. Isso não é saúde. É tortura disfarçada de disciplina.',
    cta: 'A comida não é inimiga. A culpa é. Vamos separar as duas. — Vivianne',
  },
  {
    hook: 'O tédio é o gatilho emocional mais subestimado. E o mais frequente.',
    corpo: 'Não é fome. Não é tristeza. É simplesmente nada. E o "nada" é insuportável para um cérebro que precisa de estímulo. A comida dá dopamina instantânea — sabor, textura, ritual. Resolve o tédio por 10 minutos. Depois volta. E comes outra vez.',
    cta: 'A próxima vez que sentires tédio, experimenta: 5 minutos ao ar livre, uma música que gostes, ou ligar a alguém. — Vivianne',
  },
  {
    hook: 'A tua mãe dizia "come tudo" e o teu corpo ainda obedece.',
    corpo: 'As regras de infância ficam gravadas: não desperdiçar, comer tudo do prato, a sobremesa é prémio. Décadas depois, o teu corpo adulto ainda obedece à voz de uma criança de 5 anos. Não é fome. É programação. E programação reprograma-se.',
    cta: 'Podes amar a tua mãe e devolver-lhe a regra. Já não te serve. — Vivianne',
  },
];

// DISTORÇÕES E IMAGEM CORPORAL — como o espelho mente
const CONTEUDO_DISTORCOES = [
  {
    hook: 'O espelho não te mostra o que és. Mostra-te o que acreditas.',
    corpo: 'A imagem que vês quando te olhas ao espelho não é objectiva. É filtrada pelas tuas crenças, pelo teu dia, pela tua energia, pelo que alguém te disse aos 12 anos. Distorção de imagem corporal não é vaidade — é uma ferida.',
    cta: 'Pergunta: quando foi a última vez que te olhaste sem julgar? — Vivianne',
  },
  {
    hook: 'Mudaste de corpo. Mas a cabeça ficou no antigo.',
    corpo: 'Já perdeste peso antes. Já mudaste. Mas continuas a ver-te como antes — a evitar espelhos, a comprar roupa larga, a sentir que "não chega". Isto chama-se dissonância de imagem. O corpo mudou. A identidade ainda não.',
    cta: 'Não basta mudar o corpo. Tens de actualizar a história que contas sobre ti. — Vivianne',
  },
  {
    hook: 'Ninguém te ensinou a habitar o teu corpo. Ensinaram-te a corrigi-lo.',
    corpo: 'Desde criança: "estás gorda", "come menos", "fecha a boca", "não devias repetir". Cresceste a achar que o teu corpo era um problema a resolver. Não era. Era — e é — a tua casa. Não se destrói uma casa. Renova-se.',
    cta: 'O teu corpo não é um projecto. É o teu endereço. — Vivianne',
  },
  {
    hook: 'Compras roupa para o corpo que achas que devias ter, não para o que tens.',
    corpo: 'Calças "motivação" guardadas no armário. Vestidos para "quando emagrecer". Biquínis para "o próximo verão". Enquanto isso, vives no corpo de agora com vergonha do corpo de agora. Mas este corpo já te trouxe até aqui.',
    cta: 'Veste-te para o corpo que tens. Ele merece. — Vivianne',
  },
  {
    hook: '3 quilos a mais não mudam quem és. Mas a forma como falas contigo muda.',
    corpo: 'A diferença entre 68kg e 71kg é invisível para quem te ama. Mas na tua cabeça é a diferença entre "posso sair" e "fico em casa". Não são os quilos que te prendem. É a narrativa.',
    cta: 'Muda a voz interior antes de mudar a balança. — Vivianne',
  },
  {
    hook: 'A indústria lucra com a tua insatisfação corporal. Não sejas cliente.',
    corpo: 'Chás detox. Cintas modeladoras. Dietas de 800 calorias. Antes e depois milagrosos. Tudo desenhado para te fazer sentir que estás errada como estás. Estás errada? Ou estás num corpo real que precisa de nutrição real?',
    cta: 'Escolhe cuidar-te por amor, não por vergonha. A diferença muda tudo. — Vivianne',
  },
  {
    hook: 'Uma cliente perdeu 15kg. Continuava a ver-se "enorme". O espelho mentia.',
    corpo: 'A roupa era nova, os números confirmavam, as pessoas elogiavam. Mas no espelho, ela via o corpo antigo. Porque a imagem corporal não se actualiza com a balança. Actualiza-se quando reescreves a história que tens sobre o teu corpo.',
    cta: 'No VITALIS trabalhamos o corpo E a imagem. Porque mudar só um não chega. — Vivianne',
  },
  {
    hook: 'Quantas fotos apagaste porque "não estavas bem"?',
    corpo: 'Centenas. Talvez milhares. Fotos de momentos felizes, eliminadas porque o ângulo mostrava uma barriga, um braço, um queixo. Apagaste memórias para apagar um corpo. Mas o corpo estava lá — a viver, a celebrar. Eras tu.',
    cta: 'A próxima foto que tirares, guarda-a. Mesmo que o espelho proteste. — Vivianne',
  },
  {
    hook: '5 coisas que o teu corpo fez hoje que nada têm a ver com aparência:',
    corpo: '1) Respirou sem que pedisses. 2) Digeriu a comida que lhe deste. 3) Levou-te onde precisavas de ir. 4) Deu-te abraços e recebeu-os. 5) Manteve-te viva. O teu corpo é extraordinário. Não pelo que parece. Pelo que faz.',
    cta: 'Antes de criticar, agradece. O teu corpo trabalha para ti 24 horas por dia. — Vivianne',
  },
  {
    hook: 'O "antes e depois" é a maior mentira do wellness.',
    corpo: 'Iluminação diferente, postura alterada, roupa escolhida a dedo. O "antes" é desenhado para parecer miserável. O "depois" é desenhado para parecer impossível sem o produto. E tu, no meio, a sentir que o teu progresso real nunca é suficiente.',
    cta: 'O teu progresso não precisa de fotos. Precisa de honestidade. — Vivianne',
  },
  {
    hook: 'Dizes "odeio o meu corpo" como quem diz "bom dia". Ouve o que estás a dizer.',
    corpo: 'Normalizaste a violência verbal contra ti mesma. É tão automático que nem percebes. Mas cada "odeio" reforça a crença. E a crença gera o comportamento — comes por castigo, não por prazer. Restringes por punição, não por saúde.',
    cta: 'Experimenta 7 dias sem te insultares ao espelho. Nota o que muda. — Vivianne',
  },
  {
    hook: 'O corpo da mulher na capa da revista não existe. Nem ela o tem.',
    corpo: 'Filtros, edição, iluminação profissional, maquilhagem de 3 horas, e mesmo assim retocam. Estás a comparar-te com uma imagem que a própria modelo não reconhece. Esse "padrão" é ficção. O teu corpo é real. Real ganha.',
    cta: 'Compara-te com quem eras ontem. Mais ninguém importa. — Vivianne',
  },
];

// ANSIEDADE E STRESS — o impacto no corpo e na alimentação
const CONTEUDO_ANSIEDADE = [
  {
    hook: 'A ansiedade não mora na cabeça. Mora no estômago.',
    corpo: 'O intestino tem mais neurónios que a espinal medula. 90% da serotonina é produzida no intestino, não no cérebro. Quando comes por ansiedade, não estás a ser fraca — o teu corpo está literalmente a tentar regular-se. O problema não é tu. É o sistema nervoso em sobrecarga.',
    cta: 'Antes de mudar a dieta, regula o sistema nervoso. Tudo o resto segue. — Vivianne',
  },
  {
    hook: 'Não estás a comer demais. Estás a sentir demais sem ferramentas para processar.',
    corpo: 'A comida é a tua ferramenta de regulação. Provavelmente a única que te ensinaram. Ninguém te disse: "quando sentires medo, respira em 4-7-8". Disseram-te: "come um bolinho e acalma-te". Agora tens mais ferramentas.',
    cta: 'No VITALIS, o Espaço de Retorno existe exactamente para estes momentos. — Vivianne',
  },
  {
    hook: 'O cortisol engorda. Mas a culpa por engordar produz mais cortisol.',
    corpo: 'Stress crónico → cortisol alto → acumula gordura abdominal → vês o corpo a mudar → stress por ver o corpo a mudar → mais cortisol. É um ciclo bioquímico, não moral. A saída não é mais dieta. É menos stress.',
    cta: 'Às vezes, dormir melhor emagrece mais do que cortar calorias. — Vivianne',
  },
  {
    hook: 'Tens ansiedade por comida. Ou tens ansiedade que se manifesta na comida?',
    corpo: 'A comida é o sintoma, não a causa. A causa pode ser um trabalho que te drena, uma relação que te sufoca, um passado que não processaste, ou simplesmente nunca teres aprendido a regular emoções sem substâncias.',
    cta: 'Tratar o sintoma sem tocar na causa é como tomar paracetamol para uma infecção. — Vivianne',
  },
  {
    hook: 'A técnica 4-7-8 não é meditação hippie. É neurociência.',
    corpo: 'Inspirar 4 segundos, segurar 7, expirar 8 — activa o nervo vago, reduz cortisol, baixa a frequência cardíaca e corta o impulso de comer por stress. Em 60 segundos. Sem app, sem equipamento, sem desculpa.',
    cta: 'Da próxima vez que quiseres abrir o frigorífico por ansiedade, experimenta primeiro. — Vivianne',
  },
  {
    hook: 'A "falta de disciplina" é quase sempre o sistema nervoso em modo de sobrevivência.',
    corpo: 'Quando o corpo está em fight-or-flight permanente, a parte do cérebro que toma decisões racionais desliga-se. Literalmente. A amígdala assume o controlo. E a amígdala não quer salada — quer sobreviver. É por isso que a disciplina falha quando estás em burnout.',
    cta: 'Segurança primeiro. Nutrição depois. A ordem importa. — Vivianne',
  },
  {
    hook: 'Uma cliente descobriu que cada vez que o chefe gritava, ela comia pão no carro a caminho de casa.',
    corpo: 'O padrão era invisível até escrevermos juntas. Conflito no trabalho → tensão → carro → padaria → comer em silêncio → culpa → "amanhã como bem". Repetiu 200 vezes em 4 anos. Quando nomeou o gatilho, a padaria perdeu o poder.',
    cta: 'Mapear gatilhos é a ferramenta mais subestimada da nutrição. No VITALIS fazemos isto juntas. — Vivianne',
  },
  {
    hook: 'A insónia e a compulsão alimentar são primas. Dormem na mesma casa.',
    corpo: 'Quando dormes pouco, a grelina (hormona da fome) sobe 28%. A leptina (hormona da saciedade) desce. O córtex pré-frontal desliga. Resultado: queres comida calórica, não sentes saciedade, e não tens capacidade de decidir. Não é fraqueza. É privação de sono.',
    cta: 'Antes de mudar a dieta, conta-me: quantas horas dormes? A resposta pode mudar tudo. — Vivianne',
  },
  {
    hook: '4 perguntas para quando a ansiedade apertar e quiseres comer:',
    corpo: '1) Tenho fome real ou aconteceu algo? 2) O que sinto no corpo agora — aperto, calor, tremor? 3) Se a comida não existisse, o que faria? 4) Do que preciso realmente neste momento? Não é para evitar comer. É para escolher conscientemente.',
    cta: 'Cola estas 4 perguntas no frigorífico. A sério. Funciona. — Vivianne',
  },
  {
    hook: 'Não precisas de eliminar o stress. Precisas de processar o stress que já está no corpo.',
    corpo: 'O stress que não se processa acumula-se: tensão muscular, inflamação, cortisol elevado, fome constante. Não basta meditar 5 minutos. É preciso mover o corpo — sacudir, dançar, correr, chorar. A energia precisa de sair, não de ser controlada.',
    cta: 'O corpo sabe como libertar o stress. Só precisa de permissão. Dá-lha. — Vivianne',
  },
  {
    hook: 'O scroll infinito no telemóvel é ansiedade disfarçada. E muitas vezes acaba na cozinha.',
    corpo: 'Telemóvel → comparação → inadequação → ansiedade → cozinha. Reconheces? O cérebro entra em overload com estímulos digitais e pede algo físico para regular. A comida é o mais acessível. Mas não é a única saída.',
    cta: 'Experimenta: 20 minutos sem telemóvel antes de dormir. Nota o que muda na tua fome nocturna. — Vivianne',
  },
  {
    hook: 'Respira. Literalmente. 3 respirações profundas cortam 40% do impulso.',
    corpo: 'Não é filosofia. É fisiologia. A expiração longa activa o parassimpático e desacelera a amígdala. 3 respirações de 6 segundos (2 a inspirar, 4 a expirar) são suficientes para sair do modo de emergência e voltar ao modo de escolha.',
    cta: 'Faz agora: inspira 2 segundos, expira 4. Repete 3 vezes. Pronto. Estás diferente. — Vivianne',
  },
];

// AUTOESTIMA E VALOR PRÓPRIO — o que comes reflecte o que sentes sobre ti
const CONTEUDO_AUTOESTIMA = [
  {
    hook: 'Não comes demais porque não tens disciplina. Comes demais porque não acreditas que mereces cuidado.',
    corpo: 'Pensa nisto: quando cuidas de alguém que amas, preparas comida com atenção. Escolhes bons ingredientes. Não dás lixo. Mas quando é para ti, qualquer coisa serve. Porquê? Porque no fundo, não te sentes digna desse cuidado.',
    cta: 'Cozinhar para ti com atenção é um acto de reparação. Começa por aí. — Vivianne',
  },
  {
    hook: 'A forma como falas do teu corpo é a forma como falas de ti.',
    corpo: '"Sou gorda." "Sou horrível." "Que nojo." Dirias isto a alguém que amas? Então por que dizes a ti? Cada vez que te insultas no espelho, reforças a crença de que não mereces. E quem não merece, não cuida.',
    cta: 'Hoje experimenta: olha-te ao espelho e diz "Obrigada por carregares a minha vida." — Vivianne',
  },
  {
    hook: 'Não é o peso que te tira a paz. É a crença de que só és válida magra.',
    corpo: 'Se acreditas que o teu valor depende da balança, vais viver em montanha-russa emocional para sempre. -2kg e és feliz. +1kg e estás destruída. Esse não é um sistema de saúde. É uma prisão.',
    cta: 'O teu valor não tem quilos. Nunca teve. — Vivianne',
  },
  {
    hook: 'Investes em roupa, cabelo, unhas. Mas investes na forma como falas contigo?',
    corpo: 'A autoestima não é o que os outros vêem. É o que tu dizes quando ficas sozinha contigo. E se essa voz interior é cruel, controladora e insatisfeita, nenhuma mudança exterior vai ser suficiente.',
    cta: 'A transformação começa na voz que ouves por dentro. — Vivianne',
  },
  {
    hook: 'Sabotagem não é preguiça. É protecção.',
    corpo: 'Quando estás prestes a conseguir, algo dentro de ti trava. Não é falta de querer. É medo de conseguir. Porque se conseguires e continuares infeliz, perdes a desculpa. A sabotagem protege-te da desilusão de descobrir que o problema nunca foi o peso.',
    cta: 'O medo de conseguir é mais real do que o medo de falhar. Vamos falar sobre isto. — Vivianne',
  },
  {
    hook: 'Mereces nutrir-te. Não é prémio. Não é condicional. Mereces.',
    corpo: 'Não "quando emagrecer". Não "quando merecer". Não "quando for disciplinada". Agora. Hoje. Neste corpo. Neste peso. Nesta desordem. Nutrir-te não é um destino. É uma decisão diária.',
    cta: 'A saúde é um acto de amor, não de controlo. — Vivianne',
  },
  {
    hook: 'Se tratasses uma amiga como te tratas a ti, já não seriam amigas.',
    corpo: 'Reparaste que perdoas os erros dos outros mas castigas os teus? Que dás espaço aos outros mas exiges perfeição de ti? Que acolhes a vulnerabilidade alheia mas rejeitas a tua? Esta é a raiz de tudo.',
    cta: 'Trata-te como tratarias alguém que amas. É simples. Mas não é fácil. — Vivianne',
  },
  {
    hook: 'Uma cliente recusou ir à praia 5 verões seguidos. Não por causa do corpo. Por causa do que pensava do corpo.',
    corpo: 'O corpo dela estava bem. Funcional, saudável, capaz. Mas a narrativa dizia "não estás pronta". Pronta para quê? Para quem? Quem decidiu que há um corpo de praia e um corpo de esconder? A praia não tem bilheteira de quilos.',
    cta: 'O que deixaste de viver por causa do que pensas sobre o teu corpo? Conta-me. — Vivianne',
  },
  {
    hook: 'Dizes "não tenho tempo para mim" mas o que queres dizer é "não mereço tempo para mim".',
    corpo: 'Tempo para os filhos, encontras. Para o trabalho, encontras. Para ajudar alguém, encontras. Para ti? "Não dá." Porque no fundo, o teu cuidado não é prioridade. E enquanto não for, nenhum plano alimentar sobrevive à primeira semana.',
    cta: 'Marca 15 minutos no teu dia. Só para ti. Amanhã. Sem negociar. — Vivianne',
  },
  {
    hook: 'O elogio que recusas diz mais sobre ti do que quem o fez.',
    corpo: '"Estás bonita." "Não, estou horrível." "Que bem que te fica." "Isto? Estava em saldos." Deflectir elogios é recusar amor. É dizer ao mundo: não mereço ser vista. Cada elogio recusado reforça a crença de que não és suficiente.',
    cta: 'Próximo elogio que receberes: diz apenas "obrigada". Sem mas. Sem desculpas. — Vivianne',
  },
  {
    hook: 'Pedes desculpa por existir. Já reparaste?',
    corpo: '"Desculpa incomodar." "Desculpa perguntar." "Desculpa, mas..." Pedes desculpa por ter fome, por ter opinião, por ocupar espaço. A comida torna-se a única área onde não precisas de pedir licença. Comes em silêncio. Sem pedir desculpa a ninguém.',
    cta: 'A tua presença não é incómodo. A tua fome não é exagero. Estás a ocupar o teu lugar. — Vivianne',
  },
  {
    hook: 'A autoestima não se constrói com afirmações no espelho. Constrói-se com decisões.',
    corpo: 'Repetir "eu mereço" 50 vezes não muda nada se depois aceitas migalhas. A autoestima real é: escolher-te quando é difícil, sair quando te tratam mal, descansar quando precisas, comer com cuidado porque o teu corpo importa. Acções. Não palavras.',
    cta: 'Hoje toma uma decisão pequena a teu favor. É aí que começa. — Vivianne',
  },
];

// CICLO DE COMEÇA-PÁRA — para quem já "desistiu 100 vezes"
const CONTEUDO_CICLO_RECOMECOS = [
  {
    hook: 'Já começaste 100 vezes. E achas que isso te torna fraca. Eu acho que te torna persistente.',
    corpo: 'Cada recomeço não é um fracasso. É evidência de que não desististe. Quem realmente desiste, pára de tentar. Tu voltaste. Outra vez. E isso não é fraqueza — é a coisa mais corajosa que podes fazer.',
    cta: 'Desta vez não é diferente porque o plano é melhor. É diferente porque vais entender por que paravas. — Vivianne',
  },
  {
    hook: 'Não falhaste 100 dietas. Sobreviveste a 100 planos que não te viam por inteiro.',
    corpo: 'Cada dieta que "falhaste" ignorou algo: a tua emoção, o teu contexto, o teu passado com comida, os teus gatilhos, a tua auto-estima. Não falhaste. O plano é que falhou contigo.',
    cta: 'Um plano que não inclui quem tu és, nunca vai funcionar para quem tu és. — Vivianne',
  },
  {
    hook: 'O padrão não é: começar e desistir. O padrão é: começar, sentir, fugir do que sentiste.',
    corpo: 'Na semana 2-3, algo acontece. Não é que o plano fique difícil. É que as emoções que estavas a tapar com comida começam a emergir. E como não tens ferramentas para lidar com elas, voltas ao conforto que conheces.',
    cta: 'A verdadeira transformação começa quando o desconforto aparece e decides ficar. — Vivianne',
  },
  {
    hook: '"Amanhã começo." Amanhã nunca vem. Porque amanhã também terás emoções.',
    corpo: 'Adiar é uma estratégia emocional, não logística. Não esperas pela segunda-feira porque é mais conveniente. Esperas porque hoje dói. Mas segunda-feira também vai doer. A questão não é quando começar. É decidir que vais sentir o desconforto e não fugir.',
    cta: 'Não esperes pela motivação. Age apesar da falta dela. — Vivianne',
  },
  {
    hook: 'Desistir na semana 2 não é falta de vontade. É um padrão — e padrões mudam-se.',
    corpo: 'O teu cérebro tem uma janela de desistência. Normalmente entre o dia 10 e o dia 21. É quando a novidade acaba e o trabalho real começa. Se souberes que essa janela existe, podes preparar-te para ela em vez de ser apanhada de surpresa.',
    cta: 'No VITALIS, o Detector de Desistência avisa-te quando estás nesse ponto. Para desta vez ser diferente. — Vivianne',
  },
  {
    hook: 'Não precisas de começar do zero. Precisas de continuar de onde paraste.',
    corpo: 'Cada vez que "recomeças", trazes contigo tudo o que aprendeste. Não partes do zero. Partes do 47. Ou do 73. Ou do 89. As lições ficaram. O progresso acumulou-se. Mesmo que não pareça.',
    cta: 'Não recomeça. Continua. A diferença é enorme. — Vivianne',
  },
  {
    hook: 'Uma cliente contou-me que tinha 47 screenshots de dietas guardadas no telemóvel. Usou zero.',
    corpo: 'Guardar informação é confortável. Agir sobre ela é desconfortável. O acto de guardar dá a ilusão de progresso — "estou a preparar-me". Mas preparar-te eternamente é outra forma de adiar. A informação que tens já chega. O que falta é começar imperfeita.',
    cta: 'Apaga as screenshots. Começa com uma única refeição consciente. Hoje. — Vivianne',
  },
  {
    hook: 'O "tudo ou nada" é a armadilha perfeita. Come um chocolate e a semana "foi por água".',
    corpo: 'Uma refeição não estraga nada. Mas na tua cabeça, um deslize = fracasso total = desisto = como tudo = segunda-feira recomeço. Este pensamento binário é mais destrutivo do que qualquer chocolate. Porque não é o chocolate que te faz parar. É a crença de que imperfeito não conta.',
    cta: 'Imperfeito conta. 70% é melhor que 0%. Sempre. — Vivianne',
  },
  {
    hook: 'Sabes qual é a diferença entre quem consegue e quem não consegue? Não é o plano.',
    corpo: 'É a capacidade de continuar depois de falhar. Quem transforma o corpo não é quem nunca saiu do plano. É quem saiu, voltou, saiu, voltou — e não desistiu. A consistência imperfeita bate a perfeição intermitente todas as vezes.',
    cta: 'Não sejas perfeita. Sê consistente. Mesmo que signifique 3 dias bons por semana. — Vivianne',
  },
  {
    hook: 'Já pensaste que talvez não estejas a falhar — mas a aprender como NÃO fazer?',
    corpo: 'Edison fez 10.000 tentativas antes da lâmpada. Ninguém lhe chamou fraco. Mas tu, com 10 tentativas de mudar hábitos de uma vida inteira, achas que és um caso perdido? Cada tentativa anterior ensinou-te algo. Mesmo que tenha sido "isto não funciona para mim".',
    cta: 'A sabedoria que trazes de cada tentativa é o teu verdadeiro superpoder. — Vivianne',
  },
  {
    hook: 'A pergunta não é "como começo?" É "o que me fez parar das últimas vezes?"',
    corpo: 'Começas com energia, motivação e um plano novinho. Na semana 3, algo acontece — stress, ciclo menstrual, uma festa, uma discussão. E pronto. Mas o gatilho é sempre o mesmo. Se identificares o teu, podes preparar-te em vez de ser surpreendida.',
    cta: 'Diz-me o que te fez parar e eu digo-te o que fazer diferente. É isso que fazemos no VITALIS. — Vivianne',
  },
  {
    hook: 'Não tens de mudar tudo ao mesmo tempo. Muda uma coisa. Uma.',
    corpo: 'Dieta nova + ginásio + meditação + jejum + suplementos + 2L de água + 8h de sono. Tudo ao mesmo tempo. Em que universo isto é sustentável? Escolhe UMA coisa. Faz durante 14 dias. Quando for automático, acrescenta outra. Micro-mudanças. Macro-resultados.',
    cta: 'Qual é a tua UMA coisa desta semana? Decide agora. — Vivianne',
  },
];

// Juntar tudo num pool único rotativo
// ============================================================
// CONTEUDO POR ECO — Inspirado nos áudios de cada módulo
// Cada eco tem a sua dimensão: não é wellness genérico, é específico
// ============================================================

// ÁUREA — Valor próprio, merecimento, culpa herdada
// Inspirado: "O Teu Valor Não Se Ganha", "A Culpa Que Não Te Pertence", "Abundância e Merecimento"
const CONTEUDO_AUREA = [
  {
    hook: 'O teu valor não se ganha. Não se conquista. Não depende do que produzes.',
    corpo: 'Nasceste com ele. Antes de teres nome, profissão ou relações. O teu valor existia. Mas cresceste a acreditar que tinhas de o merecer — ser boa filha, boa mãe, boa profissional. Essa mentira cansa. E consome energia que devias usar para viver.',
    cta: 'O ÁUREA existe para reconstruir essa relação. Com o teu valor. De verdade. — Vivianne',
  },
  {
    hook: 'A culpa que sentes quando cuidas de ti não é tua. É herdada.',
    corpo: 'Alguém te ensinou que cuidar de ti era egoísmo. Que priorizar-te era traição. Que gastar contigo era desperdício. Essa pessoa tinha as suas próprias feridas. Mas as feridas dela não são verdade sobre ti.',
    cta: 'Cuidar de ti não é traição. É a coisa mais sagrada que podes fazer. — Vivianne',
  },
  {
    hook: 'Gastas em tudo menos em ti. E depois perguntas-te por que estás vazia.',
    corpo: 'Investes nos filhos, no trabalho, na casa, nos outros. Quando sobra algo (se sobrar), talvez compres algo para ti — com culpa. Mas investir em ti não é sobra. É fundação. Sem fundação, tudo o que construíste para os outros desmorona.',
    cta: 'A tua prosperidade não tira nada a ninguém. — Vivianne',
  },
  {
    hook: 'Dizes "eu mereço" mas não acreditas. Há uma diferença enorme.',
    corpo: 'Repetes afirmações. Colas post-its no espelho. Mas lá no fundo, sentes que é mentira. Porque o merecimento não se cola — constrói-se. Com decisões pequenas: escolher-te quando é difícil, parar quando o corpo pede, gastar contigo sem pedir desculpa.',
    cta: 'No ÁUREA, não repetimos mantras. Praticamos o merecimento. — Vivianne',
  },
  {
    hook: 'Se a tua filha se tratasse como tu te tratas, o que lhe dirias?',
    corpo: 'Dirias: "Tu mereces mais." "Não aceites isso." "Cuida de ti." Mas para ti, aplicam-se regras diferentes. Porquê? Porque interiorizaste que o teu valor depende do quanto dás — não do quanto és.',
    cta: 'Trata-te como tratarias quem mais amas. Mereces o mesmo. — Vivianne',
  },
  {
    hook: 'O dinheiro que gastas em ti não é despesa. É investimento na tua fundação.',
    corpo: 'Gastas na escola dos filhos sem pensar. No carro, no aluguer, nas contas. Mas gastar 2.500 MZN em ti provoca culpa. Porque aprendeste que gastar em ti é luxo. Não é. É o investimento que sustenta todo o resto.',
    cta: 'Se a fundação ceder, tudo o que construíste em cima cai. Cuida da fundação. — Vivianne',
  },
  {
    hook: '3 formas pelas quais te desvalorizas sem perceber:',
    corpo: '1) Aceitas menos do que mereces — no trabalho, nas relações, na comida que te dás. 2) Pedes desculpa por ter necessidades. 3) Priorizas sempre os outros e dizes que "não faz mal". Faz. E o teu corpo sabe.',
    cta: 'Reconhecer o padrão é o primeiro passo para quebrá-lo. O ÁUREA mostra-te como. — Vivianne',
  },
  {
    hook: 'A abundância não é ter muito. É acreditar que mereces o que tens.',
    corpo: 'Podes ter dinheiro e sentir-te pobre. Podes ter saúde e sentir-te doente. Podes ter amor e sentir-te sozinha. A abundância não é externa — é a crença interna de que o que chega até ti é merecido. Sem essa crença, nada é suficiente.',
    cta: 'O que já tens e não celebras? Começa por aí. — Vivianne',
  },
  {
    hook: 'Uma cliente chorou quando lhe perguntei: "Quando foi a última vez que fizeste algo só por prazer?"',
    corpo: 'Não se lembrava. Tudo tinha de ter propósito — para os filhos, para o trabalho, para a casa. O prazer era "perda de tempo". Mas o prazer é nutrição. Sem ele, o corpo procura substitutos: comida, compras, scroll infinito.',
    cta: 'Prazer sem culpa é um acto revolucionário. O ÁUREA começa aí. — Vivianne',
  },
  {
    hook: 'Vestir-te bem não é vaidade. É a forma como dizes ao mundo que existes.',
    corpo: 'Quando te vestes por obrigação — preto, largo, discreto — estás a esconder-te. Quando te vestes com intenção — cores que gostas, tecidos que sentes, formas que celebram — estás a ocupar espaço. E ocupar espaço é merecimento em acção.',
    cta: 'O espelho do ÁUREA não julga. Convida-te a ver-te de novo. — Vivianne',
  },
  {
    hook: 'Herdaste a relação da tua mãe com o dinheiro. Já decidiste se queres ficar com ela?',
    corpo: 'Se a tua mãe poupava por medo, talvez acredites que gastar é perigo. Se nunca havia suficiente, talvez acredites que nunca vai haver. Essas crenças não são tuas — são herdadas. E o primeiro passo é devolvê-las.',
    cta: 'O ÁUREA tem um exercício de "crenças herdadas" que muda tudo. Experimenta na versão trial. — Vivianne',
  },
  {
    hook: 'Responde: qual é o valor máximo que gastarias em ti mesma, sem culpa?',
    corpo: 'Se a resposta te assusta, repara no que isso diz. Não sobre dinheiro — sobre quanto achas que vales. Uma pessoa que se valoriza não tem um tecto para o cuidado próprio. Tem discernimento, sim. Mas não tem culpa.',
    cta: 'O teu valor não tem tecto. Vamos reconstruir isso juntas. — Vivianne',
  },
];

// SERENA — Regulação emocional, respiração, ciclos emocionais
// Inspirado: "Respiração 4-7-8", "Coerência Cardíaca", técnicas de respiração
const CONTEUDO_SERENA = [
  {
    hook: 'Não precisas de controlar as emoções. Precisas de aprender a surfá-las.',
    corpo: 'Controlo é repressão disfarçada. E repressão explode — em comida, em raiva, em shutdown. Surfar é diferente: reconhecer a onda, respirar, deixar que passe. A emoção dura 90 segundos no corpo. O sofrimento vem de resistir a ela.',
    cta: 'O SERENA ensina-te a estar com o que sentes sem ser destruída por isso. — Vivianne',
  },
  {
    hook: '90% da serotonina é produzida no intestino. Não na cabeça.',
    corpo: 'A tua saúde emocional começa no corpo. No que comes, como respiras, como dormes. A ligação intestino-cérebro não é metáfora — é anatomia. Quando cuidas do corpo, cuidas da emoção. Quando ignoras o corpo, a emoção desregula.',
    cta: 'Corpo e emoção são um sistema. Não podes tratar só metade. — Vivianne',
  },
  {
    hook: 'Respirar em 4-7-8 durante 60 segundos baixa o cortisol mais do que 30 minutos a tentar "acalmar-te".',
    corpo: 'O nervo vago conecta o diafragma ao cérebro. Quando expiras mais lentamente do que inspiras, activas a resposta de relaxamento. Não é meditação. É fisiologia. E funciona em menos de 2 minutos.',
    cta: 'Experimenta agora: inspira 4, segura 7, expira 8. Repete 3 vezes. — Vivianne',
  },
  {
    hook: 'O choro não é fraqueza. É o sistema nervoso a libertar pressão.',
    corpo: 'As lágrimas de stress contêm cortisol — literalmente eliminas hormonas de stress quando choras. Quem te disse "não chores" estava a pedir-te para guardar veneno no corpo. Chorar limpa. A comida não.',
    cta: 'A próxima vez que sentires vontade, não vás ao frigorífico. Chora. Depois bebe água. — Vivianne',
  },
  {
    hook: 'Tens emoções. Não és as tuas emoções.',
    corpo: 'Há uma diferença entre "estou triste" e "sou triste". A primeira é um estado — passa. A segunda é uma identidade — prende. Quando aprendes a observar o que sentes em vez de te fundires com isso, tudo muda.',
    cta: 'O SERENA começa aqui: observar sem reagir. Sentir sem fugir. — Vivianne',
  },
  {
    hook: 'Uma cliente disse: "Não sei o que sinto. Só sei que como." O SERENA começa aí.',
    corpo: 'A iliteracia emocional é mais comum do que imaginas. Cresceste sem vocabulário para emoções — estava tudo bem ou estava mal. Sem nuances. "Triste" pode ser 15 coisas diferentes: solidão, luto, desilusão, saudade, exaustão. Quando aprendes a nomear, paras de comer para calar.',
    cta: 'No SERENA tens uma roda com 16 emoções. Nomear é o primeiro passo para libertar. — Vivianne',
  },
  {
    hook: 'A raiva que engoles transforma-se em inflamação. Literalmente.',
    corpo: 'Emoções reprimidas activam a resposta inflamatória do corpo. Raiva crónica não expressa → cortisol → inflamação sistémica → retenção, inchaço, dor. Não é metáfora. É bioquímica. O corpo grita o que a boca cala.',
    cta: 'Expressar raiva não é gritar. É reconhecer, respirar e canalizar. O SERENA ensina. — Vivianne',
  },
  {
    hook: '5 emoções que confundes com fome:',
    corpo: '1) Tédio — o "nada" que pede estímulo. 2) Solidão — a falta que sentes de presença. 3) Ansiedade — o aperto que parece estômago vazio. 4) Raiva — a energia que não sabes onde pôr. 5) Cansaço — o corpo que confunde sono com fome.',
    cta: 'Na próxima vez, antes de ir à cozinha, pergunta: qual destas 5 estou a sentir? — Vivianne',
  },
  {
    hook: 'O teu ciclo menstrual muda as tuas emoções. E ninguém te avisou.',
    corpo: 'Fase folicular: energia, optimismo. Ovulação: confiança, sociabilidade. Fase lútea: irritabilidade, compulsão. Menstruação: introspecção, cansaço. Não és instável. És cíclica. E quando entendes o ciclo, paras de te culpar pelo que é biologia.',
    cta: 'O SERENA integra o ciclo menstrual no teu mapa emocional. Porque faz toda a diferença. — Vivianne',
  },
  {
    hook: 'Coerência cardíaca: 5 minutos por dia que mudam a tua bioquímica.',
    corpo: 'Respirar a 6 ciclos por minuto sincroniza o coração, o cérebro e o sistema nervoso. Reduz cortisol, melhora variabilidade cardíaca, e corta impulsos alimentares. Não é meditação mística. É treino fisiológico com resultados em 2 semanas.',
    cta: 'Experimenta: 5 segundos a inspirar, 5 a expirar. Durante 5 minutos. Todos os dias. — Vivianne',
  },
  {
    hook: 'Responde: qual é a emoção que mais evitas sentir?',
    corpo: 'Todos temos uma. A raiva, a tristeza, a vergonha, o medo, a solidão. Aquela que tapas mais rápido — com comida, com trabalho, com distracção. Essa emoção evitada é a chave. Porque enquanto a evitares, ela controla-te. Quando a enfrentares, liberta-te.',
    cta: 'Não tenhas medo dela. Ela tem o tamanho que lhe dás. — Vivianne',
  },
  {
    hook: 'Estás a sentir muito ou estás a sentir o que sempre evitaste?',
    corpo: 'Quando começas a cuidar de ti — nutrição, sono, menos álcool — as anestesias caem. E o que estavas a tapar emerge. Parece que estás pior. Na verdade, estás mais presente. É desconfortável. Mas é o caminho.',
    cta: 'O desconforto de sentir é temporário. O preço de evitar é permanente. — Vivianne',
  },
];

// IGNIS — Vontade, foco, cortar o que não serve, disciplina consciente
// Inspirado: "Acende a Chama", "O Corte Que Liberta", "Foco Máximo", "Coragem Diária"
const CONTEUDO_IGNIS = [
  {
    hook: 'Disciplina não é fazer tudo. É escolher o que importa e cortar o resto.',
    corpo: 'Estás exausta porque dizes sim a tudo. Ao trabalho, à família, às obrigações, aos outros. Nunca sobra um sim para ti. O IGNIS não te ensina a fazer mais. Ensina-te a cortar — com clareza, sem culpa.',
    cta: 'Cada "não" que dizes ao que não importa é um "sim" ao que importa. — Vivianne',
  },
  {
    hook: 'Não te falta motivação. Falta-te uma decisão que não se renegocia.',
    corpo: 'A motivação é uma emoção — vem e vai. A decisão é uma estrutura — fica. Quem espera pela motivação para agir, nunca age consistentemente. Quem decide e age apesar da falta de motivação, transforma-se.',
    cta: 'Não perguntes "estou motivada?" Pergunta "decidi ou não?" — Vivianne',
  },
  {
    hook: 'O que carregas que já não te pertence? É isso que te tira a energia.',
    corpo: 'Expectativas alheias. Relações que esgotam. Hábitos que já não servem. Papéis que nunca escolheste. Tudo isso pesa — e rouba energia que devias usar para construir o que importa. Cortar não é destruir. É libertar.',
    cta: 'O corte que liberta é o mais difícil. Mas é o que te dá espaço para viver. — Vivianne',
  },
  {
    hook: 'Foco não é concentração. É protecção. Estás a proteger a tua energia do que não merece.',
    corpo: 'Cada vez que abres o telemóvel sem motivo, estás a dar a tua atenção de graça. Cada vez que entras numa conversa que te drena, estás a pagar com energia vital. Foco é decidir onde a tua energia vai — e defender essa decisão.',
    cta: 'A tua atenção é o recurso mais caro que tens. Gasta-a com cuidado. — Vivianne',
  },
  {
    hook: 'A coragem não é ausência de medo. É fazer apesar dele.',
    corpo: 'Esperas não ter medo para agir. Mas o medo nunca vai embora — faz parte do sistema nervoso. A questão não é eliminá-lo. É deixar de obedecer-lhe. Cada pequena acção apesar do medo reprograma o cérebro.',
    cta: 'Coragem diária. Não grandes gestos — pequenas decisões repetidas. — Vivianne',
  },
  {
    hook: 'Uma cliente disse "sim" ao ginásio, à dieta e ao trabalho. Disse "não" a tudo o resto. Esgotou-se.',
    corpo: 'Disciplina sem discernimento é prisão. Ela fazia tudo "certo" mas estava destruída. Porque a disciplina verdadeira não é fazer mais — é fazer o que importa. E às vezes, o que importa é parar.',
    cta: 'No IGNIS, a primeira chama que acendes é a da escolha consciente. Não da força bruta. — Vivianne',
  },
  {
    hook: 'A procrastinação é a versão educada do medo.',
    corpo: 'Não adias porque és preguiçosa. Adias porque tens medo: de falhar, de ser julgada, de não ser suficiente. O cérebro prefere o desconforto de adiar ao desconforto de enfrentar. Mas o preço de adiar é maior — e paga-se em culpa.',
    cta: 'Identifica o medo por trás do adiamento. Quando o nomeares, perde metade do poder. — Vivianne',
  },
  {
    hook: '4 coisas que podes cortar esta semana sem perder nada:',
    corpo: '1) Uma obrigação social que não te acrescenta. 2) 30 minutos de scroll antes de dormir. 3) Uma conversa com alguém que só te drena. 4) Uma tarefa que fazes por hábito, não por necessidade. Cortar não é egoísmo. É higiene energética.',
    cta: 'Escolhe uma. Corta. Nota como te sentes. — Vivianne',
  },
  {
    hook: 'O teu "sim automático" está a matar a tua energia.',
    corpo: 'Alguém pede — dizes sim. Antes de pensar, já aceitaste. Porque "não" parece egoísta, rude, cruel. Mas cada sim automático é um não a ti mesma. E a energia que gastas em coisas que não escolheste é energia que falta para o que importa.',
    cta: 'Pratica o "deixa-me pensar" antes de responder. É o primeiro passo. — Vivianne',
  },
  {
    hook: 'Responde: qual é a decisão que andas a adiar há meses?',
    corpo: 'Sabes qual é. Está aí, no fundo, a ocupar espaço mental todos os dias. Cada dia que adias, gasta energia em não decidir. Uma decisão tomada — mesmo imperfeita — liberta mais energia do que semanas de indecisão.',
    cta: 'O IGNIS chama-lhe "O Corte Que Liberta". E funciona. — Vivianne',
  },
  {
    hook: 'Estás tão ocupada a sobreviver que esqueceste de decidir como queres viver.',
    corpo: 'O modo automático é confortável: levantar, trabalhar, comer, dormir, repetir. Não precisas de pensar. Mas também não vives. O IGNIS é sobre parar o automático e acender a intenção. Cada escolha consciente é uma chama.',
    cta: 'Viver por inércia é confortável. Viver com intenção é transformador. — Vivianne',
  },
  {
    hook: 'A distracção não é inofensiva. É o que te impede de sentir, decidir e agir.',
    corpo: 'Telemóvel, séries, comida, compras — são tudo versões da mesma fuga. Foge-se do vazio, do medo, da incerteza. Mas o que evitas não desaparece. Acumula-se. Até que não caiba mais e transborde — em ansiedade, em compulsão, em burnout.',
    cta: 'Experimenta 10 minutos de silêncio total. Sem estímulos. Nota o que aparece. — Vivianne',
  },
];

// VENTIS — Energia, ritmo, pausa, burnout, renovação
// Inspirado: "Ritmo Natural", "Pausa Que Renova", "Energia e Equilíbrio"
const CONTEUDO_VENTIS = [
  {
    hook: 'Não estás cansada. Estás em modo de sobrevivência há tanto tempo que esqueceste o que é viver.',
    corpo: 'O corpo foi desenhado para ciclos: esforço e descanso, acção e pausa. Mas tu cortas o descanso. Sempre. Porque acreditas que parar é perder. Resultado: burnout crónico disfarçado de "cansaço normal".',
    cta: 'O VENTIS é sobre recuperar o ritmo que perdeste. Não adicionar mais. — Vivianne',
  },
  {
    hook: 'Pausar não é preguiça. É inteligência.',
    corpo: 'O teu telemóvel precisa de carregar. O teu computador precisa de reiniciar. Mas tu? Tu achas que podes funcionar 18 horas por dia sem consequências. Não podes. E o teu corpo está a avisar-te — com cansaço, insónia, fome descontrolada, irritabilidade.',
    cta: 'A pausa não é prémio. É necessidade fisiológica. — Vivianne',
  },
  {
    hook: 'Se não páras quando podes, vais parar quando não podes. Chama-se doença.',
    corpo: 'O corpo não negocia. Envia sinais: dor, cansaço, insónia, inflamação. Se ignoras, escala: doença crónica, burnout, colapso. A pausa preventiva custa minutos. A pausa forçada custa meses.',
    cta: 'Pára 5 minutos agora. Respira. O mundo espera. — Vivianne',
  },
  {
    hook: 'A energia não se gere com café. Gere-se com ritmo.',
    corpo: 'O teu corpo tem ritmos ultradianos — ciclos de 90 minutos de alta energia seguidos de 20 minutos de recuperação. Se forças os 90 minutos sem a pausa, cada ciclo seguinte rende menos. Resultado: mais café, menos clareza, mais exaustão.',
    cta: 'Menos café. Mais pausas. A ciência é clara. — Vivianne',
  },
  {
    hook: 'Cuidas de tudo e de todos. Menos da tua energia. E depois não entendes por que desabas.',
    corpo: 'A energia é finita. Cada decisão gasta. Cada conflito gasta. Cada obrigação gasta. Se não recarregas conscientemente — com sono, com pausa, com natureza, com silêncio — chegas ao fim do dia a vazio. E é aí que comes por impulso.',
    cta: 'Gerir energia é a fundação de tudo. Corpo, emoção, foco — tudo depende disto. — Vivianne',
  },
  {
    hook: 'Uma cliente dormia 5 horas e compensava com 4 cafés. Chamava-lhe "rotina".',
    corpo: 'Quando lhe disse que o cansaço era a causa de 80% das suas compulsões alimentares, não acreditou. Duas semanas a dormir 7 horas: menos fome, menos irritabilidade, menos 2kg. Sem mudar a dieta. Só o sono.',
    cta: 'E se o segredo não fosse comer menos, mas dormir mais? — Vivianne',
  },
  {
    hook: '3 tipos de cansaço que confundes com preguiça:',
    corpo: '1) Cansaço físico — o corpo precisa de descanso real (não de séries no sofá). 2) Cansaço mental — decisões demais, estímulos demais, obrigações demais. 3) Cansaço emocional — relações que drenam, emoções não processadas. Cada um precisa de um tipo diferente de pausa.',
    cta: 'Qual é o teu cansaço dominante? Identificar muda a forma como descansas. — Vivianne',
  },
  {
    hook: 'O domingo não é para "pôr tudo em dia". É para parar.',
    corpo: 'Lavar, cozinhar, limpar, organizar, preparar a semana. O teu "dia de descanso" é o mais produtivo da semana. Resultado: começas segunda esgotada. O corpo entra em modo de sobrevivência e pede comida calórica. Não é gula. É exaustão.',
    cta: 'Experimenta um domingo com metade das tarefas. Nota como começas segunda. — Vivianne',
  },
  {
    hook: 'A natureza não tem pressa. E tu devias aprender com ela.',
    corpo: 'Uma árvore não cresce mais rápido porque gritas com ela. Um rio não corre mais porque lhe pedes. O teu corpo funciona com os mesmos ritmos da natureza. Quando forças velocidade antinatural, o corpo adoece. Quando respeitas o ritmo, floresce.',
    cta: '10 minutos ao ar livre, sem telemóvel. É a pausa mais poderosa que existe. — Vivianne',
  },
  {
    hook: 'Responde: a que horas a tua energia é máxima? Usas essa janela para ti ou para os outros?',
    corpo: 'Todos temos um pico de energia. Se o teu é de manhã e o gastas todo em emails e reuniões, chegas ao fim do dia sem nada para ti. E quando não tens energia para ti, não tens energia para escolhas conscientes — comes o que aparecer.',
    cta: 'Protege a tua melhor hora do dia. Usa-a para o que importa. — Vivianne',
  },
  {
    hook: 'Burnout não é trabalhar muito. É viver sem prazer.',
    corpo: 'Há quem trabalhe 12 horas e não entre em burnout. E há quem trabalhe 6 e desmorone. A diferença não é o volume — é a presença ou ausência de momentos de recarga genuína. Prazer, riso, conexão, natureza, silêncio. Sem isto, qualquer carga é demais.',
    cta: 'O VENTIS tem um detector de burnout. Porque às vezes estás em burnout e não sabes. — Vivianne',
  },
  {
    hook: 'O corpo avisa 3 vezes antes de colapsar. Estás a ouvir?',
    corpo: 'Primeiro aviso: cansaço constante, sono não reparador. Segundo aviso: dores de cabeça, tensão muscular, digestão difícil. Terceiro aviso: insónia, ansiedade, compulsões, inflamação. Se ignoras os 3, vem o colapso. Não é surpresa. É consequência.',
    cta: 'Em que aviso estás? Sê honesta. O VENTIS ajuda-te a responder. — Vivianne',
  },
];

// ECOA — Voz, silenciamento, expressão, assertividade
// Inspirado: "O Silêncio Que Guardas", "A Tua Voz É Válida", "Libertar a Palavra"
const CONTEUDO_ECOA = [
  {
    hook: 'O silêncio que te protegeu em criança está a sufocar-te em adulta.',
    corpo: 'Aprendeste a calar. A não incomodar. A engolir. Funcionou — evitou conflitos, castigos, abandono. Mas agora, esse silêncio não te protege. Prende-te. Cada palavra não dita fica presa no corpo. E o corpo cobra.',
    cta: 'No ECOA, não forçamos a voz. Primeiro, reconhecemos o silêncio. — Vivianne',
  },
  {
    hook: 'Comes o que não dizes. Literalmente.',
    corpo: 'Engoles a raiva — comes. Cales a frustração — comes. Abafas a verdade — comes. A comida substitui as palavras que ficaram presas na garganta. Enquanto não encontrares outra saída para o que sentes, a comida vai continuar a ser a tua voz.',
    cta: 'Antes de mudar o que comes, muda o que dizes. Ou pelo menos o que te permites sentir. — Vivianne',
  },
  {
    hook: 'A tua opinião não é "demais". A tua necessidade não é "exagero". A tua voz é válida.',
    corpo: 'Quantas vezes pediste desculpa por falar? Quantas vezes começaste com "isto pode ser parvo, mas..."? Quantas vezes disseste "não é nada" quando era tudo? A tua voz foi silenciada tantas vezes que agora és tu que te silencias.',
    cta: 'A voz é um músculo. Atrofia sem uso. Mas também se fortalece. — Vivianne',
  },
  {
    hook: 'Dizer "não" a alguém é dizer "sim" a ti. E isso não é egoísmo.',
    corpo: 'O teu "sim" automático é um "não" a ti mesma. Cada vez que aceitas por obrigação, engoles o que querias dizer. E essa energia reprimida vai para algum lado — raiva, cansaço, ou comida.',
    cta: 'Pratica: hoje diz um "não" pequeno. Sem explicar. Sem pedir desculpa. — Vivianne',
  },
  {
    hook: 'Se guardares mais uma coisa dentro de ti, o corpo vai cobrar.',
    corpo: 'O corpo fala quando a boca não fala. Tensão na mandíbula? Palavras presas. Nó na garganta? Verdades engolidas. Dor no estômago? Emoções não digeridas. O corpo não mente. E não espera.',
    cta: 'Escreve o que não consegues dizer. Uma carta que não envias. É um começo. — Vivianne',
  },
  {
    hook: 'Uma cliente escreveu uma carta à mãe que nunca enviou. Perdeu 4kg no mês seguinte.',
    corpo: 'Não por magia. Porque a raiva que guardava há 20 anos finalmente teve saída. Sem a raiva a ocupar espaço, o corpo largou o peso — literal e figurado. A comida que usava para abafar deixou de ser necessária.',
    cta: 'O ECOA tem exercícios de cartas não enviadas. Perdão. Raiva. Despedida. Verdade. Escolhe uma. — Vivianne',
  },
  {
    hook: '3 frases que parecem educadas mas são silenciamento:',
    corpo: '1) "Não vale a pena dizer nada." — Vale. 2) "Eu aguento." — Mas devias ter de aguentar? 3) "Deixa estar, não é nada." — É. E quanto mais dizes que não é, mais se acumula. Estas frases são o teu silêncio disfarçado de maturidade.',
    cta: 'Hoje substitui "não é nada" por "é isto que sinto". Uma vez basta. — Vivianne',
  },
  {
    hook: 'Responde: quem te silenciou pela primeira vez?',
    corpo: 'Um pai que gritava. Uma mãe que dizia "cala-te". Um professor que humilhava. Um parceiro que minimizava. Alguém, em algum momento, te ensinou que a tua voz era perigosa. E tu aprendeste. Mas podes desaprender.',
    cta: 'Não é para culpar. É para entender. E depois, escolher diferente. — Vivianne',
  },
  {
    hook: 'O nó na garganta não é ansiedade. É a tua verdade a pedir passagem.',
    corpo: 'Sentes aquele aperto antes de falar? Aquela sensação de que as palavras ficam presas? Não é doença. É o corpo a preparar-se para dizer algo que a mente acha perigoso. A garganta é o portão entre o que sentes e o que expressas.',
    cta: 'A próxima vez que sentires o nó, respira e deixa sair. Mesmo que trema. — Vivianne',
  },
  {
    hook: 'A assertividade não é ser dura. É ser honesta sem te destruir nem destruir o outro.',
    corpo: 'Passiva: engoles e acumulas. Agressiva: explodes e magoas. Assertiva: dizes o que sentes, com respeito, sem culpa. A maioria das pessoas oscila entre passiva e agressiva porque nunca aprendeu a terceira via.',
    cta: 'O ECOA tem 4 modelos de comunicação assertiva. Pratica-se como qualquer músculo. — Vivianne',
  },
  {
    hook: 'Se a tua voz incomoda alguém, talvez esteja a dizer a verdade.',
    corpo: 'As pessoas que beneficiam do teu silêncio vão resistir à tua voz. Vão dizer que mudaste, que estás diferente, que és "difícil". Não mudaste para pior. Estás a deixar de ser conveniente. E isso assusta quem te quer submissa.',
    cta: 'A tua voz não é para confortar os outros. É para honrar quem és. — Vivianne',
  },
  {
    hook: 'Quanto mais calas, mais comes. A boca encontra outra função.',
    corpo: 'Quando a boca não serve para falar — para dizer "não", "basta", "eu quero" — ela encontra outra ocupação. Mastigar. Engolir. Encher. A compulsão alimentar e o silenciamento são dois lados da mesma moeda. Libertar a voz liberta a fome.',
    cta: 'Começa com o Micro-Voz: 8 semanas progressivas para recuperar a tua voz. No ECOA. — Vivianne',
  },
];

// IMAGO — Identidade, essência, rótulos, quem sou além dos papéis
// Inspirado: "Quem Sou Sem Rótulos", "Eu Essencial", "Corpo e Identidade"
const CONTEUDO_IMAGO = [
  {
    hook: 'Quem és tu sem os rótulos? Mãe. Esposa. Profissional. Tira tudo. O que fica?',
    corpo: 'Se te pedirem para te descreveres, começas pelos papéis: mãe de X, trabalha em Y, casada com Z. Mas quem és quando ninguém precisa de ti? Quando não há função a cumprir? Esse vazio não é nada. É a tua essência. E ela existe antes e além de qualquer papel.',
    cta: 'O IMAGO é para quem quer encontrar-se debaixo de tudo o que carrega. — Vivianne',
  },
  {
    hook: 'A identidade que construíste para sobreviver está a impedir-te de viver.',
    corpo: 'A "forte". A "que resolve tudo". A "que não precisa de ninguém". Criaste estas versões para te proteger. Mas agora são armaduras que pesam. E por debaixo delas, há alguém que está cansada de fingir que não precisa de cuidado.',
    cta: 'Soltar versões antigas não é traição. É evolução. — Vivianne',
  },
  {
    hook: 'Mudas o corpo mas não actualizas a identidade. E depois sabotaste.',
    corpo: 'Perdeste 10kg mas continuas a agir como se pesasses o mesmo. Compras as mesmas roupas. Evitas as mesmas situações. Dizes as mesmas coisas sobre ti. Porque o corpo mudou mas a história que contas sobre ti ficou no passado.',
    cta: 'Não basta mudar o corpo. Tens de reescrever quem acreditas ser. — Vivianne',
  },
  {
    hook: 'Os teus valores definem o que comes, como gastas e com quem ficas. Sabes quais são?',
    corpo: 'A maioria das pessoas nunca parou para pensar no que realmente valoriza. Funciona no automático — valores herdados dos pais, da cultura, da sociedade. Mas quando descobres os TEUS valores, cada decisão fica mais clara. Incluindo o que pões no prato.',
    cta: 'No IMAGO, defines os teus 5 valores essenciais. Tudo o resto alinha-se a partir daí. — Vivianne',
  },
  {
    hook: 'Não és um projecto a melhorar. És uma pessoa a integrar.',
    corpo: 'A indústria do self-improvement vende-te a ideia de que tens falhas a corrigir. Tens defeitos a eliminar. Tens versões melhores a alcançar. Mas e se não tiveres de te melhorar? E se precisares apenas de integrar o que já és — as partes bonitas e as difíceis?',
    cta: 'Integração, não perfeição. Esse é o caminho. — Vivianne',
  },
  {
    hook: 'Uma cliente descobriu que vivia a vida da mãe. Aos 38 anos.',
    corpo: 'Mesma profissão. Mesmo tipo de parceiro. Mesma relação com comida. Mesma forma de se esconder. Tudo herdado, nada escolhido. Quando percebeu, chorou. Depois perguntou: "E agora, quem sou eu?" Essa pergunta é o início do IMAGO.',
    cta: 'A identidade que tens foi escolhida ou herdada? Descobre. — Vivianne',
  },
  {
    hook: '3 versões de ti que já não existem (mas ainda te governam):',
    corpo: '1) A criança que aprendeu que ser boa = ser amada. 2) A adolescente que acreditou que o corpo define o valor. 3) A jovem adulta que decidiu que pedir ajuda é fraqueza. Essas versões criaram regras. Regras que ainda obedeces.',
    cta: 'No IMAGO, fazemos arqueologia da identidade. Camada a camada, até chegar a ti. — Vivianne',
  },
  {
    hook: 'Responde: quem serias se ninguém te estivesse a ver?',
    corpo: 'Sem julgamento, sem expectativas, sem audiência. Que roupa vestirias? Que comida escolherias? Que decisão tomarias? Se a resposta é diferente do que fazes agora, a distância entre as duas é a distância entre quem és e quem mostras.',
    cta: 'A coragem de ser quem és quando alguém está a ver — isso é identidade integrada. — Vivianne',
  },
  {
    hook: 'O teu corpo conta a tua história. Cada quilo, cada cicatriz, cada tensão.',
    corpo: 'O peso que ganhaste no luto. A tensão nos ombros do trabalho. A barriga que cresceu com o stress. O corpo não engorda por acaso. Guarda o que a mente recusa processar. Quando integras a história, o corpo liberta-a.',
    cta: 'No IMAGO, o corpo é mapa. Não é problema. — Vivianne',
  },
  {
    hook: 'A máscara que usas para o mundo pesa mais do que qualquer excesso de peso.',
    corpo: 'A "simpática". A "disponível". A "forte". A "que está sempre bem". Cada máscara é energia gasta em performance. E quando chegas a casa e tiras tudo, o vazio que sentes não é depressão. É exaustão de ser quem não és.',
    cta: 'O IMAGO tem o Espelho Triplo: quem mostras, quem és, quem queres ser. A diferença entre os 3 é reveladora. — Vivianne',
  },
  {
    hook: 'Conheces os teus gatilhos alimentares. Mas conheces os teus valores?',
    corpo: 'Sabes o que te faz comer mal. Mas sabes o que te faz viver bem? Se "saúde" é um valor, as tuas decisões alimentares mudam. Se "liberdade" é um valor, dietas restritivas nunca vão funcionar. Os valores são o GPS. Sem eles, andas em círculos.',
    cta: 'Define 5 valores. Alinha as tuas decisões. Tudo muda. — Vivianne',
  },
  {
    hook: 'Não precisas de te encontrar. Precisas de parar de te esconder.',
    corpo: 'Sabes quem és. Lá no fundo, sabes. Mas mostrar é arriscado. Porque se mostrares quem realmente és e alguém rejeitar, dói mais do que rejeitar a máscara. Então escondes-te. E vives a versão segura. E seguro e vivo não são a mesma coisa.',
    cta: 'A vulnerabilidade é o preço da autenticidade. E vale cada risco. — Vivianne',
  },
];

// LUMINA — Diagnóstico gratuito, autoconhecimento, despertar
// O LUMINA é a porta de entrada: gratuito, rápido, revelador
const CONTEUDO_LUMINA = [
  {
    hook: '7 perguntas. 23 padrões. 2 minutos. O diagnóstico que ninguém te fez.',
    corpo: 'Não mede peso. Não conta calorias. Mede como estás — de verdade. Energia, tensão no corpo, imagem no espelho, clareza mental, conexão emocional. Em 2 minutos tens um mapa de 8 dimensões da tua vida. Gratuito. Sem registo.',
    cta: 'Experimenta agora: app.seteecos.com/lumina — Vivianne',
  },
  {
    hook: 'A última vez que alguém te perguntou "como estás?" e tu respondeste a verdade foi quando?',
    corpo: '"Estou bem." "Tudo normal." "Na correria." Respostas automáticas que escondem o que realmente sentes. O LUMINA não aceita "estou bem". Faz-te as perguntas que ninguém faz. E dá-te respostas que ninguém te deu.',
    cta: 'São 7 perguntas honestas. Consegues responder sem mentir a ti mesma? — Vivianne',
  },
  {
    hook: 'Uma pessoa fez o LUMINA "por curiosidade". Chorou quando leu o resultado.',
    corpo: 'Não porque o resultado era mau. Porque pela primeira vez alguém nomeou o que ela sentia. "Tensão acumulada com protecção activa." Nunca ninguém tinha dito aquilo. Mas ela reconheceu-se em cada palavra. Às vezes, ser vista é o que faltava.',
    cta: 'O LUMINA não julga. Espelha. E às vezes o espelho é mais poderoso que qualquer conselho. — Vivianne',
  },
  {
    hook: 'Não precisas de pagar nada para começar a conhecer-te. O LUMINA é gratuito.',
    corpo: 'Sem cartão. Sem compromisso. Sem truques. 7 perguntas sobre como te sentes no corpo, nas emoções, na energia, na mente. O resultado é teu — com padrões identificados, dimensões mapeadas, e caminhos sugeridos.',
    cta: 'Se estás a ler isto e ainda não fizeste, a pergunta é: porquê? — Vivianne',
  },
  {
    hook: '8 dimensões da tua vida. Qual está em alerta?',
    corpo: 'Corpo. Passado. Impulso. Futuro. Mente. Energia. Espelho. Cuidado. O LUMINA mapeia as 8 e mostra onde estás a ignorar sinais. Porque o corpo avisa. As emoções avisam. Mas se ninguém te ensinou a ouvir, passam despercebidos.',
    cta: 'O LUMINA ensina-te a ouvir. Em 2 minutos. Grátis. — Vivianne',
  },
  {
    hook: 'Responde honestamente: de 0 a 10, como te sentes AGORA no teu corpo?',
    corpo: 'Se respondeste abaixo de 7, a pergunta seguinte é: o que estás a fazer sobre isso? Se a resposta é "nada", não é porque não te importas. É porque não sabes por onde começar. O LUMINA é esse início. Um mapa. Um ponto de partida.',
    cta: 'Começa por saber onde estás. O caminho fica claro depois. — Vivianne',
  },
  {
    hook: '23 leituras possíveis. Cada uma é um espelho diferente.',
    corpo: '4 categorias de severidade: protecção, alerta, máximo, crítico. Cada leitura tem 3 mensagens personalizadas e uma recomendação de eco. Não é genérico. É feito para ti — baseado nas tuas respostas, não em médias estatísticas.',
    cta: 'Qual é a tua leitura? Descobre: app.seteecos.com/lumina — Vivianne',
  },
  {
    hook: 'O LUMINA é grátis. O preço de não te conhecer é que é caro.',
    corpo: 'Decisões erradas na alimentação. Relações que drenam. Trabalho que esgota. Emoções que transbordam. Tudo isto tem um custo — em saúde, em energia, em anos. Conhecer-te é o investimento mais barato e mais rentável que podes fazer.',
    cta: 'Investe 2 minutos. O retorno dura a vida inteira. — Vivianne',
  },
  {
    hook: '3 coisas que o LUMINA revela que tu não vias:',
    corpo: '1) Padrões repetitivos — o que fazes automaticamente sem perceber. 2) Dimensões em alerta — áreas da vida que estás a negligenciar. 3) A ligação entre corpo e emoção — como o que sentes afecta o que comes, a energia que tens e as decisões que tomas.',
    cta: 'Ninguém muda o que não vê. O LUMINA mostra. — Vivianne',
  },
  {
    hook: 'Já fizeste o LUMINA? Então faz outra vez. Tu não és a mesma pessoa.',
    corpo: 'O LUMINA não é um teste que se faz uma vez. É um check-in. Porque a tua energia muda. As tuas emoções mudam. O teu corpo muda. Fazer o LUMINA de 3 em 3 meses mostra-te a evolução — ou mostra-te o que ainda precisa de atenção.',
    cta: 'Repetir o LUMINA é um acto de coragem. Porque às vezes a verdade incomoda. Mas cura. — Vivianne',
  },
  {
    hook: 'O diagnóstico mais honesto que vais fazer não é no hospital. É no LUMINA.',
    corpo: 'O médico mede o teu colesterol. O LUMINA mede como te sentes a viver. Porque podes ter análises perfeitas e estar destruída por dentro. Saúde não é só ausência de doença. É presença de bem-estar. E isso ninguém mede — excepto tu.',
    cta: 'Mede-te. De verdade. Gratuitamente. app.seteecos.com/lumina — Vivianne',
  },
  {
    hook: 'Achas que te conheces? O LUMINA pode surpreender-te.',
    corpo: 'Sabemos muito sobre o mundo e pouco sobre nós. Sabemos as notícias, o horóscopo, o tempo. Mas não sabemos responder: "Como está a minha energia?" "O que sinto no corpo agora?" "Qual é a emoção dominante esta semana?" O autoconhecimento começa com perguntas simples.',
    cta: 'O LUMINA faz as perguntas. Tu descobres as respostas. Grátis. — Vivianne',
  },
];

const HASHTAGS_BASE = [
  '#seteecos', '#vitalis', '#transformacao',
  '#nutricaointeligente', '#saudereal', '#semdieta', '#bemestar',
];

const HASHTAGS_TEMATICOS = {
  corpo: ['#nutricao', '#comidadereal', '#comidadeverdade', '#porcoes', '#receitas'],
  emocional: ['#saudeemocional', '#autoconhecimento', '#inteligenciaemocional', '#comerconsciente'],
  provocacao: ['#verdadeincomoda', '#semfiltro', '#realidade', '#mudanca', '#chega'],
  lumina: ['#lumina', '#diagnostico', '#autoconhecimento', '#energia', '#checkin'],
  aurea: ['#aurea', '#autovalor', '#merecimento', '#autoestima', '#empoderamento', '#culpaherdada', '#investiremti'],
  alimentacao_emocional: ['#alimentacaoemocional', '#fomeemocional', '#comerconsciente', '#compulsaoalimentar', '#semculpa'],
  distorcoes: ['#imagemcorporal', '#corpopositivo', '#espelho', '#autoaceitacao', '#corporeal'],
  ansiedade: ['#ansiedade', '#stressecorpo', '#sistemanervoso', '#cortisol', '#regulacaoemocional'],
  autoestima: ['#autoestima', '#valorproprio', '#amorproprio', '#voziinterior', '#merecescuidado'],
  ciclo_recomecos: ['#recomecar', '#naoefraqueza', '#persistencia', '#semanadesistencia', '#continuadaqui'],
  serena_eco: ['#serena', '#regulacaoemocional', '#respiracao', '#chorar', '#emocoes'],
  ignis: ['#ignis', '#disciplina', '#foco', '#coragem', '#corte'],
  ventis: ['#ventis', '#energia', '#burnout', '#pausa', '#ritmo'],
  ecoa: ['#ecoa', '#voz', '#silenciamento', '#expressao', '#comunicacao'],
  imago: ['#imago', '#identidade', '#essencia', '#valores', '#autoconhecimento'],
  lumina_eco: ['#lumina', '#diagnostico', '#autoconhecimento', '#gratuito', '#checkin'],
};

// ============================================================
// CALENDARIO SEMANAL - Mais variado e estrategico
// ============================================================

// Semana par: temas VITALIS + emocionais | Semana ímpar: temas dos outros módulos
const TEMAS_SEMANA_PAR = {
  0: { tema: 'autoestima', titulo: 'Carta para Ti', formato: 'carrossel', tipo: 'conexão' },
  1: { tema: 'alimentacao_emocional', titulo: 'Fome Emocional', formato: 'reel', tipo: 'educação' },
  2: { tema: 'corpo', titulo: 'Mito vs Realidade', formato: 'carrossel', tipo: 'educação' },
  3: { tema: 'ansiedade', titulo: 'Corpo e Stress', formato: 'stories', tipo: 'educação' },
  4: { tema: 'distorcoes', titulo: 'Espelho e Verdade', formato: 'reel', tipo: 'provocação' },
  5: { tema: 'ciclo_recomecos', titulo: 'Para Quem Já Desistiu', formato: 'carrossel', tipo: 'empatia' },
  6: { tema: 'emocional', titulo: 'Reflexão de Sábado', formato: 'post', tipo: 'reflexão' },
};

const TEMAS_SEMANA_IMPAR = {
  0: { tema: 'serena_eco', titulo: 'Sentir Sem Medo', formato: 'carrossel', tipo: 'educação' },
  1: { tema: 'aurea', titulo: 'Valor Próprio', formato: 'reel', tipo: 'educação' },
  2: { tema: 'ignis', titulo: 'Foco e Coragem', formato: 'stories', tipo: 'provocação' },
  3: { tema: 'ventis', titulo: 'Energia e Ritmo', formato: 'carrossel', tipo: 'educação' },
  4: { tema: 'ecoa', titulo: 'Voz Recuperada', formato: 'reel', tipo: 'provocação' },
  5: { tema: 'imago', titulo: 'Quem És Tu', formato: 'carrossel', tipo: 'reflexão' },
  6: { tema: 'lumina_eco', titulo: 'Diagnóstico Gratuito', formato: 'post', tipo: 'conversão' },
};

function getTemasSemanaPorData(date) {
  const weekNum = Math.floor(getDayOfYear(date) / 7);
  return weekNum % 2 === 0 ? TEMAS_SEMANA_PAR : TEMAS_SEMANA_IMPAR;
}

// ============================================================
// GERADOR DE CONTEUDO DIARIO
// ============================================================

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / (1000 * 60 * 60 * 24));
}

function pickFromArray(arr, seed) {
  return arr[seed % arr.length];
}

function getConteudoByTema(tema, seed) {
  if (tema === 'corpo') return pickFromArray(CONTEUDO_CORPO, seed);
  if (tema === 'emocional') return pickFromArray(CONTEUDO_EMOCIONAL, seed);
  if (tema === 'alimentacao_emocional') return pickFromArray(CONTEUDO_ALIMENTACAO_EMOCIONAL, seed);
  if (tema === 'distorcoes') return pickFromArray(CONTEUDO_DISTORCOES, seed);
  if (tema === 'ansiedade') return pickFromArray(CONTEUDO_ANSIEDADE, seed);
  if (tema === 'autoestima') return pickFromArray(CONTEUDO_AUTOESTIMA, seed);
  if (tema === 'ciclo_recomecos') return pickFromArray(CONTEUDO_CICLO_RECOMECOS, seed);
  if (tema === 'aurea') return pickFromArray(CONTEUDO_AUREA, seed);
  if (tema === 'serena_eco') return pickFromArray(CONTEUDO_SERENA, seed);
  if (tema === 'ignis') return pickFromArray(CONTEUDO_IGNIS, seed);
  if (tema === 'ventis') return pickFromArray(CONTEUDO_VENTIS, seed);
  if (tema === 'ecoa') return pickFromArray(CONTEUDO_ECOA, seed);
  if (tema === 'imago') return pickFromArray(CONTEUDO_IMAGO, seed);
  if (tema === 'lumina_eco') return pickFromArray(CONTEUDO_LUMINA, seed);
  return pickFromArray(CONTEUDO_PROVOCACAO, seed);
}

export function gerarConteudoHoje(date = new Date(), variante = 0) {
  const dayOfWeek = date.getDay();
  const dayOfYear = getDayOfYear(date);
  const seed = dayOfYear + variante;
  const temasSemana = getTemasSemanaPorData(date);
  const { tema, titulo, formato, tipo } = temasSemana[dayOfWeek];
  const conteudo = getConteudoByTema(tema, seed);

  const hashBase = HASHTAGS_BASE.slice(0, 4);
  const hashTema = (HASHTAGS_TEMATICOS[tema] || []).slice(0, 4);

  return {
    data: date.toISOString().split('T')[0],
    diaSemana: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek],
    tema,
    titulo,
    formato,
    tipo,
    hook: conteudo.hook,
    dica: conteudo.hook, // backwards compat
    corpo: conteudo.corpo,
    cta: conteudo.cta,
    hashtags: [...hashBase, ...hashTema],
  };
}

export function totalVariantes(tema) {
  if (tema === 'corpo') return CONTEUDO_CORPO.length;
  if (tema === 'emocional') return CONTEUDO_EMOCIONAL.length;
  if (tema === 'alimentacao_emocional') return CONTEUDO_ALIMENTACAO_EMOCIONAL.length;
  if (tema === 'distorcoes') return CONTEUDO_DISTORCOES.length;
  if (tema === 'ansiedade') return CONTEUDO_ANSIEDADE.length;
  if (tema === 'autoestima') return CONTEUDO_AUTOESTIMA.length;
  if (tema === 'ciclo_recomecos') return CONTEUDO_CICLO_RECOMECOS.length;
  if (tema === 'aurea') return CONTEUDO_AUREA.length;
  if (tema === 'serena_eco') return CONTEUDO_SERENA.length;
  if (tema === 'ignis') return CONTEUDO_IGNIS.length;
  if (tema === 'ventis') return CONTEUDO_VENTIS.length;
  if (tema === 'ecoa') return CONTEUDO_ECOA.length;
  if (tema === 'imago') return CONTEUDO_IMAGO.length;
  if (tema === 'lumina_eco') return CONTEUDO_LUMINA.length;
  return CONTEUDO_PROVOCACAO.length;
}

export function gerarConteudoSemana(startDate = new Date()) {
  const semana = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    semana.push(gerarConteudoHoje(d));
  }
  return semana;
}

// ============================================================
// WHATSAPP - Mensagens que soam como a Vivianne a falar
// ============================================================

export function gerarMensagemWhatsApp(tipo = 'dica', campanha = '', variante = 0) {
  const hoje = gerarConteudoHoje(new Date(), variante);
  const camp = campanha || `whatsapp-${hoje.data}`;
  const linkVitalis = buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappBroadcast(camp));
  const linkLumina = buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.whatsappBroadcast(camp + '-lumina'));

  const templates = {
    // Dica educativa
    dica: `${hoje.hook}\n\n${hoje.corpo}\n\n${hoje.cta}\n\nSe quiseres aprofundar, o link está aqui:\n${linkVitalis}`,

    // Provocação reflexiva
    provocacao: `*${hoje.hook}*\n\nVou dizer uma coisa que talvez ninguém te disse:\n\n${hoje.corpo}\n\nSe isto te fez pensar, guarda esta mensagem.\n\nPodes explorar mais aqui:\n${linkLumina}`,

    // Voz pessoal (como se a Viv estivesse a falar)
    pessoal: `Olá 🤍\n\nHoje quero partilhar algo que aprendi:\n\n_${hoje.hook}_\n\n${hoje.corpo}\n\nSe te identificas, responde a esta mensagem. Quero saber como te sentes.\n\nOu experimenta o diagnóstico gratuito:\n${linkLumina}`,

    // Conteúdo educativo (ensina algo sobre nutrição/bem-estar)
    educacao: `📚 *Hoje vou ensinar-te algo:*\n\n${hoje.hook}\n\n${hoje.corpo}\n\nIsto não é opinião — é como o corpo funciona. Quanto mais souberes, melhores decisões tomas.\n\nSe quiseres aprofundar, o link está aqui:\n${linkLumina}\n\n— Vivianne`,

    // Reflexão (pergunta que provoca pensamento)
    reflexao: `💭 *Pergunta para hoje:*\n\n_${hoje.hook}_\n\nPára um momento e pensa nisto.\n\n${hoje.corpo}\n\nNão preciso que respondas agora. Mas se esta pergunta te ficou na cabeça, talvez valha a pena explorar:\n${linkLumina}\n\n— Vivianne`,

    // Ciência (partilha um facto científico)
    ciencia: `🔬 *Facto que pouca gente sabe:*\n\n${hoje.hook}\n\n${hoje.corpo}\n\nA ciência é clara. O problema é que ninguém traduz isto para linguagem simples. É isso que eu faço.\n\nSe quiseres aprofundar, o link está aqui:\n${linkLumina}\n\n— Vivianne`,

    // Lumina como ferramenta de autoconhecimento
    lumina: `Faz-te estas 7 perguntas:\n\n1. Como está a tua energia hoje?\n2. Onde sentes tensão no corpo?\n3. O que viste no espelho?\n4. Pensaste muito no passado?\n5. Preocupaste-te com o futuro?\n6. A tua mente está clara ou confusa?\n7. Sentes vontade de conexão ou isolamento?\n\nO LUMINA analisa as tuas respostas e revela padrões que não vias.\n\nGratuito. 2 minutos. 23 leituras possíveis.\n\n${linkLumina}`,

    // Status rápido (para WhatsApp Status)
    status: `_${hoje.hook}_\n\n${hoje.cta} 🌿`,

    // DM pessoal (para enviar a uma pessoa)
    dm: `Olá! 🤍\n\nEu sou a Vivianne e trabalho com nutrição e bem-estar integrado.\n\nCriei uma ferramenta gratuita que mapeia como estás — energia, emoção, corpo — em 2 minutos. Chama-se LUMINA.\n\nNão é questionário chato. É uma leitura personalizada.\n\nExperimenta e diz-me o que achaste:\n${linkLumina}\n\nSe quiseres aprofundar, estou aqui 🤍`,

    // Sequência Stories WhatsApp (5 partes)
    storiesSeq: `📱 *SEQUÊNCIA DE 5 STATUS* (publica um de cada vez, de hora em hora):\n\n*Status 1 (9h):*\n_${hoje.hook}_\n\n*Status 2 (11h):*\n_${hoje.corpo}_\n\n*Status 3 (13h):*\n_Sabias que a maioria das pessoas nunca recebeu orientação nutricional personalizada?_\n\n*Status 4 (16h):*\n_${hoje.cta}_\n\n*Status 5 (19h):*\n_Hoje já cuidaste de ti? Mesmo 2 minutos contam.\nSe quiseres aprofundar: ${linkLumina}_`,

    // Áudio educativo (nota de voz sobre um tema de saúde)
    audio: `🎙 *SCRIPT PARA NOTA DE VOZ EDUCATIVA:*\n\n"Olá, tudo bem contigo? Hoje quero explicar-te uma coisa sobre nutrição que pouca gente sabe.\n\n${hoje.hook}\n\n${hoje.corpo}\n\nIsto é ciência, não opinião. E quanto mais souberes sobre como o teu corpo funciona, melhores decisões vais tomar.\n\nSe quiseres aprofundar, tenho uma ferramenta gratuita que te ajuda a perceber onde estás. Chama-se LUMINA. Vou mandar-te o link.\n\n${linkLumina}"`,

    // Para grupos (linguagem neutra)
    grupo: `*Para todas as pessoas neste grupo* 🤍\n\nVou ser directa: a maioria de nós nunca aprendeu a comer.\n\nAprendemos a fazer dieta. A contar calorias. A sentir culpa.\n\nMas ninguém nos ensinou a OUVIR o corpo.\n\nHoje quero partilhar algo: um diagnóstico gratuito que analisa a tua energia, emoção e corpo em 2 minutos.\n\nNão vende nada. Não pede cartão. É só... um espelho.\n\n${linkLumina}\n\nExperimenta e partilha aqui o que achaste 🤍`,
  };

  return {
    mensagem: templates[tipo] || templates.dica,
    link: linkVitalis,
    tipo,
    campanha: camp,
  };
}

export function gerarStatusWhatsApp(campanha = '', variante = 0) {
  const hoje = gerarConteudoHoje(new Date(), variante);
  const camp = campanha || `status-${hoje.data}`;
  const link = buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.whatsappStatus(camp));
  return {
    mensagem: `_${hoje.hook}_\n\n🌿 Descobre mais: ${link}`,
    link,
  };
}

// ============================================================
// INSTAGRAM - Captions que param o scroll
// ============================================================

export function gerarCaptionInstagram(tipo = 'post', variante = 0) {
  const hoje = gerarConteudoHoje(new Date(), variante);
  const hashtagStr = hoje.hashtags.join(' ');

  const templates = {
    post: `${hoje.hook}\n\n${hoje.corpo}\n\n${hoje.cta}\n\nSe quiseres aprofundar, o link está na bio.\n.\n.\n.\n${hashtagStr}`,

    reel: `${hoje.hook}\n\n${hoje.corpo}\n\nGuarda isto. Partilha com alguém que precisa de ouvir.\n\n${hashtagStr}`,

    carrossel: `SLIDE 1 (CAPA): ${hoje.hook}\n\nSLIDE 2: ${hoje.corpo.split('.').slice(0, 2).join('.')}\n\nSLIDE 3: ${hoje.corpo.split('.').slice(2).join('.')}\n\nSLIDE 4: ${hoje.cta}\n\nSLIDE 5 (FINAL): Experimenta o LUMINA — diagnóstico gratuito em 2 min. Link na bio.\n\n---\n\nCAPTION:\n${hoje.hook}\n\nDesliza para aprender algo novo 👉\n\n${hashtagStr}`,

    stories: `📱 *SEQUÊNCIA DE 5 STORIES:*\n\n*Story 1:* Poll - "${hoje.hook}" (SIM / NÃO)\n\n*Story 2:* Texto sobre fundo de cor:\n"${hoje.corpo.split('.')[0]}"\n\n*Story 3:* Slider - "Quanto te identificas? 0-100%"\n\n*Story 4:* "${hoje.cta}"\n\n*Story 5:* Swipe up / Link - LUMINA gratuito`,
  };

  return {
    caption: templates[tipo] || templates.post,
    formato: tipo,
    hashtags: hashtagStr,
    dica: hoje.hook,
    hook: hoje.hook,
  };
}

// ============================================================
// SCRIPTS DE VOZ PARA REELS/STORIES
// ============================================================

export function gerarScriptVoz() {
  const hoje = gerarConteudoHoje();
  return {
    reel30s: `[Texto sobre fundo de cor, sem face]\n\nTELA 1: "${hoje.hook}"\n\n[Transição suave]\n\nTELA 2: "${hoje.corpo}"\n\n[Fundo mais escuro]\n\nTELA 3: "${hoje.cta}. Link na bio."\n\n*ÁUDIO:* Voz narrada ou música ambiente`,

    storiesVoz: `[Texto sobre fundo de cor, sem face]\n\nSTORY 1: "Vou dizer uma coisa que talvez ninguém te disse..."\n\n[Próximo story - fundo diferente]\n\nSTORY 2: "${hoje.hook}"\n\n[Próximo story]\n\nSTORY 3: "Se quiseres aprofundar, o LUMINA é gratuito. Link em cima."`,

    audioWhatsApp: `"Olá! Hoje quero ensinar-te algo sobre como o corpo funciona.\n\n${hoje.hook}\n\nPorque digo isto? Porque ${hoje.corpo.toLowerCase()}\n\nSe quiseres aprofundar, tenho uma ferramenta gratuita chamada LUMINA. Demora 2 minutinhos. Vou mandar-te o link."`,
  };
}

// ============================================================
// CAMPANHAS LANCAMENTO - Sequencias de 7 dias
// ============================================================

export function getCampanhaLancamento() {
  return [
    {
      dia: 1,
      titulo: 'EDUCAÇÃO - A Fragmentação',
      whatsapp: '*Porque é que tantas pessoas falham com dietas?*\n\nPorque tratam o corpo como se fosse separado da mente.\n\nUma app para calorias. Outra para meditação. Outra para exercício. Nada se fala entre si.\n\nO corpo não funciona em compartimentos. É um sistema integrado.\n\nNos próximos dias, vou explicar o que a ciência diz sobre isto.',
      instagram: 'Porque é que a maioria das abordagens de bem-estar falham?\n\nPorque tratam o corpo, a mente e as emoções como coisas separadas.\n\nMas não são.\n\nEsta semana, vou partilhar o que aprendi sobre integração.\n\nActiva as notificações 🔔',
      stories: 'Poll: "Já fizeste uma dieta que não funcionou?" SIM/NÃO',
    },
    {
      dia: 2,
      titulo: 'EDUCAÇÃO - O Mito',
      whatsapp: '*Mentira #1 que te venderam:*\n\n"Se comeres menos, emagreces."\n\nFalso.\n\nQuando comes de menos, o metabolismo ABRANDA. O corpo entra em modo de sobrevivência. Quando voltas a comer normal, ganhas tudo de volta. E mais.\n\nNão é falta de disciplina. É biologia.\n\nAmanhã conto-te o que realmente funciona.',
      instagram: 'MENTIRA #1 que te venderam sobre emagrecer.\n\n"Come menos." ❌\n\nA verdade? Quando comes de menos, o metabolismo abranda.\n\nO corpo não é estúpido. Protege-se.\n\nDesliza para entender o que realmente acontece 👉',
      stories: 'Caixa de perguntas: "Qual a dieta mais absurda que já fizeste?"',
    },
    {
      dia: 3,
      titulo: 'HISTÓRIA - A Vivianne',
      whatsapp: 'Hoje quero ser honesta contigo.\n\nAntes de criar o Sete Ecos, eu também tratava a alimentação de forma isolada. Focava-me só nos números, nas restrições, nos planos rígidos.\n\nAté que percebi: o problema nunca foi só a comida. Era a desconexão entre corpo, emoção e hábitos.\n\nFoi quando comecei a estudar integração que tudo mudou.\n\nAmanhã mostro-te o que descobri.',
      instagram: 'A minha história.\n\nAntes de criar o @seteecos, eu também tratava o bem-estar de forma fragmentada.\n\nFocava-me só num aspecto de cada vez. Nunca funcionava a longo prazo.\n\nAté que descobri o poder da integração...\n\n(continua nos comentários)',
      stories: 'Poll: "Já sentiste que cuidas de uma área da vida mas outra desaba?" SIM/NÃO',
    },
    {
      dia: 4,
      titulo: 'EDUCAÇÃO - O LUMINA',
      whatsapp: '*E se em 2 minutos pudesses descobrir padrões que nunca tinhas visto em ti?*\n\n7 perguntas sobre energia, emoção e corpo.\n23 leituras possíveis.\n1 espelho digital.\n\nChama-se LUMINA. É gratuito.\n\nExperimenta e diz-me o que achaste:\n',
      instagram: '2 minutos que podem mudar a forma como te vês.\n\n7 perguntas.\n23 padrões.\n1 leitura que parece que te conhece.\n\nO LUMINA é gratuito. É diferente de tudo o que já experimentaste.\n\nLink na bio 🔮',
      stories: 'Countdown: "LUMINA - Diagnóstico gratuito" + Swipe up',
    },
    {
      dia: 5,
      titulo: 'EDUCAÇÃO - A Ciência',
      whatsapp: '*Sabias que até 80% dos episódios de compulsão alimentar têm gatilho emocional?*\n\nO cortisol (hormona do stress) aumenta o desejo por açúcar e gordura. É biologia, não fraqueza.\n\nQuando estás sob pressão, o cérebro procura a recompensa mais rápida: comida.\n\nPor isso, tratar só a alimentação sem olhar para as emoções é como tratar o sintoma e ignorar a causa.\n\nÉ exactamente isto que o Sete Ecos integra.',
      instagram: 'Porque é que comes mais quando estás sob stress?\n\nNão é falta de disciplina. É biologia.\n\nO cortisol aumenta → o cérebro procura recompensa rápida → açúcar e gordura.\n\nTratar a alimentação sem olhar para as emoções é tratar o sintoma, não a causa.\n\nDesliza para entender 👉',
      stories: 'Poll: "Já comeste por stress e não por fome?" SIM/NÃO',
    },
    {
      dia: 6,
      titulo: 'EDUCAÇÃO - Integração',
      whatsapp: '*Porque é que abordagens isoladas falham?*\n\nFazes uma dieta → perdes peso → mas continuas emocionalmente no mesmo sítio → voltas aos velhos hábitos → ganhas tudo de volta.\n\nO ciclo repete-se porque o problema nunca foi só a comida.\n\nO corpo, a emoção e os hábitos são um sistema. Quando cuidas de um sem cuidar dos outros, o sistema volta ao padrão antigo.\n\nÉ por isso que criámos 7 dimensões, não apenas uma.',
      instagram: 'Porque é que perdes peso e voltas a ganhar?\n\nPorque a dieta trata o sintoma, não a causa.\n\nCorpo, emoção e hábitos são um sistema.\n\nQuando cuidas de um sem cuidar dos outros, o sistema volta ao padrão antigo.\n\nDesliza para entender porquê 👉',
      stories: 'Caixa de perguntas: "Que área da tua vida sentes que afecta a tua alimentação?"',
    },
    {
      dia: 7,
      titulo: 'CONVITE - O Convite',
      whatsapp: 'Esta semana partilhei contigo o que aprendi sobre integração e bem-estar.\n\nSe algo ressoou, o próximo passo é simples:\n\nExperimenta o LUMINA (gratuito, 2 minutos) e descobre os teus padrões.\n\nDepois, se quiseres explorar mais, o VITALIS está disponível.\n\nSem pressa. O teu ritmo é o certo.\n\n— Vivianne\n\n👉 ',
      instagram: 'Esta semana partilhei o que aprendi sobre bem-estar integrado.\n\nSe algo fez sentido para ti, o próximo passo é simples:\n\nExperimenta o LUMINA — é gratuito.\n\nDescobre os teus padrões. Ao teu ritmo.\n\nLink na bio 🤍',
      stories: 'Text: "Obrigada por acompanhares esta semana. O LUMINA está na bio, quando quiseres."',
    },
  ];
}

// ============================================================
// CARROSSEIS PRONTOS - 5 slides cada, prontos para descarregar
// ============================================================

export function getCarrosseisProntos() {
  return [
    {
      id: 'mitos-alimentação',
      titulo: '5 Mitos sobre Alimentação',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: '5 Mitos que Destroem a tua Saúde', texto: 'Quantos destes já acreditaste?' },
        { titulo: 'Mito 1: Hidratos engordam', texto: 'Falso. O que importa é a porção e o acompanhamento. Hidratos são energia essencial.' },
        { titulo: 'Mito 2: Preciso de suplementos caros', texto: 'Feijão, ovo, amendoim, lentilhas. Proteína acessível em qualquer mercado.' },
        { titulo: 'Mito 3: Comer menos = emagrecer', texto: 'Quando comes de menos, o metabolismo abranda. Comer MELHOR é o segredo.' },
        { titulo: 'Mito 4: Salada todos os dias', texto: 'Comida saudável tem sabor. Caril de coco, piri-piri. Porção certa = saúde.' },
        { titulo: 'Para de acreditar em mitos.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
      ],
      caption: '5 mitos que provavelmente já acreditaste (eu também!) 🫣\n\nDesliza e descobre a verdade.\n\nSalva este post. Partilha com alguém que precisa.\n\n#seteecos #vitalis #nutricaointeligente #mitos #comidadereal #saudereal',
    },
    {
      id: 'fome-emocional',
      titulo: '4 Sinais de Fome Emocional',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: 'Tens fome ou tens medo?', texto: '4 sinais de que comes por emoção, não por necessidade.' },
        { titulo: 'Sinal 1: Comes sem fome', texto: 'Quando a boca quer mas o estômago não pede. É emoção disfarçada.' },
        { titulo: 'Sinal 2: Comes às escondidas', texto: 'Se precisas de esconder o que comes, o problema não é a comida.' },
        { titulo: 'Sinal 3: Culpa depois de comer', texto: 'Comer não é crime. Se sentes culpa, alguém te ensinou a ter medo.' },
        { titulo: 'Sinal 4: Comer acalma a ansiedade', texto: 'A comida virou anestesia. O corpo encontrou uma forma de lidar com a dor.' },
        { titulo: 'Há uma saída. E não é mais uma dieta.', texto: 'VITALIS - Espaço de Retorno Emocional\napp.seteecos.com' },
      ],
      caption: 'Tens fome... ou algo dentro de ti precisa de atenção? 🤍\n\nDesliza e descobre os 4 sinais de fome emocional.\n\nPartilha com alguém que precisa de ouvir isto.\n\n#seteecos #vitalis #fomeemocional #saudeemocional #pessoaforte #comerconsciente',
    },
    {
      id: 'porções-mãos',
      titulo: 'Guia de Porções com as Mãos',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: 'Esquece a balança. Usa as mãos.', texto: 'O guia mais simples para porções correctas.' },
        { titulo: 'Palma aberta = Proteína', texto: 'Frango, peixe, carne, ovo. Uma palma por refeição.' },
        { titulo: 'Punho fechado = Hidratos', texto: 'Arroz, massa, batata, pão. Um punho por refeição. É suficiente.' },
        { titulo: 'Polegar = Gorduras', texto: 'Óleo, amendoim, abacate. Um polegar. Pouco mas essencial.' },
        { titulo: 'Duas mãos = Legumes', texto: 'Quanto mais legumes, melhor. Sem limite. Enche o prato.' },
        { titulo: 'Sem balança. Sem apps. Só as tuas mãos.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
      ],
      caption: 'A forma mais simples de medir porções que já vi 🤲\n\nNão precisa de balança. Não precisa de app de calorias. Só as tuas mãos.\n\nSalva e usa na tua próxima refeição.\n\n#seteecos #vitalis #porcoes #nutricao #comidadereal #dicasdesaude',
    },
    {
      id: 'lumina-como-funciona',
      titulo: 'LUMINA: O Diagnóstico que Ninguém te Fez',
      marca: 'lumina',
      cor: '#5C6BC0',
      slides: [
        { titulo: 'O diagnóstico que ninguém te fez.', texto: '2 minutos. 7 perguntas. 23 padrões possíveis.' },
        { titulo: '7 perguntas simples', texto: 'Energia, tensão, imagem, passado, futuro, clareza, conexão.' },
        { titulo: '23 leituras possíveis', texto: 'Críticas, alertas, proteção, transição, equilíbrio. O LUMINA encontra O TEU padrão.' },
        { titulo: 'Uma leitura só tua', texto: 'Não é horóscopo. É baseado nas tuas respostas reais de hoje.' },
        { titulo: 'Gratuito. Sem registo. 2 minutos.', texto: 'LUMINA - app.seteecos.com/lumina' },
      ],
      caption: 'Quando foi a última vez que alguém te perguntou como te sentes REALMENTE? 🔮\n\nO LUMINA faz-te 7 perguntas e revela padrões que não vias.\n\nGratuito. 2 minutos. Link na bio.\n\n#seteecos #lumina #autoconhecimento #diagnostico #saudeemocional #bemestar',
    },
    {
      id: 'vitalis-o-que-inclui',
      titulo: 'O que o VITALIS Inclui',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: 'Não é uma dieta. É o fim das dietas.', texto: 'VITALIS - Coaching Nutricional Personalizado' },
        { titulo: 'Plano alimentar feito para TI', texto: 'Com comida real e acessível. Adaptado à tua rotina. Sem listas impossíveis.' },
        { titulo: 'Coach IA disponível 24h', texto: 'Pergunta o que quiseres. A qualquer hora. Sem julgamento.' },
        { titulo: 'Espaço emocional para dias difíceis', texto: 'Recaíste? Sem problema. Há um espaço para isso. Sem culpa.' },
        { titulo: 'Dashboard + Receitas + Desafios', texto: 'Tudo no teu telemóvel. Progresso real que podes ver.' },
        { titulo: 'Queres saber mais? Envia-me DM.', texto: 'VITALIS — app.seteecos.com' },
      ],
      caption: 'O VITALIS não é mais uma dieta. É o único programa que cuida da tua COMIDA e da tua EMOÇÃO ao mesmo tempo. 🌿\n\nDesliza para ver tudo o que inclui.\n\nEnvia DM para saber como começar.\n\nLink na bio.\n\n#seteecos #vitalis #coachingnutricional #saudereal #bemestar #transformacao',
    },
    {
      id: 'ciclo-dieta',
      titulo: 'O Ciclo Vicioso da Dieta',
      marca: 'seteEcos',
      cor: '#6B5B95',
      slides: [
        { titulo: '80% dos problemas com comida são emocionais.', texto: 'Conhece o ciclo que te prende.' },
        { titulo: 'STRESS → Comes demais', texto: 'O corpo procura conforto rápido. Açúcar. Hidratos. Comida processada.' },
        { titulo: 'CULPA → Restringes', texto: '"Amanhã não como nada." "Vou só beber água." A punição começa.' },
        { titulo: 'RESTRIÇÃO → Compulsão', texto: 'O corpo não aguenta. Comes tudo. A culpa volta. Repete.' },
        { titulo: 'A saída não é mais disciplina. É compreensão.', texto: 'SETE ECOS - Transmutação Integral\napp.seteecos.com' },
      ],
      caption: 'Já estiveste neste ciclo? Eu também. 🔄\n\nStress → Comida → Culpa → Restrição → Compulsão → Mais culpa.\n\nA saída não é mais força de vontade. É entender PORQUE acontece.\n\nDesliza.\n\n#seteecos #ciclovicioso #saudeemocional #semdieta #pessoaforte #realidade',
    },
    {
      id: 'aurea-autovalor',
      titulo: 'AUREA: O Programa de Autovalor',
      marca: 'aurea',
      cor: '#C9A227',
      slides: [
        { titulo: 'O teu valor não cabe numa calça tamanho S.', texto: 'ÁUREA - Programa de Autovalor' },
        { titulo: 'Foste condicionado(a) a duvidar de ti.', texto: 'Pela escola. Pela TV. Pelas redes. Pelo espelho. Mas isso é uma mentira.' },
        { titulo: '7 semanas de reconexão.', texto: 'Exercícios, reflexões e ferramentas para reconstruir a relação contigo.' },
        { titulo: 'O teu corpo é a tua casa. Não um projecto.', texto: 'Para de tentar arranja-lo. Começa a habita-lo.' },
        { titulo: 'ÁUREA: envia DM para saber mais.', texto: 'app.seteecos.com/aurea' },
      ],
      caption: 'O teu valor não depende do que vestes, pesas ou aparentas. 🤍\n\nO ÁUREA é um programa de 7 semanas para reconstruir a relação contigo.\n\nPorque antes de mudar o corpo, precisas de mudar o olhar.\n\nLink na bio.\n\n#seteecos #aurea #autovalor #autoestima #empoderamento #wellness',
    },
    {
      id: 'como-funciona-integracao',
      titulo: 'As 7 Dimensões do Bem-Estar',
      marca: 'seteEcos',
      cor: '#6B5B95',
      slides: [
        { titulo: 'Porque é que abordagens isoladas não funcionam?', texto: 'O bem-estar tem 7 dimensões. Conhece cada uma.' },
        { titulo: '1. Corpo (Vitalis)', texto: 'Alimentação consciente, não restritiva. Ouvir o corpo em vez de o punir.' },
        { titulo: '2. Valor (Áurea) + 3. Emoção (Serena)', texto: 'Reconhecer o teu valor e aprender a navegar as emoções sem as anestesiar.' },
        { titulo: '4. Vontade (Ignis) + 5. Energia (Ventis)', texto: 'Foco consciente e gestão de energia. Saber quando avançar e quando parar.' },
        { titulo: '6. Expressão (Ecoa) + 7. Identidade (Imago)', texto: 'Encontrar a tua voz e integrar quem realmente és. As 7 dimensões ligam-se no AURORA.' },
        { titulo: 'Começa por onde faz sentido para ti.', texto: 'SETE ECOS - Transmutação Integral\napp.seteecos.com' },
      ],
      caption: 'Porque é que tratar só a alimentação não funciona a longo prazo? 🌿\n\nPorque o bem-estar tem 7 dimensões. Quando cuidas de uma e ignoras as outras, o sistema volta ao padrão antigo.\n\nDesliza para conhecer as 7.\n\n#seteecos #bemestar #integracao #autoconhecimento #saudeintegral',
    },
  ];
}

// ============================================================
// CALENDARIO MENSAL - 30 dias de conteúdo planeado
// ============================================================

export function gerarConteudoMensal(ano, mes) {
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const dias = [];
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const date = new Date(ano, mes, dia);
    const conteudo = gerarConteudoHoje(date);
    dias.push({
      ...conteudo,
      dia,
      dayOfWeek: date.getDay(),
    });
  }
  return dias;
}

// ============================================================
// PLANO DE LANCAMENTO - 12 POSTS GRID INSTAGRAM
// ============================================================

export function getGridInstagram() {
  return [
    {
      ordem: 1, dia: 'Dom 8', titulo: 'Apresentação da Marca',
      template: 'cta', eco: 'seteEcos', formato: 'post',
      texto: 'Comida. Emoção. Corpo. Mente. Tudo está ligado.',
      subtitulo: 'SETE ECOS - Sistema de Transformação Pessoal',
      caption: 'E se existisse um sistema que cuida de TI como um todo?\n\nNão só a comida. Não só o peso. TU — por inteiro.\n\nComida. Emoção. Corpo. Mente. Tudo está ligado.\n\nIsto é o SETE ECOS. E está aqui para ti.\n\nSegue para acompanhar esta jornada 🤍\n\n#seteecos #transformacaopessoal #bemestar #saudeintegral #saudereal',
    },
    {
      ordem: 2, dia: 'Dom 8', titulo: 'Quem é a Vivianne',
      template: 'testemunho', eco: 'seteEcos', formato: 'post',
      texto: 'Descobri que o verdadeiro problema não era o corpo. Era a fragmentação.',
      subtitulo: '- Vivianne, Fundadora',
      caption: 'Olá. Sou a Vivianne.\n\nDurante anos tentei resolver a alimentação isoladamente. Depois a emoção. Depois o corpo. Cada coisa separada.\n\nAté que percebi: a fragmentação era o verdadeiro problema. Tratar uma parte sem olhar para o todo nunca funciona.\n\nCriei o Sete Ecos para que ninguém tenha de passar por essa frustração sozinho/a.\n\nSe te identificas, segue esta página. 🤍\n\n#seteecos #historiapessoal #transformacaopessoal #wellness #comidaeemocao',
    },
    {
      ordem: 3, dia: 'Dom 8', titulo: 'Primeiro Hook Emocional',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto: 'Ninguém te ensinou a comer. Ensinaram-te a ter medo de comer.',
      subtitulo: '@seteecos',
      caption: 'Ninguém te ensinou a comer. Ensinaram-te a ter medo de comer.\n\nMedo de hidratos. Medo de gordura. Medo de jantar depois das 18h. Medo de viver.\n\nE se te dissesse que podes comer sem culpa, sem medo, sem restrição - e mesmo assim transformar o teu corpo?\n\nFica atento/a. Algo está a mudar. 🌿\n\n#seteecos #semdieta #semculpa #alimentacaoconsciente #bemestar #nutricao',
    },
    {
      ordem: 4, dia: 'Seg 9', titulo: 'Carrossel: 5 Mitos',
      template: 'carrossel', eco: 'vitalis', formato: 'post',
      carrosselId: 'mitos-alimentação',
      caption: '5 mitos que provavelmente já acreditaste (eu também!) 🫣\n\nDesliza e descobre a verdade sobre alimentação.\n\nSalva este post. Partilha com alguém que precisa.\n\n#seteecos #vitalis #nutricaointeligente #mitos #comidadereal #saudereal',
    },
    {
      ordem: 5, dia: 'Seg 9', titulo: 'Estatística de Impacto',
      template: 'stats', eco: 'vitalis', formato: 'post',
      texto: '80%',
      subtitulo: 'dos problemas com comida são emocionais. Não é falta de disciplina. É dor.',
      caption: '80% dos problemas com comida são emocionais.\n\nNão é falta de disciplina. É dor.\n\nStress. Solidão. Frustração. O corpo encontrou uma forma de se acalmar.\n\nE se em vez de castigo, o teu corpo recebesse compreensão?\n\nGuarda este post. 🤍\n\n#seteecos #fomeemocional #saudeemocional #estatistica #comerconsciente #saudeintegral',
    },
    {
      ordem: 6, dia: 'Ter 10', titulo: 'Carrossel: Porções',
      template: 'carrossel', eco: 'vitalis', formato: 'post',
      carrosselId: 'porções-mãos',
      caption: 'A forma mais simples de medir porções 🤲\n\nSem balança. Sem app de calorias. Só as tuas mãos.\n\nSalva e usa na tua próxima refeição.\n\n#seteecos #vitalis #porcoes #nutricao #comidadereal #dicasdesaude',
    },
    {
      ordem: 7, dia: 'Qua 11', titulo: 'LUMINA Teaser',
      template: 'cta', eco: 'lumina', formato: 'post',
      texto: '7 perguntas. 23 padrões. O diagnóstico que ninguém te fez.',
      subtitulo: 'LUMINA - Gratuito. 2 minutos.',
      caption: 'Quando foi a última vez que alguém te perguntou como te sentes REALMENTE?\n\nNão o que comes. Não quanto pesas. Como TE SENTES.\n\nO LUMINA faz-te 7 perguntas sobre energia, emoção e corpo. E revela padrões que não vias.\n\n🔮 Gratuito. 2 minutos. 23 leituras possíveis.\n\nLink na bio.\n\n#seteecos #lumina #diagnostico #autoconhecimento #saudeemocional #bemestar',
    },
    {
      ordem: 8, dia: 'Qui 12', titulo: 'Fome Emocional - Educação',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto: 'Comer por emoção não é fraqueza. É o corpo a pedir ajuda da única forma que conhece.',
      subtitulo: '@seteecos',
      caption: 'Comer por emoção não é fraqueza. É o corpo a pedir ajuda da única forma que conhece.\n\nA neurociência explica: quando o stress sobe, o cortisol dispara e o cérebro procura a recompensa mais rápida — comida.\n\nNão é falta de disciplina. É biologia.\n\nO primeiro passo é parar de te culpar. O segundo é entender o padrão.\n\nGuarda este post. 🤍\n\n#seteecos #vitalis #fomeemocional #neurociencia #saudeemocional #bemestar',
    },
    {
      ordem: 9, dia: 'Sex 13', titulo: 'Hook Relatable',
      template: 'dica', eco: 'seteEcos', formato: 'post',
      texto: 'Se cozinhas para a família inteira e comes os restos em pé na cozinha, este post é para ti.',
      subtitulo: '@seteecos',
      caption: 'Se cozinhas para a família inteira e comes os restos em pé na cozinha, este post é para ti.\n\nTu também mereces sentar. Comer com calma. Ter um prato pensado para TI.\n\nA tua saúde importa tanto quanto a deles.\n\nPartilha com alguém que precisa de ouvir isto. 🤍\n\n#seteecos #bemestar #cuidadeproprio #comidaconsciente #realidade #saudeintegral',
    },
    {
      ordem: 10, dia: 'Sáb 14', titulo: 'Carrossel: LUMINA',
      template: 'carrossel', eco: 'lumina', formato: 'post',
      carrosselId: 'lumina-como-funciona',
      caption: 'O diagnóstico que ninguém te fez 🔮\n\nO LUMINA analisa energia, emoção e corpo em 2 minutos.\n\nGratuito. Link na bio.\n\n#seteecos #lumina #autoconhecimento #diagnostico #saudeemocional #bemestar',
    },
    {
      ordem: 11, dia: 'Sáb 14', titulo: 'VITALIS Reveal',
      template: 'cta', eco: 'vitalis', formato: 'post',
      texto: 'Não é uma dieta. É o fim das dietas.',
      subtitulo: 'VITALIS - Abre próxima semana',
      caption: 'Algo que estive a construir há muito tempo.\n\nUm programa que não te dá uma lista e te deseja boa sorte.\n\n🍽 Plano alimentar com comida local (matapa, xima, feijão nhemba)\n🧠 Cuida da emoção ao mesmo tempo que da comida\n📱 Coach IA disponível 24h\n💚 Espaço para os dias difíceis\n\nChama-se VITALIS. Abre na próxima semana.\n\nQueres saber mais? Experimenta o LUMINA (link na bio) 🌿\n\n#seteecos #vitalis #lancamento #coachingnutricional #embreve #bemestar',
    },
    {
      ordem: 12, dia: 'Sáb 14', titulo: 'Teaser Final',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto: 'Próxima semana, tudo muda.',
      subtitulo: 'VITALIS - Em breve',
      caption: 'Próxima semana, tudo muda.\n\nSe esta semana algo ressoou contigo...\nSe te identificaste com algum post...\nSe o LUMINA te surpreendeu...\n\nEntão vais querer acompanhar o que vem a seguir.\n\nActiva as notificações 🔔\n\n🌿\n\n#seteecos #vitalis #embreve #lancamento #transformacao #bemestar',
    },
  ];
}

// ============================================================
// ANUNCIOS PAGOS - Facebook / Instagram Ads
// ============================================================

export function getAnunciosPagos() {
  return [
    {
      id: 'lumina-diagnóstico',
      nome: 'Lumina - Diagnóstico Gratuito',
      objectivo: 'Conversoes (Cliques no Link)',
      template: 'cta', eco: 'lumina', formato: 'post',
      texto_imagem: 'Descobre como REALMENTE estas. 2 minutos.',
      subtitulo_imagem: 'LUMINA - Diagnóstico Gratuito',
      headline: 'O diagnóstico que ninguém te fez',
      texto_primario: '7 perguntas sobre energia, emoção e corpo.\n23 leituras possíveis.\n1 espelho digital.\n\nO LUMINA revela padrões que não vias sobre ti.\n\nGratuito. 2 minutos. Sem registo.',
      descricao: 'Diagnóstico gratuito | LUMINA by Sete Ecos',
      cta_botao: 'Experimenta Agora',
      link: `${BASE_URL}/lumina?utm_source=facebook&utm_medium=ad&utm_campaign=lumina-launch-s1`,
      targeting: 'Pessoas 25-55 | Lusofonia | Interesses: Saúde, Bem-estar, Nutrição, Alimentação saudável, Yoga, Meditação',
      orcamento: '300-500 MT/dia (~$5-8 USD)',
    },
    {
      id: 'hook-emocional',
      nome: 'Hook Emocional - Engagement',
      objectivo: 'Engagement + Seguidores',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto_imagem: 'Tens fome ou tens medo?',
      subtitulo_imagem: '@seteecos',
      headline: 'A verdade que ninguém te diz sobre comida',
      texto_primario: 'A maioria das pessoas come por emoção e chama isso de "falta de força de vontade".\n\nNão é falta de disciplina. É dor.\n\nSegue @seteecos para conteúdo que ninguém mais partilha.',
      descricao: 'Segue @seteecos',
      cta_botao: 'Saber Mais',
      link: 'https://www.instagram.com/seteecos/',
      targeting: 'Pessoas 25-55 | Lusofonia | Interesses: Dieta, Perda de peso, Saúde mental, Corpo positivo',
      orcamento: '200-400 MT/dia (~$3-6 USD)',
    },
    {
      id: 'dor-dietas',
      nome: 'Dor das Dietas - Conversao',
      objectivo: 'Conversoes (Cliques no Link)',
      template: 'dica', eco: 'seteEcos', formato: 'post',
      texto_imagem: 'Se a dieta funcionasse, não precisavas de outra a cada 3 meses.',
      subtitulo_imagem: 'Existe outra forma.',
      headline: 'Cansado/a de dietas que não funcionam?',
      texto_primario: 'Dieta → Restrição → Desistência → Culpa → Nova dieta.\n\nJá passaste por este ciclo?\n\nDescobre o que realmente está a acontecer em 2 minutos. Gratuito.',
      descricao: 'Diagnóstico gratuito | Sem compromisso',
      cta_botao: 'Descobre Agora',
      link: `${BASE_URL}/lumina?utm_source=facebook&utm_medium=ad&utm_campaign=dor-dietas-s1`,
      targeting: 'Pessoas 25-55 | Lusofonia | Interesses: Dieta, Emagrecimento, Receitas saudáveis, Fitness',
      orcamento: '300-500 MT/dia (~$5-8 USD)',
    },
    {
      id: 'educacao-emocional-ad',
      nome: 'Educação - Fome Emocional',
      objectivo: 'Conversoes (Cliques no Link)',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto_imagem: '80% da fome que sentes não é fome. É emoção.',
      subtitulo_imagem: '@seteecos',
      headline: 'A ciência por trás da fome emocional',
      texto_primario: 'Quando o stress sobe, o cortisol dispara e o cérebro procura a recompensa mais rápida — comida.\n\nNão é falta de disciplina. É neurociência.\n\nDescobre os teus padrões com um diagnóstico gratuito de 2 minutos.',
      descricao: 'Diagnóstico gratuito LUMINA',
      cta_botao: 'Experimenta Grátis',
      link: `${BASE_URL}/lumina?utm_source=facebook&utm_medium=ad&utm_campaign=testemunho-s1`,
      targeting: 'Pessoas 25-55 | Lusofonia | Interesses: Transformação pessoal, Saúde, Bem-estar',
      orcamento: '300-500 MT/dia (~$5-8 USD)',
    },
  ];
}

// ============================================================
// SEMANA 1 (8-14 FEV): AQUECER - Dia a dia
// ============================================================

export function getSemana1() {
  const linkLumina = `${BASE_URL}/lumina?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=s1-aquecer`;
  return [
    {
      dia: 1, data: 'Domingo 8 Fev', titulo: 'APRESENTAR',
      gridPosts: [1, 2, 3],
      stories: 'Texto sobre fundo colorido: "Olá, sou a Vivianne e criei algo para pessoas como nós."',
      whatsapp: {
        mensagem: `Olá 🤍\n\nQuero partilhar uma coisa contigo.\n\nCriei um projecto para pessoas que, como eu, já estiveram em guerra com o próprio corpo.\n\nNão é uma dieta. Não é um ginásio. É algo diferente.\n\nNos próximos dias vou contar-te mais.\n\nSe tens curiosidade, segue @seteecos no Instagram. Acabou de nascer. 🌿`,
        imagem: { template: 'cta', eco: 'seteEcos', formato: 'stories', texto: 'Algo especial acaba de nascer.', subtitulo: 'SETE ECOS - Segue @seteecos' },
      },
      ads: null,
      notas: 'Publica 3 posts para preencher grid. Envia WA para TODA a lista. Cria a broadcast list.',
    },
    {
      dia: 2, data: 'Segunda 9 Fev', titulo: 'EDUCAR',
      gridPosts: [4, 5],
      stories: 'Poll: "Já fizeste uma dieta que não funcionou?" SIM / NÃO',
      whatsapp: {
        mensagem: `Sabias que 80% dos problemas com comida são emocionais? 😮\n\nNão é falta de disciplina. É o corpo a tentar lidar com stress, solidão ou frustração.\n\nPubliquei algo sobre isto no Instagram que te vai interessar.\n\n@seteecos 🌿`,
        imagem: { template: 'stats', eco: 'vitalis', formato: 'stories', texto: '80%', subtitulo: 'dos problemas com comida são emocionais' },
      },
      ads: null,
      notas: 'Publica carrossel mitos + estatística. Engaja com respostas ao poll.',
    },
    {
      dia: 3, data: 'Terça 10 Fev', titulo: 'VALOR',
      gridPosts: [6],
      stories: 'Partilha o carrossel das porções: "Salva isto!"',
      whatsapp: {
        mensagem: `Bom dia 🤍\n\nSabias que podes medir porções só com as mãos?\n\n🤚 Palma = proteína\n✊ Punho = hidratos\n👍 Polegar = gordura\n🙌 Duas mãos = legumes\n\nSem balança. Sem stress. Experimenta hoje no almoço.\n\nGuia completo no Instagram: @seteecos`,
        imagem: { template: 'dica', eco: 'vitalis', formato: 'stories', texto: 'Esquece a balança. Usa as mãos.', subtitulo: 'Guia de porções no @seteecos' },
      },
      ads: 'ACTIVAR: Ad "Lumina Diagnóstico" + Ad "Hook Emocional". Começa com 300-500 MT/dia cada.',
      notas: 'DIA DE ACTIVAR ADS. Começa a investir. Publica carrossel de porções.',
    },
    {
      dia: 4, data: 'Quarta 11 Fev', titulo: 'LUMINA - O ANZOL',
      gridPosts: [7],
      stories: 'Grava ecrã a fazer o LUMINA + reação ao resultado. Partilha nos stories.',
      whatsapp: {
        mensagem: `Tenho algo para ti 🔮\n\nCriei um diagnóstico gratuito que em 2 minutos te diz como REALMENTE estás.\n\n7 perguntas sobre energia, emoção e corpo.\n23 padrões possíveis.\nUma leitura só tua.\n\nChama-se LUMINA e é completamente grátis.\n\nExperimenta e diz-me o que achaste:\n${linkLumina}\n\nQuero saber a tua opinião 🤍`,
        imagem: { template: 'cta', eco: 'lumina', formato: 'stories', texto: '2 minutos. 7 perguntas. O diagnóstico que ninguém te fez.', subtitulo: 'LUMINA - Experimenta grátis' },
      },
      ads: 'Manter ads. Verificar métricas (CTR, CPC).',
      notas: 'DIA CHAVE: primeiro push do LUMINA. Envia para TODOS os contactos. Pede feedback.',
    },
    {
      dia: 5, data: 'Quinta 12 Fev', titulo: 'EDUCAÇÃO',
      gridPosts: [8],
      stories: 'Partilha screenshots de respostas/reações ao Lumina.',
      whatsapp: {
        mensagem: `Olá 🤍\n\nOntem partilhei o LUMINA contigo.\n\nJá experimentaste? Se sim, o que achaste da leitura?\n\nSe ainda não, demora só 2 minutinhos:\n${linkLumina}\n\nQuero ouvir a tua experiência! Responde-me 🌿`,
        imagem: { template: 'dica', eco: 'vitalis', formato: 'stories', texto: 'Comer por emoção não é fraqueza. É o corpo a pedir ajuda.', subtitulo: '@seteecos' },
      },
      ads: 'Manter. Ver qual ad tem melhor CTR e aumentar orçamento nesse.',
      notas: 'Follow-up do Lumina. Recolhe feedback. Publica conteúdo educativo.',
    },
    {
      dia: 6, data: 'Sexta 13 Fev', titulo: 'EMPATIA',
      gridPosts: [9],
      stories: 'Caixa de perguntas: "Qual a tua maior luta com a comida?"',
      whatsapp: {
        mensagem: `Se cozinhas para a família inteira e comes os restos em pé na cozinha... esta mensagem é para ti.\n\nTu também mereces sentar, comer com calma, e ter um prato pensado para TI.\n\nA tua saúde importa tanto quanto a deles.\n\nAmanhã tenho uma surpresa para ti 🌿`,
        imagem: { template: 'dica', eco: 'seteEcos', formato: 'stories', texto: 'Se cozinhas para todos e comes os restos em pé... esta mensagem é para ti.', subtitulo: '@seteecos' },
      },
      ads: 'Pausar ad com pior CTR. Aumentar o melhor para 500-800 MT/dia.',
      notas: 'Conteúdo relatable. Pura empatia. Preparar terreno para amanhã.',
    },
    {
      dia: 7, data: 'Sábado 14 Fev ❤️', titulo: 'REVELAR VITALIS',
      gridPosts: [10, 11, 12],
      stories: 'Countdown: "VITALIS abre próxima semana!"',
      whatsapp: {
        mensagem: `🤍 Feliz Dia dos Namorados!\n\nHoje quero lembrar-te: o namoro mais importante da tua vida é CONTIGO.\n\nE por isso criei o VITALIS.\n\nCoaching nutricional que cuida da tua COMIDA e da tua EMOÇÃO:\n\n🍽 Plano alimentar com comida local\n🧠 Coach IA 24h\n💚 Espaço emocional sem julgamento\n📊 Dashboard com progresso real\n\nAbre na próxima semana.\n\nSe ainda não fizeste o diagnóstico gratuito:\n${linkLumina}\n\n🌿`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'Não é uma dieta. É o fim das dietas.', subtitulo: 'VITALIS - Abre próxima semana' },
      },
      ads: 'Adicionar Ad "Dor das Dietas". Manter restantes activos.',
      notas: 'DIA CHAVE: Revelar Vitalis! 3 posts. Aproveitar Dia dos Namorados!',
    },
  ];
}

// ============================================================
// SEMANA 2 (15-21 FEV): LANCAR - Dia a dia
// ============================================================

export function getSemana2() {
  const linkVitalis = `${BASE_URL}/vitalis?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=s2-lancamento`;
  const linkLumina = `${BASE_URL}/lumina?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=s2-lancamento`;
  return [
    {
      dia: 8, data: 'Domingo 15 Fev', titulo: 'LANÇAMENTO!',
      stories: 'Texto sobre fundo colorido: "Hoje é o dia! O VITALIS está aberto!" + Countdown a zero.',
      whatsapp: {
        mensagem: `*O VITALIS está ABERTO.* 🌿\n\nDepois de meses a construir, finalmente está aqui.\n\nCoaching nutricional que cuida de TI - comida E emoção.\n\n🍽 Plano alimentar personalizado (com comida moçambicana)\n📱 Coach IA disponível 24h\n💚 Espaço emocional para dias difíceis\n📊 Dashboard com o teu progresso\n🎯 Desafios semanais\n📖 Receitas com ingredientes locais\n\n7 dias de garantia. Envia DM para saber mais.\n\n${linkVitalis}\n\nEnvia DM para saber como começar 🤍`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'VITALIS está ABERTO.', subtitulo: 'Coaching Nutricional | Envia DM' },
      },
      ads: 'Adicionar Ad "Educação Emocional". Retarget: quem visitou Lumina mas não converteu.',
      notas: 'DIA DE LANCAMENTO! Publica post de lançamento. Envia WA a todos. Stories o dia todo.',
    },
    {
      dia: 9, data: 'Segunda 16 Fev', titulo: 'DEEP DIVE',
      stories: 'Tour guiado pela app: mostra dashboard, check-in, receitas, chat.',
      whatsapp: {
        mensagem: `Bom dia 🤍\n\nOntem lancei o VITALIS e a reação foi incrível.\n\nHoje quero mostrar-te POR DENTRO o que recebes:\n\n✅ Plano alimentar feito para ti (não copiado da internet)\n✅ Receitas com matapa, xima, feijão nhemba, caril de amendoim\n✅ Check-in diário (água, sono, refeições, exercício)\n✅ Coach IA que responde às 3 da manhã sem julgamento\n✅ Espaço emocional para quando recaís\n✅ Desafios semanais que te mantêm motivado/a\n\n7 dias de garantia. Se não gostares, devolvemos.\n\n${linkVitalis}`,
        imagem: { template: 'dica', eco: 'vitalis', formato: 'stories', texto: 'O que recebes no VITALIS?', subtitulo: 'Tudo no teu telemóvel. 24h por dia.' },
      },
      ads: 'Manter todos. Verificar conversões do dia de lançamento.',
      notas: 'Mostra o produto por dentro. Elimina dúvidas com transparência.',
    },
    {
      dia: 10, data: 'Terça 17 Fev', titulo: 'CIÊNCIA',
      stories: 'Gravação de ecrã mostrando a app. Partilha dados educativos.',
      whatsapp: {
        mensagem: `*3 factos sobre alimentação que talvez não saibas:*\n\n1. O cortisol (hormona do stress) aumenta directamente a vontade de comer açúcar e gordura. Não é falta de disciplina — é bioquímica.\n\n2. Estudos mostram que dietas restritivas falham em 95% dos casos a longo prazo. O problema não és tu. É a abordagem.\n\n3. Comer com atenção plena (mindful eating) reduz episódios de compulsão alimentar em até 60%.\n\nO VITALIS foi construído com base nesta ciência.\n\n${linkVitalis}`,
        imagem: { template: 'stats', eco: 'vitalis', formato: 'stories', texto: '95%', subtitulo: 'das dietas restritivas falham a longo prazo. O problema é a abordagem.' },
      },
      ads: 'Manter. Escalar ads com melhor ROAS.',
      notas: 'Conteúdo educativo baseado em ciência. Posicionamento de autoridade.',
    },
    {
      dia: 11, data: 'Quarta 18 Fev', titulo: 'PERGUNTAS',
      stories: 'Q&A: Responder dúvidas sobre como funciona, o que inclui.',
      whatsapp: {
        mensagem: `Sei que talvez estejas a pensar:\n\n*"Não tenho tempo."*\nCheck-in: 2 min. Receitas: rápidas. App no telemóvel.\n\n*"Já tentei tudo."*\nMas nunca tentaste algo que cuida da emoção ao mesmo tempo.\n\n*"Como funciona na prática?"*\nPlano alimentar personalizado + coach IA + espaço emocional. Tudo na app.\n\nSe tens mais perguntas, envia-me mensagem. Respondo pessoalmente.\n\n${linkVitalis} 🌿`,
        imagem: { template: 'dica', eco: 'vitalis', formato: 'stories', texto: '"Já tentei tudo." Mas nunca tentaste algo que cuida da tua EMOÇÃO.', subtitulo: 'VITALIS - Envia as tuas perguntas' },
      },
      ads: 'Manter. Considerar ad de retargeting com perguntas frequentes.',
      notas: 'Responde dúvidas com transparência. Tom educativo, não pressão.',
    },
    {
      dia: 12, data: 'Quinta 19 Fev', titulo: 'BASTIDORES',
      stories: 'Gravação de ecrã mostrando a app. O dia-a-dia com o VITALIS.',
      whatsapp: {
        mensagem: `Hoje quero mostrar-te algo pessoal 🤍\n\nTodos os dias, eu própria uso o VITALIS.\n\nFaço o check-in. Sigo o meu plano. Uso o espaço emocional quando preciso.\n\nPorque isto não é só para ti. É para mim também.\n\nSomos todos iguais nisto. Todos lutamos.\n\nA diferença é ter ferramentas.\n\n${linkVitalis}`,
        imagem: { template: 'dica', eco: 'seteEcos', formato: 'stories', texto: 'Eu própria uso o VITALIS todos os dias. Porque também preciso.', subtitulo: '- Vivianne' },
      },
      ads: 'Manter.',
      notas: 'Vulnerabilidade e autenticidade. Mostra que és humana.',
    },
    {
      dia: 13, data: 'Sexta 20 Fev', titulo: 'REFLEXÃO',
      stories: 'Texto sobre fundo colorido: "O que mudarias na tua relação com a comida?"',
      whatsapp: {
        mensagem: `🤍 Uma reflexão para hoje:\n\nO que mudarias na tua relação com a comida se pudesses?\n\nNão o peso. Não o corpo. A RELAÇÃO.\n\nComer sem culpa. Sem esconder. Sem compensar.\n\nO VITALIS foi construído exactamente para isto. Para pessoas que querem paz com a comida.\n\nSe faz sentido para ti, estou aqui:\n${linkVitalis}\n\nSem pressão. A decisão é sempre tua. 🌿`,
        imagem: { template: 'dica', eco: 'vitalis', formato: 'stories', texto: 'O que mudarias na tua relação com a comida?', subtitulo: 'VITALIS - Paz com a comida' },
      },
      ads: 'Manter os 2 melhores ads. Avaliar desempenho.',
      notas: 'Reflexão genuína. Sem pressão. Convite suave.',
    },
    {
      dia: 14, data: 'Sábado 21 Fev', titulo: 'GRATIDÃO',
      stories: 'Resumo da semana. Agradecimento a quem acompanhou.',
      whatsapp: {
        mensagem: `Esta semana foi especial 🤍\n\nLançámos o VITALIS e a resposta foi bonita.\n\nObrigada a quem experimentou, a quem fez perguntas, a quem partilhou.\n\nO VITALIS continua aberto para quem sentir que é o momento certo:\n\n🍽 Plano alimentar personalizado\n📱 Coach IA 24h\n💚 Espaço emocional\n📊 Dashboard de progresso\n\nSem pressa. Quando fizer sentido para ti, estou aqui.\n\n${linkVitalis}\n\nBom fim de semana 🌿`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'Obrigada a quem acompanhou esta semana.', subtitulo: 'VITALIS - Quando estiveres pronto/a, estou aqui.' },
      },
      ads: 'Avaliar resultados da semana. Pausar ads com mau desempenho. Manter os melhores.',
      notas: 'Fecho com gratidão. Avaliar métricas totais. Planear semana 3.',
    },
  ];
}

// ============================================================
// EMAIL SEQUENCES & UTM LINKS (mantidos por compatibilidade)
// ============================================================

export function getEmailSequencia(diasDesdeRegisto) {
  const sequencia = [
    { dia: 0, assunto: 'Bem-vindo/a — A tua jornada começa aqui', tipo: 'boas-vindas', preview: 'Não é mais uma newsletter. É um espelho.' },
    { dia: 3, assunto: '2 minutos que te podem surpreender', tipo: 'convite-lumina', preview: 'O diagnóstico que ninguém te fez.' },
    { dia: 7, assunto: 'O que a ciência diz sobre metabolismo', tipo: 'educação-metabolismo', preview: 'Não é falta de disciplina. É biologia.' },
    { dia: 14, assunto: 'Mitos da nutrição: o que a evidência mostra', tipo: 'educação-mitos', preview: 'Separar factos de ficção com base em estudos.' },
    { dia: 21, assunto: 'Ciclo hormonal e alimentação — o que ninguém te ensinou', tipo: 'educação-hormonal', preview: 'O corpo muda ao longo do mês. A alimentação também devia.' },
    { dia: 30, assunto: 'As 7 dimensões da saúde integral', tipo: 'educação-integração', preview: 'Corpo, emoção, energia, voz, identidade — tudo conta.' },
  ];
  return sequencia.find(s => s.dia === diasDesdeRegisto) || null;
}

export function getSequenciaCompleta() {
  return [0, 3, 7, 14, 21, 30].map(dia => getEmailSequencia(dia));
}

export function gerarLinksUTM() {
  return {
    instagramBio: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.instagramBio()),
    instagramStory: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.instagramStory()),
    whatsappBroadcast: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappBroadcast()),
    whatsappStatus: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappStatus()),
    email: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.emailNewsletter()),
    facebook: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.facebookPost()),
    luminaInstagram: buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.instagramBio('lumina')),
    luminaWhatsapp: buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.whatsappBroadcast('lumina')),
  };
}

// ============================================================
// MOCKUPS VITALIS - 12 Conteúdos para popular o Instagram
// Usa imagens reais da app (mockups telemóvel e PC)
// ============================================================

const MOCKUP_IMAGES = {
  dashboard: '/mockups/Vitalis-dashboard_mb-mockup.jpeg',
  coach: '/mockups/Vitalis-coach_mb-mockup.jpeg',
  receitas: '/mockups/Vitalis-receitas_mb-mockup.jpeg',
  treinos: '/mockups/Vitalis-treinos_mb-mockup.jpeg',
  espacoRetorno: '/mockups/Vitalis-espaçoretorno_mb-mockup.jpeg',
  landingPC: '/mockups/Vitalis-landing_PC-mockup.jpeg',
  mozproud: '/mockups/mozproud-vitalis.jpeg',
};

// Mockups por eco — imagens reais criadas pela Vivianne
const ECO_MOCKUPS = {
  vitalis: [
    '/mockups/Vitalis-dashboard_mb-mockup.jpeg',
    '/mockups/Vitalis-receitas_mb-mockup.jpeg',
    '/mockups/Vitalis-coach_mb-mockup.jpeg',
    '/mockups/Vitalis-treinos_mb-mockup.jpeg',
    '/mockups/Vitalis-espaçoretorno_mb-mockup.jpeg',
    '/mockups/mozproud-vitalis.jpeg',
  ],
  aurea: [
    '/mockups/Aurea-Dash-portrait.png',
    '/mockups/Aurea-praticas-portrait.png',
    '/mockups/Aurea-Dash-left.png',
    '/mockups/Aurea-praticas-left.png',
  ],
  serena: [
    '/mockups/Serena-dash-portrait.png',
    '/mockups/Serena-praticas-portrait.png',
    '/mockups/Serena-dash-left.png',
    '/mockups/Serena-praticas-left.png',
  ],
  ignis: [
    '/mockups/Ignis-dash-portrait.png',
    '/mockups/Ignis-escolhas-portrait.png',
    '/mockups/Ignis-dash-left.png',
    '/mockups/Ingis-bussula-left.png',
  ],
  ventis: [
    '/mockups/Ventis-dash-portrait.png',
    '/mockups/Ventis-praticas-portrait.png',
    '/mockups/Ventis-dash-left.png',
    '/mockups/Ventis-praticas-left.png',
  ],
  ecoa: [
    '/mockups/Ecoa-dash-portrait.png',
    '/mockups/Ecoa-praticas-portrait.png',
    '/mockups/Ecoa-dash-left.png',
    '/mockups/Ecoa-praticas-left.png',
  ],
  imago: [
    '/mockups/Imago-dash-portrait.png',
    '/mockups/Imago-arqueologia-portrait.png',
    '/mockups/Imago-dash-left.png',
    '/mockups/Imago-arqueologia-left.png',
  ],
};

export function getMockupsEco(eco) {
  return ECO_MOCKUPS[eco] || ECO_MOCKUPS.vitalis;
}

export function getConteudosMockupVitalis() {
  const linkVitalis = buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.instagramBio());
  const linkLumina = buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.instagramBio('lumina'));

  return [
    // ========== POST 1 - LANÇAMENTO ==========
    {
      numero: 1,
      tipo: 'feed',
      titulo: 'Saúde real. Feita para nós.',
      descricao: 'Post de apresentação — inteligência nutricional e desportiva',
      imagens: [MOCKUP_IMAGES.mozproud],
      caption: `Saúde real. Feita para ti. 🌿

Não é mais um app de dieta genérico.
Não é mais uma lista de "não comas isto".

É uma plataforma inteira de inteligência nutricional e desportiva. Personalizada. Com ciência. Com emoção.

Chama-se VITALIS. E está dentro do @seteecos.

98 receitas equilibradas. Coach disponível 24h. Treinos adaptados ao teu ciclo. Espaço para quando a emoção pesa mais que a fome.

Saúde inteligente. Para ti. 🌿

Link na bio.

#vitalis #seteecos #saudereal #transformacaopessoal #inteligencianutricional #nutricao #bemestar #coachingnutricional #saude #wellness`,
      whatsapp: `🌿 *VITALIS - Inteligência nutricional e desportiva.*

Finalmente uma plataforma de saúde que entende a pessoa inteira.

98 receitas equilibradas. Coach 24h. Treinos que respeitam o teu corpo.

Não é dieta. É cuidado.

👉 ${linkVitalis}

Segue @seteecos no Instagram para acompanhar 🌿`,
      melhorHora: '8h ou 18h',
      dica: 'Primeiro post do perfil. Fixa-o no topo do feed.',
    },

    // ========== POST 2 - DASHBOARD TOUR ==========
    {
      numero: 2,
      tipo: 'feed',
      titulo: 'Isto é o VITALIS por dentro.',
      descricao: 'Mostrar o dashboard real - prova social e profissionalismo',
      imagens: [MOCKUP_IMAGES.dashboard],
      caption: `Isto é o VITALIS por dentro. 📱

Não é um PDF.
Não é um grupo de WhatsApp.
Não é uma lista genérica.

É uma app completa no teu telemóvel:

📋 Meu Plano - personalizado para ti
✅ Check-in diário - água, sono, emoção
🍽 Refeições - registo fácil
📖 Receitas - 98, equilibradas e variadas
💜 Espaço Retorno - para quando precisas de parar
📊 Relatórios - vê a tua evolução
💪 Treinos - adaptados à tua fase

Tudo num só lugar. Tudo feito para TI.

Link na bio. Envia DM para saber mais. 🌿

#vitalis #seteecos #appsaude #dashboard #planoalimentar #coachingnutricional #saudereal #bemestar #tecnologia #wellness`,
      whatsapp: `📱 *Já viste o VITALIS por dentro?*

Olha o que tens quando entras:
📋 Plano personalizado
✅ Check-in diário
📖 98 receitas locais
💜 Espaço emocional
📊 Relatórios
💪 Treinos

Tudo no teu telemóvel. Envia-me mensagem para saber como começar 🌿

👉 ${linkVitalis}`,
      melhorHora: '12h-14h (pausa do almoço)',
      dica: 'Mostra que é real e profissional. O mockup impressiona.',
    },

    // ========== POST 3 - COACH 24h ==========
    {
      numero: 3,
      tipo: 'feed',
      titulo: 'Uma coach que nunca dorme.',
      descricao: 'Destaque para a Coach IA - diferencial único',
      imagens: [MOCKUP_IMAGES.coach],
      caption: `3 da manhã. Não consegues dormir. A ansiedade aperta. Abres o frigorífico.

E se em vez disso... abrires uma conversa com alguém que te entende?

Conhece a Vivianne. A tua Coach Vitalis. 🤍

Disponível 24 horas. Sem julgamento. Sem espera.

Pergunta sobre porções. 🤲
Monta o teu prato. 🍽
Tira dúvidas sobre jejum. ⏰
Adapta o treino ao teu dia. 💪
Precisa de ajuda geral? Ela está lá. 💚

Isto não é um chatbot genérico. É coaching nutricional REAL, sempre disponível.

Link na bio. 🌿

#vitalis #seteecos #coachnutricional #IA #coachingonline #disponivel24h #saudereal #saudedigital #nutricao #apoioemocional`,
      whatsapp: `🤖 *Imagina ter uma coach de nutrição disponível às 3 da manhã.*

Sem julgamento. Sem espera. Sem marcação.

A Coach Vivianne no VITALIS responde-te SEMPRE:
🤲 Porções certas
🍽 Como montar o prato
⏰ Jejum
💪 Treino
💚 O que precisares

👉 ${linkVitalis}

Experimenta. Está lá para ti. 🌿`,
      melhorHora: '21h-23h (quando a ansiedade nocturna aparece)',
      dica: 'Este post toca na dor real da solidão nocturna com comida.',
    },

    // ========== POST 4 - RECEITAS LOCAIS ==========
    {
      numero: 4,
      tipo: 'feed',
      titulo: '98 receitas. Todas com comida real.',
      descricao: 'Biblioteca de receitas equilibradas e variadas',
      imagens: [MOCKUP_IMAGES.receitas],
      caption: `98 receitas. Nenhuma pede quinoa. 🍽

Comida real. Equilibrada. Saborosa.

A Biblioteca de Receitas do VITALIS tem:

🥘 Pratos tradicionais
🥗 Opções leves
🍲 Comfort food saudável
🥙 Rápidas do dia-a-dia
🌍 Internacionais

Cada receita filtrada para o TEU perfil. Compatível com as tuas necessidades. Ingredientes que encontras em qualquer mercado.

Chega de dietas com comida que não existe na tua realidade.

Link na bio. 🌿

#vitalis #seteecos #receitassaudaveis #comidadeverdade #receitas #nutricaointeligente #saudavel #bemestar #coachingnutricional #saudereal`,
      whatsapp: `🍽 *98 receitas e NENHUMA pede quinoa.*

O VITALIS tem uma biblioteca inteira de receitas:
🥘 Pratos tradicionais
🥗 Opções leves
🍲 Comfort food saudável
🥙 Rápidas do dia-a-dia

Filtradas para o teu perfil. Com comida real e acessível.

Sem listas impossíveis. Comida REAL.

👉 ${linkVitalis}`,
      melhorHora: '11h-12h (antes do almoço)',
      dica: 'O argumento "comida real e acessível" é o mais forte. As pessoas estão fartas de dietas impossíveis.',
    },

    // ========== POST 5 - ESPAÇO EMOCIONAL ==========
    {
      numero: 5,
      tipo: 'feed',
      titulo: 'O que estás a sentir agora?',
      descricao: 'Espaço de Retorno Emocional - o grande diferencial',
      imagens: [MOCKUP_IMAGES.espacoRetorno],
      caption: `O que estás a sentir agora? 💜

Cansaço. Ansiedade. Tristeza. Raiva. Vazio. Solidão.

Não há resposta errada. Só observa.

Isto é o Espaço de Retorno do VITALIS. O lugar dentro da app onde não se fala de comida. Fala-se de TI.

Porque 80% dos problemas com alimentação são emocionais. E nenhuma dieta do mundo resolve isso.

Antes de mudar o que comes, precisas de entender PORQUE comes.

Este espaço existe para isso. 🤍

Link na bio.

#vitalis #seteecos #saudeemocional #espacoseguro #ansiedade #cansaco #emocoes #autocuidado #saudementalimporta #saudereal #bemestar`,
      whatsapp: `💜 *Antes de mudar o que comes, precisas de entender PORQUE comes.*

O VITALIS tem um Espaço de Retorno Emocional.

Cansaço? Ansiedade? Tristeza? Solidão?

Não é terapia. É um espaço para parares e observares o que sentes. Sem julgamento.

Porque 80% dos problemas com comida são emocionais.

👉 ${linkVitalis}`,
      melhorHora: '20h-22h (momento introspectivo)',
      dica: 'Post mais emocional. As cores vibrantes do ecrã chamam muita atenção no feed.',
    },

    // ========== POST 6 - TREINO + CICLO ==========
    {
      numero: 6,
      tipo: 'feed',
      titulo: 'O teu treino adapta-se ao teu ciclo.',
      descricao: 'Treinos por fase do ciclo menstrual - único no mercado',
      imagens: [MOCKUP_IMAGES.treinos],
      caption: `Sabias que treinar intenso na fase errada pode PREJUDICAR-TE? 🌙

O VITALIS não te dá um plano de treino genérico. Adapta-se ao TEU ciclo:

🌙 Menstrual (Dias 1-5) → Descanso e movimento suave
🌸 Folicular (Dias 6-14) → Energia a subir, mais intensidade
☀️ Ovulação (Dias 14-17) → Pico de energia, treino forte
🍂 Lútea (Dias 18-28) → Abrandar, focar em recuperação

Frequência. Duração. Intensidade. Tudo personalizado à tua fase.

Isto não é um app de fitness. É um app que te ENTENDE. 🌿

Link na bio.

#vitalis #seteecos #ciclomenstrual #treinointeligente #fasemenstrual #ovulacao #fitness #saudepessoal #hormonal #saudereal #bemestar #treino`,
      whatsapp: `🌙 *O teu treino devia mudar conforme o teu ciclo menstrual.*

No VITALIS, muda:

🌙 Menstrual → Descanso
🌸 Folicular → Mais energia
☀️ Ovulação → Treino forte
🍂 Lútea → Recuperação

Frequência, duração, intensidade - tudo adaptado a TI.

Nenhum outro app de coaching faz isto.

👉 ${linkVitalis}`,
      melhorHora: '7h-9h (motivação matinal)',
      dica: 'Conteúdo educativo + produto. O ciclo menstrual é tema viral e educativo.',
    },

    // ========== CARROSSEL 7 - 5 RAZÕES ==========
    {
      numero: 7,
      tipo: 'carrossel',
      titulo: '5 coisas que o VITALIS faz por ti',
      descricao: 'Carrossel mostrando cada funcionalidade com mockup real',
      imagens: [
        MOCKUP_IMAGES.mozproud,
        MOCKUP_IMAGES.receitas,
        MOCKUP_IMAGES.coach,
        MOCKUP_IMAGES.treinos,
        MOCKUP_IMAGES.espacoRetorno,
        MOCKUP_IMAGES.dashboard,
      ],
      slides: [
        { texto: '5 coisas que o VITALIS faz por ti', subtitulo: 'Desliza →' },
        { texto: '1. 98 receitas equilibradas e variadas', subtitulo: 'Tradicionais, Internacionais, Rápidas, Comfort food' },
        { texto: '2. Coach disponível 24h', subtitulo: 'Sem espera. Sem julgamento. Sempre lá.' },
        { texto: '3. Treinos adaptados ao ciclo', subtitulo: 'Menstrual, Folicular, Ovulação, Lútea' },
        { texto: '4. Espaço emocional só teu', subtitulo: 'Porque 80% dos problemas com comida são emocionais' },
        { texto: '5. Dashboard completo', subtitulo: 'Plano, check-in, refeições, relatórios. Tudo num sítio.' },
      ],
      caption: `5 coisas que o VITALIS faz por ti e que nenhuma dieta faz. 🌿

Desliza para ver cada uma →

1️⃣ 98 receitas com comida real e acessível
2️⃣ Coach disponível 24 horas por dia
3️⃣ Treinos que se adaptam ao teu ciclo menstrual
4️⃣ Espaço emocional para os dias difíceis
5️⃣ Dashboard completo - tudo no teu telemóvel

Isto não é uma dieta. É um sistema inteiro de cuidado.

Envia DM para saber como começar. 7 dias de garantia.

Link na bio 🤍

#vitalis #seteecos #coachingnutricional #5razoes #carrossel #saudavel #bemestar #saudereal #planoalimentar #wellness`,
      whatsapp: `🌿 *5 coisas que o VITALIS faz por ti:*

1️⃣ 98 receitas equilibradas
2️⃣ Coach disponível 24h
3️⃣ Treinos adaptados ao ciclo
4️⃣ Espaço emocional
5️⃣ Dashboard completo

Envia DM para saber como começar. 7 dias de garantia.

👉 ${linkVitalis}`,
      melhorHora: '12h-14h',
      dica: 'Carrosséis têm o MAIOR alcance no Instagram. Publica este nos primeiros 3 dias.',
    },

    // ========== CARROSSEL 8 - DIETAS vs VITALIS ==========
    {
      numero: 8,
      tipo: 'carrossel',
      titulo: 'Dietas vs VITALIS',
      descricao: 'Comparação provocadora - formato viral',
      imagens: [
        MOCKUP_IMAGES.mozproud,
        MOCKUP_IMAGES.receitas,
        MOCKUP_IMAGES.espacoRetorno,
        MOCKUP_IMAGES.coach,
        MOCKUP_IMAGES.dashboard,
      ],
      slides: [
        { texto: 'DIETAS vs VITALIS', subtitulo: 'Desliza para ver a diferença →' },
        { texto: '❌ Dietas: "Não comas arroz"\n✅ VITALIS: 98 receitas com comida real e saborosa', subtitulo: '' },
        { texto: '❌ Dietas: "Tens de ter força de vontade"\n✅ VITALIS: Espaço emocional para quando recaís', subtitulo: '' },
        { texto: '❌ Dietas: "Segue este plano genérico"\n✅ VITALIS: Coach 24h que te responde a QUALQUER hora', subtitulo: '' },
        { texto: '❌ Dietas: "Pesa-te todos os dias"\n✅ VITALIS: Dashboard que mede progresso REAL (não só peso)', subtitulo: '' },
      ],
      caption: `DIETAS vs VITALIS 🥊

As dietas dizem-te para NÃO comer.
O VITALIS ensina-te a CUIDAR de ti.

Desliza para ver as 4 diferenças que mudam tudo →

Se já conheces o ciclo dieta-culpa-desistência, talvez estejas a precisar de algo diferente.

Link na bio. 🌿

#vitalis #seteecos #dietasnao #semdieta #comidareal #comparacao #mudanca #saudavel #bemestar #saudereal #antidieta #nutricaointuitiva`,
      whatsapp: `🥊 *DIETAS vs VITALIS*

❌ "Não comas arroz" → ✅ 98 receitas reais e saborosas
❌ "Força de vontade" → ✅ Espaço emocional
❌ "Plano genérico" → ✅ Coach 24h
❌ "Pesa-te todos os dias" → ✅ Progresso real

Cansado/a de dietas? Experimenta algo diferente.

👉 ${linkVitalis}`,
      melhorHora: '10h-12h',
      dica: 'Formato "vs" é altamente viral. Convida as pessoas a guardar e partilhar.',
    },

    // ========== CARROSSEL 9 - TOUR COMPLETO ==========
    {
      numero: 9,
      tipo: 'carrossel',
      titulo: 'Tour pela app em 7 ecrãs',
      descricao: 'Mostrar TODOS os mockups em sequência - tour visual completo',
      imagens: [
        MOCKUP_IMAGES.landingPC,
        MOCKUP_IMAGES.dashboard,
        MOCKUP_IMAGES.receitas,
        MOCKUP_IMAGES.coach,
        MOCKUP_IMAGES.treinos,
        MOCKUP_IMAGES.espacoRetorno,
        MOCKUP_IMAGES.mozproud,
      ],
      slides: [
        { texto: 'VITALIS - A raiz da transformação', subtitulo: 'Tour pela app. Desliza →' },
        { texto: 'O teu Dashboard pessoal', subtitulo: 'Plano, check-in, progresso, tudo organizado' },
        { texto: 'Biblioteca de 98 Receitas', subtitulo: 'Filtro por tipo de refeição, perfil e preferências' },
        { texto: 'Coach Vivianne - 24h disponível', subtitulo: 'Porções, prato, jejum, treino. Pergunta o que quiseres.' },
        { texto: 'Treinos por fase do ciclo', subtitulo: 'Menstrual → Folicular → Ovulação → Lútea' },
        { texto: 'Espaço de Retorno Emocional', subtitulo: 'Para quando o problema não é a comida. É a emoção.' },
        { texto: 'Saúde real. Inteligência nutricional.', subtitulo: 'Coaching personalizado 🌿' },
      ],
      caption: `Tour pela app VITALIS 📱✨

7 ecrãs. 7 razões para nunca mais fazeres dieta.

Desliza para ver o que recebes →

🖥 Landing profissional
📱 Dashboard completo
📖 98 receitas equilibradas e variadas
🤖 Coach Vivianne disponível 24h
💪 Treinos adaptados ao ciclo menstrual
💜 Espaço de retorno emocional
🧠 Inteligência nutricional e desportiva

Isto é coaching nutricional de verdade. No teu telemóvel.

Link na bio. Envia DM para saber mais. 🌿

#vitalis #seteecos #tourapp #plataforma #saudedigital #nutricao #coachingnutricional #saudereal #bemestar #bemestar #tecnologia`,
      whatsapp: `📱 *Queres ver o VITALIS por dentro?*

Fiz um tour pela app:

🖥 Landing profissional
📱 Dashboard completo
📖 98 receitas equilibradas
🤖 Coach 24h
💪 Treinos por ciclo menstrual
💜 Espaço emocional
🧠 Inteligência nutricional

Vê tudo aqui: ${linkVitalis}`,
      melhorHora: '15h-17h',
      dica: 'Carrossel "tour" funciona como prova. Mostra que é REAL, não promessa vazia.',
    },

    // ========== REEL 10 - UM DIA COM VITALIS ==========
    {
      numero: 10,
      tipo: 'reel',
      titulo: 'Um dia com VITALIS',
      descricao: 'Reel mostrando rotina diária com a app - formato "day in my life"',
      imagens: [MOCKUP_IMAGES.dashboard, MOCKUP_IMAGES.coach, MOCKUP_IMAGES.receitas],
      roteiro: `🎬 *REEL: "Um dia com VITALIS"*
Duração: 30-45 segundos
Música: trending calm/motivacional
Formato: gravação de ecrã do telemóvel + texto animado (sem câmara, sem voz)

---

🕗 *MANHÃ (0-8s)*
[Gravação de ecrã: abrir app, mostrar Dashboard]
TEXTO NO ECRÃ: "7:30 — Acordo. Abro o VITALIS. Frase do dia. ☀️"

🕐 *ALMOÇO (8-18s)*
[Gravação de ecrã: navegar para Receitas, scroll]
TEXTO NO ECRÃ: "12:30 — Receita rápida. Hoje: caril de coco com legumes 🍽"

🕓 *TARDE (18-28s)*
[Gravação de ecrã: abrir Chat com Coach]
TEXTO NO ECRÃ: "16:00 — Momento difícil? A coach está lá 💚"

🕘 *NOITE (28-35s)*
[Mostrar mozproud-vitalis]
TEXTO NO ECRÃ: "VITALIS. Saúde real. Feita para nós. 🌿 Link na bio"

---
CAPTION: Mostra abaixo.`,
      caption: `Um dia com VITALIS. 🌿

Não é mais uma app de dieta.
É a tua companheira de todos os dias.

De manhã: check-in e motivação ☀️
Ao almoço: receita rápida do mercado 🍽
À tarde: coach para os momentos difíceis 💚
À noite: reflexão e progresso 📊

Queres experimentar este dia?
Link na bio. 🤍

#vitalis #seteecos #reels #umdiacomvitalis #rotina #saudavel #dayinmylife #saudereal #bemestar #wellness #nutricao`,
      whatsapp: `🎬 *Viste o meu reel "Um dia com VITALIS"?*

De manhã: check-in
Ao almoço: receita local
À tarde: coach para a ansiedade
À noite: progresso

É isto todos os dias. No telemóvel.

👉 ${linkVitalis}`,
      melhorHora: '18h-20h (pico de reels)',
      dica: 'Grava o ecrã real do telemóvel. A autenticidade vende mais que perfeição.',
    },

    // ========== REEL 11 - POV TRENDING ==========
    {
      numero: 11,
      tipo: 'reel',
      titulo: 'POV: Alguém te envia um link...',
      descricao: 'Formato trending "POV" com reveal da app',
      imagens: [MOCKUP_IMAGES.espacoRetorno, MOCKUP_IMAGES.dashboard, MOCKUP_IMAGES.mozproud],
      roteiro: `🎬 *REEL: "POV: Alguém te envia um link..."*
Duração: 20-30 segundos
Música: trending com "build-up" (suspense → reveal)
Formato: texto no ecrã + gravação de ecrã da app (sem câmara, sem voz)

---

*CENA 1 (0-5s)* - HOOK
[Fundo escuro ou gradiente]
TEXTO NO ECRÃ: "POV: Alguém te envia um link e diz 'experimenta isto, confia em mim'"
🎵 Música calma, suspense

*CENA 2 (5-10s)* - ABERTURA
[Gravação de ecrã: abrir a app, mostrar a pergunta "O que estás a sentir agora?"]
TEXTO NO ECRÃ: "Abres e... 👀"
🎵 Build-up

*CENA 3 (10-18s)* - REVEAL
[Gravação de ecrã: scroll pelo dashboard completo, receitas, coach]
TEXTO NO ECRÃ: "98 receitas. Coach 24h. Treinos por ciclo. Espaço emocional."
🎵 Drop da música

*CENA 4 (18-25s)* - CTA
[Mostrar mozproud-vitalis]
TEXTO NO ECRÃ: "VITALIS - Inteligência nutricional e desportiva. 🌿"
TEXTO NO ECRÃ: "Envia este reel a quem precisa 🤍"

---
CAPTION: Mostra abaixo.`,
      caption: `POV: Alguém te envia um link e diz "confia em mim" 🤍

E depois descobres uma app inteira de inteligência nutricional e desportiva.

Com receitas reais. Coach que te ouve às 3 da manhã. Treinos que respeitam o teu ciclo.

E um espaço para quando o problema não é a comida. É a emoção.

Marca alguém nos comentários que precisa de ver isto. 👇🏾

Link na bio 🌿

#vitalis #seteecos #pov #reels #trending #bemestar #saudereal #surprise #saudavel #wellness`,
      whatsapp: `👀 *Vi um reel que me fez lembrar de ti.*

Uma app de inteligência nutricional e desportiva com:
🍽 98 receitas equilibradas
🤖 Coach 24h
💪 Treinos por ciclo menstrual
💜 Espaço emocional

Abre e vê: ${linkVitalis}

Depois diz-me o que achaste 🤍`,
      melhorHora: '19h-21h',
      dica: 'O formato POV é dos mais virais do Instagram. Pede para a audiência marcar alguém.',
    },

    // ========== REEL 12 - PORQUÊ O VITALIS ==========
    {
      numero: 12,
      tipo: 'reel',
      titulo: 'Porquê o VITALIS existe.',
      descricao: 'Reel emotivo sobre a origem do projecto - storytelling pessoal',
      imagens: [MOCKUP_IMAGES.mozproud, MOCKUP_IMAGES.landingPC, MOCKUP_IMAGES.dashboard],
      roteiro: `🎬 *REEL: "Porquê o VITALIS existe."*
Duração: 30-45 segundos
Música: instrumental emotiva (piano suave ou lo-fi)
Formato: texto no ecrã + transições entre mockups da app (sem câmara, sem voz)

---

*CENA 1 (0-8s)* - HOOK PESSOAL
[Fundo escuro com texto animado]
TEXTO NO ECRÃ: "Quando procurei ajuda para a minha alimentação, tudo era genérico."
TEXTO NO ECRÃ: "Planos copiados. Sem emoção. Sem ciência real. 🌿"

*CENA 2 (8-16s)* - O PROBLEMA
[Transição para mockup da landing page PC]
TEXTO NO ECRÃ: "Nenhuma app perguntava como me sentia."
TEXTO NO ECRÃ: "Nenhuma entendia que 80% dos problemas com comida são emocionais."
TEXTO NO ECRÃ: "A saúde merece inteligência."

*CENA 3 (16-28s)* - A SOLUÇÃO
[Transição entre mockups: landing PC → dashboard → receitas → coach]
TEXTO NO ECRÃ: "Então criei o VITALIS."
TEXTO NO ECRÃ: "98 receitas equilibradas. Coach 24h. Treinos que respeitam o teu corpo."
TEXTO NO ECRÃ: "VITALIS - A raiz da transformação 🌿"

*CENA 4 (28-40s)* - VISÃO
[Mostrar mozproud-vitalis.jpeg]
TEXTO NO ECRÃ: "Inteligência nutricional e desportiva."
TEXTO NO ECRÃ: "Coaching que entende a pessoa inteira. 🌿 Link na bio"

---
CAPTION: Mostra abaixo.`,
      caption: `Quando procurei ajuda para a minha alimentação, só encontrei planos genéricos. Listas de proibições. Sem emoção. Sem ciência.

Nenhuma app perguntava como me sentia. Nenhuma entendia que 80% dos problemas com comida são emocionais.

Então criei o VITALIS. 🌿

98 receitas equilibradas.
Coach disponível 24 horas.
Treinos que respeitam o teu ciclo.
Espaço para quando a emoção pesa mais que a fome.

Inteligência nutricional e desportiva. Para ti. 🌿

Se acreditas que a saúde merece mais do que proibições, partilha este reel. 🤍

Link na bio.

#vitalis #seteecos #wellness #saudereal #inteligencianutricional #coachingdigital #tecnologia #saude #bemestar #transformacaopessoal #coachingnutricional #inovacao`,
      whatsapp: `🌿 *Criei algo que gostava que existisse quando precisei.*

Nenhuma app perguntava como me sentia. Nenhuma entendia que o problema raramente é a comida.

Então criei o VITALIS:
📖 98 receitas equilibradas
🤖 Coach 24h
💪 Treinos por ciclo
💜 Espaço emocional

Inteligência nutricional e desportiva. Para ti.

👉 ${linkVitalis}

Partilha com quem precisa disto 🤍`,
      melhorHora: '18h-20h',
      dica: 'O mais emotivo de todos. Storytelling pessoal + orgulho nacional = viral garantido.',
    },
  ];
}

// ============================================================
// MENSAGENS WHATSAPP COM MOCKUPS
// Para enviar com as imagens reais da app
// ============================================================

export function getMensagensWhatsAppMockups() {
  const linkVitalis = buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappBroadcast());
  const linkLumina = buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.whatsappBroadcast('lumina'));

  return [
    {
      titulo: 'Lançamento — inteligência nutricional',
      imagem: MOCKUP_IMAGES.mozproud,
      mensagem: `🌿 *VITALIS - Inteligência nutricional e desportiva.*

Criei uma plataforma inteira de coaching nutricional personalizado.

Não é dieta. Não é restrição. É ciência + emoção.

📖 98 receitas equilibradas e variadas
🤖 Coach disponível 24 horas
💪 Treinos adaptados ao teu ciclo
💜 Espaço emocional para os dias difíceis

Envia DM para saber mais.

👉 ${linkVitalis}

Se te identificas, experimenta. Se conheces alguém que precisa, encaminha esta mensagem. 🌿`,
    },
    {
      titulo: 'Dashboard - mostrar a app real',
      imagem: MOCKUP_IMAGES.dashboard,
      mensagem: `📱 *Olha o que recebes quando entras no VITALIS:*

✨ Frase motivacional diária
🔥 Contador de dias consecutivos
📋 Meu Plano personalizado
✅ Check-in (água, sono, emoção)
🍽 Registo de refeições
📖 98 receitas filtradas para ti
💜 Espaço de retorno emocional
📊 Relatórios de evolução
💪 Treinos por fase do ciclo

Tudo isto no teu telemóvel. Envia DM para saber como começar.

Não é um PDF. Não é um grupo. É uma app COMPLETA.

👉 ${linkVitalis}`,
    },
    {
      titulo: 'Coach - apoio 24h',
      imagem: MOCKUP_IMAGES.coach,
      mensagem: `🤍 *Imagina ter alguém que te responde às 3 da manhã. Sem julgamento.*

A Coach Vivianne no VITALIS ajuda-te com:

🤲 Porções certas para ti
🍽 Como montar o prato
⏰ Dúvidas sobre jejum
💪 Adaptar o treino
❓ Qualquer pergunta sobre nutrição

Sempre disponível. Sempre paciente.

Se já te sentiste sozinho/a nesta jornada, isto é para ti.

👉 ${linkVitalis}`,
    },
    {
      titulo: 'Receitas — comida real',
      imagem: MOCKUP_IMAGES.receitas,
      mensagem: `🍽 *98 receitas. ZERO quinoa.*

O VITALIS tem uma biblioteca inteira com:

🥘 Pratos tradicionais
🥗 Opções leves
🍲 Comfort food saudável
🥙 Rápidas do dia-a-dia
🌍 Internacionais

Cada receita filtrada para o teu perfil e as tuas necessidades.

Ingredientes reais e acessíveis. Não do supermercado gourmet.

👉 ${linkVitalis}

🌿`,
    },
    {
      titulo: 'Espaço emocional',
      imagem: MOCKUP_IMAGES.espacoRetorno,
      mensagem: `💜 *"O que estás a sentir agora?"*

Esta é a primeira pergunta do Espaço de Retorno no VITALIS.

Cansaço. Ansiedade. Tristeza. Raiva. Vazio. Solidão. Negação.

Sem resposta errada. Só observação.

Porque antes de mudar o que COMES, precisas de entender o que SENTES.

80% dos problemas com comida são emocionais. E nenhuma dieta resolve isso.

O VITALIS é o primeiro programa que cuida de AMBOS.

👉 ${linkVitalis}`,
    },
    {
      titulo: 'Treinos por ciclo',
      imagem: MOCKUP_IMAGES.treinos,
      mensagem: `🌙 *O teu corpo muda ao longo do mês. O teu treino devia mudar também.*

No VITALIS, o treino adapta-se ao teu ciclo menstrual:

🌙 Menstrual (Dias 1-5) → Repouso, movimento suave
🌸 Folicular (Dias 6-14) → Energia a subir
☀️ Ovulação (Dias 14-17) → Pico de força
🍂 Lútea (Dias 18-28) → Recuperação

Frequência, duração, intensidade - tudo muda conforme a TUA fase.

Nenhuma outra app de coaching faz isto.

👉 ${linkVitalis}

🌿`,
    },
    {
      titulo: 'Landing PC - credibilidade',
      imagem: MOCKUP_IMAGES.landingPC,
      mensagem: `🖥 *VITALIS - A raiz da transformação*

Coaching nutricional personalizado. Dashboard completo. 98 receitas. Coach 24h. Treinos por ciclo. Apoio emocional.

Plataforma profissional. Acessível. Inteligente.

Método Precision Nutrition adaptado a ti.

Envia DM para saber como começar.

Vê a plataforma: ${linkVitalis} 🌿`,
    },
  ];
}

// ============================================================
// SETUP INSTAGRAM - Perfil pronto a copiar
// ============================================================

export function getSetupInstagram() {
  return {
    nome: 'Sete Ecos 🌿',
    username: '@seteecos',
    bio: `Transmutação Integral 🌿
Comida · Emoção · Corpo · Mente · Voz · Identidade
🧠 Inteligência nutricional e desportiva
🔮 LUMINA: diagnóstico gratuito ↓
🌱 7 módulos de transformação ↓`,
    link: 'https://app.seteecos.com/lumina',
    linkTexto: 'app.seteecos.com/lumina',
    categoria: 'Saúde/Beleza',
    destaques: [
      { nome: '🔮 LUMINA', descricao: 'Screenshots do LUMINA + resultados + reacções', cor: 'roxo/azul' },
      { nome: '🌿 VITALIS', descricao: 'Tour pela app + funcionalidades + preço', cor: 'verde sage' },
      { nome: '📖 RECEITAS', descricao: 'Screenshots de receitas + comida local', cor: 'verde' },
      { nome: '💜 EMOÇÃO', descricao: 'Espaço de retorno + dicas emocionais', cor: 'roxo' },
      { nome: '🗣 EU', descricao: 'Vivianne: quem sou, a minha história, bastidores', cor: 'dourado' },
      { nome: '💬 OPINIÕES', descricao: 'Screenshots de feedbacks + testemunhos', cor: 'branco' },
    ],
    fotoPerfil: 'Logo Sete Ecos ou imagem ilustrativa (sem foto pessoal).',
    primeirosPassos: [
      'Muda para conta Profissional (Criador de Conteúdo > Saúde/Beleza)',
      'Coloca a bio exactamente como está acima',
      'Link na bio: app.seteecos.com/lumina (LUMINA primeiro, porque é gratuito)',
      'Publica os 3 primeiros posts antes de seguir qualquer pessoa',
      'Segue 50-100 contas relevantes (saúde, bem-estar, nutrição, fitness)',
      'Activa notificações das contas que segues para interagir cedo',
    ],
  };
}

// ============================================================
// CALENDÁRIO 6 DIAS - Tudo pronto, dia a dia, hora a hora
// Cada entrada tem TUDO: o que publicar, onde, quando, textos, imagens
// ============================================================

export function getCalendario6Dias() {
  const conteudos = getConteudosMockupVitalis();
  const mensagensWA = getMensagensWhatsAppMockups();

  // Map posts by number for easy reference
  const post = (n) => conteudos.find(c => c.numero === n);

  return [
    // =================== DIA 1 ===================
    {
      dia: 1,
      titulo: 'DIA 1 — Lançamento do Perfil',
      subtitulo: 'Hoje crias o perfil e publicas os primeiros posts. Impacto máximo.',
      tarefas: [
        {
          hora: '08:00',
          tipo: 'setup',
          titulo: 'Configurar perfil Instagram',
          descricao: 'Bio, foto, destaques, link. Tudo conforme o guia de Setup acima.',
          accao: 'Copiar bio → Colar no Instagram → Meter foto → Link na bio',
        },
        {
          hora: '09:00',
          tipo: 'post',
          titulo: 'Post #1 — Saúde real. Feita para nós.',
          descricao: 'O post de apresentação. FIXA NO TOPO DO FEED.',
          post: post(1),
          accao: 'Descarregar imagem mozproud → Publicar → Copiar caption → Fixar post no perfil',
        },
        {
          hora: '10:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Anunciar aos contactos',
          descricao: 'Envia para TODOS os contactos e grupos relevantes.',
          mensagemWA: mensagensWA[0],
          accao: 'Copiar mensagem → Abrir WhatsApp → Enviar para listas de broadcast + grupos + contactos individuais',
        },
        {
          hora: '12:00',
          tipo: 'post',
          titulo: 'Post #7 — Carrossel: 5 coisas que o VITALIS faz',
          descricao: 'Carrossel = mais alcance no Instagram. Publica este como 2º post.',
          post: post(7),
          accao: 'Descarregar os 6 slides → Publicar como carrossel → Copiar caption',
        },
        {
          hora: '14:00',
          tipo: 'stories',
          titulo: 'Stories: 5 slides de apresentação',
          stories: [
            { texto: 'Texto sobre fundo: "Hoje começa algo novo 🌿"', tipo: 'texto' },
            { texto: 'Screenshot do post #1 (mozproud) + "Segue @seteecos"', tipo: 'screenshot' },
            { texto: 'Mockup do dashboard + "Isto é o VITALIS por dentro 📱"', tipo: 'imagem' },
            { texto: 'Texto: "98 receitas equilibradas e saborosas 🍽"', tipo: 'texto' },
            { texto: 'Sticker de Link para app.seteecos.com/lumina + "Experimenta grátis 🔮"', tipo: 'link' },
          ],
          accao: 'Publicar os 5 stories ao longo da tarde (1 a cada 30min para manter engagement)',
        },
        {
          hora: '21:00',
          tipo: 'whatsapp',
          titulo: 'Status WhatsApp: Imagem mozproud',
          descricao: 'Coloca a imagem mozproud-vitalis no teu status do WhatsApp.',
          accao: 'Descarregar mozproud → Colocar como status → Adicionar texto "Segue @seteecos no Instagram 🌿"',
        },
      ],
    },

    // =================== DIA 2 ===================
    {
      dia: 2,
      titulo: 'DIA 2 — Emoção + Viral',
      subtitulo: 'Posts emocionais geram mais partilhas. Hoje é sobre conexão.',
      tarefas: [
        {
          hora: '08:00',
          tipo: 'post',
          titulo: 'Reel #12 — Porquê o VITALIS existe.',
          descricao: 'O reel mais emotivo. Storytelling pessoal = partilhas garantidas.',
          post: post(12),
          accao: 'Criar reel com texto em ecrã + mockups → Publicar → Copiar caption',
        },
        {
          hora: '10:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Enviar o reel',
          mensagemWA: mensagensWA[1],
          descricao: 'Envia o link do reel + mockup dashboard para contactos que não responderam ontem.',
          accao: 'Copiar mensagem → Enviar com imagem do dashboard',
        },
        {
          hora: '14:00',
          tipo: 'post',
          titulo: 'Post #5 — O que estás a sentir agora? 💜',
          descricao: 'Post emocional com ecrã do Espaço de Retorno. As cores vibrantes chamam atenção.',
          post: post(5),
          accao: 'Descarregar imagem espaço retorno → Publicar → Copiar caption',
        },
        {
          hora: '16:00',
          tipo: 'stories',
          titulo: 'Stories: Emoção + Bastidores',
          stories: [
            { texto: 'Texto sobre fundo: "Sabias que 80% dos problemas com comida são emocionais?"', tipo: 'texto' },
            { texto: 'Screenshot do Espaço de Retorno + "Isto existe dentro do VITALIS"', tipo: 'imagem' },
            { texto: 'Enquete: "Já comeste por ansiedade?" SIM / QUEM NUNCA', tipo: 'enquete' },
            { texto: 'Texto: "O VITALIS cuida da comida E da emoção ao mesmo tempo 🤍"', tipo: 'texto' },
            { texto: 'Link sticker para LUMINA: "Começa por aqui — gratuito 🔮"', tipo: 'link' },
          ],
          accao: 'Publicar ao longo da tarde. A enquete gera interacção!',
        },
        {
          hora: '21:00',
          tipo: 'interaccao',
          titulo: 'Interagir: comentar em 10 contas relevantes',
          descricao: 'Vai a contas de saúde/bem-estar e deixa comentários genuínos.',
          accao: 'Procurar #saudereal #bemestar → Comentar (não spam) → Seguir 20 contas relevantes',
        },
      ],
    },

    // =================== DIA 3 ===================
    {
      dia: 3,
      titulo: 'DIA 3 — Polémico + Prático',
      subtitulo: 'Conteúdo que desafia o status quo + valor prático concreto.',
      tarefas: [
        {
          hora: '09:00',
          tipo: 'post',
          titulo: 'Post #8 — Carrossel: Dietas vs VITALIS',
          descricao: 'Formato comparativo = comentários + partilhas. Polémico no bom sentido.',
          post: post(8),
          accao: 'Descarregar 5 slides → Publicar como carrossel → Copiar caption',
        },
        {
          hora: '11:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Receitas',
          mensagemWA: mensagensWA[3],
          descricao: 'Foco nas receitas locais — argumento mais forte.',
          accao: 'Copiar mensagem → Enviar com mockup receitas → Enviar para grupos de mães/cozinha',
        },
        {
          hora: '14:00',
          tipo: 'post',
          titulo: 'Post #4 — 98 receitas. Todas do mercado.',
          descricao: 'Post prático: mostra a biblioteca de receitas real.',
          post: post(4),
          accao: 'Descarregar imagem receitas → Publicar → Copiar caption',
        },
        {
          hora: '17:00',
          tipo: 'stories',
          titulo: 'Stories: Receitas + Enquete',
          stories: [
            { texto: 'Mockup receitas + "98 receitas e NENHUMA pede quinoa 😂"', tipo: 'imagem' },
            { texto: 'Enquete: "O que mais te faz recair?" STRESS / CANSAÇO', tipo: 'enquete' },
            { texto: 'Quiz: "Qual a melhor hora para treinar?" (depende do teu ciclo!)', tipo: 'quiz' },
            { texto: 'Mockup coach + "Dúvida sobre porções? Pergunta à coach 24h"', tipo: 'imagem' },
            { texto: 'Sticker link LUMINA', tipo: 'link' },
          ],
          accao: 'Enquetes e quizzes aumentam o alcance dos stories',
        },
      ],
    },

    // =================== DIA 4 ===================
    {
      dia: 4,
      titulo: 'DIA 4 — Trending + Diferencial',
      subtitulo: 'Reel trending para alcance + post que mostra o diferencial único.',
      tarefas: [
        {
          hora: '09:00',
          tipo: 'post',
          titulo: 'Reel #11 — POV: A tua amiga envia-te um link...',
          descricao: 'Formato trending POV. Potencial viral. Pede para marcar amigas.',
          post: post(11),
          accao: 'Criar reel com texto em ecrã + mockups → Usar áudio trending → Publicar',
        },
        {
          hora: '12:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Coach 24h',
          mensagemWA: mensagensWA[2],
          descricao: 'Destaque para a coach — diferencial único.',
          accao: 'Copiar mensagem → Enviar com mockup coach',
        },
        {
          hora: '15:00',
          tipo: 'post',
          titulo: 'Post #3 — Uma coach que nunca dorme.',
          descricao: 'Mostra o coach IA como diferencial único.',
          post: post(3),
          accao: 'Descarregar imagem coach → Publicar → Copiar caption',
        },
        {
          hora: '19:00',
          tipo: 'stories',
          titulo: 'Stories: Demo da Coach',
          stories: [
            { texto: 'Gravação de ecrã: abrir a coach e fazer uma pergunta sobre porções', tipo: 'gravacao' },
            { texto: 'Texto sobre fundo: "Impressionante, não?" + screenshot da resposta', tipo: 'texto' },
            { texto: 'Texto: "Disponível 24h. Sem julgamento. Sem espera."', tipo: 'texto' },
            { texto: 'Enquete: "Já tiveste dúvidas de nutrição às 3 da manhã?" SIM / NÃO', tipo: 'enquete' },
            { texto: 'Sticker link LUMINA', tipo: 'link' },
          ],
          accao: 'A gravação de ecrã real é OURO — mostra que é verdade',
        },
      ],
    },

    // =================== DIA 5 ===================
    {
      dia: 5,
      titulo: 'DIA 5 — Educativo + Nicho',
      subtitulo: 'Tour completo pela app + conteúdo especializado.',
      tarefas: [
        {
          hora: '09:00',
          tipo: 'post',
          titulo: 'Post #9 — Carrossel: Tour pela app em 7 ecrãs',
          descricao: 'Tour visual completo. Prova que a app é REAL.',
          post: post(9),
          accao: 'Descarregar 7 slides → Publicar como carrossel → Copiar caption',
        },
        {
          hora: '12:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Treinos por ciclo',
          mensagemWA: mensagensWA[5],
          descricao: 'Treinos adaptados ao ciclo menstrual — tema que gera conversa.',
          accao: 'Copiar mensagem → Enviar com mockup treinos',
        },
        {
          hora: '15:00',
          tipo: 'post',
          titulo: 'Post #6 — O teu treino adapta-se ao ciclo.',
          descricao: 'Conteúdo de nicho: ciclo menstrual + treino. Muito partilhável.',
          post: post(6),
          accao: 'Descarregar imagem treinos → Publicar → Copiar caption',
        },
        {
          hora: '18:00',
          tipo: 'stories',
          titulo: 'Stories: Ciclo Menstrual',
          stories: [
            { texto: 'Texto: "Sabias que treinar intenso na fase errada pode prejudicar-te?"', tipo: 'texto' },
            { texto: 'Mockup treinos + mostrar as 4 fases', tipo: 'imagem' },
            { texto: 'Slider: "Quanto sabes sobre o teu ciclo?" 🌙→☀️', tipo: 'slider' },
            { texto: 'Texto: "O VITALIS adapta o treino à tua fase. Automaticamente."', tipo: 'texto' },
            { texto: 'Sticker link VITALIS', tipo: 'link' },
          ],
          accao: 'Conteúdo educativo gera saves e partilhas',
        },
      ],
    },

    // =================== DIA 6 ===================
    {
      dia: 6,
      titulo: 'DIA 6 — Relatable + Profissional',
      subtitulo: 'Último dia da primeira vaga. Mostrar a app por dentro + reel relatable.',
      tarefas: [
        {
          hora: '09:00',
          tipo: 'post',
          titulo: 'Reel #10 — Um dia com VITALIS',
          descricao: 'Formato "day in my life" com a app. Relatable e aspiracional.',
          post: post(10),
          accao: 'Criar reel com gravação de ecrã da app → Publicar',
        },
        {
          hora: '12:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Landing + urgência suave',
          mensagemWA: mensagensWA[6],
          descricao: 'Última mensagem da semana. Mostra a plataforma profissional.',
          accao: 'Copiar mensagem → Enviar com mockup landing PC',
        },
        {
          hora: '15:00',
          tipo: 'post',
          titulo: 'Post #2 — Isto é o VITALIS por dentro.',
          descricao: 'Dashboard real da app. Profissionalismo. Prova social.',
          post: post(2),
          accao: 'Descarregar imagem dashboard → Publicar → Copiar caption',
        },
        {
          hora: '18:00',
          tipo: 'stories',
          titulo: 'Stories: Resumo da semana',
          stories: [
            { texto: 'Texto sobre fundo: "Esta semana foi especial. Obrigada por estarem aqui 🤍"', tipo: 'texto' },
            { texto: 'Texto: "Em 6 dias: [X] seguidores, [X] mensagens, [X] LUMINAs feitos"', tipo: 'texto' },
            { texto: 'Screenshot de uma mensagem/feedback recebido (com permissão)', tipo: 'screenshot' },
            { texto: 'Countdown: "Próxima semana: NOVIDADES 🌿"', tipo: 'countdown' },
            { texto: 'Sticker link LUMINA + "Ainda não experimentaste? É grátis 🔮"', tipo: 'link' },
          ],
          accao: 'Fechar a semana com gratidão e antecipação',
        },
        {
          hora: '21:00',
          tipo: 'analise',
          titulo: 'Analisar resultados da semana',
          descricao: 'Ver no Instagram Insights: alcance, seguidores, posts com melhor performance.',
          accao: 'Instagram → Insights → Ver top posts → Anotar o que funcionou melhor → Repetir na semana 2',
        },
      ],
    },
  ];
}

// ============================================================
// GUIA META DEVELOPER - Setup completo para auto-publicar
// ============================================================

export function getGuiaMetaDeveloper() {
  return {
    titulo: 'Configurar Publicacao Automatica no Instagram',
    descricao: 'Guia passo-a-passo para ligar o Sete Ecos ao Instagram via Meta Graph API. Depois de configurar, os posts publicam-se sozinhos.',
    tempoEstimado: '20-30 minutos',
    requisitos: [
      'Conta Instagram Business ou Creator (não pessoal)',
      'Página de Facebook ligada ao Instagram',
      'Conta Meta Developer (grátis)',
    ],
    passos: [
      {
        numero: 1,
        titulo: 'Converter conta Instagram para Business',
        instrucoes: [
          'Abrir Instagram → Definições → Conta',
          'Tocar "Mudar para conta profissional"',
          'Escolher "Business" (empresa) ou "Creator" (criador)',
          'Selecionar categoria "Saúde/Beleza"',
          'Ligar a uma Página de Facebook (criar uma se não tiveres)',
        ],
        nota: 'A conta pessoal NÃO funciona com a API. Tem de ser Business ou Creator.',
      },
      {
        numero: 2,
        titulo: 'Criar App no Meta Developer',
        instrucoes: [
          'Ir a developers.facebook.com e fazer login',
          'Clicar "Criar App" → Tipo: "Business"',
          'Nome da app: "Sete Ecos Publishing" (ou como quiseres)',
          'Conta Business: selecionar a tua (ou criar)',
          'No painel da app, ir a "Adicionar Produto" → "Instagram Graph API" → Configurar',
        ],
        link: 'https://developers.facebook.com/apps/',
      },
      {
        numero: 3,
        titulo: 'Obter Token de Acesso',
        instrucoes: [
          'No painel da app, ir a "Ferramentas" → "Graph API Explorer"',
          'Em "Meta App", seleccionar a app criada',
          'Em "User or Page", seleccionar a tua Página de Facebook',
          'Adicionar permissoes: instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement',
          'Clicar "Generate Access Token" e autorizar',
          'IMPORTANTE: Este token expira em 1 hora. Para token permanente, seguir passo 4.',
        ],
      },
      {
        numero: 4,
        titulo: 'Converter para Token Permanente',
        instrucoes: [
          'Copiar o token do passo 3',
          'Ir ao Graph API Explorer e fazer este pedido:',
          'GET /me/accounts?access_token={TOKEN_CURTO}',
          'Na resposta, encontrar a tua Página e copiar o "access_token" dela',
          'Este Page Token ja NAO expira (Long-Lived Page Token)',
          'Guardar este token - e o META_ACCESS_TOKEN',
        ],
        nota: 'O Page Token permanente e o que vais usar. Nunca partilhes este token.',
      },
      {
        numero: 5,
        titulo: 'Obter Instagram Account ID',
        instrucoes: [
          'No Graph API Explorer, fazer:',
          'GET /me/accounts (com o token permanente)',
          'Copiar o "id" da Página de Facebook',
          'Depois fazer: GET /{PAGE_ID}?fields=instagram_business_account',
          'O campo "instagram_business_account.id" e o teu INSTAGRAM_ACCOUNT_ID',
        ],
      },
      {
        numero: 6,
        titulo: 'Configurar no Vercel',
        instrucoes: [
          'Ir ao painel Vercel → Projeto sete-ecos-pwa → Settings → Environment Variables',
          'Adicionar:',
          '  META_ACCESS_TOKEN = (token permanente do passo 4)',
          '  INSTAGRAM_ACCOUNT_ID = (ID do passo 5)',
          '  CRON_SECRET = (inventar uma password qualquer, ex: "minha-chave-secreta-123")',
          'Clicar "Save" e fazer Redeploy',
        ],
        nota: 'Depois do redeploy, o botao "Publicar no Instagram" fica activo no dashboard.',
      },
      {
        numero: 7,
        titulo: 'Criar tabela no Supabase',
        instrucoes: [
          'Ir ao painel Supabase → SQL Editor',
          'Colar e executar o script CREATE_SCHEDULED_POSTS.sql',
          'Este script está na pasta /scripts/ do projeto',
          'A tabela scheduled_posts guarda as publicações agendadas',
        ],
        nota: 'Sem esta tabela, o agendamento não funciona. A publicação direta funciona sem ela.',
      },
    ],
    verificacao: {
      titulo: 'Como verificar se está tudo a funcionar',
      passos: [
        'No Marketing Dashboard, secção VITALIS, o indicador "Meta API" deve ficar verde',
        'Se ficar vermelho, verifica os tokens no Vercel',
        'Testa com "Publicar Agora" num post - deve aparecer no Instagram em 30 segundos',
        'Para agendamento: agenda um post para daqui a 20 minutos e espera',
      ],
    },
    problemas: [
      {
        problema: 'Token expirado / erro 190',
        solucao: 'Gerar novo token seguindo passos 3 e 4. Os Page Tokens permanentes raramente expiram, mas podem ser revogados se mudares a password do Facebook.',
      },
      {
        problema: 'Permissão negada / erro OAuthException',
        solucao: 'Verificar se a app tem as permissões instagram_content_publish e pages_show_list aprovadas.',
      },
      {
        problema: 'Imagem não encontrada',
        solucao: 'As imagens precisam de estar num URL público acessível pela Meta. As imagens em /public/mockups/ são servidas pelo Vercel e funcionam.',
      },
      {
        problema: 'Rate limit / erro 4 ou 32',
        solucao: 'A Meta limita a ~25 posts por dia. O sistema automaticamente espera quando atinge o limite.',
      },
    ],
  };
}

// ============================================================
// STATUS SEMANAL DINÂMICO — roda automaticamente a cada semana
// ============================================================

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
}

const STATUS_PLAN = [
  // [dia, tipo, fonte de conteúdo, template visual, eco, bgIndex]
  { dia: 'Segunda', tipo: 'dica',       fonte: 'corpo',      tpl: 'statusWA',      eco: 'vitalis', bgIdx: [1, 3, 6, 0] },
  { dia: 'Terça',   tipo: 'motivação',  fonte: 'hooks',      tpl: 'statusMinimal', eco: 'lumina',  bgIdx: null },
  { dia: 'Quarta',  tipo: 'testemunho', fonte: 'emocional',  tpl: 'statusWA',      eco: 'vitalis', bgIdx: [4, 2, 8, 5] },
  { dia: 'Quinta',  tipo: 'bastidores', fonte: 'hooks',      tpl: 'statusMinimal', eco: 'vitalis', bgIdx: null },
  { dia: 'Sexta',   tipo: 'educação',   fonte: 'provocacao', tpl: 'statusWA',      eco: 'vitalis', bgIdx: [5, 0, 1, 7] },
  { dia: 'Sábado',  tipo: 'receita',    fonte: 'corpo',      tpl: 'statusWA',      eco: 'vitalis', bgIdx: [6, 3, 1, 9] },
  { dia: 'Domingo', tipo: 'reflexão',   fonte: 'emocional',  tpl: 'statusMinimal', eco: 'vitalis', bgIdx: null },
];

const STATUS_CTAS = {
  dica:       '🌱 Descobre mais: app.seteecos.com/vitalis\n💬 Fala comigo: wa.me/258851006473',
  motivação:  '✨ Faz o diagnóstico grátis: app.seteecos.com/lumina\n💬 Fala comigo: wa.me/258851006473',
  testemunho: '🔮 Faz o LUMINA: app.seteecos.com/lumina\n🌱 Descobre mais: app.seteecos.com/vitalis\n💬 Fala comigo: wa.me/258851006473',
  bastidores: '🌱 Conhece o projecto: app.seteecos.com\n💬 Fala comigo: wa.me/258851006473',
  educação:   '🌱 Descobre mais: app.seteecos.com/vitalis\n💬 Fala comigo: wa.me/258851006473',
  receita:    '🌱 Receitas e mais: app.seteecos.com/vitalis\n💬 Fala comigo: wa.me/258851006473',
  reflexão:   '🔮 LUMINA grátis: app.seteecos.com/lumina\n💬 Fala comigo: wa.me/258851006473',
};

function gerarStatusSemanal() {
  const week = getWeekNumber();

  // Pool de todos os temas para rotação mais rica
  const FONTES_EXPANDIDAS = {
    corpo: CONTEUDO_CORPO,
    emocional: CONTEUDO_EMOCIONAL,
    provocacao: CONTEUDO_PROVOCACAO,
    alimentacao_emocional: CONTEUDO_ALIMENTACAO_EMOCIONAL,
    distorcoes: CONTEUDO_DISTORCOES,
    ansiedade: CONTEUDO_ANSIEDADE,
    autoestima: CONTEUDO_AUTOESTIMA,
    ciclo_recomecos: CONTEUDO_CICLO_RECOMECOS,
    aurea: CONTEUDO_AUREA,
    serena: CONTEUDO_SERENA,
    lumina: CONTEUDO_LUMINA,
  };

  return STATUS_PLAN.map((plan) => {
    let conteudo;
    const idx = STATUS_PLAN.indexOf(plan);
    const fonte = plan.fonte;

    if (FONTES_EXPANDIDAS[fonte]) {
      conteudo = pickFromArray(FONTES_EXPANDIDAS[fonte], week + idx);
    } else if (fonte === 'hooks') {
      const hook = pickFromArray(HOOKS_PROVOCADORES, week + idx);
      conteudo = { hook, corpo: '', cta: '' };
    } else {
      // Fallback: rodar por todos os conteúdos expandidos
      const todosArrays = Object.values(FONTES_EXPANDIDAS);
      const arr = todosArrays[(week + idx) % todosArrays.length];
      conteudo = pickFromArray(arr, week + idx);
    }

    const hookText = conteudo.hook;
    const bodyText = conteudo.corpo ? `\n\n${conteudo.corpo}` : '';
    const ctaText = conteudo.cta ? `\n\n${conteudo.cta}` : '';

    // Legenda completa com link + WA + CTA
    const exemplo = `${hookText}${bodyText}${ctaText}\n\n${STATUS_CTAS[plan.tipo]}`;

    // Imagem — texto curto para a imagem (só hook + subtítulo)
    const imgTexto = hookText.length > 70 ? hookText.split('.').slice(0, 2).join('.') + '.' : hookText;
    const imgSub = conteudo.cta || (conteudo.corpo ? conteudo.corpo.split('.')[0] + '.' : '');
    const bgIndex = plan.bgIdx ? plan.bgIdx[week % plan.bgIdx.length] : 0;

    return {
      dia: plan.dia,
      conteudo: plan.tipo.charAt(0).toUpperCase() + plan.tipo.slice(1),
      exemplo,
      imagem: {
        template: plan.tpl,
        eco: plan.eco,
        texto: imgTexto,
        subtitulo: imgSub.length > 80 ? imgSub.substring(0, 77) + '...' : imgSub,
        bgIndex,
      },
    };
  });
}

// ============================================================
// WHATSAPP BUSINESS - Setup completo profissional
// ============================================================

export function getSetupWhatsAppBusiness() {
  return {
    perfil: {
      nome: 'Sete Ecos',
      categoria: 'Saúde e bem-estar',
      descricao: 'Inteligência nutricional e desportiva 🌿 Coaching personalizado',
      sobre: 'Inteligência nutricional e desportiva 🌿 Coaching personalizado',
      horario: 'Seg-Sex: 8h-18h',
      email: 'viv.saraiva@gmail.com',
      website: 'https://app.seteecos.com',
      endereco: '',
    },
    saudacao: `Olá! 🌿 Bem-vindo/a ao Sete Ecos.\n\nSou a Vivianne, coach de nutrição e bem-estar.\n\nComo te posso ajudar?\n\n1️⃣ Quero saber mais sobre o VITALIS (coaching nutricional)\n2️⃣ Quero fazer o diagnóstico gratuito LUMINA\n3️⃣ Tenho dúvidas sobre preços\n4️⃣ Preciso de suporte técnico\n\nResponde com o número ou escreve à vontade 💚`,
    ausencia: `Olá! 🌿 Obrigada pela tua mensagem.\n\nNeste momento estou fora do horário de atendimento (Seg-Sex, 8h-18h).\n\nEnquanto isso, podes:\n🔮 Fazer o diagnóstico gratuito: app.seteecos.com/lumina\n🌱 Ver o programa VITALIS: app.seteecos.com/vitalis\n\nRespondo-te assim que possível! 💚`,
    respostasRapidas: [
      {
        atalho: '/precos',
        titulo: 'Preços VITALIS',
        mensagem: `Os nossos planos VITALIS (coaching nutricional):\n\n💚 Mensal: 2.500 MZN/mês\n💚 Semestral: 12.500 MZN (poupas 2.500!)\n💚 Anual: 21.000 MZN (poupas 9.000!)\n\nTodos incluem:\n✅ Plano alimentar personalizado\n✅ 98 receitas equilibradas e variadas\n✅ Chat directo comigo\n✅ Treinos guiados\n✅ Acompanhamento semanal\n\nQueres experimentar? Posso activar-te um período de teste 🌱`,
      },
      {
        atalho: '/lumina',
        titulo: 'Diagnóstico LUMINA',
        mensagem: `O LUMINA é o nosso diagnóstico gratuito 🔮\n\nEm 5 minutos, descobres:\n• Como está a tua relação com a comida\n• Os teus padrões emocionais\n• O que o teu corpo está a pedir\n\nÉ 100% grátis, sem compromisso.\n\nFaz aqui: app.seteecos.com/lumina 💜`,
      },
      {
        atalho: '/vitalis',
        titulo: 'Programa VITALIS',
        mensagem: `O VITALIS é o nosso programa de coaching nutricional 🌱\n\nNão é dieta. É transformação.\n\nO que inclui:\n🍽 Plano alimentar personalizado com comida real\n📊 Dashboard com o teu progresso\n💬 Chat directo comigo\n🏋️ Treinos adaptados ao teu nível\n📋 Lista de compras automática\n🔄 Espaço de retorno (sem culpa, sem julgamento)\n\nInteligência nutricional e desportiva. Para ti.\n\nQueres começar? 💚`,
      },
      {
        atalho: '/pagamento',
        titulo: 'Dados de pagamento',
        mensagem: `Para efectuar o pagamento:\n\n📱 M-Pesa: 85 100 6473 (Vivianne Santos)\n\nDepois de pagar:\n1. Envia-me o comprovativo aqui\n2. Eu activo o teu acesso em menos de 1 hora\n3. Recebes email com as instruções\n\nQual plano escolheste? 💚`,
      },
      {
        atalho: '/obrigada',
        titulo: 'Agradecimento',
        mensagem: `Obrigada pela confiança! 💚\n\nQualquer dúvida, estou aqui. Este número é exclusivo para o Sete Ecos, por isso não hesites em escrever.\n\nLembra-te: isto é uma jornada, não uma corrida. Um dia de cada vez. 🌿`,
      },
      {
        atalho: '/teste',
        titulo: 'Activar teste',
        mensagem: `Óptimo! Vou activar-te um período de teste do VITALIS 🌱\n\nPreciso só de:\n1. O teu nome completo\n2. O teu email (para criares conta)\n\nAssim que enviares, activo em minutos! 💚`,
      },
      {
        atalho: '/suporte',
        titulo: 'Suporte técnico',
        mensagem: `Lamento que estejas com dificuldades 😔\n\nDiz-me:\n1. Qual é o problema exactamente?\n2. Que ecrã estás a ver?\n3. Se possível, envia screenshot\n\nVou resolver o mais rápido possível! 🛠`,
      },
    ],
    etiquetas: [
      { nome: 'Cliente Activo/a', cor: 'verde', descricao: 'Tem subscrição activa' },
      { nome: 'Interessado/a', cor: 'amarelo', descricao: 'Perguntou mas ainda não comprou' },
      { nome: 'Teste', cor: 'azul', descricao: 'Em período de teste' },
      { nome: 'Expirado/a', cor: 'vermelho', descricao: 'Subscrição expirou' },
      { nome: 'Lumina', cor: 'roxo', descricao: 'Fez o diagnóstico gratuito' },
      { nome: 'Suporte', cor: 'cinza', descricao: 'Precisa de ajuda técnica' },
    ],
    catalogo: [
      {
        nome: 'LUMINA — Diagnóstico Gratuito',
        preco: 'Grátis',
        descricao: 'Descobre como está a tua relação com a comida, os teus padrões emocionais e o que o teu corpo precisa. 5 minutos, 100% gratuito, sem compromisso. Resultados imediatos com leitura personalizada.',
        link: 'https://app.seteecos.com/lumina',
        imagem: '/mockups/Vitalis-landing_PC-mockup.jpeg',
      },
      {
        nome: 'VITALIS Mensal',
        preco: '2.500 MZN/mês',
        descricao: 'Coaching nutricional completo: plano alimentar personalizado, 98 receitas, treinos guiados, chat directo com a coach, lista de compras automática e acompanhamento semanal.',
        link: 'https://app.seteecos.com/vitalis',
        imagem: '/mockups/Vitalis-dashboard_mb-mockup.jpeg',
      },
      {
        nome: 'VITALIS Semestral (Poupa 2.500 MZN)',
        preco: '12.500 MZN',
        descricao: '6 meses de transformação com todos os benefícios do plano mensal. Poupas o equivalente a 1 mês inteiro. Ideal para quem quer compromisso real com a mudança.',
        link: 'https://app.seteecos.com/vitalis',
        imagem: '/mockups/Vitalis-receitas_mb-mockup.jpeg',
      },
      {
        nome: 'VITALIS Anual (Poupa 9.000 MZN)',
        preco: '21.000 MZN',
        descricao: '12 meses de acompanhamento completo. A maior poupança e o compromisso total com a tua transformação. Prioridade no suporte e acesso a todas as novidades.',
        link: 'https://app.seteecos.com/vitalis',
        imagem: '/mockups/Vitalis-coach_mb-mockup.jpeg',
      },
    ],
    statusSemanal: gerarStatusSemanal(),
  };
}

// ============================================================
// CONTEÚDO MULTI-ECO — Todos os 7 Ecos + Lumina
// Hooks, carrosséis, posts IG, mensagens WA, scripts TikTok
// ============================================================

const ECO_CONTEUDO = {
  aurea: {
    nome: 'ÁUREA',
    subtitulo: 'Programa de Autovalor',
    emoji: '✨',
    moeda: 'Jóias de Ouro',
    cor: '#C9A227',
    link: '/aurea',
    linkPagamento: '/aurea/pagamento',
    preco: '499 MZN/mês',
    hooks: [
      'O teu valor não cabe numa calça tamanho S.',
      'Gastas horas a escolher roupa e 0 minutos a cuidar de como te vês ao espelho.',
      'Se precisas de validação externa para te sentires suficiente, este post é para ti.',
      'Quando foi a última vez que te olhaste ao espelho sem te criticares?',
      'Compras coisas para preencher um vazio que só o autovalor resolve.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'O teu valor não depende do que vestes, pesas ou aparentas.',
        caption: 'O teu valor não depende do que vestes, pesas ou aparentas. 🤍\n\nO ÁUREA é um programa de 7 semanas para reconstruir a relação contigo.\n\nPorque antes de mudar o corpo, precisas de mudar o olhar.\n\n#seteecos #aurea #autovalor #autoestima #bemestar #transformacaopessoal',
      },
      {
        tipo: 'carrossel',
        titulo: '5 sinais de que o teu autovalor precisa de atenção',
        slides: [
          { titulo: '5 sinais de baixo autovalor', texto: 'Quantos reconheces em ti?' },
          { titulo: '1. Dizes sim quando queres dizer não', texto: 'O medo de rejeição controla as tuas decisões.' },
          { titulo: '2. Comparas-te constantemente', texto: 'O feed dos outros parece perfeito. O teu parece insuficiente.' },
          { titulo: '3. Compras para te sentires melhor', texto: 'Roupa nova, maquilhagem, sapatos. O vazio volta no dia seguinte.' },
          { titulo: '4. Precisas de validação para decidir', texto: '"Achas que me fica bem?" — A pergunta que escondes todos os dias.' },
          { titulo: 'O ÁUREA ajuda-te a mudar isto.', texto: '7 semanas. 100+ micro-práticas.\napp.seteecos.com/aurea' },
        ],
        caption: '5 sinais de que o teu autovalor precisa de atenção ✨\n\nReconheces algum? Desliza.\n\nSalva e partilha com quem precisa.\n\n#seteecos #aurea #autovalor #autoestima #autoconhecimento #transformacaopessoal',
      },
      {
        tipo: 'educação',
        texto: 'Autovalor não se constrói com afirmações no espelho. Constrói-se com micro-práticas diárias.',
        caption: 'Autovalor não se constrói com afirmações no espelho. Constrói-se com micro-práticas diárias. ✨\n\nExemplos do programa ÁUREA:\n• Como gastas dinheiro reflecte como te valorizas\n• A roupa que escolhes revela como te vês\n• O tempo que dás e o que guardas para ti\n\n7 semanas. 100+ micro-práticas. Uma por dia.\n\n#seteecos #aurea #autovalor #autoestima #autoconhecimento #transformacaopessoal',
      },
    ],
    mensagensWA: [
      `✨ *ÁUREA — Programa de Autovalor*\n\nSabes aquela sensação de nunca seres suficiente?\n\nO ÁUREA é um programa de 7 semanas com 100+ micro-práticas para reconstruir a tua relação contigo.\n\n• Dinheiro: como gastas reflecte como te valorizas\n• Tempo: a quem dás e de quem recebes\n• Roupa: o espelho como aliado, não inimigo\n• Prazer: reconectar com o que te faz bem\n\nEnvia-me mensagem para saber como começar 🤍\n\n👉 `,
      `🤍 *Quando foi a última vez que fizeste algo SÓ para ti?*\n\nSem culpa. Sem justificação.\n\nO ÁUREA ensina-te a colocar-te em primeiro lugar — não por egoísmo, mas por sobrevivência emocional.\n\n7 semanas. Uma prática por dia. A mudança começa no olhar.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Descobres que o teu valor não depende de ninguém',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\n[Texto em ecrã, fundo dourado]\n"Quando foi a última vez que te olhaste ao espelho sem te criticares?"\n\n*CENA 2 (5-15s)* — DESENVOLVIMENTO\n[Texto em ecrã]\n"Passas a vida a dar. Aos filhos. Ao trabalho. A toda a gente. E a ti?"\n\n*CENA 3 (15-25s)* — SOLUÇÃO\n[Texto em ecrã + mockup do ÁUREA]\n"ÁUREA: 7 semanas para reconstruir a relação contigo. 100+ micro-práticas."\n\n*CENA 4 (25-30s)* — CTA\n[Texto em ecrã]\n"Link na bio. ✨"`,
      caption: 'Quando foi a última vez que te olhaste ao espelho e sorriste? ✨\n\n#seteecos #aurea #autovalor #autoestima #selflove #tiktok #fyp',
    },
  },

  serena: {
    nome: 'SERENA',
    subtitulo: 'Emoção & Fluidez',
    emoji: '💧',
    moeda: 'Gotas',
    cor: '#6B8E9B',
    link: '/serena',
    linkPagamento: '/serena/pagamento',
    preco: '499 MZN/mês',
    hooks: [
      'Sentes tudo com intensidade e depois culpas-te por ser "demasiado".',
      'A ansiedade não é fraqueza. É o teu corpo a pedir atenção.',
      'Quantas vezes disseste "estou bem" quando não estavas?',
      'Se choras sem razão aparente, há uma razão. Só não a vês ainda.',
      'Reprimir emoções não é força. É uma bomba-relógio.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'A ansiedade não é fraqueza. É o teu corpo a pedir atenção.',
        caption: 'A ansiedade não é fraqueza. É o teu corpo a pedir atenção. 💧\n\nO SERENA tem 16 emoções mapeadas, 6 técnicas de respiração e um diário emocional que te ajuda a entender padrões.\n\nPara de fugir do que sentes. Começa a fluir.\n\n#seteecos #serena #saudeemocional #ansiedade #respiracao #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: '4 técnicas de respiração para ansiedade',
        slides: [
          { titulo: '4 respirações que acalmam em minutos', texto: 'Guarda este post. Vais precisar.' },
          { titulo: '1. Respiração 4-7-8', texto: 'Inspira 4s → Segura 7s → Expira 8s. Repete 4x. Acalma o sistema nervoso em 2 minutos.' },
          { titulo: '2. Respiração Box (Quadrada)', texto: 'Inspira 4s → Segura 4s → Expira 4s → Segura 4s. Usada por militares para controlo.' },
          { titulo: '3. Respiração Oceânica', texto: 'Inspira pelo nariz → Expira pela boca como se soprasses uma vela ao longe. Suave e profunda.' },
          { titulo: '4. Suspiro Fisiológico', texto: 'Duas inspirações curtas pelo nariz + uma expiração longa pela boca. A forma mais rápida de acalmar.' },
          { titulo: 'Pratica no SERENA com guia áudio.', texto: 'app.seteecos.com/serena\nEnvia DM para saber mais' },
        ],
        caption: '4 respirações que te acalmam em minutos 💧\n\nGuarda este post. Vai ser útil.\n\nQual vais experimentar primeiro?\n\n#seteecos #serena #respiracao #ansiedade #calma #saudeemocional #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Aprendi que sentir não é fraqueza. É informação.',
        subtitulo: '— Reflexão SERENA',
        caption: '"Aprendi que sentir não é fraqueza. É informação."\n\nO SERENA ensina-te a ouvir as tuas emoções em vez de as calar.\n\n16 emoções mapeadas. Diário emocional. Técnicas de respiração. Rituais de libertação.\n\n#seteecos #serena #emocoes #saudeemocional #transformacao',
      },
    ],
    mensagensWA: [
      `💧 *SERENA — Emoção & Fluidez*\n\nSentes tudo com intensidade? Depois culpas-te por ser "demais"?\n\nO SERENA ajuda-te a:\n\n🎯 Mapear 16 emoções diferentes\n🌊 6 técnicas de respiração guiadas\n📖 Diário emocional com padrões\n🔥 Rituais de libertação\n💆 Integração com o ciclo menstrual\n\nPara de reprimir. Começa a fluir.\n\nEnvia-me mensagem para saber mais 💧\n\n👉 `,
      `🤍 *Quantas vezes disseste "estou bem" quando não estavas?*\n\nO SERENA é o único espaço onde as tuas emoções são bem-vindas. Todas.\n\nSem julgamento. Sem "tens de ser forte". Só observação e fluidez.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Aprendes a sentir sem culpa',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\n[Texto em ecrã, fundo azul-cinza]\n"Quantas vezes disseste 'estou bem' quando não estavas?"\n\n*CENA 2 (5-15s)* — DESENVOLVIMENTO\n[Texto em ecrã]\n"Reprimir emoções não é força. É uma bomba-relógio."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\n[Texto em ecrã + mockup do SERENA]\n"SERENA: 16 emoções mapeadas. Respiração guiada. Diário emocional."\n\n*CENA 4 (25-30s)* — CTA\n[Texto em ecrã]\n"Link na bio. 💧"`,
      caption: 'Reprimir emoções não é força. É uma bomba-relógio. 💧\n\n#seteecos #serena #emocoes #ansiedade #saudeemocional #tiktok #fyp',
    },
  },

  ignis: {
    nome: 'IGNIS',
    subtitulo: 'Vontade & Foco',
    emoji: '🔥',
    moeda: 'Chamas',
    cor: '#C1634A',
    link: '/ignis',
    linkPagamento: '/ignis/pagamento',
    preco: '499 MZN/mês',
    hooks: [
      'Tens 47 separadores abertos e nenhum projecto acabado.',
      'A procrastinação não é preguiça. É medo disfarçado.',
      'Se esperas pela motivação para agir, vais esperar para sempre.',
      'Dizes que não tens tempo. Tens. Não tens foco.',
      'A disciplina não vem de gritar contigo. Vem de te conheceres.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'A procrastinação não é preguiça. É medo disfarçado.',
        caption: 'A procrastinação não é preguiça. É medo disfarçado. 🔥\n\nMedo de falhar. Medo de não ser suficiente. Medo de começar.\n\nO IGNIS ajuda-te a identificar os teus padrões de dispersão e a transformar vontade em acção.\n\n16 desafios de fogo. Sessões de foco. Detector de distracções.\n\n#seteecos #ignis #foco #produtividade #disciplina #motivacao #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: '4 tipos de procrastinação (e como vencer cada um)',
        slides: [
          { titulo: 'Porque procrastinas?', texto: 'Não é preguiça. É um padrão. Descobre o teu.' },
          { titulo: '1. Procrastinação por medo', texto: '"E se não for suficiente?" — O perfeccionismo paralisa. A acção imperfeita é melhor que a inacção perfeita.' },
          { titulo: '2. Procrastinação por sobrecarga', texto: '"Tenho tanto para fazer..." — O cérebro bloqueia. Começa por UMA coisa. Só uma.' },
          { titulo: '3. Procrastinação por recompensa', texto: '"Amanhã faço" — O cérebro prefere o prazer imediato. Precisa de micro-recompensas.' },
          { titulo: '4. Procrastinação por valores', texto: '"Não me apetece" — Talvez o que adias não esteja alinhado com o que realmente importa.' },
          { titulo: 'O IGNIS treina a tua vontade.', texto: '16 desafios. Sessões de foco. Bússola de valores.\napp.seteecos.com/ignis' },
        ],
        caption: 'Porque procrastinas? Não é o que pensas. 🔥\n\nDesliza para descobrir o teu padrão.\n\n#seteecos #ignis #procrastinacao #foco #produtividade #mindset #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Finalmente percebi que não me faltava disciplina. Faltava-me direcção.',
        subtitulo: '— Reflexão IGNIS',
        caption: '"Não me faltava disciplina. Faltava-me direcção."\n\nO IGNIS não te obriga a ser produtivo. Ajuda-te a perceber O QUE realmente importa.\n\n#seteecos #ignis #foco #proposito #transformacao #bemestar',
      },
    ],
    mensagensWA: [
      `🔥 *IGNIS — Vontade & Foco*\n\nTens projectos que nunca acabas? Ideias que morrem no "amanhã começo"?\n\nO IGNIS treina a tua vontade:\n\n🎯 16 desafios de fogo (coragem, corte, alinhamento, iniciativa)\n⏱ Sessões de foco cronometradas\n🔍 Detector de distracções\n🧭 Bússola de valores\n📋 Plano de acção concreto\n\nEnvia-me mensagem para saber mais 🔥\n\n👉 `,
      `🤍 *Dizes que não tens tempo. Mas tens — não tens foco.*\n\nO IGNIS ajuda-te a separar o urgente do importante. A dizer não ao que não serve. A transformar vontade em acção.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Descobres que não te falta disciplina, falta-te foco',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\n[Texto em ecrã, fundo vermelho-alaranjado]\n"47 separadores abertos. 0 projectos acabados."\n\n*CENA 2 (5-15s)* — DESENVOLVIMENTO\n[Texto em ecrã]\n"Procrastinação não é preguiça. É medo disfarçado."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\n[Texto em ecrã + mockup do IGNIS]\n"IGNIS: 16 desafios de fogo. Sessões de foco. Detector de distracções."\n\n*CENA 4 (25-30s)* — CTA\n[Texto em ecrã]\n"Link na bio. 🔥"`,
      caption: '47 separadores. 0 projectos acabados. Conheces? 🔥\n\n#seteecos #ignis #foco #produtividade #procrastinacao #tiktok #fyp',
    },
  },

  ventis: {
    nome: 'VENTIS',
    subtitulo: 'Energia & Ritmo',
    emoji: '🍃',
    moeda: 'Folhas',
    cor: '#5D9B84',
    link: '/ventis',
    linkPagamento: '/ventis/pagamento',
    preco: '499 MZN/mês',
    hooks: [
      'Acordas com cansaço e adormeces sem energia. Onde foi parar a tua vitalidade?',
      'Tens uma rotina ou tens um modo de sobrevivência?',
      'Burnout não é medalha de honra. É o corpo a desistir de ti.',
      'Se precisas de café para funcionar, não é energia. É dívida.',
      'O teu corpo tem um ritmo natural. Ignora-lo é o que te cansa.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'Burnout não é medalha de honra. É o corpo a desistir de ti.',
        caption: 'Burnout não é medalha de honra. É o corpo a desistir de ti. 🍃\n\nO VENTIS monitoriza a tua energia, constrói rotinas conscientes e detecta sinais de burnout antes que seja tarde.\n\nMovimento. Natureza. Pausas. Ritmo.\n\n#seteecos #ventis #energia #burnout #rotina #bemestar #saudemental',
      },
      {
        tipo: 'carrossel',
        titulo: '5 sinais de que o teu corpo precisa de pausa',
        slides: [
          { titulo: 'O teu corpo está a pedir pausa?', texto: '5 sinais que ignoras todos os dias.' },
          { titulo: '1. Acordas já sem energia', texto: '8 horas de sono e mesmo assim exaustão. O corpo está a gritar.' },
          { titulo: '2. Irritas-te por tudo', texto: 'Não é mau feitio. É esgotamento emocional disfarçado.' },
          { titulo: '3. Café o dia todo', texto: 'Se precisas de estimulantes para funcionar, estás a pedir emprestado ao futuro.' },
          { titulo: '4. Zero vontade de socializar', texto: 'Isolamento é o último sinal antes do burnout completo.' },
          { titulo: 'O VENTIS detecta isto por ti.', texto: 'Monitor de energia. Detector de burnout.\napp.seteecos.com/ventis' },
        ],
        caption: 'O teu corpo está a pedir pausa? 🍃\n\nDesliza. Reconhece. Age.\n\n#seteecos #ventis #burnout #energia #pausa #saudemental #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Descobri que não precisava de fazer mais. Precisava de parar melhor.',
        subtitulo: '— Reflexão VENTIS',
        caption: '"Não precisava de fazer mais. Precisava de parar melhor."\n\nO VENTIS ensina-te a respeitar o teu ritmo natural.\n\n#seteecos #ventis #energia #ritmo #pausa #transformacao',
      },
    ],
    mensagensWA: [
      `🍃 *VENTIS — Energia & Ritmo*\n\nAcordas sem energia? Adormeces com exaustão? O dia é uma maratona sem fim?\n\nO VENTIS ajuda-te a:\n\n📊 Monitorizar a tua energia real\n🧘 8 tipos de pausas conscientes\n🏃 Movimento: yoga, tai chi, dança\n🌿 10 actividades de conexão com a natureza\n🔥 Detector de burnout\n⚡ Mapeamento de picos e vales\n\nEnvia-me mensagem para saber mais 🍃\n\n👉 `,
      `🤍 *O teu corpo tem um ritmo natural. Ignora-lo é o que te cansa.*\n\nO VENTIS ensina-te a trabalhar COM o teu corpo, não contra ele.\n\nRotinas conscientes. Pausas estratégicas. Energia real.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Descobres que não precisas de mais café, precisas de ritmo',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\n[Texto em ecrã, fundo verde]\n"Acordas sem energia. Adormeces com exaustão. Onde foi a tua vitalidade?"\n\n*CENA 2 (5-15s)* — DESENVOLVIMENTO\n[Texto em ecrã]\n"Burnout não é medalha de honra. É o corpo a desistir de ti."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\n[Texto em ecrã + mockup do VENTIS]\n"VENTIS: Monitor de energia. Pausas conscientes. Detector de burnout."\n\n*CENA 4 (25-30s)* — CTA\n[Texto em ecrã]\n"Link na bio. 🍃"`,
      caption: 'Burnout não é medalha de honra. 🍃\n\n#seteecos #ventis #energia #burnout #ritmo #tiktok #fyp',
    },
  },

  ecoa: {
    nome: 'ECOA',
    subtitulo: 'Expressão & Voz',
    emoji: '🔊',
    moeda: 'Ecos',
    cor: '#4A90A4',
    link: '/ecoa',
    linkPagamento: '/ecoa/pagamento',
    preco: '499 MZN/mês',
    hooks: [
      'Quantas vezes engoliste o que querias dizer para não incomodar?',
      'O silêncio que te protegeu em criança está a sufocar-te agora.',
      'Se a tua voz treme quando pedes algo, o problema não é timidez.',
      'Tens uma opinião sobre tudo mas nunca a dizes em voz alta.',
      'Ser assertivo/a não é ser agressivo/a. É ser honesto/a.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'O silêncio que te protegeu em criança está a sufocar-te agora.',
        caption: 'O silêncio que te protegeu em criança está a sufocar-te agora. 🔊\n\nO ECOA é um programa de 8 semanas para recuperar a tua voz.\n\nMapa de silenciamento. Programa Micro-Voz. Cartas não enviadas. Comunicação assertiva.\n\n#seteecos #ecoa #voz #expressao #assertividade #comunicacao #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: '4 formas de silenciamento que não reconheces',
        slides: [
          { titulo: 'Estás a silenciar-te?', texto: 'Talvez sem saber. Descobre.' },
          { titulo: '1. Silêncio por medo', texto: '"Se eu disser, vão ficar chateados." — Priorizas o conforto dos outros acima da tua verdade.' },
          { titulo: '2. Silêncio por hábito', texto: '"Sempre fui assim." — Cresceste a ouvir que crianças boas não respondem.' },
          { titulo: '3. Silêncio por vergonha', texto: '"A minha opinião não é importante." — Aprendeste que a tua voz não conta.' },
          { titulo: '4. Silêncio por exaustão', texto: '"Não vale a pena." — Desististe de ser ouvida. E isso dói.' },
          { titulo: 'O ECOA devolve-te a voz.', texto: '8 semanas. Programa Micro-Voz.\napp.seteecos.com/ecoa' },
        ],
        caption: 'Estás a silenciar-te sem saber? 🔊\n\nDesliza e descobre.\n\n#seteecos #ecoa #voz #silencio #expressao #assertividade #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Pela primeira vez disse "não" sem sentir culpa.',
        subtitulo: '— Reflexão ECOA',
        caption: '"Pela primeira vez disse não sem sentir culpa."\n\nIsto é o poder de recuperar a tua voz.\n\nO ECOA. 8 semanas. Um passo de cada vez.\n\n#seteecos #ecoa #assertividade #voz #transformacao',
      },
    ],
    mensagensWA: [
      `🔊 *ECOA — Expressão & Voz*\n\nEngoles o que queres dizer? Dizes sim quando queres dizer não?\n\nO ECOA ajuda-te a:\n\n🗺 Mapear os teus silenciamentos\n🎙 Programa Micro-Voz de 8 semanas\n✉️ Cartas não enviadas (5 categorias)\n💬 Templates de comunicação assertiva\n📖 Diário de voz recuperada\n\nEnvia-me mensagem para saber mais 🔊\n\n👉 `,
      `🤍 *Ser assertivo/a não é ser agressivo/a. É ser honesto/a.*\n\nO ECOA ensina-te 4 padrões de comunicação assertiva:\n• Sentimento • Sanduíche • Disco riscado • Pedido claro\n\nRecupera a tua voz. Uma palavra de cada vez.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Descobres que calares-te não é ser educado/a',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\n[Texto em ecrã, fundo azul-petróleo]\n"Quantas vezes engoliste o que querias dizer?"\n\n*CENA 2 (5-15s)* — DESENVOLVIMENTO\n[Texto em ecrã]\n"O silêncio que te protegeu em criança está a sufocar-te agora."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\n[Texto em ecrã + mockup do ECOA]\n"ECOA: 8 semanas para recuperar a tua voz. Mapa de silêncio. Comunicação assertiva."\n\n*CENA 4 (25-30s)* — CTA\n[Texto em ecrã]\n"Link na bio. 🔊"`,
      caption: 'Quantas vezes engoliste o que querias dizer? 🔊\n\n#seteecos #ecoa #voz #assertividade #comunicacao #tiktok #fyp',
    },
  },

  imago: {
    nome: 'IMAGO',
    subtitulo: 'Identidade Essencial',
    emoji: '⭐',
    moeda: 'Estrelas',
    cor: '#8B7BA5',
    link: '/imago',
    linkPagamento: '/imago/pagamento',
    preco: '499 MZN/mês',
    hooks: [
      'Sabes quem és quando ninguém está a ver?',
      'A máscara que usas para o mundo está a sufocar quem realmente és.',
      'Tens 30 anos e ainda vives segundo as expectativas dos teus pais.',
      'Se te pedissem para te descreveres em 3 palavras, conseguias?',
      'A roupa que vestes conta mais sobre ti do que pensas.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'Sabes quem és quando ninguém está a ver?',
        caption: 'Sabes quem és quando ninguém está a ver? ⭐\n\nO IMAGO é uma viagem à tua essência. Espelho triplo. Arqueologia pessoal. 50 valores. Mapa de identidade.\n\nDescobre quem és para além dos papéis que representas.\n\n#seteecos #imago #identidade #autoconhecimento #essencia #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: 'O Espelho Triplo: Essência, Máscara, Aspiração',
        slides: [
          { titulo: 'Quem és? Quem mostras? Quem queres ser?', texto: 'O Espelho Triplo do IMAGO.' },
          { titulo: 'Essência', texto: 'Quem és quando ninguém vê. Os teus valores reais. O que te move sem aplausos.' },
          { titulo: 'Máscara', texto: 'Quem mostras ao mundo. O papel que representas. A armadura que construíste.' },
          { titulo: 'Aspiração', texto: 'Quem queres ser. A versão que imaginas. O futuro que te chama.' },
          { titulo: 'Quando os 3 estão alinhados, encontras paz.', texto: 'IMAGO — Identidade Essencial\napp.seteecos.com/imago' },
        ],
        caption: 'Quem és? Quem mostras? Quem queres ser? ⭐\n\nQuando os 3 estão alinhados, encontras paz.\n\nDesliza para entender o Espelho Triplo.\n\n#seteecos #imago #identidade #espelho #autoconhecimento #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Descobri que estava a viver a vida que os meus pais queriam, não a minha.',
        subtitulo: '— Reflexão IMAGO',
        caption: '"Estava a viver a vida que os meus pais queriam, não a minha."\n\nO IMAGO ajuda-te a separar quem TU és de quem te disseram para ser.\n\n#seteecos #imago #identidade #autoconhecimento #transformacao',
      },
    ],
    mensagensWA: [
      `⭐ *IMAGO — Identidade Essencial*\n\nSabes quem és? Ou sabes quem te disseram para ser?\n\nO IMAGO é uma viagem à tua essência:\n\n🪞 Espelho Triplo (essência, máscara, aspiração)\n🏛 Arqueologia pessoal (5 camadas: infância → presente)\n🎯 Selecção de 50 valores fundamentais\n🗺 Mapa de identidade em 7 dimensões\n🧘 5 meditações de essência guiadas\n\nEnvia-me mensagem para saber mais ⭐\n\n👉 `,
      `🤍 *A roupa que vestes conta mais sobre ti do que pensas.*\n\nNo IMAGO, exploramos a roupa como identidade — não como moda, mas como espelho.\n\nQuem és quando escolhes o que vestir? O que escondes? O que mostras?\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Percebes que não sabes quem és',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\n[Texto em ecrã, fundo violeta]\n"Se te pedissem para te descreveres em 3 palavras, conseguias?"\n\n*CENA 2 (5-15s)* — DESENVOLVIMENTO\n[Texto em ecrã]\n"Vives segundo as expectativas de todos. Menos as tuas."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\n[Texto em ecrã + mockup do IMAGO]\n"IMAGO: Espelho triplo. 50 valores. Mapa de identidade em 7 dimensões."\n\n*CENA 4 (25-30s)* — CTA\n[Texto em ecrã]\n"Link na bio. ⭐"`,
      caption: 'Sabes quem és quando ninguém está a ver? ⭐\n\n#seteecos #imago #identidade #autoconhecimento #essencia #tiktok #fyp',
    },
  },

  lumina: {
    nome: 'LUMINA',
    subtitulo: 'Diagnóstico Gratuito',
    emoji: '🔮',
    moeda: null,
    cor: '#5C6BC0',
    link: '/lumina',
    linkPagamento: null,
    preco: 'Gratuito',
    hooks: [
      '7 perguntas. 23 padrões. O diagnóstico que ninguém te fez.',
      'Em 2 minutos sabes mais sobre ti do que em 2 anos de terapia.',
      'O teu corpo está a falar. Tu não estás a ouvir.',
      'A última vez que alguém te perguntou como te sentes foi quando?',
      'Não é horóscopo. É ciência emocional em 2 minutos.',
    ],
    conteudoIG: [
      {
        tipo: 'cta',
        texto: '7 perguntas. 23 padrões. 2 minutos. Gratuito.',
        caption: '7 perguntas. 23 padrões possíveis. 2 minutos. Gratuito. 🔮\n\nO LUMINA é o diagnóstico que ninguém te fez. Não mede peso. Mede como TE SENTES.\n\nEnergia. Tensão. Imagem. Clareza. Conexão.\n\nExperimenta: link na bio.\n\n#seteecos #lumina #diagnostico #autoconhecimento #saudeemocional #gratuito #bemestar',
      },
    ],
    mensagensWA: [
      `🔮 *LUMINA — O diagnóstico que ninguém te fez.*\n\n7 perguntas sobre:\n• Energia\n• Tensão no corpo\n• Imagem no espelho\n• Passado e futuro\n• Clareza mental\n• Conexão\n\n23 leituras possíveis. Resultado personalizado.\n\n100% gratuito. 2 minutos. Sem registo.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Fazes um diagnóstico e ficas em choque',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\n[Texto em ecrã, fundo índigo]\n"Fiz um diagnóstico emocional gratuito e..."\n\n*CENA 2 (5-15s)* — DESENVOLVIMENTO\n[Texto em ecrã]\n"7 perguntas. 23 padrões possíveis. E acertou em TUDO."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\n[Texto em ecrã + mockup do LUMINA]\n"LUMINA. Gratuito. 2 minutos. Link na bio."\n\n*CENA 4 (25-30s)* — CTA\n[Texto em ecrã]\n"Link na bio. 🔮"`,
      caption: 'Fiz um diagnóstico emocional gratuito e... 🔮\n\n#seteecos #lumina #diagnostico #autoconhecimento #gratuit #tiktok #fyp',
    },
  },

  vitalis: {
    nome: 'VITALIS',
    subtitulo: 'Inteligência Nutricional & Desportiva',
    emoji: '🌿',
    moeda: null,
    cor: '#7C8B6F',
    link: '/vitalis',
    linkPagamento: '/vitalis/pagamento',
    preco: '2.500 MZN/mês',
    hooks: HOOKS_PROVOCADORES,
    conteudoIG: [
      {
        tipo: 'carrossel',
        titulo: '5 Mitos sobre Alimentação',
        slides: [
          { titulo: '5 Mitos que Destroem a tua Saúde', texto: 'Quantos destes já acreditaste?' },
          { titulo: 'Mito 1: Hidratos engordam', texto: 'Falso. O que importa é a porção e o acompanhamento. Hidratos são energia essencial.' },
          { titulo: 'Mito 2: Preciso de suplementos caros', texto: 'Feijão, ovo, amendoim, lentilhas. Proteína acessível em qualquer mercado.' },
          { titulo: 'Mito 3: Comer menos = emagrecer', texto: 'Quando comes de menos, o metabolismo abranda. Comer MELHOR é o segredo.' },
          { titulo: 'Mito 4: Salada todos os dias', texto: 'Comida saudável tem sabor. Caril de coco, piri-piri. Porção certa = saúde.' },
          { titulo: 'Para de acreditar em mitos.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
        ],
        caption: '5 mitos que provavelmente já acreditaste (eu também!) 🌿\n\nDesliza e descobre a verdade.\n\nSalva este post. Partilha com alguém que precisa.\n\n#seteecos #vitalis #nutricaointeligente #mitos #comidadereal #saudereal',
      },
      {
        tipo: 'carrossel',
        titulo: '4 Sinais de Fome Emocional',
        slides: [
          { titulo: 'Tens fome ou tens medo?', texto: '4 sinais de que comes por emoção, não por necessidade.' },
          { titulo: 'Sinal 1: Comes sem fome', texto: 'Quando a boca quer mas o estômago não pede. É emoção disfarçada.' },
          { titulo: 'Sinal 2: Comes às escondidas', texto: 'Se precisas de esconder o que comes, o problema não é a comida.' },
          { titulo: 'Sinal 3: Culpa depois de comer', texto: 'Comer não é crime. Se sentes culpa, alguém te ensinou a ter medo.' },
          { titulo: 'Sinal 4: Comer acalma a ansiedade', texto: 'A comida virou anestesia. O corpo encontrou uma forma de lidar com a dor.' },
          { titulo: 'Há uma saída. E não é mais uma dieta.', texto: 'VITALIS - Espaço de Retorno Emocional\napp.seteecos.com' },
        ],
        caption: 'Tens fome... ou algo dentro de ti precisa de atenção? 🤍\n\nDesliza e descobre os 4 sinais de fome emocional.\n\nPartilha com alguém que precisa de ouvir isto.\n\n#seteecos #vitalis #fomeemocional #saudeemocional #comerconsciente #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: 'Guia de Porções com as Mãos',
        slides: [
          { titulo: 'Esquece a balança. Usa as mãos.', texto: 'O guia mais simples para porções correctas.' },
          { titulo: 'Palma aberta = Proteína', texto: 'Frango, peixe, carne, ovo. Uma palma por refeição.' },
          { titulo: 'Punho fechado = Hidratos', texto: 'Arroz, massa, batata, pão. Um punho por refeição. É suficiente.' },
          { titulo: 'Polegar = Gorduras', texto: 'Óleo, amendoim, abacate. Um polegar. Pouco mas essencial.' },
          { titulo: 'Duas mãos = Legumes', texto: 'Quanto mais legumes, melhor. Sem limite. Enche o prato.' },
          { titulo: 'Sem balança. Sem apps. Só as tuas mãos.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
        ],
        caption: 'A forma mais simples de medir porções que já vi 🤲\n\nNão precisa de balança. Não precisa de app de calorias. Só as tuas mãos.\n\nSalva e usa na tua próxima refeição.\n\n#seteecos #vitalis #porcoes #nutricao #comidadereal #dicasdesaude',
      },
      {
        tipo: 'dica',
        texto: 'A comida que a tua avó fazia é mais saudável que qualquer suplemento importado.',
        caption: 'A comida que a tua avó fazia é mais saudável que qualquer suplemento importado. 🌿\n\nFerro, vitaminas, proteína vegetal. Tudo na comida real que já conheces.\n\nNão precisas de comprar nada caro. Precisas de voltar ao que é teu.\n\nO VITALIS ensina-te a usar o que já tens.\n\n#seteecos #vitalis #comidadeverdade #nutricao #comidadereal #bemestar',
      },
      {
        tipo: 'dica',
        texto: 'Dormes 5 horas e depois perguntas porque não emagreces?',
        caption: 'Dormes 5 horas e depois perguntas porque não emagreces? 😴\n\nO sono regula as hormonas da fome. Se dormes mal, o corpo pede açúcar para compensar.\n\nNão é falta de disciplina. É falta de descanso.\n\nO VITALIS rastreia sono, stress e alimentação juntos.\n\n#seteecos #vitalis #sono #nutricao #saudereal #metabolismo #bemestar',
      },
      {
        tipo: 'educação',
        texto: 'Fome emocional: quando comes para calar uma emoção, não para alimentar o corpo.',
        caption: 'Fome emocional: quando comes para calar uma emoção, não para alimentar o corpo. 🤍\n\nSinais de que a fome é emocional:\n• Aparece de repente (a fome real é gradual)\n• Pede comida específica (doce, salgado, processado)\n• Continua depois de estares satisfeito/a\n• Traz culpa depois\n\nO VITALIS tem um Espaço de Retorno para estes momentos. Sem julgamento.\n\n#seteecos #vitalis #fomeemocional #nutricao #saudeemocional #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: 'O Ciclo Vicioso da Dieta',
        slides: [
          { titulo: '80% dos problemas com comida são emocionais.', texto: 'Conhece o ciclo que te prende.' },
          { titulo: 'STRESS → Comes demais', texto: 'O corpo procura conforto rápido. Açúcar. Hidratos. Comida processada.' },
          { titulo: 'CULPA → Restringes', texto: '"Amanhã não como nada." A punição começa.' },
          { titulo: 'RESTRIÇÃO → Compulsão', texto: 'O corpo não aguenta. Comes tudo. A culpa volta. Repete.' },
          { titulo: 'A saída não é mais disciplina. É compreensão.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
        ],
        caption: 'Já estiveste preso/a neste ciclo? Eu também. 🔄\n\nStress → Comida → Culpa → Restrição → Compulsão → Mais culpa.\n\nA saída não é mais força de vontade. É entender PORQUE acontece.\n\nDesliza.\n\n#seteecos #vitalis #ciclovicioso #saudeemocional #semdieta #bemestar',
      },
    ],
    mensagensWA: [
      `🌿 *VITALIS — Inteligência Nutricional*\n\nNão é mais uma dieta. É o fim das dietas.\n\n🍽 Plano alimentar feito para TI (comida real, acessível)\n📱 Coach disponível 24h\n💚 Espaço emocional para dias difíceis\n📊 Dashboard com o teu progresso\n🎯 Desafios semanais\n📖 Receitas com ingredientes locais\n\nEnvia-me mensagem para saber como começar 🌿\n\n👉 `,
      `🤍 *A comida não é o problema. É a anestesia.*\n\nQuando comes sem fome, não é gula. É dor.\n\nO VITALIS tem um Espaço de Retorno para esses momentos. Sem julgamento. Sem culpa.\n\nExperimenta o diagnóstico gratuito LUMINA primeiro:\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Descobres que o problema nunca foi a comida',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\n[Texto em ecrã, fundo verde-musgo]\n"O problema não é o que comes. É o que te come por dentro."\n\n*CENA 2 (5-15s)* — DESENVOLVIMENTO\n[Texto em ecrã]\n"80% dos problemas com comida são emocionais. Dietas não resolvem emoções."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\n[Texto em ecrã + mockup do VITALIS]\n"VITALIS: coaching nutricional que cuida da comida E da emoção."\n\n*CENA 4 (25-30s)* — CTA\n[Texto em ecrã]\n"Link na bio. 🌿"`,
      caption: 'O problema não é o que comes. É o que te come por dentro. 🌿\n\n#seteecos #vitalis #nutricao #fomeemocional #semdieta #tiktok #fyp',
    },
  },
};

export function getConteudoMultiEco() {
  return ECO_CONTEUDO;
}

export function getConteudoEco(eco) {
  return ECO_CONTEUDO[eco] || null;
}

export function getHooksEco(eco) {
  return ECO_CONTEUDO[eco]?.hooks || [];
}

export function getTodosHooksMultiEco() {
  const todos = [];
  for (const [eco, dados] of Object.entries(ECO_CONTEUDO)) {
    for (const hook of (dados.hooks || [])) {
      todos.push({ eco, hook, cor: dados.cor, emoji: dados.emoji, nome: dados.nome });
    }
  }
  return todos;
}

// ============================================================
// CALENDÁRIO MULTI-ECO — Rotação semanal entre todos os Ecos
// ============================================================

const ROTACAO_SEMANAL = {
  0: { eco: 'serena', tema: 'Reflexão emocional', formato: 'carrossel', razao: 'Domingo = introspecção' },
  1: { eco: 'ignis', tema: 'Foco e acção', formato: 'dica', razao: 'Segunda = motivação para a semana' },
  2: { eco: 'vitalis', tema: 'Corpo e nutrição', formato: 'carrossel', razao: 'Terça = prático e útil' },
  3: { eco: 'ecoa', tema: 'Voz e expressão', formato: 'dica', razao: 'Quarta = meio da semana, coragem' },
  4: { eco: 'ventis', tema: 'Energia e ritmo', formato: 'carrossel', razao: 'Quinta = pausa consciente' },
  5: { eco: 'aurea', tema: 'Autovalor e presença', formato: 'testemunho', razao: 'Sexta = celebração pessoal' },
  6: { eco: 'imago', tema: 'Identidade e essência', formato: 'dica', razao: 'Sábado = autoconhecimento profundo' },
};

export function getCalendarioMultiEco(semanas = 4) {
  const baseUrl = BASE_URL;
  const calendario = [];

  for (let semana = 1; semana <= semanas; semana++) {
    const dias = [];
    for (let diaSemana = 0; diaSemana <= 6; diaSemana++) {
      const rotacao = ROTACAO_SEMANAL[diaSemana];
      const ecoData = ECO_CONTEUDO[rotacao.eco];
      if (!ecoData) continue;

      const hookIndex = (semana - 1 + diaSemana) % (ecoData.hooks?.length || 1);
      const hook = ecoData.hooks?.[hookIndex] || '';
      const linkEco = `${baseUrl}${ecoData.link}`;
      const linkLumina = `${baseUrl}/lumina`;

      dias.push({
        diaSemana,
        eco: rotacao.eco,
        ecoNome: ecoData.nome,
        ecoEmoji: ecoData.emoji,
        ecoCor: ecoData.cor,
        tema: rotacao.tema,
        formato: rotacao.formato,
        hook,
        linkEco,
        linkLumina,
        // A cada 3 dias, intercalar com um post LUMINA (gratuito como anzol)
        intercalarLumina: diaSemana % 3 === 0,
        conteudoIG: ecoData.conteudoIG?.[hookIndex % (ecoData.conteudoIG?.length || 1)] || null,
      });
    }
    calendario.push({ semana, dias });
  }

  return calendario;
}

export function getRotacaoSemanal() {
  return ROTACAO_SEMANAL;
}

// ============================================================
// FORMATOS POR CANAL — IG, FB, WA, TikTok
// ============================================================

// ============================================================
// GERADOR DE CONTEUDO DIÁRIO — 4 plataformas × 2 ecos
// Vitalis SEMPRE + eco do dia em rotação
// ============================================================

const HASHTAGS_IG_BASE = ['#seteecos', '#vitalis', '#transformacao', '#bemestar'];
const HASHTAGS_TIKTOK_BASE = ['#seteecos', '#fyp', '#tiktok'];

function formatarParaFacebook(hook, corpo, cta, ecoNome) {
  // Facebook: mais curto, sem hashtags pesados, tom conversacional
  return `${hook}\n\n${corpo}\n\n${cta}\n\n— Vivianne | ${ecoNome}`;
}

function formatarParaTikTok(hook, corpo, cta, eco, hashtagsExtra) {
  const hashtags = [...HASHTAGS_TIKTOK_BASE, ...(hashtagsExtra || [])].slice(0, 6).join(' ');
  return {
    ideia: `HOOK (0-3s): "${hook}"\n\nDESENVOLVIMENTO: ${corpo}\n\nCTA: ${cta}`,
    caption: `${hook} ${ECO_CONTEUDO[eco]?.emoji || '🌿'}\n\n${hashtags}`,
  };
}

function formatarParaInstagram(hook, corpo, cta, hashtagsTematicos) {
  const hashtags = [...HASHTAGS_IG_BASE, ...(hashtagsTematicos || [])].slice(0, 12).join(' ');
  return {
    caption: `${hook}\n\n${corpo}\n\n${cta}\n\nLink na bio.\n.\n.\n.\n${hashtags}`,
    hashtags,
  };
}

function formatarParaWhatsApp(hook, corpo, cta, linkEco) {
  return `${hook}\n\n${corpo}\n\n${cta}\n\n👉 ${linkEco}`;
}

// Mapa eco -> array de conteúdo expandido (hook/corpo/cta)
const ECO_CONTEUDO_ARRAYS = {
  aurea: CONTEUDO_AUREA,
  serena: CONTEUDO_SERENA,
  ignis: CONTEUDO_IGNIS,
  ventis: CONTEUDO_VENTIS,
  ecoa: CONTEUDO_ECOA,
  imago: CONTEUDO_IMAGO,
  lumina: CONTEUDO_LUMINA,
};

function gerarConteudoEcoDia(eco, seed) {
  const ecoData = ECO_CONTEUDO[eco];
  if (!ecoData) return null;

  const hooks = ecoData.hooks || [];
  const conteudoIG = ecoData.conteudoIG || [];
  const mensagensWA = ecoData.mensagensWA || [];
  const script = ecoData.scriptTikTok;

  const hookIndex = seed % (hooks.length || 1);
  const igIndex = seed % (conteudoIG.length || 1);
  const waIndex = seed % (mensagensWA.length || 1);

  let igContent = conteudoIG[igIndex] || null;
  const waMsg = mensagensWA[waIndex] || '';

  // Usar CONTEUDO_* expandidos para hook/corpo/cta quando disponível
  let hook = '';
  let corpo = '';
  let cta = '';
  let usouExpandido = false;
  const conteudoArray = ECO_CONTEUDO_ARRAYS[eco];

  if (eco === 'vitalis') {
    hook = hooks[hookIndex] || '';
    const conteudo = getConteudoByTema(['corpo', 'emocional', 'provocacao'][seed % 3], seed);
    corpo = conteudo.corpo;
    cta = conteudo.cta;
    usouExpandido = true;
    igContent = {
      tipo: 'dica',
      texto: corpo.slice(0, 120),
      subtitulo: cta,
      caption: '',
    };
  } else if (conteudoArray && conteudoArray.length > 0) {
    // Usar conteúdo expandido (12 entradas por eco)
    const item = conteudoArray[seed % conteudoArray.length];
    hook = item.hook;
    corpo = item.corpo;
    cta = item.cta;
    usouExpandido = true;
    // Sobrescrever igContent para reflectir o conteúdo expandido
    igContent = {
      tipo: 'dica',
      texto: corpo.slice(0, 120),
      subtitulo: cta,
      caption: '',
    };
  } else {
    hook = hooks[hookIndex] || '';
    corpo = igContent?.texto || hook;
    cta = `Descobre mais sobre o ${ecoData.nome}. Link na bio.`;
  }

  const linkEco = `${BASE_URL}${ecoData.link}`;
  const hashExtra = HASHTAGS_TEMATICOS[eco === 'vitalis' ? ['corpo', 'emocional', 'provocacao'][seed % 3] : eco] || [];

  // WA: quando há conteúdo expandido, gerar WA dinâmico; senão usar estático
  const whatsappFinal = usouExpandido
    ? formatarParaWhatsApp(hook, corpo, cta, linkEco)
    : (waMsg || formatarParaWhatsApp(hook, corpo, cta, linkEco));

  return {
    eco,
    nome: ecoData.nome,
    emoji: ecoData.emoji,
    cor: ecoData.cor,
    link: linkEco,
    hook,
    corpo,
    cta,
    // Conteúdo IG (carrossel ou dica)
    conteudoIG: igContent,
    // 4 plataformas formatadas
    instagram: formatarParaInstagram(hook, corpo, cta, hashExtra),
    facebook: formatarParaFacebook(hook, corpo, cta, ecoData.nome),
    tiktok: script ? {
      ideia: script.roteiro,
      caption: script.caption,
    } : formatarParaTikTok(hook, corpo, cta, eco, hashExtra),
    whatsapp: whatsappFinal,
  };
}

export function gerarConteudoDiario(date = new Date(), variante = 0) {
  const dayOfWeek = date.getDay();
  const dayOfYear = getDayOfYear(date);
  const seed = dayOfYear + variante;

  // Vitalis SEMPRE
  const vitalis = gerarConteudoEcoDia('vitalis', seed);

  // Eco do dia em rotação (exclui vitalis da rotação)
  const ecosRotacao = ['aurea', 'serena', 'ignis', 'ventis', 'ecoa', 'imago', 'lumina'];
  const ecoHoje = ecosRotacao[dayOfWeek % ecosRotacao.length];
  const ecoDoDia = gerarConteudoEcoDia(ecoHoje, seed);

  const diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek];

  return {
    data: date.toISOString().split('T')[0],
    diaSemana,
    vitalis,
    ecoDoDia,
  };
}

export function gerarSemanaCompleta(startDate = new Date(), variante = 0) {
  const semana = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    semana.push(gerarConteudoDiario(d, variante));
  }
  return semana;
}

export function getFormatosCanal() {
  return {
    instagram: {
      formatos: ['post (1:1)', 'stories (9:16)', 'reels (9:16)', 'carrossel (1:1, até 10 slides)'],
      melhorHora: '8h-9h, 12h-13h, 18h-20h',
      hashtags: 15,
      maxCaption: 2200,
      dica: 'Reels têm o maior alcance orgânico. Carrosséis o maior engagement.',
    },
    facebook: {
      formatos: ['post com imagem', 'vídeo', 'reels', 'link com preview'],
      melhorHora: '9h-11h, 14h-16h',
      hashtags: 3,
      maxCaption: 63206,
      dica: 'Facebook prefere vídeos nativos. Evita links no texto (reduz alcance).',
    },
    whatsapp: {
      formatos: ['mensagem directa', 'broadcast', 'status (24h)', 'catálogo'],
      melhorHora: '8h-9h, 12h-13h, 19h-20h',
      maxMensagem: 1024,
      dica: 'Mensagens pessoais têm 5x mais abertura que broadcasts. Status = visibilidade gratuita.',
    },
    tiktok: {
      formatos: ['vídeo curto (15-60s)', 'vídeo médio (1-3min)', 'carousel (fotos)'],
      melhorHora: '7h-9h, 12h-15h, 19h-23h',
      hashtags: 5,
      maxCaption: 2200,
      dica: 'Primeiros 3 segundos são tudo. Hook forte. Texto em ecrã. Trending audio.',
    },
  };
}

// ============================================================
// CAMPANHA DE LANÇAMENTO — Estratégia para ZERO seguidores
// REELS ONLY (único formato que chega a não-seguidores)
// NUNCA misturar ecos — 1 eco por post, cor e mockup próprias
// Fase 1: Marca visual + Destaques IG
// Fase 2: Lumina grátis + Vitalis com mockups
// Fase 3: Cada eco individual (cor + mockup + identidade)
// ============================================================

const DESTAQUES_INSTAGRAM = [
  { eco: 'lumina', nome: 'LUMINA', emoji: '🔮', cor: '#5C6BC0', descricao: 'Diagnóstico gratuito — 7 perguntas, 23 leituras' },
  { eco: 'vitalis', nome: 'VITALIS', emoji: '🌿', cor: '#7C8B6F', descricao: 'Nutrição e corpo — plano, receitas, coach 24h' },
  { eco: 'aurea', nome: 'ÁUREA', emoji: '✨', cor: '#C9A227', descricao: 'Valor próprio — 100+ micro-práticas' },
  { eco: 'serena', nome: 'SERENA', emoji: '💧', cor: '#6B8E9B', descricao: 'Emoções — 16 emoções, respiração, diário' },
  { eco: 'ignis', nome: 'IGNIS', emoji: '🔥', cor: '#C1634A', descricao: 'Foco e disciplina — desafios, detector' },
  { eco: 'ventis', nome: 'VENTIS', emoji: '🍃', cor: '#5D9B84', descricao: 'Energia e ritmo — pausas, burnout' },
  { eco: 'ecoa', nome: 'ECOA', emoji: '🔊', cor: '#4A90A4', descricao: 'Voz e expressão — programa Micro-Voz' },
  { eco: 'imago', nome: 'IMAGO', emoji: '⭐', cor: '#8B7BA5', descricao: 'Identidade — espelho triplo, 50 valores' },
  { eco: 'aurora', nome: 'AURORA', emoji: '🌅', cor: '#D4A5A5', descricao: 'Integração final — desbloqueia com 7/7' },
];

export function getDestaquesInstagram() {
  return DESTAQUES_INSTAGRAM;
}

const LANCAMENTO_POSTS = [
  // =================================================================
  // FASE 1: MARCA & IDENTIDADE (Posts 1-4)
  // Narrativa: quem é a Sete Ecos e porque nasceu
  // =================================================================

  {
    dia: 1,
    fase: 1,
    faseTitulo: 'Marca & Identidade',
    titulo: 'Nasceu de excesso. Não de falta.',
    eco: 'seteEcos',
    template: 'dica',
    formato: 'reel',
    hook: 'Isto nasceu de excesso. Não de falta.',
    corpo: 'Não nasceu porque eu precisava de emagrecer. Não nasceu porque eu estava perdida.\n\nNasceu porque eu vivia muitas camadas ao mesmo tempo — intelectual, espiritual, profissional, criativa, corporal — e tudo estava separado.\n\nEu tinha profundidade. Tinha disciplina. Tinha visão. Mas não tinha integração.\n\nRecusei-me a continuar a trabalhar a vida por pedaços. E criei isto.',
    cta: 'Segue. Nos próximos dias vais perceber o que é.',
    instagram: { caption: 'Isto nasceu de excesso. Não de falta.\n\nNão nasceu porque eu precisava de emagrecer.\nNão nasceu porque eu estava perdida.\n\nNasceu porque eu vivia muitas camadas ao mesmo tempo — e tudo estava separado.\n\nRecusei-me a continuar a trabalhar a vida por pedaços.\n\n— Vivianne\n\n#seteecos #integração #autoconhecimento #maputo #moçambique #reels' },
    facebook: 'Isto nasceu de excesso. Não de falta.\n\nEu vivia muitas camadas ao mesmo tempo — intelectual, espiritual, profissional, criativa, corporal — e tudo estava separado.\n\nRecusei-me a continuar a trabalhar a vida por pedaços.\n\n— Vivianne | Sete Ecos',
    whatsapp: 'Criei algo a partir de uma necessidade real.\n\nEu vivia muitas camadas ao mesmo tempo — e nenhuma falava com a outra. A Sete Ecos nasceu como resposta.\n\nSegue @seteecos no Instagram para perceberes o que é.',
    tiktok: { ideia: 'REEL — TEXTO EM ECRÃ (palavra a palavra, fundo escuro roxo, música calma trending):\n\n"Isto nasceu de excesso."\n"Não de falta."\n[pausa 2s]\n"Vivia muitas camadas."\n"Todas separadas."\n[pausa]\n"Recusei-me a continuar."\n"E criei isto."\n"— Vivianne"', caption: 'Nasceu de excesso. Não de falta. #seteecos #integração #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Isto nasceu de excesso. Não de falta.', subtitulo: 'Recusei-me a trabalhar a vida por pedaços.', caption: '' },
    dica: 'REEL obrigatório. Texto palavra a palavra, fundo escuro roxo (#6B5B95), música calma trending. Sem cara — só texto. É a declaração de identidade da marca.',
  },

  {
    dia: 2,
    fase: 1,
    faseTitulo: 'Marca & Identidade',
    titulo: '7 dimensões que finalmente conversam.',
    eco: 'seteEcos',
    template: 'dica',
    formato: 'reel',
    hook: 'Resolver só o corpo não muda identidade. Resolver só emoção não muda disciplina.',
    corpo: 'Enquanto tratares partes isoladas, vais continuar a viver em ciclos.\n\nCorpo (Vitalis). Valor (Áurea). Emoção (Serena). Vontade (Ignis). Energia (Ventis). Voz (Ecoa). Identidade (Imago).\n\n7 dimensões. 1 sistema. As partes conversam entre si.\n\nChama-se Sete Ecos.',
    cta: 'Nos próximos dias vais conhecer cada uma.',
    instagram: { caption: 'Resolver só o corpo não muda identidade.\nResolver só emoção não muda disciplina.\n\nEnquanto tratares partes isoladas, vais continuar a viver em ciclos.\n\n7 dimensões. 1 sistema.\nAs partes conversam entre si.\n\nChama-se Sete Ecos.\n\n— Vivianne\n\n#seteecos #integração #bemestar #autoconhecimento #maputo #moçambique #reels' },
    facebook: 'Resolver só o corpo não muda identidade. Resolver só emoção não muda disciplina.\n\n7 dimensões. 1 sistema. As partes conversam.\n\nChama-se Sete Ecos.\n\n— Vivianne | Sete Ecos',
    whatsapp: 'Resolver só o corpo não muda identidade. Resolver só emoção não muda disciplina.\n\nCriei um sistema de 7 dimensões onde tudo conversa: corpo, valor, emoção, vontade, energia, voz, identidade.\n\nChama-se Sete Ecos.',
    tiktok: { ideia: 'REEL — Cada dimensão aparece com a SUA cor de fundo:\n\n"Resolver só o corpo não muda identidade."\n[pausa]\n"7 dimensões."\n[transição de cores: verde → dourado → azul → terracota → teal → azul oceano → roxo]\n"1 sistema."\n"As partes conversam."\n"Sete Ecos."', caption: '7 dimensões. 1 sistema. #seteecos #integração #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Resolver só o corpo não muda identidade.', subtitulo: '7 dimensões. 1 sistema. Sete Ecos.', caption: '' },
    dica: 'REEL com transição de cores — cada eco aparece com o SEU fundo. O texto central é a tese da marca. Efeito visual forte.',
  },

  {
    dia: 3,
    fase: 1,
    faseTitulo: 'Marca & Identidade',
    titulo: 'O ponto de partida.',
    eco: 'lumina',
    template: 'cta',
    formato: 'reel',
    hook: '8 dimensões da tua vida. 7 perguntas. 2 minutos. Grátis.',
    corpo: 'O LUMINA mapeia como estás — de verdade. Não mede peso. Não conta calorias.\n\nMede corpo, energia, mente, emoção, passado, futuro, conexão, espelho.\n\n23 leituras possíveis. Cada uma com um padrão diferente. E a partir daí, sabes por onde começar.',
    cta: 'Experimenta: app.seteecos.com/lumina',
    instagram: { caption: '8 dimensões da tua vida mapeadas.\n7 perguntas. 2 minutos. Grátis.\n\nO LUMINA não mede peso. Não conta calorias.\n\nMede como estás — de verdade.\n\n23 leituras possíveis. Cada uma é o teu ponto de partida.\n\nLink na bio.\n\n#lumina #seteecos #autoconhecimento #diagnóstico #grátis #maputo #moçambique #reels' },
    facebook: '8 dimensões. 7 perguntas. 2 minutos. Grátis.\n\nO LUMINA mapeia como estás de verdade. 23 leituras possíveis.\n\nExperimenta: app.seteecos.com/lumina\n\n— Vivianne | Sete Ecos',
    whatsapp: '8 dimensões da tua vida. 7 perguntas. 2 minutos. Grátis.\n\nO LUMINA é o ponto de partida. 23 leituras possíveis.\n\n👉 app.seteecos.com/lumina',
    tiktok: { ideia: 'REEL — Screen recording do Lumina:\n\n"8 dimensões. 7 perguntas. 2 minutos. Grátis."\n[gravar ecrã a abrir LUMINA]\n[mostrar as perguntas uma a uma]\n[mostrar o resultado]\n"23 leituras possíveis. Qual é a tua?"\n"Link na bio."', caption: '23 leituras. Qual é a tua? #lumina #seteecos #fyp' },
    conteudoIG: { tipo: 'cta', texto: '8 dimensões. 7 perguntas. 2 minutos. Grátis.', subtitulo: 'LUMINA — o ponto de partida.', caption: '' },
    dica: 'REEL — Screen recording real do Lumina no telemóvel. Autêntico. Mostra que funciona de verdade. Fundo indigo (#5C6BC0).',
  },

  {
    dia: 4,
    fase: 1,
    faseTitulo: 'Marca & Destaques',
    titulo: 'Criar 9 Destaques do Instagram',
    eco: 'lumina',
    template: 'dica',
    formato: 'destaques',
    hook: '9 anéis coloridos no topo do teu perfil — um por cada Eco',
    corpo: 'Os Destaques (Highlights) são os anéis no topo do perfil Instagram. Cada um representa um Eco com a sua cor e identidade.\n\nCria uma Story para cada eco (fundo com a cor do eco + nome + emoji). Guarda como Destaque.\n\nAssim quem visita o perfil vê imediatamente o sistema completo.',
    cta: 'Cria os 9 destaques antes de continuar a publicar.',
    instagram: { caption: '' },
    facebook: '',
    whatsapp: '',
    tiktok: { ideia: '', caption: '' },
    conteudoIG: {
      tipo: 'carrossel',
      titulo: '9 Capas de Destaques',
      texto: 'Cria uma Story para cada eco e guarda como Destaque.',
      slides: [
        { titulo: '🔮 LUMINA', texto: 'Cor: Indigo (#5C6BC0)\nConteúdo: "Diagnóstico gratuito"\nStory: fundo indigo + 🔮 + LUMINA' },
        { titulo: '🌿 VITALIS', texto: 'Cor: Verde salva (#7C8B6F)\nConteúdo: "Nutrição inteligente"\nStory: fundo verde + 🌿 + VITALIS' },
        { titulo: '✨ ÁUREA', texto: 'Cor: Dourado (#C9A227)\nConteúdo: "Valor próprio"\nStory: fundo dourado + ✨ + ÁUREA' },
        { titulo: '💧 SERENA', texto: 'Cor: Azul (#6B8E9B)\nConteúdo: "Emoções"\nStory: fundo azul + 💧 + SERENA' },
        { titulo: '🔥 IGNIS', texto: 'Cor: Terracota (#C1634A)\nConteúdo: "Foco"\nStory: fundo terracota + 🔥 + IGNIS' },
        { titulo: '🍃 VENTIS', texto: 'Cor: Teal (#5D9B84)\nConteúdo: "Energia"\nStory: fundo teal + 🍃 + VENTIS' },
        { titulo: '🔊 ECOA', texto: 'Cor: Azul oceano (#4A90A4)\nConteúdo: "Voz"\nStory: fundo azul oceano + 🔊 + ECOA' },
        { titulo: '⭐ IMAGO', texto: 'Cor: Roxo (#8B7BA5)\nConteúdo: "Identidade"\nStory: fundo roxo + ⭐ + IMAGO' },
        { titulo: '🌅 AURORA', texto: 'Cor: Mauve (#D4A5A5)\nConteúdo: "Integração final"\nStory: fundo mauve + 🌅 + AURORA' },
      ],
      caption: '',
    },
    dica: 'NÃO é um post para publicar — é uma tarefa de preparação do perfil. Cria 9 Stories (uma por eco) com fundo na cor do eco + emoji + nome. Guarda cada uma como Destaque. O resultado: 9 anéis coloridos no topo do perfil. Visitantes veem o sistema todo de relance.',
  },

  // =================================================================
  // FASE 2: LUMINA + VITALIS (Posts 5-10)
  // Objectivo: Isca gratuita + produto herói com MOCKUPS REAIS
  // =================================================================

  {
    dia: 5,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'O que o LUMINA revela sobre ti.',
    eco: 'lumina',
    template: 'dica',
    formato: 'reel',
    hook: 'Energia baixa pode ser desconexão emocional. Tensão no corpo pode ser palavras engolidas.',
    corpo: 'O LUMINA não te diz o que está "errado". Mostra-te padrões que não vias.\n\nCansaço crónico? Pode ser falta de ritmo, não de sono.\nTensão no corpo? Pode ser o que não dizes.\nFalta de clareza? Pode ser identidade fragmentada.\n\nCada leitura é uma porta. Tu decides qual abrir.',
    cta: 'Grátis. 2 minutos. app.seteecos.com/lumina',
    instagram: { caption: 'Energia baixa pode ser desconexão emocional.\nTensão no corpo pode ser palavras engolidas.\n\nO LUMINA mostra padrões que não vias.\n\n23 leituras. Cada uma é uma porta.\nTu decides qual abrir.\n\nGrátis. Link na bio.\n\n#lumina #seteecos #autoconhecimento #padrões #maputo #moçambique #reels' },
    facebook: 'Energia baixa pode ser desconexão emocional. Tensão no corpo pode ser palavras engolidas.\n\nO LUMINA mostra padrões que não vias. 23 leituras possíveis.\n\nGrátis → app.seteecos.com/lumina\n\n— Vivianne | Sete Ecos',
    whatsapp: 'O LUMINA não te diz o que está "errado". Mostra-te padrões que não vias.\n\n23 leituras possíveis. Grátis.\n\n👉 app.seteecos.com/lumina',
    tiktok: { ideia: 'REEL — Revelação de padrões:\n\n"Energia baixa?"\n"Pode ser desconexão emocional."\n"Tensão no corpo?"\n"Pode ser o que não dizes."\n[pausa]\n"O LUMINA mostra o que não vias."\n"Grátis. Link na bio."', caption: 'O que o teu corpo te diz #lumina #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Energia baixa pode ser desconexão emocional.', subtitulo: 'O LUMINA mostra padrões que não vias.', caption: '' },
    dica: 'REEL — Texto animado com revelação de padrões. Fundo indigo (#5C6BC0). Cada padrão aparece como conexão inesperada.',
  },

  {
    dia: 6,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'O corpo é a primeira dimensão. Não a única.',
    eco: 'vitalis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/mozproud-vitalis.jpeg'],
    hook: 'A maioria das apps resolve o corpo e ignora tudo o resto. O VITALIS é diferente.',
    corpo: 'Dentro do sistema Sete Ecos, o corpo é a raiz. A primeira dimensão. O VITALIS cuida dela com profundidade:\n\nPlano nutricional personalizado. 98 receitas com ingredientes do mercado. Coach disponível 24h. Treinos adaptados. Espaço emocional integrado.\n\nMas é UMA dimensão de sete. E isso é o ponto.',
    cta: '7 dias grátis. Link na bio.',
    instagram: { caption: 'A maioria das apps resolve o corpo e ignora tudo o resto.\n\nO VITALIS é a primeira dimensão do sistema Sete Ecos. Cuida do corpo com profundidade — plano, receitas, coach, treinos, espaço emocional.\n\nMas é uma dimensão de sete. E isso é o ponto.\n\n7 dias grátis. Link na bio.\n\n— Vivianne\n\n#vitalis #seteecos #nutricao #integração #maputo #moçambique #reels' },
    facebook: 'A maioria das apps resolve o corpo e ignora tudo o resto.\n\nO VITALIS é a raiz — plano, receitas, coach 24h, espaço emocional. Mas é uma dimensão de sete.\n\n— Vivianne | VITALIS',
    whatsapp: 'O VITALIS é a raiz do sistema Sete Ecos.\n\nPlano nutricional. 98 receitas. Coach 24h. Espaço emocional.\n\nMas é uma dimensão de sete. E isso é o ponto.\n\n👉 app.seteecos.com/vitalis',
    tiktok: { ideia: 'REEL — Mockup mozproud:\n\n"A maioria das apps resolve o corpo e ignora tudo o resto."\n[mostrar mockup]\n"O VITALIS é a primeira dimensão."\n"Não a única."\n"Sete Ecos."', caption: 'Primeira dimensão 🌿 #vitalis #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'A maioria das apps resolve o corpo e ignora tudo o resto.', subtitulo: 'O VITALIS é a primeira dimensão. Não a única.', caption: '' },
    dica: 'REEL com mockup mozproud-vitalis.jpeg. Mensagem central: o corpo é importante MAS é parte de algo maior. Fundo VERDE (#7C8B6F).',
  },

  {
    dia: 7,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'Isto é real. Não é um PDF.',
    eco: 'vitalis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Vitalis-dashboard_mb-mockup.jpeg'],
    hook: 'Isto é o que recebes. Não é um PDF. Não é um grupo de WhatsApp. É uma app completa.',
    corpo: 'Plano personalizado. Check-in diário. 98 receitas filtradas para ti. Espaço emocional. Relatórios de evolução. Treinos adaptados.\n\nTudo construído com rigor. Nada genérico.',
    cta: 'Link na bio.',
    instagram: { caption: 'Isto é o que recebes.\n\nNão é um PDF. Não é um grupo de WhatsApp.\nÉ uma app completa:\n\nPlano personalizado. Check-in diário. 98 receitas. Espaço emocional. Relatórios. Treinos.\n\nConstruído com rigor. Nada genérico.\n\nLink na bio.\n\n— Vivianne\n\n#vitalis #seteecos #app #dashboard #maputo #moçambique #reels' },
    facebook: 'Isto é o que recebes. Não é PDF. Não é grupo de WhatsApp. É app completa.\n\nConstruído com rigor. Nada genérico.\n\n— Vivianne | VITALIS',
    whatsapp: 'Isto é o VITALIS por dentro.\n\nPlano personalizado. 98 receitas. Coach 24h. Espaço emocional. Tudo numa app.\n\n👉 app.seteecos.com/vitalis',
    tiktok: { ideia: 'REEL — Mostrar dashboard:\n\n"Isto é o que recebes."\n[mostrar mockup dashboard]\n"Não é PDF. Não é grupo."\n"É app completa. Construída com rigor."\n"Link na bio."', caption: 'Nada genérico #vitalis #seteecos #fyp #app' },
    conteudoIG: { tipo: 'dica', texto: 'Isto é o que recebes.', subtitulo: 'Construído com rigor. Nada genérico.', caption: '' },
    dica: 'REEL com mockup Vitalis-dashboard_mb-mockup.jpeg. Mostrar que é real e profissional. Fundo VERDE (#7C8B6F).',
  },

  {
    dia: 8,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'Acompanhamento real. Não chatbot genérico.',
    eco: 'vitalis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Vitalis-coach_mb-mockup.jpeg'],
    hook: 'Quando precisas de orientação, a resposta está a uma mensagem. A qualquer hora.',
    corpo: 'A Coach no VITALIS está disponível 24 horas. Porções. Prato. Jejum. Treino. Dúvidas.\n\nNão é motivação genérica. É coaching nutricional real, sempre acessível.\n\nPorque as dúvidas não esperam pelo horário de consulta.',
    cta: 'Link na bio.',
    instagram: { caption: 'Quando precisas de orientação, a resposta está a uma mensagem.\n\nA qualquer hora. Coach disponível 24h.\n\nPorções. Prato. Jejum. Treino. Dúvidas.\n\nNão é motivação genérica. É coaching real.\n\nLink na bio.\n\n— Vivianne\n\n#vitalis #seteecos #coaching #maputo #moçambique #reels' },
    facebook: 'Quando precisas de orientação, a resposta está a uma mensagem. A qualquer hora.\n\nCoaching real. Sempre acessível.\n\n— Vivianne | VITALIS',
    whatsapp: 'Coach de nutrição disponível 24h dentro do VITALIS.\n\nPorções. Prato. Jejum. Treino. Dúvidas.\n\nSem espera.\n\n👉 app.seteecos.com/vitalis',
    tiktok: { ideia: 'REEL — Mostrar coach:\n\n"Precisas de orientação."\n"A resposta está a uma mensagem."\n[mostrar mockup coach]\n"24h. Coaching real."\n"VITALIS — link na bio."', caption: 'Coaching real 24h #vitalis #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'A resposta está a uma mensagem. A qualquer hora.', subtitulo: 'Coach de nutrição 24h no VITALIS.', caption: '' },
    dica: 'REEL com mockup Vitalis-coach_mb-mockup.jpeg. Fundo VERDE (#7C8B6F).',
  },

  {
    dia: 9,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'Comida real. Do mercado. Para ti.',
    eco: 'vitalis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Vitalis-receitas_mb-mockup.jpeg'],
    hook: '98 receitas. Ingredientes que encontras em qualquer mercado. Sem listas impossíveis.',
    corpo: 'Pratos tradicionais. Opções leves. Comfort food. Refeições rápidas.\n\nCada receita filtrada para o TEU perfil e as TUAS restrições. Nada importado. Nada caro.\n\nPorque cuidar do corpo não devia ser um privilégio.',
    cta: 'Link na bio.',
    instagram: { caption: '98 receitas. Ingredientes do mercado. Sem listas impossíveis.\n\nFiltradas para o teu perfil. Nada importado. Nada caro.\n\nPorque cuidar do corpo não devia ser um privilégio.\n\nLink na bio.\n\n— Vivianne\n\n#vitalis #seteecos #receitas #comidareal #maputo #moçambique #reels' },
    facebook: '98 receitas com ingredientes do mercado. Sem listas impossíveis.\n\nCuidar do corpo não devia ser um privilégio.\n\n— Vivianne | VITALIS',
    whatsapp: '98 receitas com ingredientes reais e acessíveis.\n\nFiltradas para o teu perfil. Sem listas impossíveis.\n\n👉 app.seteecos.com/vitalis',
    tiktok: { ideia: 'REEL — Receitas:\n\n"98 receitas."\n"Ingredientes do mercado."\n[mostrar mockup receitas]\n"Sem listas impossíveis."\n"VITALIS — link na bio."', caption: 'Comida real #vitalis #seteecos #receitas #fyp' },
    conteudoIG: { tipo: 'dica', texto: '98 receitas. Ingredientes do mercado.', subtitulo: 'Cuidar do corpo não devia ser um privilégio.', caption: '' },
    dica: 'REEL com mockup Vitalis-receitas_mb-mockup.jpeg. Fundo VERDE (#7C8B6F).',
  },

  {
    dia: 10,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'O corpo e a emoção não são departamentos separados.',
    eco: 'vitalis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Vitalis-espaçoretorno_mb-mockup.jpeg'],
    hook: 'O corpo e a emoção não são departamentos separados. No VITALIS, também não.',
    corpo: 'O Espaço de Retorno existe dentro do VITALIS. É o lugar onde não se fala de comida. Fala-se do que está por trás.\n\nPorque uma app de nutrição que ignora o que sentes não é integração. É só mais um pedaço.\n\nE nós não trabalhamos por pedaços.',
    cta: 'Link na bio.',
    instagram: { caption: 'O corpo e a emoção não são departamentos separados.\n\nNo VITALIS, também não.\n\nO Espaço de Retorno: o lugar dentro da app onde não se fala de comida. Fala-se do que está por trás.\n\nPorque integração começa aqui.\n\nLink na bio.\n\n— Vivianne\n\n#vitalis #seteecos #integração #emoção #maputo #moçambique #reels' },
    facebook: 'O corpo e a emoção não são departamentos separados.\n\nNo VITALIS, também não. O Espaço de Retorno cuida do que está por trás.\n\n— Vivianne | VITALIS',
    whatsapp: 'O corpo e a emoção não são departamentos separados.\n\nO Espaço de Retorno no VITALIS: para quando o que sentes pesa mais do que o que comes.\n\n👉 app.seteecos.com/vitalis',
    tiktok: { ideia: 'REEL — Emocional:\n\n"O corpo e a emoção não são departamentos separados."\n[mostrar mockup espaço retorno]\n"Integração começa aqui."\n"VITALIS — link na bio."', caption: 'Integração começa aqui #vitalis #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'O corpo e a emoção não são departamentos separados.', subtitulo: 'Integração começa aqui. VITALIS.', caption: '' },
    dica: 'REEL com mockup Vitalis-espaçoretorno_mb-mockup.jpeg. Diferencial ÚNICO — integração corpo + emoção. Fundo VERDE (#7C8B6F).',
  },

  // =================================================================
  // FASE 3: CADA ECO INDIVIDUAL (Posts 11-17)
  // Objectivo: 1 eco por post, cor própria, mockup própria
  // NUNCA misturar ecos no mesmo post
  // =================================================================

  {
    dia: 11,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'ÁUREA — Onde mora o teu valor?',
    eco: 'aurea',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Aurea-Dash-portrait.png', '/mockups/Aurea-praticas-portrait.png'],
    hook: 'Cuidas do corpo mas não cuidas de como te vês ao espelho. Porquê?',
    corpo: 'O ÁUREA é a dimensão do valor próprio. Como gastas dinheiro, como ocupas o tempo, como te vestes, o que te dá prazer.\n\n100+ micro-práticas em 4 áreas. Não é autoajuda. É arqueologia do que vale para ti.\n\nSem esta dimensão, qualquer transformação é superficial.',
    cta: 'Link na bio.',
    instagram: { caption: 'Cuidas do corpo mas não cuidas de como te vês ao espelho. Porquê?\n\nO ÁUREA é a dimensão do valor próprio.\n\n100+ micro-práticas. 4 áreas: dinheiro, tempo, roupa, prazer.\n\nSem esta dimensão, qualquer transformação é superficial.\n\nLink na bio.\n\n— Vivianne\n\n#áurea #seteecos #valorpróprio #integração #maputo #moçambique #reels' },
    facebook: 'Cuidas do corpo mas não cuidas de como te vês ao espelho.\n\nO ÁUREA trabalha o valor próprio. 100+ micro-práticas.\n\n— Vivianne | ÁUREA',
    whatsapp: 'O ÁUREA é a dimensão do valor próprio.\n\n100+ micro-práticas em 4 áreas: dinheiro, tempo, roupa, prazer.\n\n👉 app.seteecos.com/aurea',
    tiktok: { ideia: 'REEL — Fundo DOURADO (#C9A227):\n\n"Cuidas do corpo..."\n"...mas não cuidas de como te vês ao espelho."\n[pausa]\n"Porquê?"\n[mostrar mockup Áurea]\n"ÁUREA — link na bio."', caption: 'Onde mora o teu valor? #áurea #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Cuidas do corpo mas não cuidas de como te vês.', subtitulo: 'ÁUREA — a dimensão do valor próprio.', caption: '' },
    dica: 'REEL — Fundo DOURADO (#C9A227) obrigatório. Mockups Aurea-Dash-portrait.png ou Aurea-praticas-portrait.png. NUNCA fundo verde.',
  },

  {
    dia: 12,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'SERENA — Sentir não é o problema. É informação.',
    eco: 'serena',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Serena-dash-portrait.png', '/mockups/Serena-praticas-portrait.png'],
    hook: 'Sentir intensamente não é o problema. O problema é não saber o que fazer com isso.',
    corpo: 'O SERENA mapeia 16 emoções no teu corpo. Quando as nomeias, perdem poder sobre ti.\n\n6 técnicas de respiração. Diário emocional. Detector de padrões. SOS para crises.\n\nNão é terapia. É consciência emocional com estrutura.',
    cta: 'Link na bio.',
    instagram: { caption: 'Sentir intensamente não é o problema.\nO problema é não saber o que fazer com isso.\n\nO SERENA mapeia 16 emoções no teu corpo. 6 técnicas de respiração. Detector de padrões.\n\nNão é terapia. É consciência com estrutura.\n\nLink na bio.\n\n— Vivianne\n\n#serena #seteecos #emoções #consciência #maputo #moçambique #reels' },
    facebook: 'Sentir intensamente não é o problema. O problema é não saber o que fazer com isso.\n\nO SERENA: 16 emoções, 6 respirações, padrões.\n\n— Vivianne | SERENA',
    whatsapp: 'Sentir intensamente não é o problema.\n\nO SERENA: 16 emoções mapeadas, 6 respirações, detector de padrões.\n\n👉 app.seteecos.com/serena',
    tiktok: { ideia: 'REEL — Fundo AZUL (#6B8E9B):\n\n"Sentir intensamente não é o problema."\n"O problema é não saber o que fazer com isso."\n[mostrar mockup Serena]\n"SERENA — link na bio."', caption: 'Sentir é informação #serena #seteecos #emoções #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Sentir intensamente não é o problema.', subtitulo: 'SERENA — consciência emocional com estrutura.', caption: '' },
    dica: 'REEL — Fundo AZUL (#6B8E9B) obrigatório. Mockups Serena. Música suave. NUNCA fundo verde.',
  },

  {
    dia: 13,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'IGNIS — A vontade sem direcção dispersa-se.',
    eco: 'ignis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Ignis-dash-portrait.png', '/mockups/Ignis-escolhas-portrait.png'],
    hook: 'Tens vontade de mudar tudo. Mas sem direcção, a vontade dispersa-se.',
    corpo: 'O IGNIS é a dimensão da vontade e do foco. Não te obriga a ser produtivo. Ajuda-te a perceber o que realmente importa.\n\n16 desafios. Sessões de foco. Detector de distracções. Bússola de valores.\n\nPorque disciplina sem direcção é só cansaço.',
    cta: 'Link na bio.',
    instagram: { caption: 'Tens vontade de mudar tudo. Mas sem direcção, a vontade dispersa-se.\n\nO IGNIS: 16 desafios. Sessões de foco. Detector de distracções. Bússola de valores.\n\nDisciplina sem direcção é só cansaço.\n\nLink na bio.\n\n— Vivianne\n\n#ignis #seteecos #foco #vontade #maputo #moçambique #reels' },
    facebook: 'Tens vontade de mudar tudo. Mas sem direcção, a vontade dispersa-se.\n\nO IGNIS: foco com propósito. 16 desafios.\n\n— Vivianne | IGNIS',
    whatsapp: 'A vontade sem direcção dispersa-se.\n\nO IGNIS: 16 desafios, sessões de foco, bússola de valores.\n\n👉 app.seteecos.com/ignis',
    tiktok: { ideia: 'REEL — Fundo TERRACOTA (#C1634A):\n\n"Tens vontade de mudar tudo."\n"Mas sem direcção, dispersa-se."\n[mostrar mockup Ignis]\n"IGNIS — link na bio."', caption: 'Vontade sem direcção #ignis #seteecos #foco #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Tens vontade de mudar tudo.', subtitulo: 'Sem direcção, dispersa-se. IGNIS.', caption: '' },
    dica: 'REEL — Fundo TERRACOTA (#C1634A) obrigatório. Mockups Ignis. NUNCA fundo verde.',
  },

  {
    dia: 14,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'VENTIS — A energia não se gere com café.',
    eco: 'ventis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Ventis-dash-portrait.png', '/mockups/Ventis-praticas-portrait.png'],
    hook: 'Se precisas de café para funcionar, não é energia. É dívida.',
    corpo: 'O VENTIS é a dimensão da energia e do ritmo. Monitor de energia. 8 tipos de pausas conscientes. Detector de burnout. Movimentos. Natureza.\n\nO teu corpo tem um ritmo natural. Ignorá-lo é o que te cansa.',
    cta: 'Link na bio.',
    instagram: { caption: 'Se precisas de café para funcionar, não é energia. É dívida.\n\nO VENTIS: monitor de energia. Pausas conscientes. Detector de burnout.\n\nO teu corpo tem um ritmo natural. Ignorá-lo é o que te cansa.\n\nLink na bio.\n\n— Vivianne\n\n#ventis #seteecos #energia #ritmo #maputo #moçambique #reels' },
    facebook: 'Se precisas de café para funcionar, não é energia. É dívida.\n\nO VENTIS encontra o teu ritmo natural.\n\n— Vivianne | VENTIS',
    whatsapp: 'Se precisas de café para funcionar, não é energia. É dívida.\n\nO VENTIS: monitor de energia + detector de burnout.\n\n👉 app.seteecos.com/ventis',
    tiktok: { ideia: 'REEL — Fundo TEAL (#5D9B84):\n\n"Se precisas de café para funcionar..."\n"...não é energia. É dívida."\n[mostrar mockup Ventis]\n"VENTIS — link na bio."', caption: 'Não é energia. É dívida. #ventis #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Se precisas de café para funcionar, não é energia.', subtitulo: 'VENTIS — energia e ritmo.', caption: '' },
    dica: 'REEL — Fundo TEAL (#5D9B84) obrigatório. Mockups Ventis. NUNCA fundo verde.',
  },

  {
    dia: 15,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'ECOA — O silêncio também é uma ferida.',
    eco: 'ecoa',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Ecoa-dash-portrait.png', '/mockups/Ecoa-praticas-portrait.png'],
    hook: 'Há coisas que nunca disseste. E o corpo guarda tudo.',
    corpo: 'O ECOA é a dimensão da voz e da expressão. Mapa de silenciamento. Programa Micro-Voz de 8 semanas. Cartas não enviadas. Comunicação assertiva.\n\nPorque integração também é ter voz para o que sentes.',
    cta: 'Link na bio.',
    instagram: { caption: 'Há coisas que nunca disseste. E o corpo guarda tudo.\n\nO ECOA: mapa de silenciamento. Programa Micro-Voz. Cartas não enviadas. Comunicação assertiva.\n\nIntegração também é ter voz.\n\nLink na bio.\n\n— Vivianne\n\n#ecoa #seteecos #voz #expressão #maputo #moçambique #reels' },
    facebook: 'Há coisas que nunca disseste. E o corpo guarda tudo.\n\nO ECOA: a dimensão da voz. 8 semanas.\n\n— Vivianne | ECOA',
    whatsapp: 'Há coisas que nunca disseste. E o corpo guarda tudo.\n\nO ECOA: programa Micro-Voz de 8 semanas.\n\n👉 app.seteecos.com/ecoa',
    tiktok: { ideia: 'REEL — Fundo AZUL OCEANO (#4A90A4):\n\n"Há coisas que nunca disseste."\n"E o corpo guarda tudo."\n[mostrar mockup Ecoa]\n"ECOA — link na bio."', caption: 'O corpo guarda tudo #ecoa #seteecos #voz #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Há coisas que nunca disseste.', subtitulo: 'E o corpo guarda tudo. ECOA.', caption: '' },
    dica: 'REEL — Fundo AZUL OCEANO (#4A90A4) obrigatório. Mockups Ecoa. NUNCA fundo verde.',
  },

  {
    dia: 16,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'IMAGO — Quem és tu para além dos papéis?',
    eco: 'imago',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Imago-dash-portrait.png', '/mockups/Imago-arqueologia-portrait.png'],
    hook: 'Profissional. Familiar. Amigo(a). Colega. E tu? Quem és tu para além dos papéis?',
    corpo: 'O IMAGO é a dimensão da identidade. Espelho triplo: essência, máscara, aspiração. Arqueologia pessoal. 50 valores. Mapa de identidade.\n\nPorque sem saber quem és, não sabes para onde ir.',
    cta: 'Link na bio.',
    instagram: { caption: 'Profissional. Familiar. Amigo(a). Colega.\nE tu? Quem és tu para além dos papéis?\n\nO IMAGO: espelho triplo. Arqueologia pessoal. 50 valores.\n\nSem saber quem és, não sabes para onde ir.\n\nLink na bio.\n\n— Vivianne\n\n#imago #seteecos #identidade #autoconhecimento #maputo #moçambique #reels' },
    facebook: 'Profissional. Familiar. Amigo(a). Colega. E tu? Quem és para além dos papéis?\n\nO IMAGO: a dimensão da identidade.\n\n— Vivianne | IMAGO',
    whatsapp: 'Quem és tu para além dos papéis que desempenhas?\n\nO IMAGO: espelho triplo, 50 valores, arqueologia pessoal.\n\n👉 app.seteecos.com/imago',
    tiktok: { ideia: 'REEL — Fundo ROXO (#8B7BA5):\n\n"Profissional. Familiar. Amigo(a). Colega."\n"E tu?"\n"Quem és para além dos papéis?"\n[mostrar mockup Imago]\n"IMAGO — link na bio."', caption: 'Para além dos papéis #imago #seteecos #identidade #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Quem és para além dos papéis?', subtitulo: 'IMAGO — a dimensão da identidade.', caption: '' },
    dica: 'REEL — Fundo ROXO (#8B7BA5) obrigatório. Mockups Imago. NUNCA fundo verde.',
  },

  {
    dia: 17,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'Agora sabes o que é. O passo é teu.',
    eco: 'lumina',
    template: 'cta',
    formato: 'reel',
    hook: '7 dimensões. 1 sistema. As partes conversam. E o primeiro passo é grátis.',
    corpo: 'Nos últimos dias mostrei-te o que é a Sete Ecos. Não é motivação. Não é wellness estético. É arquitectura de integração.\n\nO LUMINA é o ponto de partida. Gratuito. 2 minutos. 23 leituras possíveis.\n\nSe o que viste te fez parar e pensar, experimenta.',
    cta: 'app.seteecos.com/lumina',
    instagram: { caption: '7 dimensões. 1 sistema. As partes conversam.\n\nNos últimos dias mostrei-te o que é a Sete Ecos.\n\nNão é motivação. Não é wellness estético.\nÉ arquitectura de integração.\n\nO ponto de partida é gratuito. 2 minutos.\n\nLink na bio.\n\n— Vivianne\n\n#seteecos #lumina #integração #grátis #maputo #moçambique #reels' },
    facebook: '7 dimensões. 1 sistema. O primeiro passo é grátis.\n\nLUMINA: 2 minutos. 23 leituras → app.seteecos.com/lumina\n\n— Vivianne | Sete Ecos',
    whatsapp: '7 dimensões. 1 sistema. O ponto de partida é grátis.\n\nLUMINA: 2 minutos. 23 leituras possíveis.\n\n👉 app.seteecos.com/lumina',
    tiktok: { ideia: 'REEL — Recap cores:\n\n[fundo muda: verde → dourado → azul → terracota → teal → azul oceano → roxo]\n"7 dimensões."\n"1 sistema."\n"As partes conversam."\n[fundo branco]\n"O ponto de partida é grátis."\n"Link na bio."', caption: 'O ponto de partida #seteecos #lumina #fyp' },
    conteudoIG: { tipo: 'cta', texto: '7 dimensões. 1 sistema.', subtitulo: 'O ponto de partida é grátis. LUMINA.', caption: '' },
    dica: 'REEL — Recap de todas as cores (cada eco com a SUA cor, 1 segundo cada). Fecha o ciclo com CTA para o Lumina.',
  },
];

export function getCampanhaLancamentoZero() {
  return LANCAMENTO_POSTS;
}
