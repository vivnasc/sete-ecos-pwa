const LEITURAS = {
  equilibrio: { texto: "Hoje há equilíbrio em ti. O corpo responde, a mente aquieta, e algo em ti sabe que estás no caminho. Não é perfeição — é presença. Honra este momento.", eco: "nenhum" },
  corpo_fecha: { texto: "O corpo guarda o que a mente não quer ver. Hoje ele pede atenção — não correção, mas escuta. O que precisas não é de força, é de gentileza.", eco: "vitalis" },
  energia_baixa: { texto: "A energia está em baixo, mas isso não é falha — é informação. Algo precisa de pausa, de retorno, de silêncio. Antes de fazer, permite-te ser.", eco: "ventis" },
  mente_ruido: { texto: "A mente faz barulho quando tenta resolver sozinha o que precisa de corpo, tempo ou presença. Hoje, não tentes silenciá-la — observa o que ela tenta proteger.", eco: "lumina" },
  passado_pesa: { texto: "Há algo do passado que ainda não encontrou lugar. Não precisas resolver hoje — apenas reconhecer que ainda está aí. O que não se nomeia, repete-se.", eco: "serena" },
  futuro_ameaca: { texto: "O futuro parece pesado porque o presente ainda não está seguro. Não é o amanhã que te assusta — é o hoje que precisa de atenção.", eco: "ignis" },
  espelho_duro: { texto: "O espelho mostra o que ainda não fizeste paz. A imagem que vês não é verdade — é história. E histórias podem ser reescritas.", eco: "imago" },
  sem_impulso: { texto: "Quando o impulso some, não é preguiça — é protecção. Algo em ti sabe que agir agora seria forçar. Espera. A vontade volta quando o terreno estiver pronto.", eco: "ignis" },
  tudo_trava: { texto: "Quando tudo trava ao mesmo tempo, não é colapso — é reset. O sistema está a pedir para parar antes de continuar. Honra a paragem.", eco: "ventis" },
  default: { texto: "Hoje é um dia de escuta. Não de respostas, não de acções — apenas de presença. O que precisas já está em ti, à espera de ser reconhecido.", eco: "lumina" }
}

export function gerarLeitura(respostas) {
  const { corpo, energia, mente, passado, futuro, impulso, espelho } = respostas
  let padrao = 'default', bloqueio = null
  
  const tudo_bem = ['normal','solto','leve','boa','cheia','calma','silenciosa','arrumado','claro','luminoso','decidir','agir','visivel','luminosa']
  const valores = Object.values(respostas)
  const positivos = valores.filter(v => tudo_bem.includes(v)).length
  
  if (positivos >= 5) padrao = 'equilibrio'
  else if (['pesado','tenso'].includes(corpo)) { padrao = 'corpo_fecha'; bloqueio = 'corpo' }
  else if (['vazia','baixa'].includes(energia)) { padrao = 'energia_baixa'; bloqueio = 'ritmo' }
  else if (['caotica','barulhenta'].includes(mente)) { padrao = 'mente_ruido'; bloqueio = 'vontade' }
  else if (['preso','apesar'].includes(passado)) { padrao = 'passado_pesa'; bloqueio = 'emocao' }
  else if (['escuro','pesado'].includes(futuro)) { padrao = 'futuro_ameaca'; bloqueio = 'vontade' }
  else if (['invisivel','apagada'].includes(espelho)) { padrao = 'espelho_duro'; bloqueio = 'identidade' }
  else if (['esconder','parar','nada'].includes(impulso)) { padrao = 'sem_impulso'; bloqueio = 'vontade' }
  
  const leitura = LEITURAS[padrao]
  return { padrao, texto_leitura: leitura.texto, eco_sugerido: leitura.eco, bloqueio_principal: bloqueio }
}
