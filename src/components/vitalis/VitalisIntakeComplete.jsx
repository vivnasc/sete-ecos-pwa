import React, { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { setSexo } from '../../utils/genero';
import { setObservaRamadao } from '../../utils/ramadao';
import { gerarPlanoAutomatico } from '../../lib/vitalis/planoGenerator';

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
    abordagem_preferida: '', restricoes_alimentares: [], observa_ramadao: '',
    condicoes_saude: [], medicacao: '',
    refeicoes_dia: '', faz_pequeno_almoco: '', pequeno_almoco_opcoes: [],
    onde_come: [], tipos_comida: [], agua_litros_dia: '2', bebidas: [],
    freq_doces: '3', freq_fritos: '3', petisca: false, o_que_petisca: [],
    freq_cansaco: '', freq_ansiedade: '', freq_tristeza: '', freq_raiva: '',
    freq_vazio: '', freq_solidao: '', freq_negacao: '', emocao_dominante: '',
    o_que_procura_comer: [], como_sente_depois: [],
    quando_comecou_padrao: '', tentou_alternativas: false, que_alternativas: '',
    nivel_actividade: '', faz_exercicio: false, tipo_exercicio: [],
    horas_sono: '', qualidade_sono: '3',
    situacao_profissional: '', situacao_familiar: '', filhos_pequenos: false,
    quem_cozinha: '', nivel_stress: '3',
    maior_obstaculo: '', historico_dietas: [], gatilhos_sair_plano: [],
    quantas_dietas: '', dieta_funcionou: [],
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
    { title: 'Boas-vindas ao Vitalis 💪', isWelcome: true },
    { title: 'Dados Pessoais', fields: ['nome', 'email', 'whatsapp', 'idade', 'sexo'] },
    { title: 'Medidas Corporais', fields: ['altura_cm', 'peso_actual', 'peso_meta', 'cintura_cm', 'anca_cm'] },
    { title: 'Objectivo e Prazo', fields: ['objectivo_principal', 'prazo', 'porque_importante'] },
    { title: 'Abordagem Alimentar', fields: ['abordagem_preferida', 'restricoes_alimentares', 'observa_ramadao'] },
    { title: 'Saúde', fields: ['condicoes_saude', 'medicacao'] },
    { title: 'Hábitos Alimentares', fields: ['refeicoes_dia', 'faz_pequeno_almoco', 'pequeno_almoco_opcoes', 'onde_come', 'tipos_comida', 'agua_litros_dia', 'bebidas', 'freq_doces', 'freq_fritos', 'petisca', 'o_que_petisca'] },
    { title: 'Fome Emocional - As 7 Emoções', subtitle: 'Com que frequência comes quando sentes…', fields: ['freq_cansaco', 'freq_ansiedade', 'freq_tristeza', 'freq_raiva', 'freq_vazio', 'freq_solidao', 'freq_negacao', 'emocao_dominante'] },
    { title: 'Padrão de Fome Emocional', subtitle: 'Quando comes por emoção (não por fome física)…', fields: ['o_que_procura_comer', 'como_sente_depois', 'quando_comecou_padrao', 'tentou_alternativas', 'que_alternativas'] },
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
    sexo: { label: 'Sexo', type: 'radio', options: ['feminino', 'masculino', 'outro'], labels: ['Feminino', 'Masculino', 'Prefiro não especificar'], required: true },
    altura_cm: { label: 'Altura (cm)', type: 'number', required: true, inputMode: 'numeric' },
    peso_actual: { label: 'Peso actual (kg)', type: 'number', step: '0.1', required: true, inputMode: 'decimal' },
    peso_meta: { label: 'Peso desejado (kg)', type: 'number', step: '0.1', required: true, inputMode: 'decimal' },
    cintura_cm: { label: 'Cintura (cm)', type: 'number', step: '0.1', inputMode: 'decimal' },
    anca_cm: { label: 'Anca (cm)', type: 'number', step: '0.1', inputMode: 'decimal' },
    objectivo_principal: { 
      label: 'Objectivo principal', 
      type: 'radio',
      options: ['emagrecer', 'ganhar_energia', 'melhorar_saude', 'controlar_emocoes', 'outro'],
      labels: ['Emagrecer', 'Ganhar energia', 'Melhorar saúde', 'Controlar fome emocional', 'Outro'],
      required: true 
    },
    prazo: { label: 'Em quanto tempo?', type: 'radio', options: ['3m', '6m', '9m', '12m', 'sem_pressa'], labels: ['3 meses', '6 meses', '9 meses', '12 meses', 'Sem pressa'], required: true },
    porque_importante: { label: 'Porquê é importante para ti?', type: 'textarea', placeholder: 'O que vai mudar na tua vida?', rows: 3 },
    abordagem_preferida: { label: 'Que abordagem preferes?', type: 'radio', options: ['keto_if', 'low_carb', 'equilibrado', 'nao_sei'], labels: ['Keto + Jejum Intermitente', 'Low Carb', 'Equilibrado', 'Não sei'], required: true },
    restricoes_alimentares: { label: 'Restrições alimentares', type: 'checkbox', options: ['Vegetariano/a', 'Vegano/a', 'Sem glúten', 'Sem lactose', 'Halal', 'Nenhuma'] },
    observa_ramadao: { label: '🌙 Observas o jejum do Ramadan?', type: 'radio', options: ['sim', 'nao', 'as_vezes'], labels: ['Sim, todos os anos', 'Não', 'Às vezes / parcialmente'] },
    condicoes_saude: { label: 'Condições de saúde', type: 'checkbox', options: ['Diabetes', 'Hipertensão', 'Colesterol alto', 'Problemas de tiroide', 'SOP (Síndrome do Ovário Policístico)', 'Problemas de próstata', 'Nenhuma'] },
    medicacao: { label: 'Medicação e suplementos actuais', type: 'textarea', placeholder: 'Lista medicamentos e suplementos (ou "Nenhum")', rows: 2 },
    
    // REFEIÇÕES - CORRIGIDO
    refeicoes_dia: { 
      label: 'Quantas refeições comes por dia?', 
      type: 'radio',
      options: ['1-2', '3', '4', '5-6'],
      labels: ['1-2 refeições', '3 refeições', '4 refeições', '5-6 refeições'],
      required: true
    },
    faz_pequeno_almoco: {
      label: 'Fazes pequeno-almoço?',
      type: 'radio',
      options: ['sim', 'nao', 'as_vezes'],
      labels: ['Sim, sempre', 'Não', 'Às vezes'],
      required: true
    },
    pequeno_almoco_opcoes: { 
      label: 'O que costumas comer no pequeno-almoço?', 
      type: 'checkbox', 
      options: ['Pão/torradas', 'Cereais', 'Ovos', 'Fruta', 'Iogurte', 'Café/chá só', 'Outro'],
      conditional: 'faz_pequeno_almoco',
      conditionalValues: ['sim', 'as_vezes']
    },
    
    onde_come: { label: 'Onde comes habitualmente?', type: 'checkbox', options: ['Casa', 'Trabalho', 'Restaurante', 'Fast food', 'Na rua'] },
    tipos_comida: { label: 'Tipos de comida que preferes', type: 'checkbox', options: ['Tradicional moçambicana', 'Portuguesa', 'Italiana', 'Chinesa', 'Fast food', 'Vegetariana'] },
    agua_litros_dia: { label: 'Água por dia (litros)', type: 'slider', min: '0', max: '5', step: '0.5' },
    bebidas: { label: 'Bebidas que consomes', type: 'checkbox', options: ['Café', 'Chá', 'Refrigerantes', 'Sumos naturais', 'Sumos de pacote', 'Álcool', 'Só água'] },
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
    emocao_dominante: { label: 'Qual é a emoção DOMINANTE quando comes por emoção?', type: 'radio', options: ['cansaco', 'ansiedade', 'tristeza', 'raiva', 'vazio', 'solidao', 'negacao'], labels: ['Cansaço', 'Ansiedade', 'Tristeza', 'Raiva', 'Vazio', 'Solidão', 'Negação'], required: true },
    
    // PADRÃO EMOCIONAL - CORRIGIDO
    o_que_procura_comer: { 
      label: 'Quando comes por emoção, o que mais procuras?', 
      type: 'checkbox', 
      options: ['Doce', 'Salgado', 'Crocante', 'Cremoso', 'Macio', 'Picante'],
      required: true
    },
    como_sente_depois: { 
      label: 'Como te sentes depois de comer por emoção?', 
      type: 'checkbox',
      options: ['Culpa', 'Alívio temporário', 'Pior que antes', 'Entorpecimento', 'Arrependimento', 'Indiferença'],
      required: true
    },
    quando_comecou_padrao: { 
      label: 'Quando começou este padrão?', 
      type: 'radio',
      options: ['infancia', 'adolescencia', 'fase_adulta', 'recente', 'nao_sei'],
      labels: ['Infância', 'Adolescência', 'Fase adulta', 'Recentemente', 'Não sei']
    },
    tentou_alternativas: { label: 'Já tentaste lidar com isto de outra forma?', type: 'checkbox_single' },
    que_alternativas: { label: 'O que tentaste?', type: 'textarea', placeholder: 'Ex: meditação, exercício, terapia...', rows: 2, conditional: 'tentou_alternativas' },
    
    nivel_actividade: { label: 'Nível de actividade física no dia-a-dia', type: 'radio', options: ['sedentaria', 'leve', 'moderada', 'intensa'], labels: ['Sedentário/a (sentado/a maior parte do dia)', 'Leve (caminho um pouco)', 'Moderado/a (bastante activo/a)', 'Intenso/a (muito activo/a)'], required: true },
    faz_exercicio: { label: 'Fazes exercício regular?', type: 'checkbox_single' },
    tipo_exercicio: { label: 'Que tipo de exercício?', type: 'checkbox', options: ['Caminhada', 'Corrida', 'Ginásio', 'Natação', 'Yoga', 'Dança', 'Outro'], conditional: 'faz_exercicio' },
    horas_sono: { label: 'Quantas horas dormes por noite?', type: 'radio', options: ['menos_5h', '5-6h', '7-8h', 'mais_8h'], labels: ['Menos de 5h', '5-6h', '7-8h', 'Mais de 8h'] },
    qualidade_sono: { label: 'Qualidade do sono', type: 'slider', min: '1', max: '5', labels: ['Péssima', 'Má', 'Razoável', 'Boa', 'Excelente'] },
    nivel_stress: { label: 'Nível de stress no dia-a-dia', type: 'slider', min: '1', max: '5', labels: ['Baixo', 'Médio', 'Alto', 'Muito Alto', 'Extremo'] },
    
    // CONTEXTO DE VIDA - CORRIGIDO
    situacao_profissional: { 
      label: 'Situação profissional', 
      type: 'radio',
      options: ['empregado_tempo_inteiro', 'empregado_meio_tempo', 'autonomo', 'desempregado', 'estudante', 'reforma'],
      labels: ['Empregado/a (tempo inteiro)', 'Empregado/a (meio tempo)', 'Autónomo/a / Empresário/a', 'Desempregado/a', 'Estudante', 'Reformado/a'],
      required: true
    },
    situacao_familiar: {
      label: 'Com quem vives?',
      type: 'radio',
      options: ['sozinho', 'com_parceiro', 'com_parceiro_filhos', 'pai_mae_solteiro', 'com_familia', 'com_irmaos', 'com_filhos_adultos', 'outro'],
      labels: ['Sozinho/a', 'Com parceiro/a', 'Com parceiro/a e filhos', 'Pai/Mãe solteiro/a com filhos', 'Com família (pais, avós...)', 'Com irmãos/irmãs', 'Com filhos adultos', 'Outra situação'],
      required: true
    },
    filhos_pequenos: { label: 'Tens filhos pequenos (< 10 anos)?', type: 'checkbox_single' },
    quem_cozinha: {
      label: 'Quem cozinha em casa?',
      type: 'radio',
      options: ['eu', 'parceiro', 'partilhado', 'familiar', 'empregada', 'nao_cozinho'],
      labels: ['Eu', 'Meu/minha parceiro/a', 'Partilhamos', 'Familiar (mãe, irmã...)', 'Empregada doméstica', 'Não costumo cozinhar'],
      required: true
    },
    
    // HISTÓRICO - CORRIGIDO
    quantas_dietas: { label: 'Quantas dietas já fizeste?', type: 'radio', options: ['nunca', '1-2', '3-5', 'mais_5'], labels: ['Nunca fiz dieta', '1-2 dietas', '3-5 dietas', 'Mais de 5 dietas'], required: true },
    historico_dietas: { 
      label: 'Que dietas já experimentaste?', 
      type: 'checkbox',
      options: ['Keto', 'Low carb', 'Jejum intermitente', 'Detox', 'Shakes/substitutos', 'Contagem calorias', 'Weight Watchers', 'Outra']
    },
    dieta_funcionou: { 
      label: 'O que funcionou bem para ti no passado?', 
      type: 'checkbox',
      options: ['Plano estruturado', 'Apoio profissional', 'Grupo de apoio', 'Exercício regular', 'Jejum intermitente', 'Cortar açúcar', 'Reduzir hidratos', 'Nada funcionou']
    },
    maior_obstaculo: { 
      label: 'Qual é o teu maior obstáculo?', 
      type: 'radio',
      options: ['fome_emocional', 'falta_tempo', 'familia', 'custo', 'motivacao', 'conhecimento', 'outro'],
      labels: ['Fome emocional', 'Falta de tempo', 'Família não apoia', 'Custo', 'Falta de motivação', 'Não sei o que comer', 'Outro']
    },
    gatilhos_sair_plano: { label: 'O que te faz sair do plano?', type: 'checkbox', options: ['Stress', 'Eventos sociais', 'Alterações hormonais (TPM, etc.)', 'Fins de semana', 'Viagens', 'Falta de tempo', 'Desânimo', 'Fome emocional'] },
    
    abordagem_realista: { label: 'Preferes abordagem...', type: 'radio', options: ['gradual', 'intensiva'], labels: ['Gradual (mudanças lentas e sustentáveis)', 'Intensiva (mudanças rápidas e profundas)'], required: true },
    preferencias_alimentares: { label: 'Preferências alimentares', type: 'checkbox', options: ['Vegetariano/a', 'Vegano/a', 'Sem glúten', 'Sem lactose', 'Sem restrições'] },
    medir_pesar_comida: { label: 'Estás disposto/a a medir/pesar comida?', type: 'radio', options: ['sim', 'nao', 'as_vezes'], labels: ['Sim', 'Não', 'Às vezes'] },
    acesso_ingredientes: { label: 'Acesso a ingredientes saudáveis', type: 'radio', options: ['facil', 'moderado', 'dificil'], labels: ['Fácil', 'Moderado', 'Difícil'] },
    
    como_conheceu: { label: 'Como conheceste o Vitalis?', type: 'checkbox', options: ['Instagram', 'Facebook', 'Indicação', 'Google', 'Outro'], required: true },
    o_que_espera_ganhar: { label: 'O que MAIS esperas ganhar com o Vitalis?', type: 'textarea', required: true, placeholder: 'Sê específico/a…', rows: 3 },
    observacoes_adicionais: { label: 'Algo mais que queiras partilhar?', type: 'textarea', rows: 3 },
    prontidao_1a10: { label: 'Numa escala de 1-10, quão pronto/a estás para mudar?', type: 'slider', min: '1', max: '10', labels: ['1 - Não muito', '5 - Moderadamente', '10 - Totalmente'], required: true },
    autoriza_dados_pesquisa: { label: 'Autorizo uso de dados anonimizados para pesquisa', type: 'checkbox_single' },
    
    // Campos legais
    li_termos: { label: 'Li e aceito os Termos de Serviço', type: 'checkbox_legal', required: true },
    li_privacidade: { label: 'Li e aceito a Política de Privacidade', type: 'checkbox_legal', required: true },
    entendo_coaching: { label: 'Entendo que isto é coaching nutricional e não substitui acompanhamento médico', type: 'checkbox_legal', required: true },
    comprometo_programa: { label: 'Comprometo-me a seguir o programa e comunicar dificuldades', type: 'checkbox_legal', required: true }
  };

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
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

      // Check conditional fields
      if (config.conditional) {
        const condValue = formData[config.conditional];
        if (config.conditionalValues) {
          if (!config.conditionalValues.includes(condValue)) return;
        } else if (!condValue) {
          return;
        }
      }

      const value = formData[fieldId];
      
      if (config.type === 'checkbox') {
        if (!value || value.length === 0) {
          errors[fieldId] = 'Selecciona pelo menos uma opção';
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
    setError('');
    
try {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  // Buscar user record (já criado pelo AuthContext)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, nome')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (userError) {
    console.error('Erro ao buscar utilizador:', userError);
    throw new Error('Erro ao carregar perfil de utilizador. Tente novamente.');
  }

  if (!userData) {
    throw new Error('Perfil de utilizador não encontrado. Faça logout e login novamente.');
  }

  const aceita_jejum = formData.abordagem_preferida === 'keto_if';
  
  // Converter arrays para strings onde necessário
  const intakeData = {
    user_id: userData.id,  // 🎯 MUDANÇA AQUI!
        nome: formData.nome,
        email: formData.email,
        whatsapp: formData.whatsapp,
        idade: parseInt(formData.idade),
        sexo: formData.sexo,
        altura_cm: parseInt(formData.altura_cm),
        peso_actual: parseFloat(formData.peso_actual),
        peso_meta: parseFloat(formData.peso_meta),
        cintura_cm: formData.cintura_cm ? parseFloat(formData.cintura_cm) : null,
        anca_cm: formData.anca_cm ? parseFloat(formData.anca_cm) : null,
        objectivo_principal: formData.objectivo_principal,
        prazo: formData.prazo,
        porque_importante: formData.porque_importante,
        abordagem_preferida: formData.abordagem_preferida,
        aceita_jejum: aceita_jejum,
        restricoes_alimentares: formData.restricoes_alimentares,
        condicoes_saude: formData.condicoes_saude,
        medicacao: formData.medicacao,
        refeicoes_dia: formData.refeicoes_dia === '1-2' ? 2 
                     : formData.refeicoes_dia === '3' ? 3
                     : formData.refeicoes_dia === '4' ? 4
                     : formData.refeicoes_dia === '5-6' ? 5
                     : null,
        pequeno_almoco: formData.faz_pequeno_almoco === 'sim' || formData.faz_pequeno_almoco === 'as_vezes' 
          ? formData.pequeno_almoco_opcoes.join(', ') 
          : 'Não faz',
        onde_come: formData.onde_come,
        tipos_comida: formData.tipos_comida,
        agua_litros_dia: parseFloat(formData.agua_litros_dia),
        bebidas: formData.bebidas,
        freq_doces: parseInt(formData.freq_doces),
        freq_fritos: parseInt(formData.freq_fritos),
        petisca: formData.petisca,
        o_que_petisca: formData.o_que_petisca,
        freq_cansaco: formData.freq_cansaco,
        freq_ansiedade: formData.freq_ansiedade,
        freq_tristeza: formData.freq_tristeza,
        freq_raiva: formData.freq_raiva,
        freq_vazio: formData.freq_vazio,
        freq_solidao: formData.freq_solidao,
        freq_negacao: formData.freq_negacao,
        emocao_dominante: formData.emocao_dominante,
        o_que_procura_comer: formData.o_que_procura_comer,
        como_sente_depois: Array.isArray(formData.como_sente_depois) 
          ? formData.como_sente_depois.join(', ') 
          : formData.como_sente_depois,
        quando_comecou_padrao: formData.quando_comecou_padrao,
        tentou_alternativas: formData.tentou_alternativas,
        que_alternativas: formData.que_alternativas,
        nivel_actividade: formData.nivel_actividade,
        faz_exercicio: formData.faz_exercicio,
        tipo_exercicio: formData.tipo_exercicio,
        horas_sono: formData.horas_sono,
        qualidade_sono: parseInt(formData.qualidade_sono),
        nivel_stress: parseInt(formData.nivel_stress),
        situacao_profissional: formData.situacao_profissional,
        situacao_familiar: formData.situacao_familiar,
        filhos_pequenos: formData.filhos_pequenos,
        quem_cozinha: formData.quem_cozinha,
        quantas_dietas: formData.quantas_dietas,
        historico_dietas: Array.isArray(formData.historico_dietas) 
          ? formData.historico_dietas.join(', ') 
          : formData.historico_dietas,
        dieta_funcionou: Array.isArray(formData.dieta_funcionou) 
          ? formData.dieta_funcionou.join(', ') 
          : formData.dieta_funcionou,
        maior_obstaculo: formData.maior_obstaculo,
        gatilhos_sair_plano: formData.gatilhos_sair_plano,
        abordagem_realista: formData.abordagem_realista,
        preferencias_alimentares: formData.preferencias_alimentares,
        medir_pesar_comida: formData.medir_pesar_comida,
        acesso_ingredientes: formData.acesso_ingredientes,
        como_conheceu: Array.isArray(formData.como_conheceu) 
          ? formData.como_conheceu.join(', ') 
          : formData.como_conheceu,
        o_que_espera_ganhar: formData.o_que_espera_ganhar,
        observacoes_adicionais: formData.observacoes_adicionais,
        prontidao_1a10: parseInt(formData.prontidao_1a10),
        autoriza_dados_pesquisa: formData.autoriza_dados_pesquisa,
        observa_ramadao: formData.observa_ramadao || null
      };

      // Inserir intake primeiro
      const { error: intakeError } = await supabase
        .from('vitalis_intake')
        .upsert(intakeData, { 
          onConflict: 'user_id',
          returning: 'minimal'
        });

      if (intakeError) {
        console.error('Erro no intake:', intakeError);
        throw intakeError;
      }

    // Verificar se já existe registo com subscription_status
      const { data: existingClient } = await supabase
        .from('vitalis_clients')
        .select('id, subscription_status')
        .eq('user_id', userData.id)
        .maybeSingle();

      const clientData = {
        user_id: userData.id,
        objectivo_principal: formData.objectivo_principal,
        peso_inicial: parseFloat(formData.peso_actual),
        peso_actual: parseFloat(formData.peso_actual),
        peso_meta: parseFloat(formData.peso_meta),
        emocao_dominante: formData.emocao_dominante,
        prontidao_1a10: parseInt(formData.prontidao_1a10),
        status: 'novo'
      };

      if (existingClient) {
        // Atualizar mas NÃO sobrescrever subscription_status
        const { error: clientError } = await supabase
          .from('vitalis_clients')
          .update(clientData)
          .eq('user_id', userData.id);
        if (clientError) {
          console.error('Erro no client:', clientError);
          throw clientError;
        }
      } else {
        // Criar novo (subscription_status será 'none' por defeito)
        const { error: clientError } = await supabase
          .from('vitalis_clients')
          .insert({
            ...clientData,
            subscription_status: 'none',
            created_at: new Date().toISOString()
          });
        if (clientError) {
          console.error('Erro no client:', clientError);
          throw clientError;
        }
      }

      // IMPORTANTE: Re-buscar o cliente para obter o status ACTUAL após insert/update
      const { data: currentClient } = await supabase
        .from('vitalis_clients')
        .select('subscription_status')
        .eq('user_id', userData.id)
        .maybeSingle();

      // Verificar se já tem acesso (tester, active, pending, trial)
      const statusComAcesso = ['tester', 'active', 'pending', 'trial'];
      const temAcesso = currentClient && statusComAcesso.includes(currentClient.subscription_status);

      console.log('Intake complete - subscription_status:', currentClient?.subscription_status, 'temAcesso:', temAcesso);

      // Guardar preferências para personalizar textos na app
      setSexo(formData.sexo);
      setObservaRamadao(formData.observa_ramadao);

      if (temAcesso) {
        // GERAR PLANO AUTOMATICAMENTE
        console.log('🔄 A gerar plano automático...');
        try {
          const resultado = await gerarPlanoAutomatico(userData.id);
          if (resultado?.success) {
            console.log('✅ PLANO GERADO COM SUCESSO!');
          } else {
            console.error('⚠️ Plano não gerado:', resultado?.error);
          }
        } catch (planoError) {
          console.error('⚠️ Erro ao gerar plano:', planoError);
        }

        // Ir para dashboard (mesmo que plano falhe — dashboard mostra opção de retry)
        navigate('/vitalis/dashboard');
      } else {
        // Não tem acesso - ir para pagamento
        navigate('/vitalis/pagamento');
      }
    } catch (err) {
      console.error('Erro completo:', err);
      setError(`Erro ao submeter: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (fieldId) => {
    const config = fieldConfig[fieldId];
    if (!config) return null;

    // Check conditional rendering
    if (config.conditional) {
      const condValue = formData[config.conditional];
      if (config.conditionalValues) {
        if (!config.conditionalValues.includes(condValue)) return null;
      } else if (!condValue) {
        return null;
      }
    }

    const value = formData[fieldId];
    const hasError = validationErrors[fieldId];
    const inputClass = `w-full px-4 py-3 border-2 ${hasError ? 'border-red-500' : 'border-[#D2B48C]/50'} rounded-xl focus:border-[#C1634A] focus:ring-2 focus:ring-[#C1634A]/20 focus:outline-none transition-colors bg-white/80`;

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
              rows={config.rows || 4}
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
                <label key={opt} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#C1634A]/10 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={fieldId}
                    value={opt}
                    checked={value === opt}
                    onChange={(e) => handleChange(fieldId, e.target.value)}
                    className="w-5 h-5 text-[#C1634A]"
                  />
                  <span className="text-sm">{config.labels ? config.labels[i] : opt}</span>
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
                <label key={opt} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#C1634A]/10 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(opt)}
                    onChange={(e) => handleCheckbox(fieldId, opt, e.target.checked)}
                    className="w-5 h-5 text-[#C1634A] rounded"
                  />
                  <span className="text-sm">{opt}</span>
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
              className="w-5 h-5 text-[#C1634A] rounded"
            />
            <span className="text-sm font-semibold text-gray-700">{config.label}</span>
          </label>
        );

      case 'checkbox_legal':
        return (
          <label className={`flex items-start gap-3 mb-4 p-4 rounded-lg cursor-pointer transition-colors ${hasError ? 'bg-red-50 border-2 border-red-300' : 'bg-[#F5F0E8] hover:bg-[#C1634A]/15'}`} id={`field-${fieldId}`}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(fieldId, e.target.checked)}
              required={config.required}
              className="w-5 h-5 text-[#C1634A] rounded mt-0.5 flex-shrink-0"
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
              className="w-full h-2 bg-[#D2B48C] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              {config.labels?.map((l, i) => <span key={i}>{l}</span>)}
            </div>
            <div className="text-center mt-2 text-xl font-bold text-[#C1634A]">{value}</div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderLegalSection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#E8E4DC] to-[#F5F2ED] rounded-xl p-6 border-2 border-[#D2B48C]">
          <h3 className="font-bold text-lg mb-4 text-[#4A4035]">📜 Documentos Legais</h3>
          <p className="text-sm text-gray-700 mb-4">
            Antes de continuar, por favor lê os seguintes documentos:
          </p>
          <div className="space-y-3">
            <button 
              type="button"
              onClick={() => setShowTermos(true)}
              className="w-full text-left px-4 py-3 bg-white rounded-lg border-2 border-[#C1634A]/50 hover:border-[#C1634A] hover:shadow-md transition-all text-[#C1634A] font-semibold"
            >
              📄 Ler Termos de Serviço →
            </button>
            <button 
              type="button"
              onClick={() => setShowPrivacidade(true)}
              className="w-full text-left px-4 py-3 bg-white rounded-lg border-2 border-[#C1634A]/50 hover:border-[#C1634A] hover:shadow-md transition-all text-[#C1634A] font-semibold"
            >
              🔒 Ler Política de Privacidade →
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {renderField('li_termos')}
          {renderField('li_privacidade')}
          {renderField('entendo_coaching')}
          {renderField('comprometo_programa')}
        </div>

        <div className="bg-[#F5F2ED] border-2 border-[#9CAF88] rounded-lg p-4">
          <p className="text-sm text-[#4A4035]">
            ⚠️ <strong>Importante:</strong> O Vitalis é um programa de coaching nutricional. Se tens condições de saúde, recomendamos que consultes o teu médico antes de iniciar.
          </p>
        </div>
      </div>
    );
  };

  const section = sections[currentSection];
  const progress = (currentSection / (sections.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FDF8F3] to-[#F0EBE3]">
      <div className="fixed top-0 left-0 w-full h-1.5 bg-[#D2B48C]/30 z-50">
        <div
          className="h-full bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl pt-20">
        <div className="text-center mb-10">
          <img
            src="/logos/VITALIS_LOGO_V3.png"
            alt="Vitalis"
            className="w-20 h-20 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold text-[#4A4035] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {section.title}
          </h1>
          {section.subtitle && <p className="text-[#6B4423] italic text-sm">{section.subtitle}</p>}
          {!section.isWelcome && <p className="text-sm text-[#8B4513] mt-4">Secção {currentSection} de {sections.length - 1}</p>}
        </div>

        {section.isWelcome ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 text-center border border-[#D2B48C]/30">
            <img
              src="/logos/VITALIS_LOGO_V3.png"
              alt="Vitalis"
              className="w-24 h-24 mx-auto mb-6 drop-shadow-lg"
            />
            <p className="text-lg text-[#4A4035] mb-8">
              Responde com honestidade. Não há respostas certas ou erradas.<br />
              <span className="font-semibold text-[#C1634A]">⏱️ 10-15 minutos</span>
            </p>
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white px-12 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Começar →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {section.isLegal ? renderLegalSection() : section.fields?.map(field => renderField(field))}
              
              {error && (
                <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between mt-10 pt-6 border-t border-[#D2B48C]/30">
                {currentSection > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border-2 border-[#C1634A]/50 text-[#C1634A] rounded-full font-semibold hover:bg-[#C1634A]/10 transition-colors"
                  >
                    ← Anterior
                  </button>
                )}
                {currentSection < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
                  >
                    Continuar →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-[#6B8E23] to-[#556B2F] text-white rounded-full font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'A enviar...' : '🌱 Finalizar'}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Modais Termos e Privacidade */}
      {showTermos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#4A4035]">Termos de Serviço</h2>
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
                className="w-full bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
              >
                Li e Aceito os Termos
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrivacidade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#4A4035]">Política de Privacidade</h2>
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
                className="w-full bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
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
