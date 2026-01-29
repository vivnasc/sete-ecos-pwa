// ============================================================
// VITALIS - PLANO ALIMENTAR COMPONENT
// ============================================================
// Mostra: porções do dia, check-in diário, mensagens de contexto
// Usa as funções SQL: vitalis_plano_do_dia, vitalis_checkin_diario
// ============================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

// ============================================================
// CONSTANTES
// ============================================================
const DIAS_SEMANA = [
  { valor: 1, nome: 'Dom', nomeLongo: 'Domingo' },
  { valor: 2, nome: 'Seg', nomeLongo: 'Segunda' },
  { valor: 3, nome: 'Ter', nomeLongo: 'Terça' },
  { valor: 4, nome: 'Qua', nomeLongo: 'Quarta' },
  { valor: 5, nome: 'Qui', nomeLongo: 'Quinta' },
  { valor: 6, nome: 'Sex', nomeLongo: 'Sexta' },
  { valor: 7, nome: 'Sáb', nomeLongo: 'Sábado' }
];

// ============================================================
// ÍCONES (inline para não depender de bibliotecas)
// ============================================================
const Icons = {
  Hand: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
    </svg>
  ),
  Meat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M15.5 2.5c2 0 3.5 1.5 3.5 3.5 0 2.5-2 4-4 6-2-2-4-3.5-4-6 0-2 1.5-3.5 3.5-3.5h1z"/>
      <path d="M12 12c-2 2-3.5 4-3.5 6.5a3.5 3.5 0 0 0 7 0c0-2.5-1.5-4.5-3.5-6.5z"/>
    </svg>
  ),
  Salad: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M7 21h10"/>
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z"/>
      <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47.63 2.4 2.4 0 0 1 .53 3.67 2.4 2.4 0 0 1-2.8 3.24"/>
    </svg>
  ),
  Bread: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M12 2a4 4 0 0 0-4 4v2H5a3 3 0 0 0 0 6h1v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6h1a3 3 0 0 0 0-6h-3V6a4 4 0 0 0-4-4z"/>
    </svg>
  ),
  Oil: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M10 2v7.31"/>
      <path d="M14 9.3V1.99"/>
      <path d="M8.5 2h7"/>
      <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
    </svg>
  ),
  Dumbbell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M6.5 6.5a2 2 0 0 0-3 0L2 8l10 10 1.5-1.5a2 2 0 0 0 0-3"/>
      <path d="M17.5 17.5a2 2 0 0 0 3 0L22 16 12 6l-1.5 1.5a2 2 0 0 0 0 3"/>
      <path d="M12 6L6 12"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  Meh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
      <circle cx="12" cy="12" r="10"/>
      <line x1="8" y1="15" x2="16" y2="15"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  ),
  Scale: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M8 21h8M12 17v4M7 4h10M12 4v8"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
};

