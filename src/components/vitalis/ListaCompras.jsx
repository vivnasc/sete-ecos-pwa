import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

// Categorias de alimentos para organizar a lista
const CATEGORIAS = {
  proteinas: { nome: 'Proteínas', icone: '🥩', cor: 'red' },
  laticinios: { nome: 'Laticínios', icone: '🥛', cor: 'blue' },
  vegetais: { nome: 'Vegetais', icone: '🥬', cor: 'green' },
  frutas: { nome: 'Frutas', icone: '🍎', cor: 'pink' },
  cereais: { nome: 'Cereais e Grãos', icone: '🌾', cor: 'yellow' },
  gorduras: { nome: 'Gorduras Saudáveis', icone: '🥑', cor: 'emerald' },
  temperos: { nome: 'Temperos e Ervas', icone: '🌿', cor: 'lime' },
  bebidas: { nome: 'Bebidas', icone: '🥤', cor: 'cyan' },
  outros: { nome: 'Outros', icone: '🛒', cor: 'gray' }
};

// Mapeamento de alimentos para categorias
const ALIMENTOS_CATEGORIA = {
  // Proteínas
  'frango': 'proteinas', 'peito de frango': 'proteinas', 'peru': 'proteinas',
  'carne': 'proteinas', 'vaca': 'proteinas', 'porco': 'proteinas',
  'peixe': 'proteinas', 'salmão': 'proteinas', 'atum': 'proteinas', 'bacalhau': 'proteinas',
  'camarão': 'proteinas', 'ovo': 'proteinas', 'ovos': 'proteinas',
  'tofu': 'proteinas', 'seitan': 'proteinas',
  // Laticínios
  'leite': 'laticinios', 'iogurte': 'laticinios', 'queijo': 'laticinios',
  'natas': 'laticinios', 'manteiga': 'laticinios', 'requeijão': 'laticinios',
  'skyr': 'laticinios', 'kefir': 'laticinios',
  // Vegetais
  'alface': 'vegetais', 'espinafre': 'vegetais', 'couve': 'vegetais',
  'brócolos': 'vegetais', 'cenoura': 'vegetais', 'tomate': 'vegetais',
  'pepino': 'vegetais', 'pimento': 'vegetais', 'cebola': 'vegetais',
  'alho': 'vegetais', 'cogumelos': 'vegetais', 'abobrinha': 'vegetais',
  'beringela': 'vegetais', 'feijão verde': 'vegetais',
  // Frutas
  'maçã': 'frutas', 'banana': 'frutas', 'laranja': 'frutas',
  'morango': 'frutas', 'mirtilos': 'frutas', 'framboesas': 'frutas',
  'abacate': 'gorduras', 'limão': 'frutas', 'kiwi': 'frutas',
  // Cereais
  'arroz': 'cereais', 'massa': 'cereais', 'pão': 'cereais',
  'aveia': 'cereais', 'quinoa': 'cereais', 'batata': 'cereais',
  'batata doce': 'cereais', 'farinha': 'cereais',
  // Gorduras
  'azeite': 'gorduras', 'óleo': 'gorduras', 'nozes': 'gorduras',
  'amêndoas': 'gorduras', 'sementes': 'gorduras', 'manteiga amendoim': 'gorduras',
  // Temperos
  'sal': 'temperos', 'pimenta': 'temperos', 'oregãos': 'temperos',
  'manjericão': 'temperos', 'salsa': 'temperos', 'coentros': 'temperos',
  'canela': 'temperos', 'gengibre': 'temperos',
};

