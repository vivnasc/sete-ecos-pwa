import React, { useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function VitalisIntakeComplete() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado consolidado para evitar re-renders
  const [formData, setFormData] = useState({
    // Secção 1: Informação Básica (6 campos)
    nome_completo: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    profissao: '',
    horario_trabalho: '',

    // Secção 2: Antropometria (8 campos)
    peso_actual: '',
    altura: '',
    circunferencia_cintura: '',
    circunferencia_anca: '',
    peso_desejado: '',
    peso_minimo_adulto: '',
    peso_maximo_adulto: '',
    variacao_peso_recente: '',

    // Secção 3: Saúde (14 campos)
    condicoes_saude: '',
    medicamentos_suplementos: '',
    cirurgias_passadas: '',
    alergias_intolerancia: '',
    sintomas_digestivos: '',
    qualidade_sono: '',
    nivel_stress: '',
    ciclo_menstrual: '',
    contracepcao: '',
    gravidez_amamentacao: '',
    apoio_psicologico: '',
    consome_alcool: '',
    fuma: '',
    atividade_fisica: '',

    // Secção 4: Hábitos Alimentares (13 campos)
    cafe_manha_habitual: '',
    almoco_habitual: '',
    jantar_habitual: '',
    snacks_habituais: '',
    hidratacao_diaria: '',
    alimentos_evita: '',
    alimentos_prefere: '',
    cozinha_em_casa: '',
    come_fora_frequencia: '',
    restricoes_alimentares: '',
    tentativas_emagrecimento: '',
    relacao_com_comida: '',
    alimentacao_emocional: '',

    // Secção 5: Contexto de Vida (12 campos)
    mora_com: '',
    quem_cozinha: '',
    orcamento_alimentacao: '',
    acesso_supermercado: '',
    tempo_preparacao_refeicoes: '',
    rotina_refeicoes: '',
    come_sozinha_acompanhada: '',
    ambiente_refeicoes: '',
    suporte_familiar: '',
    eventos_sociais_frequencia: '',
    viagens_frequencia: '',
    desafios_alimentacao: '',

    // Secção 6: Objetivos e Expectativas (12 campos)
    objetivo_principal: '',
    motivo_objetivo: '',
    prazo_desejado: '',
    expectativas_programa: '',
    maior_desafio: '',
    tentou_dietas_antes: '',
    o_que_funcionou: '',
    o_que_nao_funcionou: '',
    disponibilidade_consultas: '',
    forma_acompanhamento: '',
    compromisso_mudanca: '',
    o_que_mais_espera: ''
  });

  const sections = [
    {
      title: 'Bem-vinda ao Vitalis 💪',
      subtitle: 'Responde com honestidade. Não há respostas certas ou erradas.',
      icon: '🌱',
      time: '10-15 minutos'
    },
    {
      title: 'Informação Básica',
      subtitle: 'Vamos começar por te conhecer',
      questions: [
        { id: 'nome_completo', label: 'Nome completo', type: 'text', required: true },
        { id: 'data_nascimento', label: 'Data de nascimento', type: 'date', required: true },
        { id: 'telefone', label: 'Telefone/WhatsApp', type: 'tel', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
        { id: 'profissao', label: 'Profissão', type: 'text' },
        { id: 'horario_trabalho', label: 'Horário de trabalho', type: 'text', placeholder: 'Ex: 9h-18h, turnos rotativos...' }
      ]
    },
    {
      title: 'Antropometria',
      subtitle: 'Dados sobre o teu corpo',
      questions: [
        { id: 'peso_actual', label: 'Peso actual (kg)', type: 'number', step: '0.1', required: true },
        { id: 'altura', label: 'Altura (cm)', type: 'number', required: true },
        { id: 'circunferencia_cintura', label: 'Circunferência da cintura (cm)', type: 'number', step: '0.1' },
        { id: 'circunferencia_anca', label: 'Circunferência da anca (cm)', type: 'number', step: '0.1' },
        { id: 'peso_desejado', label: 'Peso desejado (kg)', type: 'number', step: '0.1' },
        { id: 'peso_minimo_adulto', label: 'Peso mínimo na idade adulta (kg)', type: 'number', step: '0.1' },
        { id: 'peso_maximo_adulto', label: 'Peso máximo na idade adulta (kg)', type: 'number', step: '0.1' },
        { id: 'variacao_peso_recente', label: 'Variação de peso recente?', type: 'textarea', placeholder: 'Ganhaste ou perdeste peso recentemente? Quanto e porquê?' }
      ]
    },
    {
      title: 'Saúde',
      subtitle: 'Como está a tua saúde?',
      questions: [
        { id: 'condicoes_saude', label: 'Condições de saúde diagnosticadas', type: 'textarea', placeholder: 'Diabetes, hipertensão, problemas de tiroide, SOP, etc.' },
        { id: 'medicamentos_suplementos', label: 'Medicamentos e suplementos', type: 'textarea' },
        { id: 'cirurgias_passadas', label: 'Cirurgias relevantes', type: 'textarea' },
        { id: 'alergias_intolerancia', label: 'Alergias ou intolerâncias alimentares', type: 'textarea' },
        { id: 'sintomas_digestivos', label: 'Sintomas digestivos', type: 'textarea', placeholder: 'Inchaço, gases, obstipação, diarreia...' },
        { id: 'qualidade_sono', label: 'Qualidade do sono (1-10)', type: 'range', min: '1', max: '10', required: true },
        { id: 'nivel_stress', label: 'Nível de stress (1-10)', type: 'range', min: '1', max: '10', required: true },
        { id: 'ciclo_menstrual', label: 'Ciclo menstrual', type: 'text', placeholder: 'Regular, irregular, menopausa...' },
        { id: 'contracepcao', label: 'Usa contracepção? Qual?', type: 'text' },
        { id: 'gravidez_amamentacao', label: 'Grávida ou a amamentar?', type: 'select', options: ['Não', 'Grávida', 'A amamentar'] },
        { id: 'apoio_psicologico', label: 'Acompanhamento psicológico', type: 'select', options: ['Não', 'Sim, atual', 'Sim, passado'] },
        { id: 'consome_alcool', label: 'Consumo de álcool', type: 'select', options: ['Não consumo', 'Ocasional', 'Regular', 'Frequente'] },
        { id: 'fuma', label: 'Fuma?', type: 'select', options: ['Não', 'Sim', 'Ex-fumadora'] },
        { id: 'atividade_fisica', label: 'Atividade física semanal', type: 'textarea', placeholder: 'Tipo, frequência e duração...' }
      ]
    },
    {
      title: 'Hábitos Alimentares',
      subtitle: 'Como te alimentas no dia a dia',
      questions: [
        { id: 'cafe_manha_habitual', label: 'Café da manhã habitual', type: 'textarea', placeholder: 'O que costumas comer?' },
        { id: 'almoco_habitual', label: 'Almoço habitual', type: 'textarea' },
        { id: 'jantar_habitual', label: 'Jantar habitual', type: 'textarea' },
        { id: 'snacks_habituais', label: 'Snacks habituais', type: 'textarea' },
        { id: 'hidratacao_diaria', label: 'Água por dia (litros)', type: 'number', step: '0.1' },
        { id: 'alimentos_evita', label: 'Alimentos que evitas', type: 'textarea' },
        { id: 'alimentos_prefere', label: 'Alimentos preferidos', type: 'textarea' },
        { id: 'cozinha_em_casa', label: 'Frequência de cozinhar em casa', type: 'select', options: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'] },
        { id: 'come_fora_frequencia', label: 'Comes fora quantas vezes por semana?', type: 'number' },
        { id: 'restricoes_alimentares', label: 'Restrições alimentares', type: 'textarea', placeholder: 'Vegetariana, vegana, sem glúten, religiosas...' },
        { id: 'tentativas_emagrecimento', label: 'Já tentaste emagrecer antes?', type: 'textarea', placeholder: 'Que dietas ou programas?' },
        { id: 'relacao_com_comida', label: 'Como descreves a tua relação com a comida?', type: 'textarea' },
        { id: 'alimentacao_emocional', label: 'Comes por emoções?', type: 'textarea', placeholder: 'Stress, ansiedade, tristeza...' }
      ]
    },
    {
      title: 'Contexto de Vida',
      subtitle: 'O teu dia a dia',
      questions: [
        { id: 'mora_com', label: 'Com quem moras?', type: 'text' },
        { id: 'quem_cozinha', label: 'Quem cozinha em casa?', type: 'text' },
        { id: 'orcamento_alimentacao', label: 'Orçamento mensal para alimentação', type: 'text', placeholder: 'Aproximadamente...' },
        { id: 'acesso_supermercado', label: 'Acesso a supermercado/mercado', type: 'select', options: ['Fácil', 'Moderado', 'Difícil'] },
        { id: 'tempo_preparacao_refeicoes', label: 'Tempo disponível para preparar refeições', type: 'text' },
        { id: 'rotina_refeicoes', label: 'Rotina de refeições', type: 'textarea', placeholder: 'Horários, onde comes, com quem...' },
        { id: 'come_sozinha_acompanhada', label: 'Comes sozinha ou acompanhada?', type: 'text' },
        { id: 'ambiente_refeicoes', label: 'Ambiente das refeições', type: 'textarea', placeholder: 'Calmo, stressante, à pressa...' },
        { id: 'suporte_familiar', label: 'Suporte familiar/social', type: 'textarea', placeholder: 'A tua família apoia as tuas mudanças?' },
        { id: 'eventos_sociais_frequencia', label: 'Frequência de eventos sociais', type: 'select', options: ['Raro', 'Mensal', 'Semanal', 'Diário'] },
        { id: 'viagens_frequencia', label: 'Viajas com frequência?', type: 'text' },
        { id: 'desafios_alimentacao', label: 'Maiores desafios na alimentação', type: 'textarea' }
      ]
    },
    {
      title: 'Objetivos e Expectativas',
      subtitle: 'O que MAIS esperas ganhar?',
      questions: [
        { id: 'objetivo_principal', label: 'Objetivo principal', type: 'textarea', required: true },
        { id: 'motivo_objetivo', label: 'Porquê este objetivo?', type: 'textarea', placeholder: 'O que vai mudar na tua vida?' },
        { id: 'prazo_desejado', label: 'Em quanto tempo?', type: 'text' },
        { id: 'expectativas_programa', label: 'Expectativas do programa', type: 'textarea' },
        { id: 'maior_desafio', label: 'Maior desafio antecipado', type: 'textarea' },
        { id: 'tentou_dietas_antes', label: 'Já tentaste dietas/programas antes?', type: 'textarea' },
        { id: 'o_que_funcionou', label: 'O que funcionou?', type: 'textarea' },
        { id: 'o_que_nao_funcionou', label: 'O que NÃO funcionou?', type: 'textarea' },
        { id: 'disponibilidade_consultas', label: 'Disponibilidade para consultas', type: 'text' },
        { id: 'forma_acompanhamento', label: 'Preferência de acompanhamento', type: 'select', options: ['WhatsApp', 'Email', 'Videochamada', 'Presencial'] },
        { id: 'compromisso_mudanca', label: 'Quão PRONTA estás para fazer mudanças? (1-10)', type: 'range', min: '1', max: '10', required: true },
        { id: 'o_que_mais_espera', label: 'O que MAIS esperas ganhar?', type: 'textarea', placeholder: 'Sê específica...', required: true }
      ]
    }
  ];

  // Handler otimizado - evita re-renders desnecessários
  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilizador não autenticado');
      }

      // 1. Criar ou atualizar cliente
      const { data: clientData, error: clientError } = await supabase
        .from('vitalis_clients')
        .upsert({
          user_id: user.id,
          nome_completo: formData.nome_completo,
          email: formData.email,
          telefone: formData.telefone,
          data_nascimento: formData.data_nascimento,
          profissao: formData.profissao,
          peso_inicial: parseFloat(formData.peso_actual) || null,
          peso_actual: parseFloat(formData.peso_actual) || null,
          peso_meta: parseFloat(formData.peso_desejado) || null,
          altura_cm: parseFloat(formData.altura) || null,
          data_inicio: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Guardar intake completo
      const { error: intakeError } = await supabase
        .from('vitalis_intake')
        .upsert({
          user_id: user.id,
          client_id: clientData.id,
          ...formData
        }, { onConflict: 'user_id' });

      if (intakeError) throw intakeError;

      // 3. Redirecionar para dashboard
      navigate('/vitalis/dashboard');

    } catch (err) {
      console.error('Erro ao submeter:', err);
      setError(err.message || 'Erro ao submeter. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const currentSectionData = sections[currentSection];
  const progress = ((currentSection) / (sections.length - 1)) * 100;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #FFF8F0, #FFE4D6)',
      padding: '20px'
    }}>
      {/* Progress Bar */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '4px', 
        background: '#E5E7EB',
        zIndex: 1000
      }}>
        <div style={{ 
          height: '100%', 
          background: 'linear-gradient(to right, #D97706, #EA580C)',
          width: `${progress}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      <div style={{ maxWidth: '640px', margin: '40px auto 80px' }}>
        {/* Welcome Screen */}
        {currentSection === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>
              {currentSectionData.icon}
            </div>
            <h1 style={{ 
              fontSize: '2rem', 
              color: '#1A1A4E',
              marginBottom: '10px'
            }}>
              {currentSectionData.title}
            </h1>
            <p style={{ 
              fontSize: '1rem', 
              color: '#6B7280',
              fontStyle: 'italic',
              marginBottom: '30px'
            }}>
              {currentSectionData.subtitle}
            </p>
            <div style={{
              background: 'rgba(217, 119, 6, 0.1)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '30px'
            }}>
              <p style={{ fontSize: '0.9rem', color: '#D97706' }}>
                ⏱️ {currentSectionData.time}
              </p>
            </div>
            <button
              onClick={handleNext}
              style={{
                background: 'linear-gradient(to right, #D97706, #EA580C)',
                color: 'white',
                padding: '16px 40px',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
              }}
            >
              Começar →
            </button>
          </div>
        )}

        {/* Question Sections */}
        {currentSection > 0 && (
          <form onSubmit={handleSubmit}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                color: '#1A1A4E',
                marginBottom: '8px'
              }}>
                {currentSectionData.title}
              </h2>
              <p style={{
                fontSize: '0.95rem',
                color: '#6B7280',
                fontStyle: 'italic',
                marginBottom: '30px'
              }}>
                {currentSectionData.subtitle}
              </p>

              {currentSectionData.questions.map((q, index) => (
                <div key={q.id} style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    {q.label} {q.required && <span style={{ color: '#DC2626' }}>*</span>}
                  </label>

                  {q.type === 'textarea' ? (
                    <textarea
                      value={formData[q.id] || ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      required={q.required}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  ) : q.type === 'select' ? (
                    <select
                      value={formData[q.id] || ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      required={q.required}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="">Seleciona...</option>
                      {q.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : q.type === 'range' ? (
                    <div>
                      <input
                        type="range"
                        min={q.min}
                        max={q.max}
                        value={formData[q.id] || q.min}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        required={q.required}
                        style={{ width: '100%' }}
                      />
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                        color: '#6B7280',
                        marginTop: '4px'
                      }}>
                        <span>1 - Ainda não sei</span>
                        <span style={{ fontWeight: '600', color: '#D97706' }}>
                          {formData[q.id] || q.min}
                        </span>
                        <span>10 - Totalmente comprometida</span>
                      </div>
                    </div>
                  ) : (
                    <input
                      type={q.type}
                      value={formData[q.id] || ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      required={q.required}
                      step={q.step}
                      min={q.min}
                      max={q.max}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  )}
                </div>
              ))}

              {error && (
                <div style={{
                  background: '#FEE2E2',
                  border: '2px solid #DC2626',
                  color: '#DC2626',
                  padding: '12px',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '1px solid #E5E7EB'
              }}>
                {currentSection > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    style={{
                      padding: '14px 24px',
                      background: '#F3F4F6',
                      color: '#374151',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ← Anterior
                  </button>
                )}

                {currentSection < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'linear-gradient(to right, #D97706, #EA580C)',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Próximo →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: loading 
                        ? '#94A3B8' 
                        : 'linear-gradient(to right, #10B981, #059669)',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'A enviar...' : 'Finalizar ✓'}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
