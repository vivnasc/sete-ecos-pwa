// ============================================================
// LUMINA — Sistema de Leituras (23 Padrões)
// ============================================================

const LEITURAS = {
  // ========== Estados de Equilíbrio ==========
  equilibrio_total: {
    texto: "Hoje há harmonia em ti. O corpo responde, a mente aquieta, o coração sente sem pesar. Não é ausência de vida — é presença plena nela. Este momento é raro. Honra-o.",
    eco: "nenhum",
    bloqueio: null
  },
  equilibrio_parcial: {
    texto: "Estás mais perto de ti do que imaginas. Há áreas que fluem, outras que pedem atenção. Não precisas de perfeição — precisas de presença. Continua a escutar.",
    eco: "nenhum",
    bloqueio: null
  },

  // ========== Corpo (VITALIS) ==========
  corpo_pesado: {
    texto: "O corpo carrega o que a mente não quer ver. Hoje ele pede atenção — não correção, mas escuta. Antes de mudar o que comes, pergunta: o que estás a engolir que não é comida?",
    eco: "vitalis",
    bloqueio: "corpo"
  },
  corpo_tenso: {
    texto: "A tensão é uma mensagem. O corpo guarda aquilo que não encontrou saída. Não forces o relaxamento — permite que ele aconteça. Onde no teu corpo vive o que não disseste?",
    eco: "vitalis",
    bloqueio: "corpo"
  },

  // ========== Energia (VENTIS) ==========
  energia_vazia: {
    texto: "O vazio não é fraqueza — é um pedido. A energia não desapareceu, está a ser consumida por algo que não vês. Antes de tentar produzir mais, descobre onde ela está a escapar.",
    eco: "ventis",
    bloqueio: "ritmo"
  },
  energia_baixa: {
    texto: "A energia baixa é um convite à pausa, não uma falha a corrigir. O teu sistema está a pedir menos, não mais. Que ritmo estás a forçar que não é teu?",
    eco: "ventis",
    bloqueio: "ritmo"
  },

  // ========== Mente (LUMINA) ==========
  mente_caotica: {
    texto: "Quando a mente gira sem parar, não é para ser silenciada — é para ser ouvida. O caos mental é uma tentativa de processar o que ainda não tem lugar. Não lutes. Observa.",
    eco: "lumina",
    bloqueio: "vontade"
  },
  mente_barulhenta: {
    texto: "O ruído mental é uma forma de protecção. A mente faz barulho para não sentir o silêncio. Que verdade está a tentar abafar? A clareza vem quando deixas de fugir.",
    eco: "lumina",
    bloqueio: "vontade"
  },

  // ========== Passado (SERENA) ==========
  passado_preso: {
    texto: "O passado que não larga não é memória — é ferida aberta. Não precisas de esquecer para seguir. Precisas de dar lugar ao que aconteceu sem deixar que ele defina o que vem.",
    eco: "serena",
    bloqueio: "emocao"
  },
  passado_pesa: {
    texto: "Há algo antigo que ainda pulsa no presente. Não é para ser resolvido — é para ser reconhecido. O peso do passado alivia quando deixas de o carregar sozinha.",
    eco: "serena",
    bloqueio: "emocao"
  },

  // ========== Futuro (IGNIS) ==========
  futuro_escuro: {
    texto: "Quando o futuro parece escuro, não é porque não há luz — é porque o presente ainda não está seguro. Não é o amanhã que te assusta. É o hoje que precisa de atenção.",
    eco: "ignis",
    bloqueio: "vontade"
  },
  futuro_pesado: {
    texto: "O futuro só pesa quando tentamos controlá-lo. A ansiedade sobre o amanhã é medo disfarçado de planeamento. Que decisão estás a adiar que mantém o futuro refém?",
    eco: "ignis",
    bloqueio: "vontade"
  },

  // ========== Impulso/Voz (ECOA) ==========
  impulso_esconder: {
    texto: "O impulso de esconder é uma voz que se cala antes de nascer. Algo em ti sabe que ainda não é seguro ser ouvida. Não forces a fala — constrói primeiro o espaço onde a tua voz possa existir.",
    eco: "ecoa",
    bloqueio: "voz"
  },
  impulso_parar: {
    texto: "Parar não é silêncio — é recusar dizer o que não é teu. O impulso de travar a voz é sabedoria disfarçada. Que palavras estás a engolir que não te pertencem?",
    eco: "ecoa",
    bloqueio: "voz"
  },
  impulso_nada: {
    texto: "Quando o impulso de falar desaparece, não é timidez — é a voz a pedir espaço. A expressão volta quando o terreno estiver seguro. Não forces. Escuta primeiro o silêncio.",
    eco: "ecoa",
    bloqueio: "voz"
  },

  // ========== Espelho (IMAGO) ==========
  espelho_invisivel: {
    texto: "Sentir-se invisível não é um problema de visibilidade — é um problema de valor. Algures aprendeste que ser vista era perigoso. Mas esconder-te não te protege. Apaga-te.",
    eco: "imago",
    bloqueio: "identidade"
  },
  espelho_apagada: {
    texto: "A imagem apagada no espelho não é verdade — é história. A forma como te vês foi construída por olhos que não sabiam ver. É tempo de olhar com os teus próprios olhos.",
    eco: "imago",
    bloqueio: "identidade"
  },

  // ========== Padrões Combinados ==========
  corpo_energia_baixos: {
    texto: "Corpo pesado e energia em baixo são o mesmo pedido: para. O sistema está em modo de sobrevivência. Não é momento de fazer — é momento de restaurar.",
    eco: "vitalis",
    bloqueio: "corpo"
  },
  mente_futuro_ansiosos: {
    texto: "A mente agitada e o futuro pesado dançam juntos. Uma alimenta o outro. O caminho não é pensar mais — é decidir menos e sentir mais. Uma coisa de cada vez.",
    eco: "ignis",
    bloqueio: "vontade"
  },
  passado_espelho_feridos: {
    texto: "O passado e o espelho contam a mesma história: alguém que ainda não fez paz consigo. A ferida antiga reflecte-se na imagem. Curar um é curar o outro.",
    eco: "imago",
    bloqueio: "identidade"
  },
  tudo_trava: {
    texto: "Quando tudo trava ao mesmo tempo, não é colapso — é reset. O sistema está a pedir uma paragem completa antes de reiniciar. Honra a paragem. Ela é necessária.",
    eco: "ventis",
    bloqueio: "ritmo"
  },

  // ========== Default ==========
  default: {
    texto: "Hoje é um dia de escuta. Não de respostas, não de acções — apenas de presença. O que precisas já está em ti, à espera de ser reconhecido. Continua a prestar atenção.",
    eco: "lumina",
    bloqueio: null
  }
}

