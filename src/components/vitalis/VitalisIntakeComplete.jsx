import React, { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function VitalisIntakeComplete() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Dados pessoais
    nome: '',
    email: '',
    whatsapp: '',
    idade: '',
    sexo: '',
    
    // Medidas físicas
    altura_cm: '',
    peso_actual: '',
    peso_meta: '',
    cintura_cm: '',
    anca_cm: '',
    
    // Objectivo
    objectivo_principal: '',
    prazo: '',
    porque_importante: '',
    
    // Abordagem alimentar
    abordagem_preferida: '',
    aceita_jejum: false,
    restricoes_alimentares: [],
    
    // Saúde
    condicoes_saude: [],
    medicacao: '',
    
    // Hábitos alimentares
    refeicoes_dia: '',
    pequeno_almoco: '',
    onde_come: [],
    tipos_comida: [],
    agua_litros_dia: '',
    bebidas: [],
    freq_doces: '3',
    freq_fritos: '3',
    petisca: false,
    o_que_petisca: [],
    
    // FOME EMOCIONAL - 7 emoções
    gatilhos_fome_emocional: [],
    freq_cansaco: '',
    freq_ansiedade: '',
    freq_tristeza: '',
    freq_raiva: '',
    freq_vazio: '',
    freq_solidao: '',
    freq_negacao: '',
    emocao_dominante: '',
    
    // Padrão fome emocional
    o_que_procura_comer: [],
    como_sente_depois: '',
    quando_comecou_padrao: '',
    tentou_alternativas: false,
    que_alternativas: '',
    
    // Actividade física
    nivel_actividade: '',
    faz_exercicio: false,
    tipo_exercicio: [],
    
    // Sono
    horas_sono: '',
    qualidade_sono: '3',
    
    // Contexto de vida
    situacao_profissional: '',
    situacao_familiar: '',
    filhos_pequenos: false,
    quem_cozinha: '',
    nivel_stress: '3',
    
    // Histórico
    maior_obstaculo: '',
    historico_dietas: '',
    gatilhos_sair_plano: [],
    quantas_dietas: '',
    dieta_funcionou: '',
    
    // Preferências do programa
    abordagem_realista: '',
    disposta_jejum: false,
    preferencias_alimentares: [],
    medir_pesar_comida: '',
    acesso_ingredientes: '',
    
    // Pacote
    pacote_escolhido: '',
    duracao: '',
    forma_pagamento: '',
    codigo_promo: '',
    
    // Final
    como_conheceu: '',
    observacoes_adicionais: '',
    o_que_espera_ganhar: '',
    autoriza_dados_pesquisa: false,
    prontidao_1a10: '5',
    confirmacoes: []
  });

  const sections = [
    {
      title: 'Bem-vinda ao Vitalis 💪',
      subtitle: 'Responde com honestidade. Não há respostas certas ou erradas.',
      icon: '🌱',
      time: '10-15 minutos'
    },
    {
      title: 'Sobre Ti',
      questions: [
        { id: 'nome', label: 'Nome completo', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
        { id: 'whatsapp', label: 'WhatsApp', type: 'tel', placeholder: '+258...' },
        { id: 'idade', label: 'Idade', type: 'number', required: true },
        { id: 'sexo', label: 'Sexo', type: 'radio', options: ['feminino', 'masculino'], labels: ['Feminino', 'Masculino'], required: true }
      ]
    },
    {
      title: 'Medidas e Objectivo',
      questions: [
        { id: 'altura_cm', label: 'Altura (cm)', type: 'number', required: true },
        { id: 'peso_actual', label: 'Peso actual (kg)', type: 'number', step: '0.1', required: true },
        { id: 'peso_meta', label: 'Peso desejado (kg)', type: 'number', step: '0.1', required: true },
        { id: 'cintura_cm', label: 'Cintura (cm)', type: 'number', step: '0.1' },
        { id: 'anca_cm', label: 'Anca (cm)', type: 'number', step: '0.1' },
        { id: 'objectivo_principal', label: 'Objectivo principal', type: 'textarea', required: true, placeholder: 'Ex: Emagrecer 10kg, ganhar energia, melhorar saúde...' },
        { id: 'prazo', label: 'Em quanto tempo?', type: 'radio', options: ['3m', '6m', '9m', '12m', 'sem_pressa'], labels: ['3 meses', '6 meses', '9 meses', '12 meses', 'Sem pressa'], required: true },
        { id: 'porque_importante', label: 'Porquê é importante para ti?', type: 'textarea', placeholder: 'O que vai mudar na tua vida?' }
      ]
    },
    {
      title: 'Abordagem Alimentar',
      questions: [
        { id: 'abordagem_preferida', label: 'Que abordagem preferes?', type: 'radio', options: ['keto_if', 'low_carb', 'equilibrado', 'nao_sei'], labels: ['Keto + Jejum Intermitente', 'Low Carb', 'Equilibrado', 'Não sei'], required: true },
        { id: 'aceita_jejum', label: 'Aceitas fazer jejum intermitente?', type: 'checkbox_single' },
        { id: 'restricoes_alimentares', label: 'Restrições alimentares', type: 'checkbox_multiple', options: ['Vegetariana', 'Vegana', 'Sem glúten', 'Sem lactose', 'Halal', 'Nenhuma'] }
      ]
    },
    {
      title: 'Saúde',
      questions: [
        { id: 'condicoes_saude', label: 'Condições de saúde', type: 'checkbox_multiple', options: ['Diabetes', 'Hipertensão', 'Colesterol alto', 'Problemas de tiroide', 'SOP', 'Nenhuma'] },
        { id: 'medicacao', label: 'Medicação actual', type: 'textarea', placeholder: 'Lista os medicamentos e suplementos que tomas' }
      ]
    },
    {
      title: 'Hábitos Alimentares',
      questions: [
        { id: 'refeicoes_dia', label: 'Quantas refeições por dia?', type: 'number', min: '1', max: '10' },
        { id: 'pequeno_almoco', label: 'O que comes no pequeno-almoço?', type: 'textarea' },
        { id: 'onde_come', label: 'Onde comes habitualmente?', type: 'checkbox_multiple', options: ['Casa', 'Trabalho', 'Restaurante', 'Fast food', 'Na rua'] },
        { id: 'tipos_comida', label: 'Tipos de comida que preferes', type: 'checkbox_multiple', options: ['Tradicional moçambicana', 'Portuguesa', 'Italiana', 'Chinesa', 'Fast food', 'Vegetariana'] },
        { id: 'agua_litros_dia', label: 'Água por dia (litros)', type: 'number', step: '0.5', min: '0', max: '5' },
        { id: 'bebidas', label: 'Que bebidas consomes?', type: 'checkbox_multiple', options: ['Café', 'Chá', 'Refrigerantes', 'Sumos naturais', 'Sumos de pacote', 'Álcool', 'Só água'] },
        { id: 'freq_doces', label: 'Comes doces?', type: 'range', min: '1', max: '5', labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'] },
        { id: 'freq_fritos', label: 'Comes fritos?', type: 'range', min: '1', max: '5', labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'] },
        { id: 'petisca', label: 'Petiscas entre refeições?', type: 'checkbox_single' },
        { id: 'o_que_petisca', label: 'O que petiscas?', type: 'checkbox_multiple', options: ['Doces', 'Salgados', 'Frutas', 'Nuts', 'Bolachas', 'Pão'], conditional: 'petisca' }
      ]
    },
    {
      title: 'Fome Emocional - As 7 Emoções',
      subtitle: 'Com que frequência comes quando sentes...',
      questions: [
        { id: 'gatilhos_fome_emocional', label: 'Quando é que comes por emoções?', type: 'checkbox_multiple', options: ['Stress', 'Tédio', 'Ansiedade', 'Tristeza', 'Solidão', 'Cansaço', 'Raiva', 'Frustração', 'Nunca'] },
        { id: 'freq_cansaco', label: 'Cansaço', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
        { id: 'freq_ansiedade', label: 'Ansiedade', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
        { id: 'freq_tristeza', label: 'Tristeza', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
        { id: 'freq_raiva', label: 'Raiva', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
        { id: 'freq_vazio', label: 'Vazio', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
        { id: 'freq_solidao', label: 'Solidão', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
        { id: 'freq_negacao', label: 'Negação', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
        { id: 'emocao_dominante', label: 'Qual é a emoção DOMINANTE?', type: 'radio', options: ['cansaco', 'ansiedade', 'tristeza', 'raiva', 'vazio', 'solidao', 'negacao'], labels: ['Cansaço', 'Ansiedade', 'Tristeza', 'Raiva', 'Vazio', 'Solidão', 'Negação'], required: true }
      ]
    },
    {
      title: 'Padrão de Fome Emocional',
      questions: [
        { id: 'o_que_procura_comer', label: 'O que procuras comer?', type: 'checkbox_multiple', options: ['Doce', 'Salgado', 'Crocante', 'Cremoso', 'Macio', 'Picante'] },
        { id: 'como_sente_depois', label: 'Como te sentes depois?', type: 'textarea', placeholder: 'Culpa, alívio temporário, vazio...' },
        { id: 'quando_comecou_padrao', label: 'Quando começou este padrão?', type: 'text', placeholder: 'Infância, adolescência, após evento específico...' },
        { id: 'tentou_alternativas', label: 'Já tentaste alternativas à comida?', type: 'checkbox_single' },
        { id: 'que_alternativas', label: 'Que alternativas tentaste?', type: 'textarea', conditional: 'tentou_alternativas' }
      ]
    },
    {
      title: 'Actividade Física',
      questions: [
        { id: 'nivel_actividade', label: 'Nível de actividade', type: 'radio', options: ['sedentaria', 'leve', 'moderada', 'intensa'], labels: ['Sedentária', 'Leve', 'Moderada', 'Intensa'], required: true },
        { id: 'faz_exercicio', label: 'Fazes exercício regularmente?', type: 'checkbox_single' },
        { id: 'tipo_exercicio', label: 'Que tipo de exercício?', type: 'checkbox_multiple', options: ['Caminhada', 'Corrida', 'Ginásio', 'Natação', 'Yoga', 'Dança', 'Outro'], conditional: 'faz_exercicio' }
      ]
    },
    {
      title: 'Sono e Stress',
      questions: [
        { id: 'horas_sono', label: 'Quantas horas dormes?', type: 'radio', options: ['menos_5h', '5-6h', '7-8h', 'mais_8h'], labels: ['Menos de 5h', '5-6h', '7-8h', 'Mais de 8h'] },
        { id: 'qualidade_sono', label: 'Qualidade do sono', type: 'range', min: '1', max: '5', labels: ['Péssima', 'Má', 'Razoável', 'Boa', 'Excelente'] },
        { id: 'nivel_stress', label: 'Nível de stress', type: 'range', min: '1', max: '5', labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'] }
      ]
    },
    {
      title: 'Contexto de Vida',
      questions: [
        { id: 'situacao_profissional', label: 'Situação profissional', type: 'text', placeholder: 'Empregada, desempregada, estudante...' },
        { id: 'situacao_familiar', label: 'Situação familiar', type: 'text', placeholder: 'Solteira, casada, divorciada...' },
        { id: 'filhos_pequenos', label: 'Tens filhos pequenos?', type: 'checkbox_single' },
        { id: 'quem_cozinha', label: 'Quem cozinha em casa?', type: 'text', placeholder: 'Eu, parceiro, empregada...' }
      ]
    },
    {
      title: 'Histórico de Dietas',
      questions: [
        { id: 'quantas_dietas', label: 'Quantas dietas já fizeste?', type: 'radio', options: ['nunca', '1-2', '3-5', 'mais_5'], labels: ['Nunca', '1-2 dietas', '3-5 dietas', 'Mais de 5'], required: true },
        { id: 'historico_dietas', label: 'Descreve o teu histórico', type: 'textarea', placeholder: 'Que dietas fizeste? Como foi?' },
        { id: 'dieta_funcionou', label: 'Alguma funcionou? Porquê?', type: 'textarea' },
        { id: 'maior_obstaculo', label: 'Maior obstáculo', type: 'textarea', placeholder: 'O que te impede de ter sucesso?' },
        { id: 'gatilhos_sair_plano', label: 'Gatilhos para sair do plano', type: 'checkbox_multiple', options: ['Stress', 'Eventos sociais', 'TPM', 'Fins de semana', 'Viagens', 'Falta de tempo', 'Desânimo'] }
      ]
    },
    {
      title: 'Preferências do Programa',
      questions: [
        { id: 'abordagem_realista', label: 'Preferes abordagem...', type: 'radio', options: ['gradual', 'intensiva'], labels: ['Gradual (mudanças aos poucos)', 'Intensiva (mudança rápida)'], required: true },
        { id: 'disposta_jejum', label: 'Estás disposta a fazer jejum?', type: 'checkbox_single' },
        { id: 'preferencias_alimentares', label: 'Preferências alimentares', type: 'checkbox_multiple', options: ['Vegetariana', 'Vegana', 'Sem glúten', 'Sem lactose', 'Sem restrições'] },
        { id: 'medir_pesar_comida', label: 'Estás disposta a medir/pesar comida?', type: 'radio', options: ['sim', 'nao', 'as_vezes'], labels: ['Sim', 'Não', 'Às vezes'] },
        { id: 'acesso_ingredientes', label: 'Acesso a ingredientes saudáveis', type: 'radio', options: ['facil', 'moderado', 'dificil'], labels: ['Fácil', 'Moderado', 'Difícil'] }
      ]
    },
    {
      title: 'Pacote e Pagamento',
      questions: [
        { id: 'pacote_escolhido', label: 'Pacote escolhido', type: 'radio', options: ['essencial', 'premium', 'vip'], labels: ['Essencial', 'Premium', 'VIP'], required: true },
        { id: 'duracao', label: 'Duração', type: 'radio', options: ['3m', '6m', '9m', '12m'], labels: ['3 meses', '6 meses', '9 meses', '12 meses'], required: true },
        { id: 'forma_pagamento', label: 'Forma de pagamento preferida', type: 'text', placeholder: 'M-Pesa, transferência bancária...' },
        { id: 'codigo_promo', label: 'Código promocional', type: 'text', placeholder: 'Se tiveres...' }
      ]
    },
    {
      title: 'Últimas Perguntas',
      questions: [
        { id: 'como_conheceu', label: 'Como conheceste o Vitalis?', type: 'text' },
        { id: 'o_que_espera_ganhar', label: 'O que MAIS esperas ganhar?', type: 'textarea', placeholder: 'Sê específica...', required: true },
        { id: 'observacoes_adicionais', label: 'Observações adicionais', type: 'textarea', placeholder: 'Algo mais que queiras partilhar?' },
        { id: 'prontidao_1a10', label: 'Quão PRONTA estás para fazer mudanças?', type: 'range', min: '1', max: '10', labels: ['1 - Ainda não sei', '7', '10 - Totalmente comprometida'], required: true },
        { id: 'autoriza_dados_pesquisa', label: 'Autorizo uso dos dados para pesquisa', type: 'checkbox_single' },
        { id: 'confirmacoes', label: 'Confirmações', type: 'checkbox_multiple', options: [
          'Entendo que este é um programa de coaching nutricional e não substitui acompanhamento médico',
          'Comprometo-me a seguir o programa com honestidade e consistência',
          'Autorizo o contacto via WhatsApp para acompanhamento',
          'Li e aceito os Termos de Serviço e Política de Privacidade'
        ], required: true }
      ]
    }
  ];

  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxMultiple = (questionId, option, checked) => {
    setFormData(prev => {
      const current = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter(item => item !== option) };
      }
    });
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilizador não autenticado');
      }

      // 1. Criar ou atualizar cliente
      const { data: clientData, error: clientError } = await supabase
        .from('vitalis_clients')
        .upsert({
          user_id: user.id,
          objectivo_principal: formData.objectivo_principal,
          peso_inicial: parseFloat(formData.peso_actual) || null,
          peso_actual: parseFloat(formData.peso_actual) || null,
          peso_meta: parseFloat(formData.peso_meta) || null,
          emocao_dominante: formData.emocao_dominante,
          prontidao_1a10: parseInt(formData.prontidao_1a10) || null,
          pacote: formData.pacote_escolhido,
          duracao_programa: formData.duracao,
          data_inicio: new Date().toISOString().split('T')[0]
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
          ...formData,
          // Converter valores
          idade: parseInt(formData.idade) || null,
          altura_cm: parseInt(formData.altura_cm) || null,
          peso_actual: parseFloat(formData.peso_actual) || null,
          peso_meta: parseFloat(formData.peso_meta) || null,
          cintura_cm: parseFloat(formData.cintura_cm) || null,
          anca_cm: parseFloat(formData.anca_cm) || null,
          agua_litros_dia: parseFloat(formData.agua_litros_dia) || null,
          refeicoes_dia: parseInt(formData.refeicoes_dia) || null,
          freq_doces: parseInt(formData.freq_doces) || null,
          freq_fritos: parseInt(formData.freq_fritos) || null,
          qualidade_sono: parseInt(formData.qualidade_sono) || null,
          nivel_stress: parseInt(formData.nivel_stress) || null,
          prontidao_1a10: parseInt(formData.prontidao_1a10) || null
        }, { onConflict: 'user_id' });

      if (intakeError) throw intakeError;

      navigate('/vitalis/dashboard');

    } catch (err) {
      console.error('Erro ao submeter:', err);
      setError(err.message || 'Erro ao submeter. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (q) => {
    // Conditional rendering
    if (q.conditional && !formData[q.conditional]) {
      return null;
    }

    switch (q.type) {
      case 'checkbox_single':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData[q.id] || false}
              onChange={(e) => handleInputChange(q.id, e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#D97706' }}
            />
            <span>{q.label}</span>
          </label>
        );

      case 'checkbox_multiple':
        return (
          <div>
            <p style={{ marginBottom: '12px', fontWeight: '500' }}>{q.label} {q.required && <span style={{ color: '#DC2626' }}>*</span>}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {q.options.map(option => (
                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={(formData[q.id] || []).includes(option)}
                    onChange={(e) => handleCheckboxMultiple(q.id, option, e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: '#D97706' }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'radio':
        return (
          <div>
            <p style={{ marginBottom: '12px', fontWeight: '500' }}>{q.label} {q.required && <span style={{ color: '#DC2626' }}>*</span>}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {q.options.map((option, index) => (
                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={formData[q.id] === option}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    required={q.required}
                    style={{ width: '20px', height: '20px', accentColor: '#D97706' }}
                  />
                  <span>{q.labels ? q.labels[index] : option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'range':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              {q.label} {q.required && <span style={{ color: '#DC2626' }}>*</span>}
            </label>
            <input
              type="range"
              min={q.min}
              max={q.max}
              value={formData[q.id] || Math.floor((parseInt(q.min) + parseInt(q.max)) / 2)}
              onChange={(e) => handleInputChange(q.id, e.target.value)}
              required={q.required}
              style={{ width: '100%', accentColor: '#D97706' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6B7280', marginTop: '8px' }}>
              {q.labels && q.labels.map((label, i) => (
                <span key={i} style={{ fontWeight: formData[q.id] == (i + parseInt(q.min)) ? '600' : '400', color: formData[q.id] == (i + parseInt(q.min)) ? '#D97706' : '#6B7280' }}>
                  {label}
                </span>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '1.2rem', fontWeight: '600', color: '#D97706' }}>
              {formData[q.id] || Math.floor((parseInt(q.min) + parseInt(q.max)) / 2)}
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              {q.label} {q.required && <span style={{ color: '#DC2626' }}>*</span>}
            </label>
            <textarea
              defaultValue={formData[q.id] || ''}
              onBlur={(e) => handleInputChange(q.id, e.target.value)}
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
          </div>
        );

      default:
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              {q.label} {q.required && <span style={{ color: '#DC2626' }}>*</span>}
            </label>
            <input
              type={q.type}
              defaultValue={formData[q.id] || ''}
              onBlur={(e) => handleInputChange(q.id, e.target.value)}
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
          </div>
        );
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
              {currentSectionData.subtitle && (
                <p style={{
                  fontSize: '0.95rem',
                  color: '#6B7280',
                  fontStyle: 'italic',
                  marginBottom: '30px'
                }}>
                  {currentSectionData.subtitle}
                </p>
              )}

              {currentSectionData.questions.map((q) => (
                <div key={q.id} style={{ marginBottom: '28px' }}>
                  {renderQuestion(q)}
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
