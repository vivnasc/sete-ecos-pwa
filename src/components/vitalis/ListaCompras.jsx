import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

// Categorias de alimentos
const CATEGORIAS = {
  proteinas: { nome: 'Proteínas', icone: '🥩', cor: 'red' },
  laticinios: { nome: 'Laticínios', icone: '🥛', cor: 'blue' },
  vegetais: { nome: 'Vegetais', icone: '🥬', cor: 'green' },
  frutas: { nome: 'Frutas', icone: '🍎', cor: 'pink' },
  cereais: { nome: 'Cereais e Grãos', icone: '🌾', cor: 'yellow' },
  gorduras: { nome: 'Gorduras Saudáveis', icone: '🥑', cor: 'emerald' },
  temperos: { nome: 'Temperos', icone: '🌿', cor: 'lime' },
  outros: { nome: 'Outros', icone: '🛒', cor: 'gray' }
};

export default function ListaCompras() {
  const [loading, setLoading] = useState(true);
  const [plano, setPlano] = useState(null);
  const [planoCompleto, setPlanoCompleto] = useState(null);
  const [itens, setItens] = useState([]);
  const [itensComprados, setItensComprados] = useState({});
  const [faseRestritiva, setFaseRestritiva] = useState(false);

  useEffect(() => {
    loadListaCompras();
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

          // Carregar regras da fase
          const { data: planoDia } = await supabase.rpc('vitalis_plano_do_dia', {
            p_user_id: userData.id
          });

          if (planoDia && !planoDia.erro) {
            setPlanoCompleto(planoDia);

            // Verificar se é fase restritiva
            const fase = planoDia.fase?.nome?.toLowerCase() || '';
            const porcoesHidratos = planoData.porcoes_hidratos || 3;
            const isRestritiva = fase.includes('ceto') || fase.includes('low') || porcoesHidratos <= 2;
            setFaseRestritiva(isRestritiva);

            gerarListaCompras(planoData, planoDia, isRestritiva);
          } else {
            gerarListaCompras(planoData, null, false);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
    } finally {
      setLoading(false);
    }
  };

  const gerarListaCompras = (plano, planoDia, isRestritiva) => {
    const ingredientes = [];
    const evitar = planoDia?.regras?.evitar || [];

    // Função para verificar se item deve ser evitado
    const deveEvitar = (item) => {
      const itemLower = item.toLowerCase();
      return evitar.some(e => itemLower.includes(e.toLowerCase()) || e.toLowerCase().includes(itemLower));
    };

    // Porções do plano
    const porcoesProteina = plano.porcoes_proteina || 6;
    const porcoesHidratos = plano.porcoes_hidratos || 3;
    const porcoesGordura = plano.porcoes_gordura || 8;

    // ========== PROTEÍNAS ==========
    const proteinaSemanal = porcoesProteina * 7;
    ingredientes.push(
      { nome: 'Peito de Frango', quantidade: `${Math.max(1, Math.round(proteinaSemanal * 20 * 0.35 / 1000))}`, unidade: 'kg', categoria: 'proteinas' },
      { nome: 'Ovos', quantidade: `${Math.round(proteinaSemanal * 0.3) * 2}`, unidade: 'unidades', categoria: 'proteinas' },
      { nome: 'Peixe (salmão ou pescada)', quantidade: `${Math.max(0.5, Math.round(proteinaSemanal * 20 * 0.2 / 1000 * 10) / 10)}`, unidade: 'kg', categoria: 'proteinas' }
    );

    // ========== LATICÍNIOS ==========
    ingredientes.push(
      { nome: 'Iogurte Grego Natural', quantidade: `${Math.round(proteinaSemanal * 0.15)}`, unidade: 'unidades', categoria: 'laticinios' },
      { nome: 'Queijo Fresco', quantidade: '500', unidade: 'g', categoria: 'laticinios' }
    );

    // ========== HIDRATOS (se não restritiva) ==========
    if (!isRestritiva && porcoesHidratos > 2) {
      ingredientes.push(
        { nome: 'Arroz Integral', quantidade: '500', unidade: 'g', categoria: 'cereais' },
        { nome: 'Batata Doce', quantidade: '1', unidade: 'kg', categoria: 'cereais' },
        { nome: 'Aveia', quantidade: '500', unidade: 'g', categoria: 'cereais' }
      );

      // Fruta - APENAS se não restritiva
      if (!deveEvitar('fruta')) {
        ingredientes.push(
          { nome: 'Maçãs', quantidade: '6', unidade: 'unidades', categoria: 'frutas' },
          { nome: 'Bananas', quantidade: '6', unidade: 'unidades', categoria: 'frutas' }
        );
      }
    } else {
      // Fase restritiva - hidratos limitados
      ingredientes.push(
        { nome: 'Couve-flor (substituto arroz)', quantidade: '2', unidade: 'unidades', categoria: 'vegetais' }
      );

      // Apenas frutos vermelhos em pequena quantidade
      if (!deveEvitar('fruta')) {
        ingredientes.push(
          { nome: 'Frutos Vermelhos (morangos/mirtilos)', quantidade: '250', unidade: 'g', categoria: 'frutas', nota: 'Consumo moderado' }
        );
      }
    }

    // ========== VEGETAIS (sempre necessários) ==========
    ingredientes.push(
      { nome: 'Brócolos', quantidade: '500', unidade: 'g', categoria: 'vegetais' },
      { nome: 'Espinafres', quantidade: '300', unidade: 'g', categoria: 'vegetais' },
      { nome: 'Tomate', quantidade: '1', unidade: 'kg', categoria: 'vegetais' },
      { nome: 'Pepino', quantidade: '3', unidade: 'unidades', categoria: 'vegetais' },
      { nome: 'Alface/Rúcula', quantidade: '2', unidade: 'embalagens', categoria: 'vegetais' },
      { nome: 'Cebola', quantidade: '500', unidade: 'g', categoria: 'vegetais' },
      { nome: 'Alho', quantidade: '2', unidade: 'cabeças', categoria: 'vegetais' },
      { nome: 'Cogumelos', quantidade: '400', unidade: 'g', categoria: 'vegetais' }
    );

    // ========== GORDURAS ==========
    ingredientes.push(
      { nome: 'Azeite Extra Virgem', quantidade: '500', unidade: 'ml', categoria: 'gorduras' },
      { nome: 'Abacate', quantidade: `${Math.round(porcoesGordura * 0.2)}`, unidade: 'unidades', categoria: 'gorduras' },
      { nome: 'Amêndoas ou Nozes', quantidade: '200', unidade: 'g', categoria: 'gorduras' }
    );

    // Se fase restritiva, adicionar mais gorduras boas
    if (isRestritiva) {
      ingredientes.push(
        { nome: 'Sementes (chia ou linhaça)', quantidade: '200', unidade: 'g', categoria: 'gorduras' },
        { nome: 'Manteiga de Amendoim (sem açúcar)', quantidade: '1', unidade: 'frasco', categoria: 'gorduras' }
      );
    }

    // ========== TEMPEROS ==========
    ingredientes.push(
      { nome: 'Limões', quantidade: '4', unidade: 'unidades', categoria: 'temperos' },
      { nome: 'Ervas Aromáticas', quantidade: '1', unidade: 'embalagem', categoria: 'temperos' }
    );

    // Filtrar itens que devem ser evitados
    const itensFiltrados = ingredientes.filter(item => !deveEvitar(item.nome));

    setItens(itensFiltrados);
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
    const fase = planoCompleto?.fase?.nome || 'Actual';
    const listaTexto = Object.entries(
      itens.reduce((acc, item) => {
        const cat = CATEGORIAS[item.categoria]?.nome || 'Outros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(`${item.nome}: ${item.quantidade} ${item.unidade}${item.nota ? ` (${item.nota})` : ''}`);
        return acc;
      }, {})
    ).map(([cat, items]) => `\n${cat}:\n${items.map(i => `  • ${i}`).join('\n')}`).join('\n');

    const texto = `Lista de Compras Vitalis\nFase: ${fase}\n${'='.repeat(25)}${listaTexto}\n\n💡 Lista personalizada para o teu plano!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lista de Compras Vitalis', text: texto });
      } catch (err) {
        console.log('Partilha cancelada');
      }
    } else {
      navigator.clipboard.writeText(texto);
      alert('Lista copiada!');
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
          <p className="text-[#6B5C4C]">A gerar lista personalizada...</p>
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
              <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                ←
              </Link>
              <div>
                <h1 className="text-xl font-bold">Lista de Compras</h1>
                <p className="text-white/70 text-sm">
                  {planoCompleto?.fase?.nome || 'Personalizada'} • {plano?.porcoes_proteina || 6}P {plano?.porcoes_hidratos || 3}H {plano?.porcoes_gordura || 8}G
                </p>
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
        {/* Aviso de fase restritiva */}
        {faseRestritiva && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm font-medium">
              ⚠️ Lista ajustada à tua fase actual
            </p>
            <p className="text-amber-700 text-xs mt-1">
              Hidratos e frutas reduzidos conforme o teu plano.
            </p>
          </div>
        )}

        {/* Botão recomeçar */}
        <button
          onClick={limparLista}
          className="w-full py-2 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow"
        >
          🔄 Limpar marcações
        </button>

        {/* Lista por categoria */}
        {Object.entries(itensPorCategoria).map(([categoria, items]) => {
          const cat = CATEGORIAS[categoria] || CATEGORIAS.outros;
          const todosComprados = items.every(item => itensComprados[item.index]);

          return (
            <div key={categoria} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`px-4 py-3 bg-${cat.cor}-50 border-b flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icone}</span>
                  <span className="font-semibold text-gray-700">{cat.nome}</span>
                  <span className="text-xs text-gray-500">({items.length})</span>
                </div>
                {todosComprados && <span className="text-green-500 text-lg">✓</span>}
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
                      {item.nota && (
                        <p className="text-xs text-amber-600">{item.nota}</p>
                      )}
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
        <div className="bg-[#E8E4DC] border border-[#D5D0C8] rounded-2xl p-4">
          <h3 className="font-semibold text-[#4A4035] mb-2">💡 Dicas para o teu plano</h3>
          <ul className="text-sm text-[#6B5C4C] space-y-1">
            <li>• Compra vegetais frescos 2x por semana</li>
            <li>• Congela as proteínas em porções individuais</li>
            {faseRestritiva && <li>• Evita a zona dos cereais e doces</li>}
            <li>• Lê sempre os rótulos (açúcares escondidos)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
