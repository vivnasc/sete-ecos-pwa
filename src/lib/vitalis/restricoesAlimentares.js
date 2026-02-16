// lib/vitalis/restricoesAlimentares.js
// Filtragem de alimentos com base nas restrições do intake
// Usado por: SugestoesRefeicoes, ListaCompras, PlanoHTML

import { supabase } from '../supabase';

// Palavras-chave que indicam alimentos NÃO permitidos para cada restrição
const KEYWORDS_PORCO = ['porco', 'bacon', 'presunto', 'fiambre', 'lombo de porco', 'costeletas de porco', 'chouriço', 'linguiça'];
const KEYWORDS_LACTOSE = ['leite', 'iogurte', 'queijo', 'natas', 'requeijão', 'cottage', 'manteiga', 'whey', 'laticínio'];
const KEYWORDS_GLUTEN = ['pão', 'massa', 'aveia', 'farinha de trigo', 'torrada', 'tosta', 'cuscuz', 'cereais', 'panquecas de aveia', 'cevada'];

/**
 * Busca as restrições alimentares do intake do utilizador actual.
 * Retorna array de strings (ex: ['Halal', 'Sem glúten'])
 */
export async function buscarRestricoesUtilizador() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();
    if (!userData) return [];

    const { data: intake } = await supabase
      .from('vitalis_intake')
      .select('restricoes_alimentares, preferencias_alimentares')
      .eq('user_id', userData.id)
      .maybeSingle();
    if (!intake) return [];

    // restricoes_alimentares pode ser array ou string separada por vírgula
    let restricoes = intake.restricoes_alimentares || [];
    if (typeof restricoes === 'string') {
      restricoes = restricoes.split(',').map(r => r.trim());
    }

    let preferencias = intake.preferencias_alimentares || [];
    if (typeof preferencias === 'string') {
      preferencias = preferencias.split(',').map(r => r.trim());
    }

    // Combinar ambas as fontes (intake secção 4 + secção 13)
    return [...new Set([...restricoes, ...preferencias])].filter(Boolean);
  } catch (e) {
    console.warn('Erro ao buscar restrições:', e.message);
    return [];
  }
}

/**
 * Verifica se um texto/nome de alimento deve ser excluído com base nas restrições.
 * @param {string} nomeAlimento - Nome do alimento ou ingrediente
 * @param {string[]} restricoes - Array de restrições do utilizador
 * @returns {boolean} true se deve ser EXCLUÍDO
 */
export function deveExcluirAlimento(nomeAlimento, restricoes) {
  if (!restricoes || restricoes.length === 0) return false;
  const nome = nomeAlimento.toLowerCase();

  // Halal: sem porco, sem álcool
  if (restricoes.some(r => r.toLowerCase().includes('halal'))) {
    if (KEYWORDS_PORCO.some(kw => nome.includes(kw))) return true;
  }

  // Sem lactose
  if (restricoes.some(r => r.toLowerCase().includes('lactose'))) {
    if (KEYWORDS_LACTOSE.some(kw => nome.includes(kw))) return true;
    // Excepção: "leite de coco" e "leite de amêndoa" não contêm lactose
    if (nome.includes('leite') && !nome.includes('coco') && !nome.includes('amêndoa')) return true;
  }

  // Sem glúten
  if (restricoes.some(r => r.toLowerCase().includes('glúten') || r.toLowerCase().includes('gluten'))) {
    if (KEYWORDS_GLUTEN.some(kw => nome.includes(kw))) return true;
  }

  // Vegetariano: sem carne, sem peixe
  if (restricoes.some(r => r.toLowerCase().includes('vegetarian'))) {
    const kwCarne = ['frango', 'vaca', 'bife', 'porco', 'carne', 'bacon', 'peru', 'peixe', 'salmão', 'atum', 'camarão', 'sardinha', 'pescada', 'lula', 'polvo'];
    if (kwCarne.some(kw => nome.includes(kw))) return true;
  }

  // Vegano: sem produtos animais
  if (restricoes.some(r => r.toLowerCase().includes('vegan'))) {
    const kwAnimal = ['frango', 'vaca', 'bife', 'porco', 'carne', 'bacon', 'peru', 'peixe', 'salmão', 'atum', 'camarão', 'sardinha', 'ovo', 'queijo', 'iogurte', 'leite', 'natas', 'manteiga', 'whey', 'mel'];
    if (kwAnimal.some(kw => nome.includes(kw)) && !nome.includes('coco') && !nome.includes('amêndoa')) return true;
  }

  return false;
}

/**
 * Filtra um array de itens (refeições ou ingredientes) com base nas restrições.
 * @param {Array} itens - Array de objectos com campo 'nome'
 * @param {string[]} restricoes - Array de restrições do utilizador
 * @returns {Array} Itens filtrados
 */
export function filtrarPorRestricoes(itens, restricoes) {
  if (!restricoes || restricoes.length === 0) return itens;
  return itens.filter(item => !deveExcluirAlimento(item.nome, restricoes));
}
