/**
 * WhatsApp Plan Update — Atualização de planos via WhatsApp
 *
 * Permite que clientes atualizem o seu plano VITALIS por WhatsApp:
 * - Peso atual
 * - Restrições alimentares
 * - Nível de atividade
 * - Número de refeições
 * - Objetivo principal
 *
 * Fluxo: telefone → lookup user → atualizar intake → recalcular plano
 */

import { createClient } from '@supabase/supabase-js';

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _supabase = createClient(url, key);
  return _supabase;
}

// ===== LOOKUP: telefone → user_id =====

/**
 * Encontra o user_id pelo número de WhatsApp
 * Procura em vitalis_intake.whatsapp e vitalis_clients.whatsapp_numero
 */
export async function lookupUserByPhone(telefone) {
  const supabase = getSupabase();
  if (!supabase) return { found: false, error: 'supabase_not_configured' };

  // Normalizar telefone: só dígitos
  const tel = telefone.replace(/[^0-9]/g, '');

  // Variantes de pesquisa (com e sem prefixo de país)
  const variantes = [tel];
  if (tel.startsWith('258')) variantes.push(tel.slice(3));
  if (!tel.startsWith('258') && tel.length <= 10) variantes.push('258' + tel);
  // Com + na frente (alguns campos guardam assim)
  variantes.push('+' + tel);
  if (tel.startsWith('258')) variantes.push('+' + tel, tel.slice(3));

  // Tentar via vitalis_intake.whatsapp
  for (const v of variantes) {
    const { data, error } = await supabase
      .from('vitalis_intake')
      .select('user_id, sexo, peso_actual, altura_cm, idade, nivel_actividade, objectivo_principal, abordagem_preferida, restricoes_alimentares, refeicoes_dia, aceita_jejum, prontidao_1a10, emocao_dominante, peso_meta')
      .or(`whatsapp.eq.${v},whatsapp.eq.+${v}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      // Buscar nome do user
      const { data: user } = await supabase
        .from('users')
        .select('nome, email')
        .eq('id', data[0].user_id)
        .single();

      return {
        found: true,
        userId: data[0].user_id,
        intake: data[0],
        nome: user?.nome || null,
        email: user?.email || null,
      };
    }
  }

  return { found: false };
}

// ===== ATUALIZAR PESO =====

export async function atualizarPeso(userId, novoPeso) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'supabase_not_configured' };

  if (novoPeso < 30 || novoPeso > 300) {
    return { ok: false, error: 'Peso inválido. Deve estar entre 30kg e 300kg.' };
  }

  // Atualizar intake
  const { error: intakeErr } = await supabase
    .from('vitalis_intake')
    .update({ peso_actual: novoPeso })
    .eq('user_id', userId);

  if (intakeErr) return { ok: false, error: intakeErr.message };

  // Atualizar vitalis_clients
  await supabase
    .from('vitalis_clients')
    .update({
      peso_actual: novoPeso,
      imc_actual: calcularIMC(novoPeso, null), // será recalculado no plano
    })
    .eq('user_id', userId);

  return { ok: true };
}

// ===== ATUALIZAR RESTRIÇÕES =====

const RESTRICOES_VALIDAS = ['halal', 'sem_lactose', 'sem_gluten', 'vegetariano', 'vegano'];
const RESTRICOES_ALIASES = {
  'gluten': 'sem_gluten',
  'glúten': 'sem_gluten',
  'sem gluten': 'sem_gluten',
  'sem glúten': 'sem_gluten',
  'lactose': 'sem_lactose',
  'sem lactose': 'sem_lactose',
  'vegetariana': 'vegetariano',
  'vegana': 'vegano',
};

export function parseRestricoes(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const encontradas = [];

  for (const [alias, valor] of Object.entries(RESTRICOES_ALIASES)) {
    const aliasNorm = alias.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (t.includes(aliasNorm)) encontradas.push(valor);
  }
  for (const r of RESTRICOES_VALIDAS) {
    const rNorm = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/_/g, ' ');
    if (t.includes(rNorm) && !encontradas.includes(r)) encontradas.push(r);
  }

  // Detectar ação: adicionar ou remover
  const remover = t.includes('tirar') || t.includes('remover') || t.includes('retirar') || t.includes('sem restricao') || t.includes('sem restricoes');

  return { restricoes: [...new Set(encontradas)], remover };
}

export async function atualizarRestricoes(userId, restricoes, remover = false) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'supabase_not_configured' };

  // Buscar restrições atuais
  const { data: intake } = await supabase
    .from('vitalis_intake')
    .select('restricoes_alimentares')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let atuais = intake?.restricoes_alimentares || [];
  if (typeof atuais === 'string') {
    try { atuais = JSON.parse(atuais); } catch { atuais = []; }
  }

  let novas;
  if (remover) {
    novas = atuais.filter(r => !restricoes.includes(r));
  } else {
    novas = [...new Set([...atuais, ...restricoes])];
  }

  const { error } = await supabase
    .from('vitalis_intake')
    .update({ restricoes_alimentares: novas })
    .eq('user_id', userId);

  if (error) return { ok: false, error: error.message };

  return { ok: true, restricoes: novas };
}

// ===== ATUALIZAR ATIVIDADE =====

const NIVEIS_ACTIVIDADE = {
  'sedentaria': 'sedentaria',
  'sedentario': 'sedentaria',
  'leve': 'leve',
  'ligeira': 'leve',
  'moderada': 'moderada',
  'moderado': 'moderada',
  'intensa': 'intensa',
  'intenso': 'intensa',
};

export function parseActividade(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  for (const [alias, valor] of Object.entries(NIVEIS_ACTIVIDADE)) {
    if (t.includes(alias)) return valor;
  }

  // Inferir pelo número de vezes por semana
  const match = t.match(/(\d+)\s*(?:x|vezes)/);
  if (match) {
    const vezes = parseInt(match[1]);
    if (vezes <= 1) return 'sedentaria';
    if (vezes <= 3) return 'leve';
    if (vezes <= 5) return 'moderada';
    return 'intensa';
  }

  return null;
}

export async function atualizarActividade(userId, nivel) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'supabase_not_configured' };

  const { error } = await supabase
    .from('vitalis_intake')
    .update({ nivel_actividade: nivel })
    .eq('user_id', userId);

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

// ===== ATUALIZAR REFEIÇÕES =====

export function parseRefeicoes(texto) {
  const match = texto.match(/(\d+)\s*(?:refei|meal)/i);
  if (match) return parseInt(match[1]);

  // Tentar extrair número solto
  const numMatch = texto.match(/\b([2-6])\b/);
  if (numMatch) return parseInt(numMatch[1]);

  return null;
}

export async function atualizarRefeicoes(userId, numRefeicoes) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'supabase_not_configured' };

  if (numRefeicoes < 2 || numRefeicoes > 6) {
    return { ok: false, error: 'Número de refeições deve estar entre 2 e 6.' };
  }

  const { error } = await supabase
    .from('vitalis_intake')
    .update({ refeicoes_dia: numRefeicoes })
    .eq('user_id', userId);

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

// ===== ATUALIZAR OBJETIVO =====

const OBJETIVOS_MAP = {
  'emagrecer': 'emagrecer',
  'perder peso': 'emagrecer',
  'perder': 'emagrecer',
  'ganhar massa': 'ganhar_massa',
  'ganhar musculo': 'ganhar_massa',
  'muscular': 'ganhar_massa',
  'ganhar peso': 'ganhar_massa',
  'saude': 'melhorar_saude',
  'saúde': 'melhorar_saude',
  'melhorar saude': 'melhorar_saude',
  'energia': 'ganhar_energia',
  'mais energia': 'ganhar_energia',
  'manter': 'melhorar_saude',
  'manter peso': 'melhorar_saude',
};

export function parseObjetivo(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  for (const [alias, valor] of Object.entries(OBJETIVOS_MAP)) {
    const aliasNorm = alias.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (t.includes(aliasNorm)) return valor;
  }

  return null;
}

export async function atualizarObjetivo(userId, objetivo) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'supabase_not_configured' };

  const { error: intakeErr } = await supabase
    .from('vitalis_intake')
    .update({ objectivo_principal: objetivo })
    .eq('user_id', userId);

  if (intakeErr) return { ok: false, error: intakeErr.message };

  await supabase
    .from('vitalis_clients')
    .update({ objectivo_principal: objetivo })
    .eq('user_id', userId);

  return { ok: true };
}

// ===== REGENERAR PLANO (serverless version) =====

export async function regenerarPlano(userId) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'supabase_not_configured' };

  try {
    // 1. Buscar intake atualizado
    const { data: intake, error: intakeError } = await supabase
      .from('vitalis_intake')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (intakeError || !intake) {
      return { ok: false, error: 'Intake não encontrado' };
    }

    // 2. Buscar dados do cliente (peso_actual pode estar mais recente)
    const { data: client } = await supabase
      .from('vitalis_clients')
      .select('peso_actual, fase_actual')
      .eq('user_id', userId)
      .single();

    // 3. Calcular TMB
    const altura = parseFloat(intake.altura_cm) || 165;
    const peso = parseFloat(client?.peso_actual) || parseFloat(intake.peso_actual);
    const idade = parseInt(intake.idade, 10);
    const sexo = intake.sexo;

    if (!peso || isNaN(peso) || !idade || isNaN(idade) || !sexo) {
      return { ok: false, error: 'Dados do intake incompletos (peso, idade ou sexo)' };
    }

    let tmb;
    if (sexo === 'masculino') {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
    } else {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
    }

    // 4. Fator de atividade
    const factores = {
      'sedentaria': 1.2,
      'leve': 1.375,
      'moderada': 1.55,
      'intensa': 1.725,
    };
    const factor = factores[intake.nivel_actividade] || 1.2;
    const tdee = tmb * factor;

    // 5. Calorias por objetivo
    const prontidao = parseInt(intake.prontidao_1a10, 10) || 5;
    const objectivo = intake.objectivo_principal;
    let caloriasAlvo;

    if (objectivo === 'perder_peso' || objectivo === 'emagrecer') {
      let deficitFactor;
      if (prontidao <= 4) deficitFactor = 0.87;
      else if (prontidao <= 7) deficitFactor = 0.82;
      else deficitFactor = 0.75;
      caloriasAlvo = Math.round(tdee * deficitFactor);
    } else if (objectivo === 'ganhar_massa') {
      caloriasAlvo = Math.round(tdee * 1.1);
    } else {
      caloriasAlvo = Math.round(tdee);
    }

    if (caloriasAlvo < 1000) caloriasAlvo = 1200;
    if (caloriasAlvo > 5000) caloriasAlvo = 4000;

    // 6. Macros
    const ABORDAGENS_VALIDAS = ['keto_if', 'low_carb', 'equilibrado'];
    const abordagemRaw = intake.abordagem_preferida || 'equilibrado';
    const abordagem = ABORDAGENS_VALIDAS.includes(abordagemRaw) ? abordagemRaw : 'equilibrado';
    let proteinaG, carboidratosG, gorduraG;

    if (abordagem === 'keto_if') {
      proteinaG = Math.round((caloriasAlvo * 0.25) / 4);
      carboidratosG = Math.round((caloriasAlvo * 0.05) / 4);
      gorduraG = Math.round((caloriasAlvo * 0.70) / 9);
    } else if (abordagem === 'low_carb') {
      proteinaG = Math.round((caloriasAlvo * 0.40) / 4);
      carboidratosG = Math.round((caloriasAlvo * 0.30) / 4);
      gorduraG = Math.round((caloriasAlvo * 0.30) / 9);
    } else {
      proteinaG = Math.round((caloriasAlvo * 0.30) / 4);
      carboidratosG = Math.round((caloriasAlvo * 0.40) / 4);
      gorduraG = Math.round((caloriasAlvo * 0.30) / 9);
    }

    // 7. Porções
    const porcoesProteina = Math.round(proteinaG / 25);
    const porcoesLegumes = 4;
    const porcoesHidratos = Math.round(carboidratosG / 30);
    const porcoesGordura = Math.round(gorduraG / 15);

    const numRefeicoes = parseInt(intake.refeicoes_dia, 10) || 3;
    let horariosRefeicoes;
    if (intake.aceita_jejum) {
      horariosRefeicoes = ['12:00', '16:00', '20:00'].slice(0, numRefeicoes);
    } else {
      horariosRefeicoes = ['08:00', '13:00', '19:00'].slice(0, numRefeicoes);
    }

    const porcoesPorRefeicao = {
      proteina: Math.ceil(porcoesProteina / numRefeicoes),
      legumes: Math.ceil(porcoesLegumes / numRefeicoes),
      hidratos: Math.ceil(porcoesHidratos / numRefeicoes),
      gordura: Math.ceil(porcoesGordura / numRefeicoes),
    };

    // 8. Desativar planos antigos
    await supabase
      .from('vitalis_meal_plans')
      .update({ status: 'inactivo' })
      .eq('user_id', userId)
      .eq('status', 'activo');

    // 9. Buscar versão mais recente
    const { data: ultimoPlano } = await supabase
      .from('vitalis_meal_plans')
      .select('versao')
      .eq('user_id', userId)
      .order('versao', { ascending: false })
      .limit(1)
      .single();

    const novaVersao = (ultimoPlano?.versao || 0) + 1;

    // 10. Criar novo plano
    const fase = client?.fase_actual || 'inducao';
    const { data: plano, error: planoError } = await supabase
      .from('vitalis_meal_plans')
      .insert({
        user_id: userId,
        versao: novaVersao,
        fase,
        abordagem,
        calorias_alvo: caloriasAlvo,
        proteina_g: proteinaG,
        carboidratos_g: carboidratosG,
        gordura_g: gorduraG,
        status: 'activo',
        receitas_incluidas: JSON.stringify({
          porcoes_diarias: {
            proteina: porcoesProteina,
            legumes: porcoesLegumes,
            hidratos: porcoesHidratos,
            gordura: porcoesGordura,
          },
          porções_por_refeicao: porcoesPorRefeicao,
          num_refeicoes: numRefeicoes,
          horarios: horariosRefeicoes,
        }),
      })
      .select()
      .single();

    if (planoError) {
      console.error('Erro ao criar plano via WA:', planoError);
      return { ok: false, error: planoError.message };
    }

    // 11. Atualizar vitalis_clients com IMC e peso
    await supabase
      .from('vitalis_clients')
      .update({
        peso_actual: peso,
        imc_actual: calcularIMC(peso, altura),
      })
      .eq('user_id', userId);

    console.log('Plano regenerado via WhatsApp:', plano.id, '| calorias:', caloriasAlvo);

    return {
      ok: true,
      plano: {
        id: plano.id,
        versao: novaVersao,
        calorias: caloriasAlvo,
        proteina: proteinaG,
        carboidratos: carboidratosG,
        gordura: gorduraG,
        refeicoes: numRefeicoes,
        abordagem,
        fase,
      },
    };
  } catch (err) {
    console.error('Erro ao regenerar plano via WA:', err);
    return { ok: false, error: err.message };
  }
}

// ===== FORMATAR RESUMO DO PLANO =====

export function formatarResumoPlano(plano) {
  const abordagemNomes = {
    'keto_if': 'Keto/Jejum Intermitente',
    'low_carb': 'Low-Carb',
    'equilibrado': 'Equilibrado',
  };

  return `*Novo plano gerado!* ✅

*Calorias:* ${plano.calorias} kcal/dia
*Proteína:* ${plano.proteina}g
*Hidratos:* ${plano.carboidratos}g
*Gordura:* ${plano.gordura}g
*Refeições:* ${plano.refeicoes}x/dia
*Abordagem:* ${abordagemNomes[plano.abordagem] || plano.abordagem}

Abre a app para ver o plano completo:
👉 app.seteecos.com/vitalis/plano

Qualquer dúvida, escreve *vivianne*.`;
}

// ===== HELPER =====

function calcularIMC(peso, altura) {
  if (!altura || altura <= 0 || !peso || peso <= 0) return 0;
  const alturaM = altura / 100;
  return parseFloat((peso / (alturaM * alturaM)).toFixed(1));
}
