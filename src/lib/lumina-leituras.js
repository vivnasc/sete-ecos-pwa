export const LEITURAS = {
  crit_vid: ["Pára. Não é altura de decidir nada. Estás vazia, não te vês, e queres resolver. Protege-te de ti mesma."],
  crit_pfm: ["O passado puxa, o futuro assusta, a mente gira. Pára. Respira. Não tens de resolver nada disto agora."],
  crit_tba: ["Corpo tenso, energia em baixo, não te vês ao espelho. Dia difícil. Cuida só do básico."],
  forcaMax: ["Isto é o teu melhor. Energia cheia, corpo solto, mente clara. O que fizeres agora vai ter raiz profunda."],
  presencaRara: ["Momento raro: quase tudo alinhado. Presença real. O que fizeres agora tem peso."],
  esgotamento: ["Estás cansada e a querer resolver. Pára. Não decidas nada hoje."],
  dissociacao: ["Não te estás a ver bem e a energia está em baixo. Afasta-te do espelho hoje."],
  passadoComanda: ["O passado está a comandar o presente. A mente não pára de revisitar. Pára o ciclo."],
  falsaClareza: ["A mente parece clara mas o corpo está fechado. Cuidado com decisões que parecem certas."],
  fugaFrente: ["Estás a fugir para a frente. O futuro assusta e a resposta é agir. Mas agir agora é evitar."],
  menteSabota: ["O corpo está bem, mas a mente não pára. Ignora a cabeça hoje. Segue o corpo."],
  corpoGrita: ["A mente está calma mas o corpo pede atenção. Ouve-o."],
  futuroRouba: ["O futuro está a roubar o presente. Tens energia mas ela está a ir toda para preocupação."],
  recolhimento: ["Queres esconder-te e o corpo concorda. Honra isso. Hoje não é dia de exposição."],
  vazioFertil: ["A energia está em baixo mas há silêncio e abertura. Este vazio não é mau. É fértil."],
  silencioCura: ["Mente silenciosa, corpo neutro, energia estável. Protege este estado. Este silêncio cura."],
  alinhamento: ["Energia, corpo e mente alinhados. Bom dia para fazer o que importa."],
  aberturaSemDirecao: ["Corpo disponível mas sem impulso claro. Está bem. Não precisas saber para onde."],
  corpoLidera: ["O corpo quer ir e tem energia para isso. Segue-o. Não penses demais. Age."],
  futuroConvite: ["O futuro parece bom e tens energia para ele. Aceita o convite."],
  neutralidade: ["Dia neutro. Nada a puxar muito. Faz o básico. Nem tudo tem de ser intenso."],
  transicao: ["Estás entre estados. Algo está a mudar. Não forces clareza."],
  diaSemNome: ["Há mistério em ti que não se decifra. E está bem. Não precisas de respostas hoje."]
}

export function detectPattern(A) {
  const e = A.energia, c = A.corpo, m = A.mente, p = A.passado, i = A.impulso, f = A.futuro, esp = A.espelho
  const eBaixa = ['vazia', 'baixa'].includes(e), eAlta = ['boa', 'cheia'].includes(e)
  const cFechado = ['pesado', 'tenso'].includes(c), cAberto = ['leve', 'solto'].includes(c)
  const mRuid = ['caotica', 'barulhenta'].includes(m), mClara = ['calma', 'silenciosa'].includes(m)
  const pPesa = ['preso', 'apesar'].includes(p)
  const fAmeaca = ['escuro', 'pesado'].includes(f), fConv = ['claro', 'luminoso'].includes(f)
  const eMau = ['invisivel', 'apagada'].includes(esp), eBom = ['visivel', 'luminosa'].includes(esp)
  const normais = [e, c, m, p, i, f, esp].filter(x => x === 'normal' || x === 'nada').length
  const pos = (eAlta ? 1 : 0) + (cAberto ? 1 : 0) + (mClara ? 1 : 0) + (fConv ? 1 : 0) + (eBom ? 1 : 0)

  if (e === 'vazia' && eMau && i === 'decidir') return 'crit_vid'
  if (pPesa && fAmeaca && mRuid) return 'crit_pfm'
  if (c === 'tenso' && eBaixa && eMau) return 'crit_tba'
  if (e === 'cheia' && c === 'solto' && m === 'silenciosa' && esp === 'luminosa') return 'forcaMax'
  if (pos >= 5) return 'presencaRara'
  if (eBaixa && (i === 'decidir' || i === 'agir')) return 'esgotamento'
  if (eMau && (eBaixa || mRuid)) return 'dissociacao'
  if (pPesa && mRuid) return 'passadoComanda'
  if (mClara && cFechado) return 'falsaClareza'
  if (fAmeaca && (i === 'decidir' || i === 'agir')) return 'fugaFrente'
  if (mRuid && cAberto) return 'menteSabota'
  if (cFechado && mClara) return 'corpoGrita'
  if (fAmeaca && eAlta) return 'futuroRouba'
  if (cFechado && i === 'esconder') return 'recolhimento'
  if (eBaixa && m === 'silenciosa' && (f === 'normal' || fConv)) return 'vazioFertil'
  if (m === 'silenciosa' && (c === 'normal' || cAberto) && e === 'normal') return 'silencioCura'
  if (eAlta && cAberto && mClara) return 'alinhamento'
  if (cAberto && i === 'nada') return 'aberturaSemDirecao'
  if (cAberto && i === 'agir' && eAlta) return 'corpoLidera'
  if (fConv && eAlta && cAberto) return 'futuroConvite'
  if (normais >= 4) return 'neutralidade'
  if (pos >= 2 && normais >= 2) return 'transicao'
  return 'diaSemNome'
}

export function getReading(pattern) {
  const arr = LEITURAS[pattern] || LEITURAS.diaSemNome
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getEcoSuggestion(A) {
  if (['pesado', 'tenso'].includes(A.corpo)) return { eco: 'vitalis', msg: 'O corpo precisa de atenção.', bloqueio: 'corpo' }
  if (['preso', 'apesar'].includes(A.passado)) return { eco: 'serena', msg: 'Há emoção por fluir.', bloqueio: 'emocao' }
  if (['esconder', 'parar'].includes(A.impulso)) return { eco: 'ecoa', msg: 'A voz precisa de espaço.', bloqueio: 'voz' }
  if (['escuro', 'pesado'].includes(A.futuro)) return { eco: 'ignis', msg: 'A direcção precisa de clareza.', bloqueio: 'vontade' }
  if (['vazia', 'baixa'].includes(A.energia)) return { eco: 'ventis', msg: 'Precisas de ritmo.', bloqueio: 'ritmo' }
  if (['invisivel', 'apagada'].includes(A.espelho)) return { eco: 'imago', msg: 'Não te estás a ver.', bloqueio: 'identidade' }
  return null
}
