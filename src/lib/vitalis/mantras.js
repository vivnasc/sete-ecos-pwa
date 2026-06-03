/**
 * mantras.js — 60 mantras editoriais rotativos.
 * Cada dia da jornada da cliente mostra um mantra diferente,
 * voltando ao 1º quando passar do 60.
 *
 * Tom: directo, humano, sem clichés motivacionais. Em minúsculas
 * editoriais (a UI capitaliza se precisar). Curtos.
 */

export const MANTRAS = [
  'a primeira escolha do dia molda o resto.',
  'comer é mais do que combustível. é raiz.',
  'a fome real espera. a vontade passa.',
  'o que comes hoje, sentes amanhã.',
  'devagar com a boca. o estômago agradece.',
  'há sabedoria no apetite quando ouves.',
  'um copo de água antes de tudo.',
  'a mesa também é cuidado contigo.',
  'comer com pressa é não comer.',
  'a fome é sinal, não emergência.',
  'a balança não conhece todos os teus dias.',
  'consistência é o tijolo. não o salto.',
  'um dia mau não desfaz cinco bons.',
  'voltar é vitória. abandonar é o oposto.',
  'a comida real é simples. quase sempre.',
  'comer em paz vale mais que comer "certo".',
  'o jejum termina com proteína, não com açúcar.',
  'a tua mão é a tua balança.',
  'o corpo lembra-se de tudo o que lhe deres.',
  'água é o primeiro nutriente.',
  'movimento curto e diário ganha ao maratona.',
  'dormir é alimentar.',
  'a vontade decide. o método executa.',
  'o que registas, vês. o que vês, mudas.',
  'plano serve quem cumpre. ajusta-o a ti.',
  'comer pouco é diferente de comer certo.',
  'o açúcar é uma decisão. não um destino.',
  'há fome de boca e há fome de barriga.',
  'aprender comida é aprender a esperar.',
  'a culpa não corrige. a clareza corrige.',
  'cozinhar uma vez. comer três.',
  'matapa cura mais do que parece.',
  'o frango não tem culpa do molho.',
  'o abacate é amigo, não inimigo.',
  'xima e feijão é refeição completa.',
  'a couve do quintal pesa nutrientes.',
  'a coca-cola não é água. mesmo às refeições.',
  'as gorduras boas alimentam. não engordam.',
  'o pão branco é açúcar disfarçado.',
  'o corpo sabe quando lhe mentes.',
  'medir é amar-se. não vigiar-se.',
  'a semana vence-se em três refeições por dia.',
  'a fruta inteira não é açúcar. é fibra.',
  'leite morno à noite acalma o sono.',
  'gengibre e limão de manhã abrem o dia.',
  'o teu corpo é casa. trata-o como tal.',
  'caminhar 30 min vale uma terapia.',
  'a cintura conta o que o peso esconde.',
  'a primeira semana é a mais difícil. e passa.',
  'cada porção é uma conversa com o corpo.',
  'o plano não é prisão. é mapa.',
  'descansa quando tens de descansar.',
  'tu não tens que provar nada a ninguém.',
  'um dia de cada vez é demais. uma refeição de cada vez chega.',
  'o teu plano é teu. ajusta. não copies.',
  'queijo coalho e ovo: pequeno-almoço de princesa.',
  'sopa de noite engana o frio e a fome.',
  'a banana é amiga depois do treino.',
  'sentar à mesa é gesto de respeito.',
  'celebra o dia em que tudo correu bem.',
]

/**
 * Devolve o mantra do dia para uma jornada com dia 1 = primeiro dia
 * da cliente. Rotativo em ciclo de 60.
 *
 * @param {number} dia — dia da jornada (1+). Default = 1
 * @returns {string} o mantra desse dia
 */
export function mantraDoDia(dia = 1) {
  const total = MANTRAS.length
  if (total === 0) return ''
  const idx = ((Math.max(1, dia) - 1) % total + total) % total
  return MANTRAS[idx]
}