// ============================================================
// COMPONENTE: CARTÃO DE PORÇÃO
// ============================================================
function PorcaoCard({ tipo, quantidade, tamanho, extra = 0, cor }) {
  const config = {
    proteina: { 
      icon: Icons.Meat, 
      nome: 'Proteína', 
      unidade: 'palmas',
      descricao: `~${tamanho}g por palma`,
      exemplos: 'Frango, peixe, ovos, carne'
    },
    legumes: { 
      icon: Icons.Salad, 
      nome: 'Legumes', 
      unidade: 'punhos',
      descricao: '~100g por punho',
      exemplos: 'Brócolos, espinafres, tomate'
    },
    hidratos: { 
      icon: Icons.Bread, 
      nome: 'Hidratos', 
      unidade: 'mãos',
      descricao: `~${tamanho}g carbs por mão`,
      exemplos: 'Arroz, batata, fruta'
    },
    gordura: { 
      icon: Icons.Oil, 
      nome: 'Gordura', 
      unidade: 'polegares',
      descricao: `~${tamanho}g por polegar`,
      exemplos: 'Azeite, abacate, nozes'
    }
  };

  const item = config[tipo];
  const Icon = item.icon;
  const total = quantidade + extra;

  return (
    <div className={`bg-gradient-to-br ${cor} rounded-2xl p-4 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white bg-opacity-50 rounded-xl">
            <Icon />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{item.nome}</h3>
            <p className="text-xs text-gray-600">{item.descricao}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-gray-800">{total}</span>
          <p className="text-xs text-gray-600">{item.unidade}</p>
        </div>
      </div>
      {extra > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
          <Icons.Dumbbell />
          <span>+{extra} dia de treino</span>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500 italic">{item.exemplos}</p>
    </div>
  );
}

// ============================================================
// COMPONENTE: CHECK-IN DIÁRIO
// ============================================================
function CheckinDiario({ userId, jaFez, respostaAnterior, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(respostaAnterior || null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const opcoes = [
    { valor: 'sim', label: 'Sim', icon: Icons.Check, cor: 'bg-green-100 border-green-400 text-green-700', corSelected: 'bg-green-500 text-white border-green-500' },
    { valor: 'mais_ou_menos', label: 'Mais ou menos', icon: Icons.Meh, cor: 'bg-yellow-100 border-yellow-400 text-yellow-700', corSelected: 'bg-yellow-500 text-white border-yellow-500' },
    { valor: 'nao', label: 'Não', icon: Icons.X, cor: 'bg-red-100 border-red-400 text-red-700', corSelected: 'bg-red-500 text-white border-red-500' }
  ];

  const handleSelect = async (valor) => {
    if (jaFez) return;
    
    setSelected(valor);
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('vitalis_checkin_diario', {
        p_user_id: userId,
        p_seguiu: valor
      });

      if (error) throw error;
      
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        if (onComplete) onComplete(valor);
      }, 2000);
    } catch (err) {
      console.error('Erro no check-in:', err);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 text-center text-white">
        <div className="text-4xl mb-2">✓</div>
        <p className="font-semibold">Check-in registado!</p>
        <p className="text-sm opacity-90">Obrigada por manteres o registo 💪</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
      <h3 className="font-bold text-gray-800 mb-1">
        {jaFez ? '✓ Check-in de hoje' : 'Check-in diário'}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {jaFez ? 'Já registaste hoje' : 'Seguiste o plano hoje?'}
      </p>
      
      <div className="grid grid-cols-3 gap-3">
        {opcoes.map((op) => {
          const Icon = op.icon;
          const isSelected = selected === op.valor;
          
          return (
            <button
              key={op.valor}
              onClick={() => handleSelect(op.valor)}
              disabled={loading || jaFez}
              className={`
                p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                ${isSelected ? op.corSelected : op.cor}
                ${jaFez && !isSelected ? 'opacity-30' : ''}
                ${!jaFez && !loading ? 'hover:scale-105 active:scale-95' : ''}
                disabled:cursor-not-allowed
              `}
            >
              <Icon />
              <span className="text-sm font-medium">{op.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE: MENSAGEM DE CONTEXTO
// ============================================================
function MensagemContexto({ mensagem, onDismiss }) {
  const getEmoji = (tipo) => {
    const emojis = {
      'ciclo_tpm': '🌙',
      'ciclo_menstrual': '🩸',
      'ciclo_ovulacao': '✨',
      'peso_desceu': '🎉',
      'peso_subiu': '📊',
      'mudanca_fase': '🎉',
      'motivacional': '💪',
      'ajuste_aplicado': '🔄',
      'ajuste_sugerido': '💡'
    };
    return emojis[tipo] || '💡';
  };

  const getBgColor = (tipo) => {
    if (tipo.includes('ciclo')) return 'from-purple-50 to-pink-50 border-purple-200';
    if (tipo === 'peso_desceu') return 'from-green-50 to-emerald-50 border-green-200';
    if (tipo === 'peso_subiu') return 'from-amber-50 to-orange-50 border-amber-200';
    if (tipo === 'mudanca_fase') return 'from-blue-50 to-indigo-50 border-blue-200';
    return 'from-orange-50 to-amber-50 border-orange-200';
  };

  return (
    <div className={`bg-gradient-to-r ${getBgColor(mensagem.tipo)} border rounded-2xl p-4 relative`}>
      <button 
        onClick={() => onDismiss(mensagem.id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl leading-none"
      >
        ×
      </button>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getEmoji(mensagem.tipo)}</span>
        <div className="pr-6">
          <h4 className="font-semibold text-gray-800">{mensagem.titulo}</h4>
          <p className="text-sm text-gray-600 mt-1">{mensagem.mensagem}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE: CHECK-IN SEMANAL (PESAGEM)
// ============================================================
function CheckinSemanal({ userId, onComplete }) {
  const [peso, setPeso] = useState('');
  const [comoCorreu, setComoCorreu] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!peso) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('vitalis_checkin_semanal', {
        p_user_id: userId,
        p_peso: parseFloat(peso),
        p_como_correu: comoCorreu || null
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        if (onComplete) onComplete(parseFloat(peso));
      }, 2000);
    } catch (err) {
      console.error('Erro na pesagem:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verificar se hoje é sexta-feira
  const hoje = new Date();
  const eSexta = hoje.getDay() === 5;

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className={`
          w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
          ${eSexta 
            ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300 animate-pulse' 
            : 'bg-gray-50 border-gray-200'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${eSexta ? 'bg-orange-200' : 'bg-gray-200'}`}>
            <Icons.Scale />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">Pesagem semanal</p>
            <p className="text-xs text-gray-500">
              {eSexta ? '🎯 Hoje é dia de pesagem!' : 'Sexta-feira de manhã'}
            </p>
          </div>
        </div>
        <Icons.ChevronRight />
      </button>
    );
  }

  if (success) {
    return (
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 text-center text-white">
        <div className="text-4xl mb-2">⚖️</div>
        <p className="font-semibold">Peso registado!</p>
        <p className="text-sm opacity-90">{peso} kg</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">Pesagem semanal</h3>
        <button 
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peso (kg) *
          </label>
          <input
            type="number"
            step="0.1"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="Ex: 72.5"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
            inputMode="decimal"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Como correu a semana? (opcional)
          </label>
          <textarea
            value={comoCorreu}
            onChange={(e) => setComoCorreu(e.target.value)}
            placeholder="Desafios, vitórias, como te sentiste..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !peso}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'A guardar...' : 'Registar peso'}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// COMPONENTE: CONFIGURAR DIAS DE TREINO (inline)
// ============================================================
const DIAS_SEMANA = [
  { valor: 1, nome: 'D', nomeLongo: 'Domingo' },
  { valor: 2, nome: 'S', nomeLongo: 'Segunda' },
  { valor: 3, nome: 'T', nomeLongo: 'Terça' },
  { valor: 4, nome: 'Q', nomeLongo: 'Quarta' },
  { valor: 5, nome: 'Q', nomeLongo: 'Quinta' },
  { valor: 6, nome: 'S', nomeLongo: 'Sexta' },
  { valor: 7, nome: 'S', nomeLongo: 'Sábado' }
];

function ConfigurarDiasTreino({ userId, diasActuais = [], onSave, compacto = false }) {
  const [dias, setDias] = useState(diasActuais);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleDia = (valor) => {
    setDias(prev => {
      const novos = prev.includes(valor) 
        ? prev.filter(d => d !== valor)
        : [...prev, valor].sort((a, b) => a - b);
      return novos;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('vitalis_definir_dias_treino', {
        p_user_id: userId,
        p_dias: dias
      });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (onSave) onSave(dias);
      }, 1500);
    } catch (err) {
      console.error('Erro ao guardar dias:', err);
    } finally {
      setLoading(false);
    }
  };

  // Versão compacta (para edição rápida)
  if (compacto) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icons.Dumbbell />
            <span className="font-semibold text-gray-800">Dias de treino</span>
          </div>
          {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
        </div>
        <div className="flex gap-1 mb-3">
          {DIAS_SEMANA.map((dia) => (
            <button
              key={dia.valor}
              onClick={() => toggleDia(dia.valor)}
              className={`
                w-9 h-9 rounded-full text-xs font-medium transition-all
                ${dias.includes(dia.valor)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
              title={dia.nomeLongo}
            >
              {dia.nome}
            </button>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={loading || JSON.stringify(dias) === JSON.stringify(diasActuais)}
          className="w-full py-2 text-sm bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'A guardar...' : 'Guardar alterações'}
        </button>
      </div>
    );
  }

  // Versão completa (primeira configuração)
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border-2 border-orange-200">
      <div className="text-center mb-4">
        <span className="text-3xl">🏋️</span>
        <h3 className="font-bold text-gray-800 mt-2">Treinas durante a semana?</h3>
        <p className="text-sm text-gray-600 mt-1">
          Seleciona os dias para ajustarmos os hidratos
        </p>
      </div>
      
      <div className="flex justify-center gap-2 mb-4">
        {DIAS_SEMANA.map((dia) => (
          <button
            key={dia.valor}
            onClick={() => toggleDia(dia.valor)}
            className={`
              w-10 h-10 rounded-full text-sm font-medium transition-all
              ${dias.includes(dia.valor)
                ? 'bg-orange-500 text-white shadow-md scale-110'
                : 'bg-white text-gray-500 hover:bg-orange-100 border border-gray-200'
              }
            `}
            title={dia.nomeLongo}
          >
            {dia.nome}
          </button>
        ))}
      </div>

      {dias.length > 0 && (
        <p className="text-center text-sm text-orange-700 mb-4">
          +1 mão de hidratos nos dias de treino 🍚
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {loading ? 'A guardar...' : dias.length === 0 ? 'Não treino' : `Confirmar ${dias.length} dia${dias.length > 1 ? 's' : ''}`}
      </button>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL: PLANO ALIMENTAR
// ============================================================
export default function PlanoAlimentar() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plano, setPlano] = useState(null);
  const [usersId, setUsersId] = useState(null);
  const [mostrarConfigTreino, setMostrarConfigTreino] = useState(false);

  // Carregar plano do dia
  const carregarPlano = async () => {
    try {
      // Obter user actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Utilizador não autenticado');
        return;
      }

      // Obter user_id da tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userError) throw userError;
      setUsersId(userData.id);

      // Chamar função que retorna plano do dia
      const { data, error: planoError } = await supabase.rpc('vitalis_plano_do_dia', {
        p_user_id: userData.id
      });

      if (planoError) throw planoError;

      if (data?.erro) {
        setError(data.erro);
      } else {
        setPlano(data);
      }
    } catch (err) {
      console.error('Erro ao carregar plano:', err);
      setError('Erro ao carregar o plano. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPlano();
  }, []);

  // Marcar mensagem como vista
  const dismissMensagem = async (mensagemId) => {
    try {
      await supabase.rpc('vitalis_marcar_mensagem_vista', {
        p_mensagem_id: mensagemId
      });
      
      // Actualizar estado local
      setPlano(prev => ({
        ...prev,
        mensagens: prev.mensagens.filter(m => m.id !== mensagemId)
      }));
    } catch (err) {
      console.error('Erro ao marcar mensagem:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar o teu plano...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 p-4">
        <div className="max-w-md mx-auto mt-20 bg-white rounded-2xl p-6 text-center shadow-lg">
          <div className="text-5xl mb-4">🥗</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Plano não disponível</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/vitalis/intake"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full font-semibold"
          >
            Completar Intake
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 pt-12 pb-6">
        <div className="max-w-md mx-auto">
          <p className="text-orange-100 text-sm">
            {plano.fase?.nome} · Semana {plano.fase?.semana || 1}
          </p>
          <h1 className="text-2xl font-bold mt-1">O teu plano de hoje</h1>
          
          {plano.e_dia_treino && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-full text-sm">
              <Icons.Dumbbell />
              <span>Dia de treino (+{plano.porcoes?.carbs_extra_treino} mão carbs)</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Configuração dias de treino - primeira vez */}
        {plano.dias_treino?.length === 0 && !mostrarConfigTreino && (
          <ConfigurarDiasTreino 
            userId={usersId}
            diasActuais={[]}
            onSave={(dias) => carregarPlano()}
          />
        )}

        {/* Mensagens de contexto */}
        {plano.mensagens && plano.mensagens.length > 0 && (
          <div className="space-y-3">
            {plano.mensagens.map((msg) => (
              <MensagemContexto 
                key={msg.id} 
                mensagem={msg} 
                onDismiss={dismissMensagem}
              />
            ))}
          </div>
        )}

        {/* Porções do dia */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">As tuas porções hoje</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <PorcaoCard 
              tipo="proteina"
              quantidade={plano.porcoes?.proteina || 0}
              tamanho={plano.tamanhos?.palma_g || 20}
              cor="from-red-50 to-rose-100"
            />
            <PorcaoCard 
              tipo="legumes"
              quantidade={plano.porcoes?.legumes || 0}
              tamanho={100}
              cor="from-green-50 to-emerald-100"
            />
            <PorcaoCard 
              tipo="hidratos"
              quantidade={plano.porcoes?.hidratos_base || 0}
              tamanho={plano.tamanhos?.mao_g || 20}
              extra={plano.porcoes?.carbs_extra_treino || 0}
              cor="from-amber-50 to-yellow-100"
            />
            <PorcaoCard 
              tipo="gordura"
              quantidade={plano.porcoes?.gordura || 0}
              tamanho={plano.tamanhos?.polegar_g || 7}
              cor="from-purple-50 to-violet-100"
            />
          </div>

          {/* Info calorias */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
            <span>~{plano.calorias} kcal/dia</span>
            <span>
              P:{plano.macros?.proteina_g}g · 
              C:{plano.macros?.carboidratos_g}g · 
              G:{plano.macros?.gordura_g}g
            </span>
          </div>
        </div>

        {/* Check-in diário */}
        <CheckinDiario 
          userId={usersId}
          jaFez={plano.checkin_hoje?.feito}
          respostaAnterior={plano.checkin_hoje?.resposta}
          onComplete={() => carregarPlano()}
        />

        {/* Check-in semanal */}
        <CheckinSemanal 
          userId={usersId}
          onComplete={() => carregarPlano()}
        />

        {/* Dias de treino - edição (só aparece se já configurou) */}
        {plano.dias_treino?.length > 0 && (
          <ConfigurarDiasTreino 
            userId={usersId}
            diasActuais={plano.dias_treino}
            onSave={(dias) => carregarPlano()}
            compacto={true}
          />
        )}

        {/* Regras da fase */}
        {plano.regras && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">Dicas da fase</h3>
            
            {plano.regras.priorizar?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-green-600 uppercase mb-1">✓ Priorizar</p>
                <p className="text-sm text-gray-600">{plano.regras.priorizar.join(', ')}</p>
              </div>
            )}
            
            {plano.regras.evitar?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-red-600 uppercase mb-1">✗ Evitar</p>
                <p className="text-sm text-gray-600">{plano.regras.evitar.join(', ')}</p>
              </div>
            )}

            {plano.regras.dicas?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase mb-1">💡 Dicas</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plano.regras.dicas.map((dica, i) => (
                    <li key={i}>• {dica}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Progresso peso */}
        {plano.peso && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">O teu progresso</h3>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-xs text-gray-500">Inicial</p>
                <p className="text-lg font-bold text-gray-400">{plano.peso.inicial} kg</p>
              </div>
              <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                {plano.peso.meta && plano.peso.inicial && plano.peso.actual && (
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, Math.max(0, 
                        ((plano.peso.inicial - plano.peso.actual) / (plano.peso.inicial - plano.peso.meta)) * 100
                      ))}%` 
                    }}
                  />
                )}
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Meta</p>
                <p className="text-lg font-bold text-orange-600">{plano.peso.meta} kg</p>
              </div>
            </div>
            <p className="text-center mt-2 text-sm text-gray-600">
              Actual: <span className="font-semibold">{plano.peso.actual} kg</span>
            </p>
          </div>
        )}

        {/* Refeição livre */}
        {plano.refeicao_livre?.permitida && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍕</span>
              <div>
                <p className="font-semibold text-gray-800">Refeição livre</p>
                <p className="text-sm text-gray-600">
                  {plano.refeicao_livre.por_semana}x por semana nesta fase
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
