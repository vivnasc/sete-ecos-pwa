import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';
import { calcularPorcoesDiarias } from '../../lib/vitalis/calcularPorcoes.js';
import { buscarRestricoesUtilizador, filtrarPorRestricoes } from '../../lib/vitalis/restricoesAlimentares.js';

// Base de dados de refeições com tags para filtragem
// Porções em: P = palmas proteína, H = mãos hidratos, G = polegares gordura
const REFEICOES_BASE = {
  pequeno_almoco: [
    // Moçambicanas
    { nome: 'Papa de mapira com leite de coco e amendoim', proteina: 1, hidratos: 2, gordura: 1.5, calorias: 300, tempo: 15, icone: '🥣', tags: ['normal'] },
    { nome: 'Mandioca cozida com ovo estrelado', proteina: 1.5, hidratos: 2, gordura: 1, calorias: 320, tempo: 15, icone: '🍳', tags: ['normal'] },
    { nome: 'Papa de farinha de milho com leite', proteina: 1, hidratos: 2.5, gordura: 0.5, calorias: 280, tempo: 10, icone: '🥣', tags: ['normal'] },
    { nome: 'Batata-doce cozida com chá e amendoim', proteina: 0.5, hidratos: 2, gordura: 1.5, calorias: 260, tempo: 10, icone: '🍠', tags: ['normal'] },
    // Internacionais
    { nome: 'Ovos mexidos com espinafres e queijo', proteina: 2, hidratos: 0, gordura: 1.5, calorias: 280, tempo: 10, icone: '🥚', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Omelete de cogumelos, bacon e queijo', proteina: 2, hidratos: 0, gordura: 2, calorias: 320, tempo: 10, icone: '🍳', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Café Keto (café + óleo coco + manteiga)', proteina: 0, hidratos: 0, gordura: 3, calorias: 200, tempo: 5, icone: '☕', tags: ['keto'], nota: 'Energia matinal sem hidratos' },
    { nome: 'Iogurte grego com sementes e canela', proteina: 1.5, hidratos: 0.5, gordura: 1, calorias: 200, tempo: 3, icone: '🥛', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Batido proteico (whey + leite amêndoa + manteiga amendoim)', proteina: 2, hidratos: 0.5, gordura: 1.5, calorias: 280, tempo: 3, icone: '🥤', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Papas de aveia com whey e frutos vermelhos', proteina: 1.5, hidratos: 2, gordura: 0.5, calorias: 280, tempo: 5, icone: '🥣', tags: ['normal'] },
    { nome: 'Tosta integral com abacate e ovo', proteina: 1, hidratos: 1.5, gordura: 2, calorias: 300, tempo: 8, icone: '🥑', tags: ['normal'] },
    { nome: 'Panquecas de farinha de amêndoa com manteiga', proteina: 1.5, hidratos: 0.5, gordura: 2, calorias: 280, tempo: 15, icone: '🥞', tags: ['lowcarb', 'keto'] },
    { nome: 'Panquecas de aveia e banana', proteina: 1.5, hidratos: 2, gordura: 1, calorias: 320, tempo: 15, icone: '🥞', tags: ['normal'] },
    { nome: 'Ovos cozidos com abacate e bacon', proteina: 2, hidratos: 0, gordura: 2.5, calorias: 300, tempo: 12, icone: '🥚', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Crepes de coco com creme de queijo', proteina: 1, hidratos: 0.5, gordura: 2, calorias: 250, tempo: 10, icone: '🥞', tags: ['keto'] },
  ],
  almoco: [
    // Moçambicanas — fase normal (com hidratos)
    { nome: 'Xima com caril de frango e matapa', proteina: 2.5, hidratos: 2, gordura: 1.5, calorias: 450, tempo: 30, icone: '🍛', tags: ['normal'] },
    { nome: 'Xima com caril de amendoim e couve', proteina: 1.5, hidratos: 2, gordura: 2, calorias: 420, tempo: 25, icone: '🥜', tags: ['normal'] },
    { nome: 'Matapa com camarão e arroz', proteina: 2.5, hidratos: 1.5, gordura: 1.5, calorias: 400, tempo: 35, icone: '🥬', tags: ['normal'] },
    { nome: 'Feijão nhemba com xima e salada', proteina: 2, hidratos: 2, gordura: 0.5, calorias: 380, tempo: 30, icone: '🫘', tags: ['normal'] },
    { nome: 'Frango à Zambeziana com arroz de coco', proteina: 3, hidratos: 2, gordura: 2, calorias: 500, tempo: 40, icone: '🍗', tags: ['normal'] },
    { nome: 'Caril de peixe com xima', proteina: 2.5, hidratos: 1.5, gordura: 1, calorias: 380, tempo: 30, icone: '🐟', tags: ['normal'] },
    { nome: 'Cacana com amendoim e xima', proteina: 1.5, hidratos: 2, gordura: 1.5, calorias: 360, tempo: 25, icone: '🥬', tags: ['normal'] },
    // Moçambicanas — keto/lowcarb (sem xima, sem arroz)
    { nome: 'Matapa com camarão (sem xima)', proteina: 2.5, hidratos: 0.5, gordura: 2.5, calorias: 380, tempo: 35, icone: '🥬', tags: ['lowcarb', 'keto'], nota: 'Folha de mandioca + coco + camarão' },
    { nome: 'Caril de frango com salada (sem xima)', proteina: 3, hidratos: 0.5, gordura: 2, calorias: 400, tempo: 25, icone: '🍗', tags: ['lowcarb', 'keto'] },
    // Internacionais
    { nome: 'Salada de frango grelhado com azeite e abacate', proteina: 3, hidratos: 0.5, gordura: 2.5, calorias: 420, tempo: 20, icone: '🥗', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Bife de vaca com manteiga de ervas e legumes', proteina: 3, hidratos: 0.5, gordura: 3, calorias: 450, tempo: 20, icone: '🥩', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Salmão ao forno com azeite e espargos', proteina: 2.5, hidratos: 0.5, gordura: 2.5, calorias: 420, tempo: 25, icone: '🐟', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Frango com arroz integral e brócolos', proteina: 3, hidratos: 2, gordura: 1, calorias: 420, tempo: 30, icone: '🍛', tags: ['normal'] },
    { nome: 'Picanha grelhada com salada e azeite', proteina: 3.5, hidratos: 0.5, gordura: 3, calorias: 480, tempo: 25, icone: '🥩', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Carne moída salteada com legumes e ghee', proteina: 3, hidratos: 0.5, gordura: 2.5, calorias: 400, tempo: 15, icone: '🥩', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Omelete recheada com queijo e bacon', proteina: 2.5, hidratos: 0, gordura: 2.5, calorias: 350, tempo: 15, icone: '🍳', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Peixe branco com puré de couve-flor e manteiga', proteina: 2.5, hidratos: 0.5, gordura: 2, calorias: 320, tempo: 25, icone: '🐟', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Costeletas de porco com salada e azeite', proteina: 3, hidratos: 0.5, gordura: 2.5, calorias: 420, tempo: 25, icone: '🍖', tags: ['lowcarb', 'keto', 'normal'] },
  ],
  jantar: [
    // Moçambicanas — fase normal (com hidratos)
    { nome: 'Matapa com xima (porção leve)', proteina: 1.5, hidratos: 1.5, gordura: 1.5, calorias: 320, tempo: 30, icone: '🥬', tags: ['normal'] },
    { nome: 'Caril de camarão com arroz', proteina: 2.5, hidratos: 1.5, gordura: 1.5, calorias: 380, tempo: 30, icone: '🦐', tags: ['normal'] },
    { nome: 'Peixe grelhado à moçambicana com mandioca', proteina: 2.5, hidratos: 1.5, gordura: 1, calorias: 350, tempo: 25, icone: '🐟', tags: ['normal'] },
    { nome: 'Sopa de feijão nhemba com couve', proteina: 2, hidratos: 1, gordura: 0.5, calorias: 260, tempo: 25, icone: '🫘', tags: ['normal'] },
    // Moçambicanas — keto/lowcarb (sem xima, sem arroz, sem mandioca)
    { nome: 'Galinha à Cafreal com salada', proteina: 3, hidratos: 0.5, gordura: 2, calorias: 400, tempo: 35, icone: '🍗', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Caril de camarão com legumes (sem arroz)', proteina: 2.5, hidratos: 0.5, gordura: 2, calorias: 350, tempo: 30, icone: '🦐', tags: ['lowcarb', 'keto'], nota: 'Camarão em leite de coco com legumes' },
    { nome: 'Matapa (sem xima, só folha com camarão)', proteina: 2, hidratos: 0.5, gordura: 2.5, calorias: 320, tempo: 30, icone: '🥬', tags: ['lowcarb', 'keto'], nota: 'Folha de mandioca + coco, rica em gordura boa' },
    // Internacionais
    { nome: 'Peixe grelhado com salada e azeite', proteina: 2.5, hidratos: 0.5, gordura: 2, calorias: 350, tempo: 20, icone: '🐟', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Sopa cremosa de legumes com frango desfiado', proteina: 2, hidratos: 0.5, gordura: 1.5, calorias: 280, tempo: 20, icone: '🍜', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Bife de vaca com cogumelos salteados em manteiga', proteina: 3, hidratos: 0.5, gordura: 2.5, calorias: 400, tempo: 20, icone: '🥩', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Frango ao forno com legumes e azeite', proteina: 2.5, hidratos: 0.5, gordura: 1.5, calorias: 350, tempo: 30, icone: '🍗', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Salada mediterrânea com atum e azeitonas', proteina: 2, hidratos: 0.5, gordura: 2.5, calorias: 320, tempo: 10, icone: '🥗', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Hambúrguer caseiro (sem pão) com queijo e salada', proteina: 2.5, hidratos: 0.5, gordura: 2.5, calorias: 380, tempo: 15, icone: '🍔', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Carne estufada com legumes', proteina: 2.5, hidratos: 0.5, gordura: 2, calorias: 360, tempo: 40, icone: '🥩', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Tofu salteado com legumes e óleo de coco', proteina: 2, hidratos: 0.5, gordura: 2, calorias: 280, tempo: 20, icone: '🥡', tags: ['lowcarb', 'keto', 'normal', 'vegetariano'] },
  ],
  snack: [
    // Moçambicanos
    { nome: 'Amendoim torrado', proteina: 1, hidratos: 0.5, gordura: 2, calorias: 180, tempo: 1, icone: '🥜', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Cajus torrados', proteina: 0.5, hidratos: 0.5, gordura: 2, calorias: 170, tempo: 1, icone: '🥜', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Banana com amendoim', proteina: 0.5, hidratos: 1.5, gordura: 1.5, calorias: 200, tempo: 2, icone: '🍌', tags: ['normal'] },
    { nome: 'Mandioca frita (porção pequena)', proteina: 0, hidratos: 1.5, gordura: 1, calorias: 180, tempo: 10, icone: '🍠', tags: ['normal'] },
    // Internacionais
    { nome: 'Iogurte grego com nozes e canela', proteina: 1, hidratos: 0.5, gordura: 1.5, calorias: 180, tempo: 2, icone: '🥛', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Queijo curado com azeitonas', proteina: 1, hidratos: 0, gordura: 2, calorias: 180, tempo: 1, icone: '🧀', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Ovos cozidos com sal e pimenta', proteina: 1.5, hidratos: 0, gordura: 1, calorias: 140, tempo: 10, icone: '🥚', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Abacate com sal e azeite', proteina: 0.5, hidratos: 0.5, gordura: 3, calorias: 220, tempo: 2, icone: '🥑', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Batido proteico (whey + leite amêndoa)', proteina: 1.5, hidratos: 0.5, gordura: 0.5, calorias: 130, tempo: 3, icone: '🥤', tags: ['lowcarb', 'keto', 'normal'] },
    { nome: 'Fat bomb de chocolate (cacau + coco)', proteina: 0.5, hidratos: 0.5, gordura: 3, calorias: 200, tempo: 5, icone: '🍫', tags: ['keto'], nota: 'Energia em gordura pura' },
    { nome: 'Maçã com manteiga de amendoim', proteina: 0.5, hidratos: 1, gordura: 1.5, calorias: 200, tempo: 2, icone: '🍎', tags: ['normal'] },
  ]
};

export default function SugestoesRefeicoes() {
  const [loading, setLoading] = useState(true);
  const [plano, setPlano] = useState(null);
  const [planoCompleto, setPlanoCompleto] = useState(null);
  const [macrosRestantes, setMacrosRestantes] = useState({ proteina: 0, hidratos: 0, gordura: 0, calorias: 0 });
  const [macrosConsumidos, setMacrosConsumidos] = useState({ proteina: 0, hidratos: 0, gordura: 0 });
  const [refeicaoSelecionada, setRefeicaoSelecionada] = useState('almoco');
  const [sugestoesFiltradas, setSugestoesFiltradas] = useState([]);
  const [filtroTempo, setFiltroTempo] = useState('todos');
  const [faseTag, setFaseTag] = useState('normal');
  const [restricoes, setRestricoes] = useState([]);

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDados();
    buscarRestricoesUtilizador().then(setRestricoes);
  }, []);

  useEffect(() => {
    filtrarSugestoes();
  }, [refeicaoSelecionada, macrosRestantes, filtroTempo, faseTag, restricoes]);

  const loadDados = async () => {
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
        let planoData = null;
        const { data: planoView } = await supabase
          .from('vitalis_plano')
          .select('*')
          .eq('client_id', clientData.id)
          .maybeSingle();
        planoData = planoView;

        // Fallback: vitalis_meal_plans
        if (!planoData) {
          const { data: mealPlan } = await supabase
            .from('vitalis_meal_plans').select('*')
            .eq('user_id', userData.id).eq('status', 'activo')
            .order('created_at', { ascending: false }).limit(1).maybeSingle();
          if (mealPlan) {
            const porcoesDiarias = calcularPorcoesDiarias(mealPlan);
            planoData = {
              ...mealPlan, client_id: clientData.id,
              porcoes_proteina: porcoesDiarias.proteina,
              porcoes_hidratos: porcoesDiarias.hidratos,
              porcoes_gordura: porcoesDiarias.gordura,
              porcoes_legumes: porcoesDiarias.legumes
            };
          }
        }

        if (planoData) {
          setPlano(planoData);

          // Carregar regras da fase
          const { data: planoDia } = await supabase.rpc('vitalis_plano_do_dia', {
            p_user_id: userData.id
          });

          if (planoDia && !planoDia.erro) {
            setPlanoCompleto(planoDia);

            // Determinar tag da fase
            const faseNome = planoDia.fase?.nome?.toLowerCase() || '';
            const porcoesH = planoData.porcoes_hidratos || 3;
            if (faseNome.includes('ceto') || porcoesH <= 1) {
              setFaseTag('keto');
            } else if (faseNome.includes('low') || porcoesH <= 2) {
              setFaseTag('lowcarb');
            } else {
              setFaseTag('normal');
            }
          }

          // Buscar consumo de hoje
          const { data: mealsData } = await supabase
            .from('vitalis_meals_log')
            .select('*')
            .eq('user_id', userData.id)
            .eq('data', hoje);

          const consumidos = (mealsData || []).reduce((acc, meal) => ({
            proteina: acc.proteina + (parseFloat(meal.porcoes_proteina) || 0),
            hidratos: acc.hidratos + (parseFloat(meal.porcoes_hidratos) || 0),
            gordura: acc.gordura + (parseFloat(meal.porcoes_gordura) || 0)
          }), { proteina: 0, hidratos: 0, gordura: 0 });

          setMacrosConsumidos(consumidos);

          // Calcular restantes
          const restantes = {
            proteina: Math.max(0, (planoData.porcoes_proteina || 6) - consumidos.proteina),
            hidratos: Math.max(0, (planoData.porcoes_hidratos || 3) - consumidos.hidratos),
            gordura: Math.max(0, (planoData.porcoes_gordura || 8) - consumidos.gordura),
            calorias: Math.max(0, (planoData.calorias_diarias || 1500) - (
              consumidos.proteina * 20 * 4 +
              consumidos.hidratos * 30 * 4 +
              consumidos.gordura * 7 * 9
            ))
          };

          setMacrosRestantes(restantes);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarSugestoes = () => {
    let sugestoes = REFEICOES_BASE[refeicaoSelecionada] || [];

    // Filtrar por fase (tag)
    // Normal: mostra tudo (incluindo opções keto/lowcarb)
    // Keto/Lowcarb: mostra APENAS itens com a tag da fase (nunca xima em indução!)
    sugestoes = faseTag === 'normal'
      ? sugestoes
      : sugestoes.filter(s => s.tags.includes(faseTag));

    // Filtrar por restrições alimentares (halal, sem glúten, sem lactose, etc.)
    sugestoes = filtrarPorRestricoes(sugestoes, restricoes);

    // Filtrar por tempo
    if (filtroTempo === 'rapido') {
      sugestoes = sugestoes.filter(s => s.tempo <= 10);
    } else if (filtroTempo === 'medio') {
      sugestoes = sugestoes.filter(s => s.tempo > 10 && s.tempo <= 20);
    }

    // Calcular adequação aos macros restantes
    sugestoes = sugestoes.map(s => {
      const dentroProteina = s.proteina <= macrosRestantes.proteina + 0.5;
      const dentroHidratos = s.hidratos <= macrosRestantes.hidratos + 0.5;
      const dentroGordura = s.gordura <= macrosRestantes.gordura + 0.5;
      const dentroCalorias = s.calorias <= macrosRestantes.calorias + 100;

      const score = (dentroProteina ? 1 : 0) + (dentroHidratos ? 1 : 0) + (dentroGordura ? 1 : 0) + (dentroCalorias ? 1 : 0);
      const adequado = score >= 3;
      const ideal = score === 4;

      return { ...s, score, adequado, ideal };
    }).sort((a, b) => b.score - a.score);

    setSugestoesFiltradas(sugestoes);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🍽️</div>
          <p className="text-[#6B5C4C]">A calcular sugestões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)' }}>Sugestões de Refeições</h1>
              <p className="text-white/70 text-sm">
                {planoCompleto?.fase?.nome || 'Personalizado'} • Baseado nos teus macros
              </p>
            </div>
          </div>

          {/* Macros Restantes */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{macrosRestantes.proteina.toFixed(1)}</p>
              <p className="text-xs text-white/70">Proteína</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{macrosRestantes.hidratos.toFixed(1)}</p>
              <p className="text-xs text-white/70">Hidratos</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{macrosRestantes.gordura.toFixed(1)}</p>
              <p className="text-xs text-white/70">Gordura</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{Math.round(macrosRestantes.calorias)}</p>
              <p className="text-xs text-white/70">kcal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Aviso de fase */}
        {faseTag !== 'normal' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-amber-800 text-sm">
              ⚠️ Sugestões filtradas para a tua fase ({faseTag === 'keto' ? 'Cetogénica' : 'Low Carb'})
            </p>
          </div>
        )}

        {/* Aviso de restrições alimentares */}
        {restricoes.length > 0 && !restricoes.includes('Nenhuma') && !restricoes.includes('Sem restrições') && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-blue-800 text-sm">
              🍽️ Sugestões adaptadas às tuas restrições: {restricoes.filter(r => r !== 'Nenhuma' && r !== 'Sem restrições').join(', ')}
            </p>
          </div>
        )}

        {/* Filtros de refeição */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'pequeno_almoco', nome: 'Peq. Almoço', icone: '🌅' },
            { id: 'almoco', nome: 'Almoço', icone: '☀️' },
            { id: 'jantar', nome: 'Jantar', icone: '🌙' },
            { id: 'snack', nome: 'Snack', icone: '🍎' }
          ].map(ref => (
            <button
              key={ref.id}
              onClick={() => setRefeicaoSelecionada(ref.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                refeicaoSelecionada === ref.id
                  ? 'bg-[#7C8B6F] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{ref.icone}</span>
              <span className="text-sm font-medium">{ref.nome}</span>
            </button>
          ))}
        </div>

        {/* Filtro de tempo */}
        <div className="flex gap-2">
          {[
            { id: 'todos', nome: 'Todos' },
            { id: 'rapido', nome: '⚡ Rápido' },
            { id: 'medio', nome: '⏱️ Médio' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroTempo(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filtroTempo === f.id
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.nome}
            </button>
          ))}
        </div>

        {/* Lista de Sugestões */}
        <div className="space-y-3">
          {sugestoesFiltradas.map((sugestao, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg p-4 transition-all ${
                sugestao.ideal ? 'border-2 border-green-400' : sugestao.adequado ? 'border border-green-200' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{sugestao.icone}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{sugestao.nome}</h3>
                    {sugestao.ideal && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        ✓ Ideal
                      </span>
                    )}
                    {sugestao.adequado && !sugestao.ideal && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">
                        Bom
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>⏱️ {sugestao.tempo} min</span>
                    <span>🔥 {sugestao.calorias} kcal</span>
                  </div>

                  {/* Macros */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                      sugestao.proteina <= macrosRestantes.proteina ? 'bg-red-50' : 'bg-red-100'
                    }`}>
                      <span className="text-xs">🥩</span>
                      <span className={`text-xs font-medium ${
                        sugestao.proteina <= macrosRestantes.proteina ? 'text-red-700' : 'text-red-500'
                      }`}>{sugestao.proteina}P</span>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                      sugestao.hidratos <= macrosRestantes.hidratos ? 'bg-amber-50' : 'bg-amber-100'
                    }`}>
                      <span className="text-xs">🍚</span>
                      <span className={`text-xs font-medium ${
                        sugestao.hidratos <= macrosRestantes.hidratos ? 'text-amber-700' : 'text-amber-500'
                      }`}>{sugestao.hidratos}H</span>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                      sugestao.gordura <= macrosRestantes.gordura ? 'bg-green-50' : 'bg-green-100'
                    }`}>
                      <span className="text-xs">🥑</span>
                      <span className={`text-xs font-medium ${
                        sugestao.gordura <= macrosRestantes.gordura ? 'text-green-700' : 'text-green-500'
                      }`}>{sugestao.gordura}G</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/vitalis/meals"
                  className="px-3 py-2 bg-[#7C8B6F] text-white rounded-xl text-sm font-medium hover:bg-[#6B7A5D] transition-colors"
                >
                  Registar
                </Link>
              </div>
            </div>
          ))}
        </div>

        {sugestoesFiltradas.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🤔</div>
            <p className="text-gray-500">Nenhuma sugestão encontrada</p>
            <p className="text-gray-400 text-sm">Experimenta outros filtros</p>
          </div>
        )}

        {/* Legenda */}
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-600 font-medium mb-2">Legenda:</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span> Ideal para os teus macros
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-200 rounded-full"></span> Adequado
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
