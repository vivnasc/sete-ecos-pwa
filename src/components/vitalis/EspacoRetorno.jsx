import React, { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export const EspacoRetorno = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    emocao: '',
    intensidade: 5,
    gatilho: '',
    o_que_queria_comer: '',
    o_que_fez: '',
    como_se_sentiu_depois: '',
    aprendizagem: ''
  });

  const emocoes = [
    { value: 'cansaco', label: 'Cansaço', emoji: '🔋', desc: 'Sem energia, exausta' },
    { value: 'ansiedade', label: 'Ansiedade', emoji: '🌀', desc: 'Nervosa, preocupada' },
    { value: 'tristeza', label: 'Tristeza', emoji: '💧', desc: 'Em baixo, melancólica' },
    { value: 'raiva', label: 'Raiva', emoji: '🔥', desc: 'Frustrada, irritada' },
    { value: 'vazio', label: 'Vazio', emoji: '◯', desc: 'Sem propósito, entediada' },
    { value: 'solidao', label: 'Solidão', emoji: '🌑', desc: 'Sozinha, isolada' },
    { value: 'negacao', label: 'Negação', emoji: '🚫', desc: 'Evito pensar, automático' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('vitalis_espaco_retorno')
        .insert([{
          user_id: user.id,
          emocao: formData.emocao,
          intensidade: formData.intensidade,
          gatilho: formData.gatilho,
          o_que_queria_comer: formData.o_que_queria_comer,
          o_que_fez: formData.o_que_fez,
          como_se_sentiu_depois: formData.como_se_sentiu_depois,
          aprendizagem: formData.aprendizagem
        }]);

      if (error) throw error;

      setSuccess(true);

      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/vitalis/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <div className="text-6xl mb-6 animate-bounce">💜</div>
          <h2 className="text-3xl font-bold text-purple-700 mb-4">
            Momento Registado!
          </h2>
          <p className="text-gray-600 mb-6">
            Cada vez que voltas aqui, estás a fazer trabalho emocional profundo. 
            Estou orgulhosa de ti! 🌱
          </p>
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-purple-800">
              <strong>Lembra-te:</strong> A transformação não é só física. 
              É reconhecer os padrões, pausar, e escolher diferente.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            A redirecionar para o dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-4xl font-bold text-purple-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Espaço de Retorno 💜
          </h1>
          <p className="text-gray-600">
            Este é o teu espaço seguro. Aqui vais aprender a reconhecer os padrões.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Card */}
        <div className="bg-purple-100 border-l-4 border-purple-500 p-6 rounded-r-xl mb-8">
          <div className="flex gap-4">
            <span className="text-3xl">🤗</span>
            <div>
              <h3 className="font-bold text-purple-900 mb-2">Pausa. Respira. Escreve.</h3>
              <p className="text-purple-800 text-sm">
                Antes de comer emocionalmente, vem aqui primeiro. 
                Não vamos julgar. Vamos apenas observar, sentir e entender.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Emoção */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-4">
              1. Que emoção estás a sentir AGORA? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {emocoes.map(emocao => (
                <button
                  key={emocao.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, emocao: emocao.value })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.emocao === emocao.value
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{emocao.emoji}</span>
                    <span className="font-bold text-gray-800">{emocao.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{emocao.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Intensidade */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-lg font-bold text-gray-800">
                2. Quão INTENSA é esta emoção? <span className="text-red-500">*</span>
              </label>
              <span className="text-4xl font-bold text-purple-600">{formData.intensidade}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.intensidade}
              onChange={(e) => setFormData({ ...formData, intensidade: parseInt(e.target.value) })}
              className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Leve</span>
              <span>Média</span>
              <span>Muito Intensa</span>
            </div>
          </div>

          {/* Gatilho */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">
              3. O que DESENCADEOU esta emoção? <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Foi algo que aconteceu? Uma conversa? Um pensamento? Tenta ser específica.
            </p>
            <textarea
              value={formData.gatilho}
              onChange={(e) => setFormData({ ...formData, gatilho: e.target.value })}
              required
              rows={3}
              placeholder="Ex: Discussão com o chefe, vi uma foto no Instagram, pensei no passado..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>

          {/* O que queria comer */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">
              4. O que QUERIAS comer? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.o_que_queria_comer}
              onChange={(e) => setFormData({ ...formData, o_que_queria_comer: e.target.value })}
              required
              placeholder="Ex: Chocolate, pão com manteiga, batatas fritas..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>

          {/* O que fez */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">
              5. O que FIZESTE em vez disso? <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Comeste? Resististe? Fizeste outra coisa?
            </p>
            <textarea
              value={formData.o_que_fez}
              onChange={(e) => setFormData({ ...formData, o_que_fez: e.target.value })}
              required
              rows={3}
              placeholder="Ex: Comi na mesma, Fui dar uma volta, Liguei a uma amiga, Respirei fundo..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Como se sentiu depois */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">
              6. Como te SENTISTE depois?
            </label>
            <textarea
              value={formData.como_se_sentiu_depois}
              onChange={(e) => setFormData({ ...formData, como_se_sentiu_depois: e.target.value })}
              rows={3}
              placeholder="Ex: Culpada, Aliviada temporariamente, Pior que antes, Orgulhosa de ter resistido..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Aprendizagem */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">
              7. Que APRENDIZAGEM tiras deste momento?
            </label>
            <p className="text-sm text-gray-600 mb-3">
              O que descobriste sobre ti? O que podes fazer diferente da próxima vez?
            </p>
            <textarea
              value={formData.aprendizagem}
              onChange={(e) => setFormData({ ...formData, aprendizagem: e.target.value })}
              rows={3}
              placeholder="Ex: Percebo que quando estou ansiosa procuro doce. Da próxima posso tentar caminhar primeiro..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Mensagem de Apoio */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <p className="text-purple-900 font-semibold mb-2">💜 Lembra-te:</p>
            <p className="text-purple-800 text-sm">
              Não há certo ou errado aqui. Se comeste, não há problema. 
              O importante é que paraste, observaste, e estás a aprender. 
              Isso JÁ é uma vitória. A mudança é gradual. 🌱
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.emocao || !formData.gatilho || !formData.o_que_queria_comer || !formData.o_que_fez}
              className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'A guardar...' : '💜 Guardar Momento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EspacoRetorno;
