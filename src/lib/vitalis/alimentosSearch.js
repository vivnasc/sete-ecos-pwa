// src/lib/vitalis/alimentosSearch.js
// Pesquisa unificada de alimentos: local + Open Food Facts API

import { pesquisarAlimentosLocal } from './alimentosDb.js';

// Cache simples para resultados de API (5 min)
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    apiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  // Limitar cache a 100 entradas
  if (apiCache.size > 100) {
    const oldest = apiCache.keys().next().value;
    apiCache.delete(oldest);
  }
  apiCache.set(key, { data, ts: Date.now() });
}

/**
 * Normalizar produto da Open Food Facts para o formato interno
 */
function normalizarProdutoOFF(produto) {
  const n = produto.nutriments || {};
  const nome = produto.product_name_pt || produto.product_name || produto.generic_name || 'Produto desconhecido';

  return {
    id: `off-${produto.code || produto._id}`,
    nome: nome.substring(0, 100),
    marca: produto.brands || null,
    categoria: detectarCategoriaOFF(produto),
    subcategoria: null,
    origem: 'openfoodfacts',
    calorias_100g: Math.round(n['energy-kcal_100g'] || n.energy_100g / 4.184 || 0),
    proteina_100g: Math.round((n.proteins_100g || 0) * 10) / 10,
    carboidratos_100g: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
    gordura_100g: Math.round((n.fat_100g || 0) * 10) / 10,
    fibra_100g: Math.round((n.fiber_100g || 0) * 10) / 10,
    porcao_padrao_g: parseFloat(produto.serving_size) || 100,
    porcao_padrao_desc: produto.serving_size || '100g',
    porcao_mao_tipo: null,
    porcao_mao_g: null,
    tags: extrairTagsOFF(produto),
    icon: '📦',
    barcode: produto.code || null,
    imagem: produto.image_front_small_url || null,
    fonte: 'openfoodfacts'
  };
}

function detectarCategoriaOFF(produto) {
  const cats = (produto.categories_tags || []).join(' ').toLowerCase();
  if (cats.includes('meat') || cats.includes('fish') || cats.includes('egg')) return 'proteina';
  if (cats.includes('cereal') || cats.includes('bread') || cats.includes('pasta') || cats.includes('rice')) return 'hidrato';
  if (cats.includes('oil') || cats.includes('nut') || cats.includes('seed')) return 'gordura';
  if (cats.includes('vegetable') || cats.includes('legume')) return 'legume';
  if (cats.includes('fruit')) return 'fruta';
  if (cats.includes('dairy') || cats.includes('milk') || cats.includes('cheese') || cats.includes('yogurt')) return 'lacteo';
  if (cats.includes('beverage') || cats.includes('drink') || cats.includes('juice')) return 'bebida';
  if (cats.includes('snack') || cats.includes('sweet') || cats.includes('chocolate')) return 'snack';
  return 'snack';
}

function extrairTagsOFF(produto) {
  const tags = [];
  const labels = (produto.labels_tags || []).join(' ').toLowerCase();
  if (labels.includes('gluten-free') || labels.includes('sem-gluten')) tags.push('sem_gluten');
  if (labels.includes('lactose-free') || labels.includes('sem-lactose')) tags.push('sem_lactose');
  if (labels.includes('halal')) tags.push('halal');
  if (labels.includes('vegan')) tags.push('vegano');
  if (labels.includes('vegetarian')) tags.push('vegetariano');
  return tags;
}

/**
 * Pesquisar alimentos por texto (local + API)
 * @param {string} query - Texto de pesquisa
 * @param {Object} opcoes - { categoria, tags, origem, limite, incluirApi }
 * @returns {Promise<{ locais: Array, api: Array }>}
 */
export async function pesquisarAlimentos(query, opcoes = {}) {
  const { limite = 20, incluirApi = true } = opcoes;

  // 1. Pesquisa local (imediata)
  const locais = pesquisarAlimentosLocal(query, {
    ...opcoes,
    limite
  });

  // 2. Se poucos resultados locais e API habilitada, pesquisar na API
  let api = [];
  if (incluirApi && query.length >= 3 && locais.length < 5) {
    try {
      api = await pesquisarOpenFoodFacts(query, limite - locais.length);
    } catch (e) {
      console.warn('Erro na pesquisa Open Food Facts:', e.message);
    }
  }

  return { locais, api };
}

/**
 * Pesquisar na Open Food Facts API via proxy
 * @param {string} query
 * @param {number} limite
 * @returns {Promise<Array>}
 */
