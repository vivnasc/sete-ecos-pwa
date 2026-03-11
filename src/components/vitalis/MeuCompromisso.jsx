// src/components/vitalis/MeuCompromisso.jsx
// Componente de compromisso pessoal — define o "porquê" e assina um contrato consigo mesma

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { g } from '../../utils/genero';

const MeuCompromisso = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [etapa, setEtapa] = useState('ver'); // ver, editar
  const [userName, setUserName] = useState('');

  const [compromisso, setCompromisso] = useState({
    porque: '',
    compromisso_minimo: '',
    quando_quiser_desistir: '',
    data_assinatura: null
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/vitalis/dashboard');

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;
      setUserId(userData.id);
      setUserName(userData.nome || user.email.split('@')[0]);

      // Carregar compromisso do localStorage
      const saved = localStorage.getItem(`vitalis-compromisso-${userData.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompromisso(parsed);
        setEtapa('ver');
      } else {
        // Pré-preencher com dados do intake se disponíveis
        const { data: intake } = await supabase
          .from('vitalis_intake')
          .select('objectivo_principal, motivacao_principal')
          .eq('user_id', userData.id)
          .maybeSingle();

        if (intake?.motivacao_principal) {
          setCompromisso(prev => ({ ...prev, porque: intake.motivacao_principal }));
        }
        setEtapa('editar');
      }
    } catch (error) {
      console.error('Erro ao carregar compromisso:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarCompromisso = async () => {
    if (!compromisso.porque.trim()) return;
    setSaving(true);

    try {
      const dataAssinatura = compromisso.data_assinatura || new Date().toISOString();
      const dados = {
        ...compromisso,
        data_assinatura: dataAssinatura
      };

      // Guardar no localStorage (não precisa de tabela nova no Supabase)
      localStorage.setItem(`vitalis-compromisso-${userId}`, JSON.stringify(dados));
      // Guardar o "porquê" separadamente para o detector de desistência usar
      localStorage.setItem(`vitalis-compromisso-porque-${userId}`, compromisso.porque);

      setCompromisso(dados);
      setEtapa('ver');
    } catch (error) {
      console.error('Erro ao guardar compromisso:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] flex items-center justify-center">
        <div role="status" aria-live="polite" className="text-[#7C8B6F]">A carregar...</div>
      </div>
    );
  }

  // ETAPA: VER COMPROMISSO
  if (etapa === 'ver' && compromisso.data_assinatura) {
    const dataFormatada = new Date(compromisso.data_assinatura).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <button
              onClick={() => navigate('/vitalis/dashboard')}
              className="text-white/80 hover:text-white mb-3 flex items-center gap-2 text-sm"
            >
              ← Voltar
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                📜
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Meu Compromisso
                </h1>
                <p className="text-white/70 text-sm">O teu contrato contigo {g('mesmo', 'mesma')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Cartão do Compromisso */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Cabeçalho decorativo */}
            <div className="bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] p-6 text-center">
              <p className="text-white/80 text-xs uppercase tracking-widest mb-1">Compromisso Pessoal</p>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Eu, {userName}
              </h2>
              <p className="text-white/70 text-sm mt-1">{dataFormatada}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* O Porquê */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#7C8B6F] mb-2">
                  O Meu Porquê
                </h3>
                <p className="text-gray-800 text-lg italic leading-relaxed">
                  "{compromisso.porque}"
                </p>
              </div>

              {/* Compromisso Mínimo */}
              {compromisso.compromisso_minimo && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#7C8B6F] mb-2">
                    O Meu Mínimo Diário
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {compromisso.compromisso_minimo}
                  </p>
                </div>
              )}

              {/* Quando quiser desistir */}
              {compromisso.quando_quiser_desistir && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#7C8B6F] mb-2">
                    Quando Quiser Desistir, Vou...
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {compromisso.quando_quiser_desistir}
                  </p>
                </div>
              )}

              {/* Assinatura */}
              <div className="pt-4 border-t border-gray-100 text-center">
                <p className="text-[#7C8B6F] font-semibold italic text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {userName}
                </p>
                <div className="w-40 mx-auto border-b-2 border-[#7C8B6F]/30 mt-1 mb-2"></div>
                <p className="text-gray-400 text-xs">
                  {g('Assinado', 'Assinada')} em {dataFormatada}
                </p>
              </div>
            </div>
          </div>

          {/* Acções */}
          <div className="flex gap-3">
            <button
              onClick={() => setEtapa('editar')}
              className="flex-1 py-3 bg-white border-2 border-[#7C8B6F] text-[#7C8B6F] rounded-xl font-semibold hover:bg-[#F0FDF4] transition-colors active:scale-95"
            >
              Editar Compromisso
            </button>
            <button
              onClick={() => navigate('/vitalis/dashboard')}
              className="flex-1 py-3 bg-[#7C8B6F] text-white rounded-xl font-semibold hover:bg-[#6B7A5D] transition-colors active:scale-95"
            >
              Voltar ao Dashboard
            </button>
          </div>

          {/* Frase motivacional */}
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm italic">
              "A diferença entre quem consegue e quem desiste não é talento — é compromisso."
            </p>
            <p className="text-gray-400 text-xs mt-1">— Vivianne</p>
          </div>
        </div>
      </div>
    );
  }

  // ETAPA: EDITAR/CRIAR COMPROMISSO
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => {
              if (compromisso.data_assinatura) setEtapa('ver');
              else navigate('/vitalis/dashboard');
            }}
            className="text-white/80 hover:text-white mb-3 flex items-center gap-2 text-sm"
          >
            ← Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              📜
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                {compromisso.data_assinatura ? 'Editar Compromisso' : 'O Teu Compromisso'}
              </h1>
              <p className="text-white/70 text-sm">Define o teu porquê antes de começar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Introdução */}
        {!compromisso.data_assinatura && (
          <div className="bg-white/80 rounded-2xl p-5 border-l-4 border-[#7C8B6F]">
            <p className="text-gray-700 leading-relaxed">
              Antes de mais nada, vamos definir algo importante:
              <strong> por que estás aqui?</strong>
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Não é sobre o plano alimentar — é sobre o que te move.
              Quando a vontade de desistir aparecer (e vai aparecer),
              é este "porquê" que te vai manter de pé.
            </p>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* O Porquê */}
          <div>
            <label className="block text-sm font-bold text-[#4A4035] mb-2">
              Por que estás a fazer isto? <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Sê {g('honesto contigo mesmo', 'honesta contigo mesma')}. Não é "para emagrecer" — é o que está por trás disso.
              Ex: "Quero engravidar e preciso de estar saudável", "Quero ter energia para brincar com os meus filhos"
            </p>
            <textarea
              value={compromisso.porque}
              onChange={(e) => setCompromisso({ ...compromisso, porque: e.target.value })}
              placeholder="O meu porquê é..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{compromisso.porque.length}/500</p>
          </div>

          {/* Compromisso Mínimo */}
          <div>
            <label className="block text-sm font-bold text-[#4A4035] mb-2">
              Qual é o teu mínimo diário?
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Nos dias maus, qual é a coisa MAIS PEQUENA que te comprometes a fazer?
              Ex: "Beber 2L de água", "Fazer 1 check-in", "Não saltar o pequeno-almoço"
            </p>
            <textarea
              value={compromisso.compromisso_minimo}
              onChange={(e) => setCompromisso({ ...compromisso, compromisso_minimo: e.target.value })}
              placeholder="No mínimo, vou..."
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Quando quiser desistir */}
          <div>
            <label className="block text-sm font-bold text-[#4A4035] mb-2">
              Quando quiseres desistir, o que vais fazer?
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Cria um plano de emergência para os momentos difíceis.
              Ex: "Vou reler este compromisso", "Vou ao Espaço de Retorno", "Vou enviar mensagem à Vivianne"
            </p>
            <textarea
              value={compromisso.quando_quiser_desistir}
              onChange={(e) => setCompromisso({ ...compromisso, quando_quiser_desistir: e.target.value })}
              placeholder="Quando quiser desistir, vou..."
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Botão Assinar */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={guardarCompromisso}
              disabled={saving || !compromisso.porque.trim()}
              className="w-full py-4 bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] text-white rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {saving ? 'A guardar...' : compromisso.data_assinatura ? 'Actualizar Compromisso' : 'Assinar o Meu Compromisso'}
            </button>
            <p className="text-center text-gray-400 text-xs mt-3">
              Este compromisso é contigo {g('mesmo', 'mesma')}. Ninguém mais o vê.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeuCompromisso;
