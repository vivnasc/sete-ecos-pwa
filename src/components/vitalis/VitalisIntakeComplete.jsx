import React, { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function VitalisIntakeComplete() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTermos, setShowTermos] = useState(false);
  const [showPrivacidade, setShowPrivacidade] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    nome: '', email: '', whatsapp: '', idade: '', sexo: '',
    altura_cm: '', peso_actual: '', peso_meta: '', cintura_cm: '', anca_cm: '',
    objectivo_principal: '', prazo: '', porque_importante: '',
    abordagem_preferida: '', restricoes_alimentares: [],
    condicoes_saude: [], medicacao: '',
    refeicoes_dia: '', pequeno_almoco: '',
    onde_come: [], tipos_comida: [], agua_litros_dia: '2', bebidas: [],
    freq_doces: '3', freq_fritos: '3', petisca: false, o_que_petisca: [],
    freq_cansaco: '', freq_ansiedade: '', freq_tristeza: '', freq_raiva: '',
    freq_vazio: '', freq_solidao: '', freq_negacao: '', emocao_dominante: '',
    o_que_procura_comer: [], como_sente_depois: '', quando_comecou_padrao: '',
    tentou_alternativas: false, que_alternativas: '',
    nivel_actividade: '', faz_exercicio: false, tipo_exercicio: [],
    horas_sono: '', qualidade_sono: '3',
    situacao_profissional: '', situacao_familiar: '', filhos_pequenos: false,
    quem_cozinha: '', nivel_stress: '3',
    maior_obstaculo: '', historico_dietas: '', gatilhos_sair_plano: [],
    quantas_dietas: '', dieta_funcionou: '',
    abordagem_realista: '', preferencias_alimentares: [],
    medir_pesar_comida: '', acesso_ingredientes: '',
    como_conheceu: [], observacoes_adicionais: '', o_que_espera_ganhar: '',
    autoriza_dados_pesquisa: false, prontidao_1a10: '5',
    li_termos: false,
    li_privacidade: false,
    entendo_coaching: false,
    comprometo_programa: false
  });

  const sections = [
    { title: 'Bem-vinda ao Vitalis 💪', isWelcome: true },
    { title: 'Dados Pessoais', fields: ['nome', 'email', 'whatsapp', 'idade', 'sexo'] },
    { title: 'Medidas Corporais', fields: ['altura_cm', 'peso_actual', 'peso_meta', 'cintura_cm', 'anca_cm'] },
    { title: 'Objectivo e Prazo', fields: ['objectivo_principal', 'prazo', 'porque_importante'] },
    { title: 'Abordagem Alimentar', fields: ['abordagem_preferida', 'restricoes_alimentares'] },
    { title: 'Saúde', fields: ['condicoes_saude', 'medicacao'] },
    { title: 'Hábitos Alimentares', fields: ['refeicoes_dia', 'pequeno_almoco', 'onde_come', 'tipos_comida', 'agua_litros_dia', 'bebidas', 'freq_doces', 'freq_fritos', 'petisca', 'o_que_petisca'] },
    { title: 'Fome Emocional - As 7 Emoções', subtitle: 'Com que frequência comes quando sentes…', fields: ['freq_cansaco', 'freq_ansiedade', 'freq_tristeza', 'freq_raiva', 'freq_vazio', 'freq_solidao', 'freq_negacao', 'emocao_dominante'] },
    { title: 'Padrão de Fome Emocional', fields: ['o_que_procura_comer', 'como_sente_depois', 'quando_comecou_padrao', 'tentou_alternativas', 'que_alternativas'] },
    { title: 'Actividade Física', fields: ['nivel_actividade', 'faz_exercicio', 'tipo_exercicio'] },
    { title: 'Sono e Stress', fields: ['horas_sono', 'qualidade_sono', 'nivel_stress'] },
    { title: 'Contexto de Vida', fields: ['situacao_profissional', 'situacao_familiar', 'filhos_pequenos', 'quem_cozinha'] },
    { title: 'Histórico de Dietas', fields: ['quantas_dietas', 'historico_dietas', 'dieta_funcionou', 'maior_obstaculo', 'gatilhos_sair_plano'] },
    { title: 'Preferências do Programa', fields: ['abordagem_realista', 'preferencias_alimentares', 'medir_pesar_comida', 'acesso_ingredientes'] },
    { title: 'Termos e Privacidade', isLegal: true, fields: ['li_termos', 'li_privacidade', 'entendo_coaching', 'comprometo_programa'] },
    { title: 'Últimas Perguntas', fields: ['como_conheceu', 'o_que_espera_ganhar', 'observacoes_adicionais', 'prontidao_1a10', 'autoriza_dados_pesquisa'] }
  ];

  const fieldConfig = {
    nome: { label: 'Nome completo', type: 'text', required: true },
    email: { label: 'Email', type: 'email', required: true },
    whatsapp: { label: 'WhatsApp', type: 'tel', placeholder: '+258…', inputMode: 'tel' },
    idade: { label: 'Idade', type: 'number', required: true, inputMode: 'numeric' },
    sexo: { label: 'Sexo', type: 'radio', options: ['feminino', 'masculino'], labels: ['Feminino', 'Masculino'], required: true },
    altura_cm: { label: 'Altura (cm)', type: 'number', required: true, inputMode: 'numeric' },
    peso_actual: { label: 'Peso actual (kg)', type: 'number', step: '0.1', required: true, inputMode: 'decimal' },
    peso_meta: { label: 'Peso desejado (kg)', type: 'number', step: '0.1', required: true, inputMode: 'decimal' },
    cintura_cm: { label: 'Cintura (cm)', type: 'number', step: '0.1', inputMode: 'decimal' },
    anca_cm: { label: 'Anca (cm)', type: 'number', step: '0.1', inputMode: 'decimal' },
    objectivo_principal: { label: 'Objectivo principal', type: 'textarea', required: true, placeholder: 'Ex: Emagrecer 10kg, ganhar energia…' },
    prazo: { label: 'Em quanto tempo?', type: 'radio', options: ['3m', '6m', '9m', '12m', 'sem_pressa'], labels: ['3 meses', '6 meses', '9 meses', '12 meses', 'Sem pressa'], required: true },
    porque_importante: { label: 'Porquê é importante?', type: 'textarea', placeholder: 'O que vai mudar na tua vida?' },
    abordagem_preferida: { label: 'Que abordagem preferes?', type: 'radio', options: ['keto_if', 'low_carb', 'equilibrado', 'nao_sei'], labels: ['Keto + Jejum Intermitente', 'Low Carb', 'Equilibrado', 'Não sei'], required: true },
    restricoes_alimentares: { label: 'Restrições alimentares', type: 'checkbox', options: ['Vegetariana', 'Vegana', 'Sem glúten', 'Sem lactose', 'Halal', 'Nenhuma'] },
    condicoes_saude: { label: 'Condições de saúde', type: 'checkbox', options: ['Diabetes', 'Hipertensão', 'Colesterol alto', 'Problemas de tiroide', 'SOP', 'Nenhuma'] },
    medicacao: { label: 'Medicação actual', type: 'textarea', placeholder: 'Lista medicamentos e suplementos' },
    refeicoes_dia: { label: 'Refeições por dia?', type: 'number', min: '1', max: '10', inputMode: 'numeric' },
    pequeno_almoco: { label: 'O que comes no pequeno-almoço?', type: 'textarea', placeholder: 'Descreve…' },
    onde_come: { label: 'Onde comes habitualmente?', type: 'checkbox', options: ['Casa', 'Trabalho', 'Restaurante', 'Fast food', 'Na rua'] },
    tipos_comida: { label: 'Tipos de comida', type: 'checkbox', options: ['Tradicional moçambicana', 'Portuguesa', 'Italiana', 'Chinesa', 'Fast food', 'Vegetariana'] },
    agua_litros_dia: { label: 'Água por dia (litros)', type: 'slider', min: '0', max: '5', step: '0.5' },
    bebidas: { label: 'Bebidas', type: 'checkbox', options: ['Café', 'Chá', 'Refrigerantes', 'Sumos naturais', 'Sumos de pacote', 'Álcool', 'Só água'] },
    freq_doces: { label: 'Frequência de doces', type: 'slider', min: '1', max: '5', labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequente', 'Sempre'] },
    freq_fritos: { label: 'Frequência de fritos', type: 'slider', min: '1', max: '5', labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequente', 'Sempre'] },
    petisca: { label: 'Petiscas entre refeições?', type: 'checkbox_single' },
    o_que_petisca: { label: 'O que petiscas?', type: 'checkbox', options: ['Doces', 'Salgados', 'Frutas', 'Nuts', 'Bolachas', 'Pão'], conditional: 'petisca' },
    freq_cansaco: { label: '🔋 Cansaço', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
    freq_ansiedade: { label: '🌀 Ansiedade', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
    freq_tristeza: { label: '💧 Tristeza', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
    freq_raiva: { label: '🔥 Raiva', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
    freq_vazio: { label: '◯ Vazio', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
    freq_solidao: { label: '🌑 Solidão', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
    freq_negacao: { label: '🚫 Negação', type: 'radio', options: ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre'], labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'], required: true },
    emocao_dominante: { label: 'Emoção DOMINANTE?', type: 'radio', options: ['cansaco', 'ansiedade', 'tristeza', 'raiva', 'vazio', 'solidao', 'negacao'], labels: ['Cansaço', 'Ansiedade', 'Tristeza', 'Raiva', 'Vazio', 'Solidão', 'Negação'], required: true },
    o_que_procura_comer: { label: 'O que procuras comer?', type: 'checkbox', options: ['Doce', 'Salgado', 'Crocante', 'Cremoso', 'Macio', 'Picante'] },
    como_sente_depois: { label: 'Como te sentes depois?', type: 'textarea' },
    quando_comecou_padrao: { label: 'Quando começou?', type: 'text' },
    tentou_alternativas: { label: 'Tentaste alternativas?', type: 'checkbox_single' },
    que_alternativas: { label: 'Quais?', type: 'textarea', conditional: 'tentou_alternativas' },
    nivel_actividade: { label: 'Nível de actividade', type: 'radio', options: ['sedentaria', 'leve', 'moderada', 'intensa'], labels: ['Sedentária', 'Leve', 'Moderada', 'Intensa'], required: true },
    faz_exercicio: { label: 'Fazes exercício?', type: 'checkbox_single' },
    tipo_exercicio: { label: 'Que tipo?', type: 'checkbox', options: ['Caminhada', 'Corrida', 'Ginásio', 'Natação', 'Yoga', 'Dança', 'Outro'], conditional: 'faz_exercicio' },
    horas_sono: { label: 'Horas de sono?', type: 'radio', options: ['menos_5h', '5-6h', '7-8h', 'mais_8h'], labels: ['<5h', '5-6h', '7-8h', '>8h'] },
    qualidade_sono: { label: 'Qualidade do sono', type: 'slider', min: '1', max: '5', labels: ['Péssima', 'Má', 'Razoável', 'Boa', 'Excelente'] },
    nivel_stress: { label: 'Nível de stress', type: 'slider', min: '1', max: '5', labels: ['Baixo', 'Médio', 'Alto', 'Muito Alto', 'Extremo'] },
    situacao_profissional: { label: 'Situação profissional', type: 'text' },
    situacao_familiar: { label: 'Situação familiar', type: 'text' },
    filhos_pequenos: { label: 'Filhos pequenos?', type: 'checkbox_single' },
    quem_cozinha: { label: 'Quem cozinha?', type: 'text' },
    quantas_dietas: { label: 'Quantas dietas já fizeste?', type: 'radio', options: ['nunca', '1-2', '3-5', 'mais_5'], labels: ['Nunca', '1-2', '3-5', '>5'], required: true },
    historico_dietas: { label: 'Histórico', type: 'textarea' },
    dieta_funcionou: { label: 'O que funcionou?', type: 'textarea' },
    maior_obstaculo: { label: 'Maior obstáculo', type: 'textarea' },
    gatilhos_sair_plano: { label: 'Gatilhos', type: 'checkbox', options: ['Stress', 'Eventos sociais', 'TPM', 'Fins de semana', 'Viagens', 'Falta de tempo', 'Desânimo'] },
    abordagem_realista: { label: 'Abordagem', type: 'radio', options: ['gradual', 'intensiva'], labels: ['Gradual', 'Intensiva'], required: true },
    preferencias_alimentares: { label: 'Preferências', type: 'checkbox', options: ['Vegetariana', 'Vegana', 'Sem glúten', 'Sem lactose', 'Sem restrições'] },
    medir_pesar_comida: { label: 'Medir/pesar comida?', type: 'radio', options: ['sim', 'nao', 'as_vezes'], labels: ['Sim', 'Não', 'Às vezes'] },
    acesso_ingredientes: { label: 'Acesso a ingredientes', type: 'radio', options: ['facil', 'moderado', 'dificil'], labels: ['Fácil', 'Moderado', 'Difícil'] },
    como_conheceu: { label: 'Como conheceste?', type: 'checkbox', options: ['Instagram', 'Facebook', 'Indicação', 'Google', 'Outro'], required: true },
    o_que_espera_ganhar: { label: 'O que MAIS esperas ganhar?', type: 'textarea', required: true, placeholder: 'Sê específica…' },
    observacoes_adicionais: { label: 'Observações', type: 'textarea' },
    prontidao_1a10: { label: 'Prontidão (1-10)', type: 'slider', min: '1', max: '10', labels: ['1', '5', '10'], required: true },
    autoriza_dados_pesquisa: { label: 'Autorizo uso de dados anonimizados para pesquisa', type: 'checkbox_single' },
    
    // Campos legais
    li_termos: { label: 'Li e aceito os Termos de Serviço', type: 'checkbox_legal', required: true },
    li_privacidade: { label: 'Li e aceito a Política de Privacidade', type: 'checkbox_legal', required: true },
    entendo_coaching: { label: 'Entendo que isto é coaching nutricional e não substitui acompanhamento médico', type: 'checkbox_legal', required: true },
    comprometo_programa: { label: 'Comprometo-me a seguir o programa e comunicar dificuldades', type: 'checkbox_legal', required: true }
  };

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    // Limpa erro do campo quando user começa a preencher
    if (validationErrors[id]) {
      setValidationErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleCheckbox = (id, option, checked) => {
    setFormData(prev => ({
      ...prev,
      [id]: checked ? [...(prev[id] || []), option] : (prev[id] || []).filter(i => i !== option)
    }));
    if (validationErrors[id]) {
      setValidationErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const validateSection = () => {
    const section = sections[currentSection];
    if (!section.fields) return true;

    const errors = {};
    section.fields.forEach(fieldId => {
      const config = fieldConfig[fieldId];
      if (!config || !config.required) return;

      const value = formData[fieldId];
      
      if (config.type === 'checkbox') {
        if (!value || value.length === 0) {
          errors[fieldId] = 'Campo obrigatório - selecciona pelo menos uma opção';
        }
      } else if (config.type === 'checkbox_legal') {
        if (!value) {
          errors[fieldId] = 'Este campo é obrigatório';
        }
      } else if (!value || value === '') {
        errors[fieldId] = 'Campo obrigatório';
      }
    });

    setValidationErrors(errors);
    
    // Scroll para primeiro erro
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(`field-${firstErrorField}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateSection()) {
      setError('Por favor preenche todos os campos obrigatórios');
      return;
    }
    
    setError('');
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setError('');
    setValidationErrors({});
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSection()) {
      setError('Por favor preenche todos os campos obrigatórios');
      return;
    }
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const aceita_jejum = formData.abordagem_preferida === 'keto_if';

      const { data: clientData, error: clientError } = await supabase
        .from('vitalis_clients')
        .upsert({
          user_id: user.id,
          objectivo_principal: formData.objectivo_principal,
          peso_inicial: parseFloat(formData.peso_actual),
          peso_actual: parseFloat(formData.peso_actual),
          peso_meta: parseFloat(formData.peso_meta),
          emocao_dominante: formData.emocao_dominante,
          prontidao_1a10: parseInt(formData.prontidao_1a10)
        }, { onConflict: 'user_id' })
        .select().single();

      if (clientError) throw clientError;

      const { error: intakeError } = await supabase
        .from('vitalis_intake')
        .upsert({
          user_id: user.id,
          client_id: clientData.id,
          ...formData,
          aceita_jejum,
          idade: parseInt(formData.idade),
          altura_cm: parseInt(formData.altura_cm),
          peso_actual: parseFloat(formData.peso_actual),
          peso_meta: parseFloat(formData.peso_meta),
          refeicoes_dia: parseInt(formData.refeicoes_dia) || null,
          agua_litros_dia: parseFloat(formData.agua_litros_dia),
          freq_doces: parseInt(formData.freq_doces),
          freq_fritos: parseInt(formData.freq_fritos),
          qualidade_sono: parseInt(formData.qualidade_sono),
          nivel_stress: parseInt(formData.nivel_stress),
          prontidao_1a10: parseInt(formData.prontidao_1a10),
          como_conheceu: Array.isArray(formData.como_conheceu) ? formData.como_conheceu.join(', ') : formData.como_conheceu
        }, { onConflict: 'user_id' });

      if (intakeError) throw intakeError;
      navigate('/vitalis/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (fieldId) => {
    const config = fieldConfig[fieldId];
    if (!config) return null;

    if (config.conditional && !formData[config.conditional]) return null;

    const value = formData[fieldId];
    const hasError = validationErrors[fieldId];
    const inputClass = `w-full px-4 py-3 border-2 ${hasError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:border-orange-400 focus:outline-none transition-colors`;

    switch (config.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <div className="mb-6" id={`field-${fieldId}`}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {config.label} {config.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={config.type}
              value={value}
              onChange={(e) => handleChange(fieldId, e.target.value)}
              placeholder={config.placeholder}
              step={config.step}
              min={config.min}
              max={config.max}
              inputMode={config.inputMode}
              required={config.required}
              className={inputClass}
            />
            {hasError && <p className="text-red-500 text-sm mt-1">{hasError}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div className="mb-6" id={`field-${fieldId}`}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {config.label} {config.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(fieldId, e.target.value)}
              placeholder={config.placeholder}
              rows={4}
              required={config.required}
              className={inputClass}
            />
            {hasError && <p className="text-red-500 text-sm mt-1">{hasError}</p>}
          </div>
        );

      case 'radio':
        return (
          <div className="mb-6" id={`field-${fieldId}`}>
            <p className="block text-sm font-semibold text-gray-700 mb-3">
              {config.label} {config.required && <span className="text-red-500">*</span>}
            </p>
            <div className="space-y-2">
              {config.options.map((opt, i) => (
                <label key={opt} className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={fieldId}
                    value={opt}
                    checked={value === opt}
                    onChange={(e) => handleChange(fieldId, e.target.value)}
                    className="w-5 h-5 text-orange-500"
                  />
                  <span>{config.labels ? config.labels[i] : opt}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="text-red-500 text-sm mt-1">{hasError}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div className="mb-6" id={`field-${fieldId}`}>
            <p className="block text-sm font-semibold text-gray-700 mb-3">
              {config.label} {config.required && <span className="text-red-500">*</span>}
            </p>
            <div className="space-y-2">
              {config.options.map(opt => (
                <label key={opt} className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(opt)}
                    onChange={(e) => handleCheckbox(fieldId, opt, e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="text-red-500 text-sm mt-1">{hasError}</p>}
          </div>
        );

      case 'checkbox_single':
        return (
          <label className="flex items-center gap-3 mb-6 cursor-pointer" id={`field-${fieldId}`}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(fieldId, e.target.checked)}
              className="w-5 h-5 text-orange-500 rounded"
            />
            <span className="text-sm font-semibold text-gray-700">{config.label}</span>
          </label>
        );

      case 'checkbox_legal':
        return (
          <label className={`flex items-start gap-3 mb-4 p-4 rounded-lg cursor-pointer transition-colors ${hasError ? 'bg-red-50 border-2 border-red-300' : 'bg-orange-50 hover:bg-orange-100'}`} id={`field-${fieldId}`}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(fieldId, e.target.checked)}
              required={config.required}
              className="w-5 h-5 text-orange-500 rounded mt-0.5 flex-shrink-0"
            />
            <span className={`text-sm ${hasError ? 'text-red-700 font-semibold' : 'text-gray-800'}`}>
              {config.label} {config.required && <span className="text-red-500">*</span>}
            </span>
          </label>
        );

      case 'slider':
        return (
          <div className="mb-6" id={`field-${fieldId}`}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {config.label} {config.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="range"
              min={config.min}
              max={config.max}
              step={config.step || '1'}
              value={value}
              onChange={(e) => handleChange(fieldId, e.target.value)}
              className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              {config.labels?.map((l, i) => <span key={i}>{l}</span>)}
            </div>
            <div className="text-center mt-2 text-xl font-bold text-orange-600">{value}</div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderLegalSection = () => {
    return (
      <div className="space-y-6">
        {/* Documentos Legais */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
          <h3 className="font-bold text-lg mb-4 text-orange-900">📜 Documentos Legais</h3>
          <p className="text-sm text-gray-700 mb-4">
            Antes de continuar, por favor lê os seguintes documentos:
          </p>
          <div className="space-y-3">
            <button 
              type="button"
              onClick={() => setShowTermos(true)}
              className="w-full text-left px-4 py-3 bg-white rounded-lg border-2 border-orange-300 hover:border-orange-500 hover:shadow-md transition-all text-orange-700 font-semibold"
            >
              📄 Ler Termos de Serviço →
            </button>
            <button 
              type="button"
              onClick={() => setShowPrivacidade(true)}
              className="w-full text-left px-4 py-3 bg-white rounded-lg border-2 border-orange-300 hover:border-orange-500 hover:shadow-md transition-all text-orange-700 font-semibold"
            >
              🔒 Ler Política de Privacidade →
            </button>
          </div>
        </div>

        {/* Confirmações Obrigatórias */}
        <div className="space-y-3">
          {renderField('li_termos')}
          {renderField('li_privacidade')}
          {renderField('entendo_coaching')}
          {renderField('comprometo_programa')}
        </div>

        {/* Aviso Importante */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            ⚠️ <strong>Importante:</strong> O Vitalis é um programa de coaching nutricional. Se tens condições de saúde, recomendamos que consultes o teu médico antes de iniciar.
          </p>
        </div>
      </div>
    );
  };

  const section = sections[currentSection];
  const progress = (currentSection / (sections.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-amber-600 transition-all duration-300" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl pt-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-orange-900 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {section.title}
          </h1>
          {section.subtitle && <p className="text-gray-600 italic">{section.subtitle}</p>}
          {!section.isWelcome && <p className="text-sm text-gray-600 mt-4">Secção {currentSection} de {sections.length - 1}</p>}
        </div>

        {section.isWelcome ? (
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <div className="text-6xl mb-6">🌱</div>
            <p className="text-lg text-gray-700 mb-8">
              Responde com honestidade. Não há respostas certas ou erradas.<br />
              <span className="font-semibold text-orange-600">⏱️ 10-15 minutos</span>
            </p>
            <button 
              onClick={handleNext} 
              className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Começar →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {section.isLegal ? renderLegalSection() : section.fields?.map(field => renderField(field))}
              
              {error && (
                <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="flex justify-between mt-10 pt-6 border-t">
                {currentSection > 1 && (
                  <button 
                    type="button" 
                    onClick={handlePrevious} 
                    className="px-6 py-3 border-2 border-orange-300 text-orange-700 rounded-full font-semibold hover:bg-orange-50 transition-colors"
                  >
                    ← Anterior
                  </button>
                )}
                {currentSection < sections.length - 1 ? (
                  <button 
                    type="button" 
                    onClick={handleNext} 
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
                  >
                    Continuar →
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'A enviar...' : 'Finalizar ✓'}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Modal Termos */}
      {showTermos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-orange-900">Termos de Serviço</h2>
              <button 
                onClick={() => setShowTermos(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <iframe 
                src="/Vitalis_Termos_Servico.pdf" 
                className="w-full h-[600px] border-0"
                title="Termos de Serviço"
              />
            </div>
            <div className="p-6 border-t">
              <button 
                onClick={() => {
                  setShowTermos(false);
                  handleChange('li_termos', true);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
              >
                Li e Aceito os Termos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Privacidade */}
      {showPrivacidade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-orange-900">Política de Privacidade</h2>
              <button 
                onClick={() => setShowPrivacidade(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <iframe 
                src="/Vitalis_Politica_Privacidade.pdf" 
                className="w-full h-[600px] border-0"
                title="Política de Privacidade"
              />
            </div>
            <div className="p-6 border-t">
              <button 
                onClick={() => {
                  setShowPrivacidade(false);
                  handleChange('li_privacidade', true);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
              >
                Li e Aceito a Política
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
