import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link, useNavigate } from 'react-router-dom';

export default function CheckinDiario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [client, setClient] = useState(null);
  const [plano, setPlano] = useState(null);
  const [registoHoje, setRegistoHoje] = useState(null);
  const [sonoHoje, setSonoHoje] = useState(null);
  
  const hoje = new Date().toISOString().split('T')[0];
  const diaSemana = new Date().getDay(); // 0 = Domingo
  
  // Form state
  const [formData, setFormData] = useState({
    peso: '',
    sono_horas: '',
    sono_minutos: '',
    sono_qualidade: 0,
    notas: ''
  });

  // Verificar se é dia de pesagem (ex: sexta-feira = 5)
  const diaPesagem = plano?.dia_pesagem || 5; // Default sexta
  const ehDiaPesagem = diaSemana === diaPesagem;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 1. Buscar user autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/vitalis/login');
        return;
      }

      // 2. Converter auth_id → users.id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('Utilizador não encontrado');
      setUserId(userData.id);

      // 3. Buscar client
      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .single();
      setClient(clientData);

      // 4. Buscar plano
      if (clientData) {
        const { data: planoData } = await supabase
          .from('vitalis_plano')
          .select('*')
          .eq('client_id', clientData.id)
          .single();
        setPlano(planoData);
      }

      // 5. Verificar se já tem registo hoje
      const { data: registoData } = await supabase
        .from('vitalis_registos')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .single();
      
      if (registoData) {
        setRegistoHoje(registoData);
        setFormData(prev => ({
          ...prev,
          peso: registoData.peso_kg || '',
          notas: registoData.notas || ''
        }));
      }

      // 6. Verificar sono de hoje
      const { data: sonoData } = await supabase
        .from('vitalis_sono_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .single();
      
      if (sonoData) {
        setSonoHoje(sonoData);
        const horas = Math.floor((sonoData.duracao_min || 0) / 60);
        const minutos = (sonoData.duracao_min || 0) % 60;
        setFormData(prev => ({
          ...prev,
          sono_horas: horas || '',
          sono_minutos: minutos || '',
          sono_qualidade: sonoData.qualidade_1a5 || 0
        }));
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      const duracaoMin = (parseInt(formData.sono_horas) || 0) * 60 + (parseInt(formData.sono_minutos) || 0);

      // 1. Guardar/Actualizar sono
      if (duracaoMin > 0 || formData.sono_qualidade > 0) {
        if (sonoHoje) {
          // Actualizar
          await supabase
            .from('vitalis_sono_log')
            .update({
              duracao_min: duracaoMin,
              qualidade_1a5: formData.sono_qualidade
            })
            .eq('id', sonoHoje.id);
        } else {
          // Criar novo
          await supabase
            .from('vitalis_sono_log')
            .insert({
              user_id: userId,
              data: hoje,
              duracao_min: duracaoMin,
              qualidade_1a5: formData.sono_qualidade
            });
        }
      }

      // 2. Guardar/Actualizar registo (peso + notas)
      const registoPayload = {
        user_id: userId,
        data: hoje,
        notas: formData.notas || null
      };

      // Só incluir peso se foi preenchido
      if (formData.peso) {
        registoPayload.peso_kg = parseFloat(formData.peso);
        
        // Actualizar peso_actual no client
        await supabase
          .from('vitalis_clients')
          .update({ peso_actual: parseFloat(formData.peso) })
          .eq('id', client.id);
      }

      if (registoHoje) {
        // Actualizar
        await supabase
          .from('vitalis_registos')
          .update(registoPayload)
          .eq('id', registoHoje.id);
      } else {
        // Criar novo
        await supabase
          .from('vitalis_registos')
          .insert(registoPayload);
      }

      // Voltar ao dashboard
      navigate('/vitalis/dashboard');
      
    } catch (error) {
      console.error('Erro ao guardar:', error);
      alert('Erro ao guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📝</div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pb-8">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/vitalis/dashboard" className="text-white/80 hover:text-white">
              ← Voltar
            </Link>
            <h1 className="text-xl font-bold">Check-in Diário</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Saudação */}
        <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
          <div className="text-4xl mb-2">🌅</div>
          <h2 className="text-xl font-semibold text-gray-800">
            Bom dia, {client?.nome_completo?.split(' ')[0] || 'Guerreira'}!
          </h2>
          <p className="text-gray-500 text-sm mt-1">Como foi a tua noite?</p>
        </div>

        {/* Sono */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">😴</span>
            <div>
              <h3 className="font-semibold text-gray-800">Sono</h3>
              <p className="text-sm text-gray-500">Quantas horas dormiste?</p>
            </div>
          </div>

          {/* Duração */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Horas</label>
              <input
                type="number"
                min="0"
                max="12"
                value={formData.sono_horas}
                onChange={(e) => setFormData({ ...formData, sono_horas: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold focus:border-indigo-500 focus:outline-none"
                placeholder="7"
              />
            </div>
            <span className="text-2xl text-gray-400 mt-6">:</span>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Minutos</label>
              <input
                type="number"
                min="0"
                max="59"
                step="15"
                value={formData.sono_minutos}
                onChange={(e) => setFormData({ ...formData, sono_minutos: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold focus:border-indigo-500 focus:outline-none"
                placeholder="30"
              />
            </div>
          </div>

          {/* Qualidade */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Qualidade do sono</label>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((valor) => (
                <button
                  key={valor}
                  onClick={() => setFormData({ ...formData, sono_qualidade: valor })}
                  className={`flex-1 py-3 rounded-xl text-2xl transition-all ${
                    formData.sono_qualidade >= valor
                      ? 'bg-yellow-100 scale-110'
                      : 'bg-gray-100 opacity-50'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-2">
              <span>Péssimo</span>
              <span>Excelente</span>
            </div>
          </div>
        </div>

        {/* Peso - só aparece no dia de pesagem */}
        {ehDiaPesagem && (
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚖️</span>
              <div>
                <h3 className="font-semibold text-gray-800">Pesagem Semanal</h3>
                <p className="text-sm text-gray-500">Hoje é dia de te pesares!</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="number"
                step="0.1"
                min="30"
                max="200"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                className="flex-1 px-4 py-4 border-2 border-gray-200 rounded-xl text-center text-3xl font-bold focus:border-amber-500 focus:outline-none"
                placeholder={client?.peso_actual || '70.0'}
              />
              <span className="text-xl text-gray-500">kg</span>
            </div>

            {client?.peso_actual && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Último peso: {client.peso_actual} kg
              </p>
            )}
          </div>
        )}

        {/* Se não é dia de pesagem, mostrar opção de pesar mesmo assim */}
        {!ehDiaPesagem && (
          <div className="bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl opacity-50">⚖️</span>
                <div>
                  <p className="text-gray-600 font-medium">Pesagem semanal</p>
                  <p className="text-xs text-gray-400">
                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][diaPesagem]} de manhã
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Mostrar campo de peso
                  const pesoSection = document.getElementById('peso-opcional');
                  if (pesoSection) pesoSection.classList.toggle('hidden');
                }}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                Pesar agora →
              </button>
            </div>
            
            <div id="peso-opcional" className="hidden mt-4">
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="200"
                  value={formData.peso}
                  onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold focus:border-amber-500 focus:outline-none"
                  placeholder={client?.peso_actual || '70.0'}
                />
                <span className="text-lg text-gray-500">kg</span>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📝</span>
            <div>
              <h3 className="font-semibold text-gray-800">Notas</h3>
              <p className="text-sm text-gray-500">Algo que queiras registar?</p>
            </div>
          </div>

          <textarea
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            placeholder="Como te sentes hoje? Algum desafio ou vitória?"
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none"
          />
        </div>

        {/* Botão Guardar */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {saving ? 'A guardar...' : '✓ Guardar Check-in'}
        </button>

        {/* Já fez check-in */}
        {(registoHoje || sonoHoje) && (
          <p className="text-center text-sm text-green-600">
            ✓ Já fizeste check-in hoje. Podes actualizar os valores.
          </p>
        )}

      </main>
    </div>
  );
}