export default function ListaCompras() {
  const [loading, setLoading] = useState(true);
  const [plano, setPlano] = useState(null);
  const [itens, setItens] = useState([]);
  const [itensComprados, setItensComprados] = useState({});
  const [semana, setSemana] = useState('atual');

  useEffect(() => {
    loadListaCompras();
    // Carregar itens já comprados do localStorage
    const comprados = JSON.parse(localStorage.getItem('vitalis-lista-comprados') || '{}');
    setItensComprados(comprados);
  }, []);

  const loadListaCompras = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (clientData) {
        const { data: planoData } = await supabase
          .from('vitalis_plano')
          .select('*')
          .eq('client_id', clientData.id)
          .single();

        if (planoData) {
          setPlano(planoData);
          gerarListaCompras(planoData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
    } finally {
      setLoading(false);
    }
  };

  const gerarListaCompras = (plano) => {
    // Extrair ingredientes do plano
    const ingredientes = [];

    // Lista base baseada nas porções do plano
    const porcoesProteina = plano.porcoes_proteina || 6;
    const porcoesHidratos = plano.porcoes_hidratos || 3;
    const porcoesGordura = plano.porcoes_gordura || 8;

    // Proteínas (20g por porção, 7 dias)
    const proteinaSemanal = porcoesProteina * 7;
    ingredientes.push(
      { nome: 'Peito de Frango', quantidade: `${Math.round(proteinaSemanal * 20 * 0.4 / 100)}`, unidade: 'kg', categoria: 'proteinas' },
      { nome: 'Ovos', quantidade: `${Math.round(proteinaSemanal * 0.3)}`, unidade: 'unidades', categoria: 'proteinas' },
      { nome: 'Peixe (salmão/pescada)', quantidade: `${Math.round(proteinaSemanal * 20 * 0.2 / 100)}`, unidade: 'kg', categoria: 'proteinas' },
      { nome: 'Iogurte Grego/Skyr', quantidade: `${Math.round(proteinaSemanal * 0.2)}`, unidade: 'unidades', categoria: 'laticinios' }
    );

    // Hidratos (30g por porção)
    const hidratosSemanal = porcoesHidratos * 7;
    ingredientes.push(
      { nome: 'Arroz/Quinoa', quantidade: `${Math.round(hidratosSemanal * 30 * 0.3 / 1000)}`, unidade: 'kg', categoria: 'cereais' },
      { nome: 'Batata Doce', quantidade: `${Math.round(hidratosSemanal * 30 * 0.3 / 100)}`, unidade: 'kg', categoria: 'cereais' },
      { nome: 'Aveia', quantidade: `${Math.round(hidratosSemanal * 30 * 0.2 / 100)}`, unidade: 'kg', categoria: 'cereais' },
      { nome: 'Fruta Variada', quantidade: `${Math.round(hidratosSemanal * 0.3)}`, unidade: 'peças', categoria: 'frutas' }
    );

    // Gorduras (7g por porção)
    const gorduraSemanal = porcoesGordura * 7;
    ingredientes.push(
      { nome: 'Azeite Extra Virgem', quantidade: '500', unidade: 'ml', categoria: 'gorduras' },
      { nome: 'Abacate', quantidade: `${Math.round(gorduraSemanal * 0.2)}`, unidade: 'unidades', categoria: 'gorduras' },
      { nome: 'Frutos Secos (nozes, amêndoas)', quantidade: `${Math.round(gorduraSemanal * 7 * 0.3 / 100)}`, unidade: 'kg', categoria: 'gorduras' }
    );

    // Vegetais (sempre necessários)
    ingredientes.push(
      { nome: 'Legumes Variados (brócolos, espinafres)', quantidade: '2', unidade: 'kg', categoria: 'vegetais' },
      { nome: 'Salada (alface, rúcula)', quantidade: '500', unidade: 'g', categoria: 'vegetais' },
      { nome: 'Tomate', quantidade: '1', unidade: 'kg', categoria: 'vegetais' },
      { nome: 'Cebola', quantidade: '500', unidade: 'g', categoria: 'vegetais' },
      { nome: 'Alho', quantidade: '2', unidade: 'cabeças', categoria: 'vegetais' }
    );

    // Extras
    ingredientes.push(
      { nome: 'Leite (ou bebida vegetal)', quantidade: '2', unidade: 'L', categoria: 'laticinios' },
      { nome: 'Queijo fresco/cottage', quantidade: '500', unidade: 'g', categoria: 'laticinios' }
    );

    setItens(ingredientes);
  };

  const toggleComprado = (index) => {
    const novoEstado = { ...itensComprados, [index]: !itensComprados[index] };
    setItensComprados(novoEstado);
    localStorage.setItem('vitalis-lista-comprados', JSON.stringify(novoEstado));
  };

  const limparLista = () => {
    setItensComprados({});
    localStorage.removeItem('vitalis-lista-comprados');
  };

  const partilharLista = async () => {
    const listaTexto = Object.entries(
      itens.reduce((acc, item) => {
        const cat = CATEGORIAS[item.categoria]?.nome || 'Outros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(`${item.nome}: ${item.quantidade} ${item.unidade}`);
        return acc;
      }, {})
    ).map(([cat, items]) => `\n${cat}:\n${items.map(i => `  - ${i}`).join('\n')}`).join('\n');

    const texto = `Lista de Compras Vitalis\n${'='.repeat(25)}${listaTexto}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lista de Compras Vitalis', text: texto });
      } catch (err) {
        console.log('Partilha cancelada');
      }
    } else {
      navigator.clipboard.writeText(texto);
      alert('Lista copiada para a área de transferência!');
    }
  };

  // Agrupar por categoria
  const itensPorCategoria = itens.reduce((acc, item, index) => {
    const cat = item.categoria || 'outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...item, index });
    return acc;
  }, {});

  const totalItens = itens.length;
  const itensCompradosCount = Object.values(itensComprados).filter(Boolean).length;
  const progresso = totalItens > 0 ? (itensCompradosCount / totalItens) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🛒</div>
          <p className="text-[#6B5C4C]">A gerar lista de compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/vitalis" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                ←
              </Link>
              <div>
                <h1 className="text-xl font-bold">Lista de Compras</h1>
                <p className="text-white/70 text-sm">Semana {semana === 'atual' ? 'Atual' : 'Próxima'}</p>
              </div>
            </div>
            <button
              onClick={partilharLista}
              className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
            >
              📤 Partilhar
            </button>
          </div>

          {/* Progresso */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{itensCompradosCount} de {totalItens} itens</span>
              <span>{Math.round(progresso)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progresso}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Ações rápidas */}
        <div className="flex gap-2">
          <button
            onClick={limparLista}
            className="flex-1 py-2 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow"
          >
            🔄 Recomeçar
          </button>
          <button
            onClick={() => setSemana(semana === 'atual' ? 'proxima' : 'atual')}
            className="flex-1 py-2 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow"
          >
            📅 {semana === 'atual' ? 'Próxima Semana' : 'Semana Atual'}
          </button>
        </div>

        {/* Lista por categoria */}
        {Object.entries(itensPorCategoria).map(([categoria, items]) => {
          const cat = CATEGORIAS[categoria] || CATEGORIAS.outros;
          const todosComprados = items.every(item => itensComprados[item.index]);

          return (
            <div key={categoria} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`px-4 py-3 bg-${cat.cor}-50 border-b border-${cat.cor}-100 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icone}</span>
                  <span className="font-semibold text-gray-700">{cat.nome}</span>
                  <span className="text-xs text-gray-500">({items.length})</span>
                </div>
                {todosComprados && <span className="text-green-500">✓</span>}
              </div>

              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.index}
                    onClick={() => toggleComprado(item.index)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                      itensComprados[item.index] ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      itensComprados[item.index]
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {itensComprados[item.index] && '✓'}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${itensComprados[item.index] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {item.nome}
                      </p>
                    </div>
                    <span className={`text-sm ${itensComprados[item.index] ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.quantidade} {item.unidade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Dicas */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h3 className="font-semibold text-amber-800 mb-2">💡 Dicas de Compras</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Compra vegetais frescos 2x por semana</li>
            <li>• Verifica sempre as datas de validade</li>
            <li>• Prefere produtos da época (mais baratos)</li>
            <li>• Congela porções de proteína para a semana</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