async function pesquisarOpenFoodFacts(query, limite = 10) {
  const cacheKey = `search:${query}:${limite}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}&limit=${limite}`);
    if (!res.ok) return [];

    const data = await res.json();
    const resultados = (data.products || [])
      .filter(p => p.product_name && p.nutriments)
      .map(normalizarProdutoOFF);

    setCache(cacheKey, resultados);
    return resultados;
  } catch (e) {
    console.warn('Erro Open Food Facts:', e.message);
    return [];
  }
}

/**
 * Pesquisar produto por barcode
 * @param {string} barcode
 * @returns {Promise<Object|null>}
 */
export async function pesquisarPorBarcode(barcode) {
  if (!barcode) return null;

  const cacheKey = `barcode:${barcode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/food-search?barcode=${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.product || !data.product.product_name) return null;

    const resultado = normalizarProdutoOFF(data.product);
    setCache(cacheKey, resultado);
    return resultado;
  } catch (e) {
    console.warn('Erro barcode lookup:', e.message);
    return null;
  }
}

/**
 * Obter alimentos recentes do utilizador (do localStorage)
 * @param {number} limite
 * @returns {Array}
 */
export function obterRecentes(limite = 10) {
  try {
    const raw = localStorage.getItem('vitalis-alimentos-recentes');
    if (!raw) return [];
    const recentes = JSON.parse(raw);
    return recentes.slice(0, limite);
  } catch {
    return [];
  }
}

/**
 * Guardar alimento como recente
 * @param {Object} alimento
 */
export function guardarRecente(alimento) {
  try {
    const raw = localStorage.getItem('vitalis-alimentos-recentes');
    let recentes = raw ? JSON.parse(raw) : [];

    // Remover duplicado
    recentes = recentes.filter(r => r.id !== alimento.id);

    // Adicionar no início
    recentes.unshift({
      id: alimento.id,
      nome: alimento.nome,
      categoria: alimento.categoria,
      icon: alimento.icon,
      calorias_100g: alimento.calorias_100g,
      proteina_100g: alimento.proteina_100g,
      carboidratos_100g: alimento.carboidratos_100g,
      gordura_100g: alimento.gordura_100g,
      porcao_padrao_g: alimento.porcao_padrao_g,
      porcao_padrao_desc: alimento.porcao_padrao_desc,
      porcao_mao_tipo: alimento.porcao_mao_tipo,
      porcao_mao_g: alimento.porcao_mao_g,
      fonte: alimento.fonte || 'sistema'
    });

    // Manter máximo 50 recentes
    recentes = recentes.slice(0, 50);

    localStorage.setItem('vitalis-alimentos-recentes', JSON.stringify(recentes));
  } catch {
    // Silently fail
  }
}

/**
 * Obter alimentos favoritos do utilizador (do localStorage)
 * @returns {Array}
 */
export function obterFavoritos() {
  try {
    const raw = localStorage.getItem('vitalis-alimentos-favoritos');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Toggle favorito de um alimento
 * @param {Object} alimento
 * @returns {boolean} true se adicionado, false se removido
 */
export function toggleFavorito(alimento) {
  try {
    const favs = obterFavoritos();
    const idx = favs.findIndex(f => f.id === alimento.id);

    if (idx >= 0) {
      favs.splice(idx, 1);
      localStorage.setItem('vitalis-alimentos-favoritos', JSON.stringify(favs));
      return false;
    } else {
      favs.push({
        id: alimento.id,
        nome: alimento.nome,
        categoria: alimento.categoria,
        icon: alimento.icon,
        calorias_100g: alimento.calorias_100g,
        proteina_100g: alimento.proteina_100g,
        carboidratos_100g: alimento.carboidratos_100g,
        gordura_100g: alimento.gordura_100g,
        porcao_padrao_g: alimento.porcao_padrao_g,
        porcao_padrao_desc: alimento.porcao_padrao_desc,
        porcao_mao_tipo: alimento.porcao_mao_tipo,
        porcao_mao_g: alimento.porcao_mao_g,
        fonte: alimento.fonte || 'sistema'
      });
      localStorage.setItem('vitalis-alimentos-favoritos', JSON.stringify(favs));
      return true;
    }
  } catch {
    return false;
  }
}

/**
 * Verificar se alimento é favorito
 * @param {string} alimentoId
 * @returns {boolean}
 */
export function isFavorito(alimentoId) {
  const favs = obterFavoritos();
  return favs.some(f => f.id === alimentoId);
}