// Mapeamento de valores para scores
const SCORE_MAP = {
  // Corpo
  pesado: 1, tenso: 2, normal: 3, solto: 4, leve: 5,
  // Energia
  vazia: 1, baixa: 2, boa: 4, cheia: 5,
  // Mente
  caotica: 1, barulhenta: 2, calma: 4, silenciosa: 5,
  // Passado
  preso: 1, apesar: 2, arrumado: 4,
  // Futuro
  escuro: 1, luminoso: 5,
  // Impulso
  esconder: 1, parar: 2, nada: 3, decidir: 4, agir: 5,
  // Espelho
  invisivel: 1, apagada: 2, visivel: 4, luminosa: 5
}

export function gerarLeitura(respostas) {
  const { corpo, energia, mente, passado, futuro, impulso, espelho } = respostas
  
  // Calcular scores
  const scores = {
    corpo: SCORE_MAP[corpo] || 3,
    energia: SCORE_MAP[energia] || 3,
    mente: SCORE_MAP[mente] || 3,
    passado: SCORE_MAP[passado] || 3,
    futuro: SCORE_MAP[futuro] || 3,
    impulso: SCORE_MAP[impulso] || 3,
    espelho: SCORE_MAP[espelho] || 3
  }
  
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const media = total / 7
  
  // Detectar padrão
  let padrao = 'default'
  let bloqueio = null
  
  // Equilíbrio
  if (media >= 4) {
    padrao = 'equilibrio_total'
  } else if (media >= 3.5) {
    padrao = 'equilibrio_parcial'
  }
  // Corpo
  else if (corpo === 'pesado') {
    padrao = 'corpo_pesado'
    bloqueio = 'corpo'
  } else if (corpo === 'tenso') {
    padrao = 'corpo_tenso'
    bloqueio = 'corpo'
  }
  // Energia
  else if (energia === 'vazia') {
    padrao = 'energia_vazia'
    bloqueio = 'ritmo'
  } else if (energia === 'baixa') {
    padrao = 'energia_baixa'
    bloqueio = 'ritmo'
  }
  // Mente
  else if (mente === 'caotica') {
    padrao = 'mente_caotica'
    bloqueio = 'vontade'
  } else if (mente === 'barulhenta') {
    padrao = 'mente_barulhenta'
    bloqueio = 'vontade'
  }
  // Passado
  else if (passado === 'preso') {
    padrao = 'passado_preso'
    bloqueio = 'emocao'
  } else if (passado === 'apesar') {
    padrao = 'passado_pesa'
    bloqueio = 'emocao'
  }
  // Futuro
  else if (futuro === 'escuro') {
    padrao = 'futuro_escuro'
    bloqueio = 'vontade'
  } else if (futuro === 'pesado') {
    padrao = 'futuro_pesado'
    bloqueio = 'vontade'
  }
  // Impulso/Voz -> ECOA
  else if (impulso === 'esconder') {
    padrao = 'impulso_esconder'
    bloqueio = 'voz'
  } else if (impulso === 'parar') {
    padrao = 'impulso_parar'
    bloqueio = 'voz'
  } else if (impulso === 'nada') {
    padrao = 'impulso_nada'
    bloqueio = 'voz'
  }
  // Espelho
  else if (espelho === 'invisivel') {
    padrao = 'espelho_invisivel'
    bloqueio = 'identidade'
  } else if (espelho === 'apagada') {
    padrao = 'espelho_apagada'
    bloqueio = 'identidade'
  }
  // Combinações
  else if (scores.corpo <= 2 && scores.energia <= 2) {
    padrao = 'corpo_energia_baixos'
    bloqueio = 'corpo'
  } else if (scores.mente <= 2 && scores.futuro <= 2) {
    padrao = 'mente_futuro_ansiosos'
    bloqueio = 'vontade'
  } else if (scores.passado <= 2 && scores.espelho <= 2) {
    padrao = 'passado_espelho_feridos'
    bloqueio = 'identidade'
  } else if (media <= 2) {
    padrao = 'tudo_trava'
    bloqueio = 'ritmo'
  }
  
  const leitura = LEITURAS[padrao]
  
  return {
    padrao,
    texto_leitura: leitura.texto,
    eco_sugerido: leitura.eco,
    bloqueio_principal: bloqueio || leitura.bloqueio,
    razao_sugestao: bloqueio ? `Detectado bloqueio em: ${bloqueio}` : null
  }
}
