import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const VitalisIntakeQuestionnaire = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    // Todas as respostas inicializadas
    nome_completo: '', email: '', whatsapp: '', idade: '', sexo: '',
    altura_cm: '', peso_actual_kg: '', peso_meta_kg: '', cintura_cm: '', anca_cm: '',
    objectivo_principal: '', prazo: '', porque_importante: '',
    condicoes_saude: [], gravida_amamentar: '', medicacao: '', medicacao_quais: '', alergias_restricoes: [],
    num_refeicoes_dia: '', pequeno_almoco: '', onde_come: [], tipos_comida_frequente: [],
    agua_litros: 3, bebidas_regulares: [],
    freq_doces: 3, freq_fritos: 3, petisca_entre_refeicoes: '', o_que_petisca: [], momentos_vontade_comer: [],
    freq_emocoes: { cansaco: 3, ansiedade: 3, tristeza: 3, raiva: 3, vazio: 3, solidao: 3, negacao: 3 },
    emocao_dominante: '', procura_quando_come: [], como_sente_depois: '',
    quando_comecou_padrao: '', ja_tentou_sem_comida: '', o_que_tentou: '',
    nivel_actividade: '', faz_exercicio: '', tipo_exercicio: [], horas_sono: '', qualidade_sono: 3,
    situacao_profissional: '', situacao_familiar: '', filhos_pequenos: '', quem_cozinha: '', nivel_stress: 3,
    o_que_atrapalha: '', historico_emagrecimento: '', o_que_faz_sair_plano: [],
    quantas_dietas: '', dieta_que_funcionou: '',
    abordagem_preferida: '', disposta_jejum: '', preferencias_alimentares: [],
    medir_pesar_comida: '', acesso_ingredientes: '',
    nivel_acompanhamento: '', duracao_programa: '', forma_pagamento: '',
    codigo_promocional: '', como_conheceu: '',
    info_adicional: '', o_que_mais_espera: '', nivel_prontidao: 5, confirmacoes: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definição das secções
  const sections = [
    { title: 'Bem-vinda ao Vitalis 💪', isWelcome: true },
    { title: 'Dados Pessoais', fields: ['nome_completo', 'email', 'whatsapp', 'idade', 'sexo'] },
    { title: 'Medidas Corporais', fields: ['altura_cm', 'peso_actual_kg', 'peso_meta_kg', 'cintura_cm', 'anca_cm'] },
    { title: 'Objectivo e Prazo', fields: ['objectivo_principal', 'prazo', 'porque_importante'] },
    { title: 'Saúde', fields: ['condicoes_saude', 'gravida_amamentar', 'medicacao', 'medicacao_quais', 'alergias_restricoes'] },
    { title: 'Hábitos Alimentares', fields: ['num_refeicoes_dia', 'pequeno_almoco', 'onde_come', 'tipos_comida_frequente', 'agua_litros', 'bebidas_regulares'] },
    { title: 'Padrões Alimentares', fields: ['freq_doces', 'freq_fritos', 'petisca_entre_refeicoes', 'o_que_petisca', 'momentos_vontade_comer'] },
    { title: 'Diagnóstico Emocional ⭐', fields: ['freq_emocoes', 'emocao_dominante', 'procura_quando_come', 'como_sente_depois', 'quando_comecou_padrao', 'ja_tentou_sem_comida', 'o_que_tentou'] },
    { title: 'Actividade Física', fields: ['nivel_actividade', 'faz_exercicio', 'tipo_exercicio', 'horas_sono', 'qualidade_sono'] },
    { title: 'Estilo de Vida', fields: ['situacao_profissional', 'situacao_familiar', 'filhos_pequenos', 'quem_cozinha', 'nivel_stress'] },
    { title: 'Desafios e História', fields: ['o_que_atrapalha', 'historico_emagrecimento', 'o_que_faz_sair_plano', 'quantas_dietas', 'dieta_que_funcionou'] },
    { title: 'Abordagem Nutricional', fields: ['abordagem_preferida', 'disposta_jejum', 'preferencias_alimentares', 'medir_pesar_comida', 'acesso_ingredientes'] },
    { title: 'Pacote e Pagamento', fields: ['nivel_acompanhamento', 'duracao_programa', 'forma_pagamento', 'codigo_promocional', 'como_conheceu'] },
    { title: 'Observações Finais', fields: ['info_adicional', 'o_que_mais_espera', 'nivel_prontidao', 'confirmacoes'] },
    { title: 'Obrigada! 🎉', isThankYou: true }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(i => i !== value)
        : [...prev[field], value]
    }));
  };

  const handleEmocaoChange = (emocao, value) => {
    setFormData(prev => ({
      ...prev,
      freq_emocoes: { ...prev.freq_emocoes, [emocao]: value }
    }));
  };

  const renderField = (field) => {
    const value = formData[field];
    const error = errors[field];

    // Helper components
    const Label = ({ children, required }) => (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {children} {required && <span className="text-red-500">*</span>}
      </label>
    );

    const Input = ({ type = 'text', placeholder, required }) => (
      <input
        type={type}
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
      />
    );

    const TextArea = ({ placeholder, rows = 4 }) => (
      <textarea
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
      />
    );

    const Radio = ({ options }) => (
      <div className="space-y-2">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-orange-50 transition-colors">
            <input
              type="radio"
              checked={value === opt.value}
              onChange={() => handleChange(field, opt.value)}
              className="w-5 h-5 text-orange-500"
            />
            <span className="text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    );

    const Checkbox = ({ options }) => (
      <div className="space-y-2">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-orange-50 transition-colors">
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => handleArrayToggle(field, opt.value)}
              className="w-5 h-5 text-orange-500 rounded"
            />
            <span className="text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    );

    const Slider = ({ min, max, labelMin, labelMax }) => (
      <div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => handleChange(field, parseInt(e.target.value))}
          className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{labelMin}</span>
          <span className="font-bold text-orange-600">{value}</span>
          <span>{labelMax}</span>
        </div>
      </div>
    );

    // TODOS OS CAMPOS DEFINIDOS
    const fieldDefinitions = {
      // Secção 1
      nome_completo: () => (
        <div>
          <Label required>Nome completo</Label>
          <Input placeholder="Nome completo" required />
        </div>
      ),
      email: () => (
        <div>
          <Label required>Email</Label>
          <Input type="email" placeholder="exemplo@email.com" required />
        </div>
      ),
      whatsapp: () => (
        <div>
          <Label required>Número de WhatsApp</Label>
          <Input type="tel" placeholder="+258 84 xxx xxxx" required />
        </div>
      ),
      idade: () => (
        <div>
          <Label required>Idade</Label>
          <Input type="number" placeholder="Em anos" required />
        </div>
      ),
      sexo: () => (
        <div>
          <Label required>Sexo</Label>
          <Radio options={[
            { value: 'feminino', label: 'Feminino' },
            { value: 'masculino', label: 'Masculino' }
          ]} />
        </div>
      ),

      // Secção 2
      altura_cm: () => (
        <div>
          <Label required>Altura (cm)</Label>
          <Input type="number" placeholder="Ex: 165" required />
        </div>
      ),
      peso_actual_kg: () => (
        <div>
          <Label required>Peso actual (kg)</Label>
          <Input type="number" placeholder="Ex: 72" required />
        </div>
      ),
      peso_meta_kg: () => (
        <div>
          <Label required>Meta de peso (kg)</Label>
          <Input type="number" placeholder="Ex: 65" required />
        </div>
      ),
      cintura_cm: () => (
        <div>
          <Label>Cintura (cm) - opcional</Label>
          <Input type="number" placeholder="Ao nível do umbigo" />
        </div>
      ),
      anca_cm: () => (
        <div>
          <Label>Anca (cm) - opcional</Label>
          <Input type="number" placeholder="Zona mais larga" />
        </div>
      ),

      // Secção 3
      objectivo_principal: () => (
        <div>
          <Label required>Qual é o teu objectivo principal?</Label>
          <Radio options={[
            { value: 'perder_peso', label: 'Perder peso' },
            { value: 'ganhar_massa', label: 'Ganhar massa muscular' },
            { value: 'melhorar_saude', label: 'Melhorar saúde geral' },
            { value: 'mais_energia', label: 'Mais energia no dia-a-dia' },
            { value: 'relacao_comida', label: 'Melhorar relação com comida' }
          ]} />
        </div>
      ),
      prazo: () => (
        <div>
          <Label required>Em quanto tempo?</Label>
          <Radio options={[
            { value: '3_meses', label: '3 meses' },
            { value: '6_meses', label: '6 meses' },
            { value: '9_meses', label: '9 meses' },
            { value: '12_meses', label: '12 meses' },
            { value: 'sem_pressa', label: 'Sem pressa — quero fazer bem feito' }
          ]} />
        </div>
      ),
      porque_importante: () => (
        <div>
          <Label required>Porque é importante AGORA?</Label>
          <TextArea placeholder="Ex: Casamento, saúde, auto-estima..." />
        </div>
      ),

      // Secção 4
      condicoes_saude: () => (
        <div>
          <Label required>Condições de saúde?</Label>
          <Checkbox options={[
            { value: 'diabetes', label: 'Diabetes (tipo 1 ou 2)' },
            { value: 'hipertensao', label: 'Hipertensão (pressão alta)' },
            { value: 'colesterol', label: 'Colesterol alto' },
            { value: 'tireoide', label: 'Problemas tireoide' },
            { value: 'sop', label: 'SOP (Síndrome Ovários Policísticos)' },
            { value: 'cardiaca', label: 'Doença cardíaca' },
            { value: 'renal', label: 'Problemas renais' },
            { value: 'hepatica', label: 'Problemas hepáticos (fígado)' },
            { value: 'nenhuma', label: 'Nenhuma das anteriores' }
          ]} />
        </div>
      ),
      gravida_amamentar: () => (
        <div>
          <Label required>Estás grávida ou a amamentar?</Label>
          <Radio options={[
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' }
          ]} />
        </div>
      ),
      medicacao: () => (
        <div>
          <Label required>Tomas medicação regularmente?</Label>
          <Radio options={[
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' }
          ]} />
        </div>
      ),
      medicacao_quais: () => formData.medicacao === 'sim' && (
        <div>
          <Label required>Que medicação?</Label>
          <TextArea placeholder="Lista os medicamentos e para que são" />
        </div>
      ),
      alergias_restricoes: () => (
        <div>
          <Label required>Alergias ou restrições?</Label>
          <Checkbox options={[
            { value: 'lactose', label: 'Intolerância lactose' },
            { value: 'gluten', label: 'Intolerância glúten/celíaca' },
            { value: 'frutos_secos', label: 'Alergia frutos secos' },
            { value: 'marisco', label: 'Alergia marisco' },
            { value: 'vegetariana', label: 'Vegetariana' },
            { value: 'vegana', label: 'Vegana' },
            { value: 'sem_carne_vermelha', label: 'Não como carne vermelha' },
            { value: 'sem_porco', label: 'Não como porco (religioso)' },
            { value: 'nenhuma', label: 'Nenhuma restrição' }
          ]} />
        </div>
      ),

      // Secção 5
      num_refeicoes_dia: () => (
        <div>
          <Label required>Quantas refeições/dia?</Label>
          <Radio options={[
            { value: '1-2', label: '1-2 refeições' },
            { value: '3', label: '3 refeições' },
            { value: '4-5', label: '4-5 refeições' },
            { value: '6+', label: '6+ refeições' },
            { value: 'varia', label: 'Varia muito / Não tenho rotina' }
          ]} />
        </div>
      ),
      pequeno_almoco: () => (
        <div>
          <Label required>Pequeno-almoço?</Label>
          <Radio options={[
            { value: 'sempre', label: 'Sim, sempre' },
            { value: 'as_vezes', label: 'Às vezes' },
            { value: 'raramente', label: 'Raramente' },
            { value: 'nunca', label: 'Nunca — não tenho fome de manhã' },
            { value: 'so_cafe', label: 'Só café' }
          ]} />
        </div>
      ),
      onde_come: () => (
        <div>
          <Label required>Onde comes mais?</Label>
          <Checkbox options={[
            { value: 'casa_cozinho', label: 'Em casa (cozinho eu)' },
            { value: 'casa_outros', label: 'Em casa (outros cozinham)' },
            { value: 'restaurantes', label: 'Restaurantes' },
            { value: 'cantina', label: 'Cantina trabalho' },
            { value: 'fastfood', label: 'Fast-food' },
            { value: 'delivery', label: 'Comida delivery' },
            { value: 'rua', label: 'Na rua / vendedores ambulantes' }
          ]} />
        </div>
      ),
      tipos_comida_frequente: () => (
        <div>
          <Label required>Que comida comes MAIS?</Label>
          <Checkbox options={[
            { value: 'arroz', label: 'Arroz branco' },
            { value: 'xima', label: 'Xima' },
            { value: 'massa', label: 'Massa' },
            { value: 'pao', label: 'Pão' },
            { value: 'batata', label: 'Batata/batata-doce' },
            { value: 'frango', label: 'Frango' },
            { value: 'peixe', label: 'Peixe' },
            { value: 'carne_vermelha', label: 'Carne vermelha' },
            { value: 'ovos', label: 'Ovos' },
            { value: 'feijao', label: 'Feijão/lentilhas' },
            { value: 'legumes', label: 'Legumes/saladas' },
            { value: 'fruta', label: 'Fruta' }
          ]} />
        </div>
      ),
      agua_litros: () => (
        <div>
          <Label required>Quanta água bebes/dia?</Label>
          <Slider min={1} max={5} labelMin="Menos de 1L" labelMax="Mais de 3L" />
        </div>
      ),
      bebidas_regulares: () => (
        <div>
          <Label required>Bebidas regulares:</Label>
          <Checkbox options={[
            { value: 'agua', label: 'Água (maioria)' },
            { value: 'cafe_sem', label: 'Café (sem açúcar)' },
            { value: 'cafe_com', label: 'Café (com açúcar)' },
            { value: 'cha', label: 'Chá' },
            { value: 'refri_normal', label: 'Refrigerantes normais' },
            { value: 'refri_zero', label: 'Refrigerantes zero' },
            { value: 'sumos_naturais', label: 'Sumos naturais' },
            { value: 'sumos_pacote', label: 'Sumos de pacote' },
            { value: 'alcool', label: 'Álcool (vinho, cerveja)' }
          ]} />
        </div>
      ),

      // Secção 6
      freq_doces: () => (
        <div>
          <Label required>Frequência de doces/sobremesas:</Label>
          <Slider min={1} max={5} labelMin="Raramente" labelMax="Todos os dias" />
        </div>
      ),
      freq_fritos: () => (
        <div>
          <Label required>Frequência de fritos/salgados:</Label>
          <Slider min={1} max={5} labelMin="Raramente" labelMax="Todos os dias" />
        </div>
      ),
      petisca_entre_refeicoes: () => (
        <div>
          <Label required>Petiscas entre refeições?</Label>
          <Radio options={[
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' }
          ]} />
        </div>
      ),
      o_que_petisca: () => formData.petisca_entre_refeicoes === 'sim' && (
        <div>
          <Label required>O que petiscas?</Label>
          <Checkbox options={[
            { value: 'fruta', label: 'Fruta' },
            { value: 'frutos_secos', label: 'Frutos secos' },
            { value: 'iogurte', label: 'Iogurte' },
            { value: 'bolachas', label: 'Bolachas/biscoitos' },
            { value: 'pao', label: 'Pão' },
            { value: 'salgados', label: 'Salgados' },
            { value: 'doces', label: 'Doces/chocolate' },
            { value: 'batatas_fritas', label: 'Batatas fritas/snacks' }
          ]} />
        </div>
      ),
      momentos_vontade_comer: () => (
        <div>
          <Label required>Quando sentes MAIS vontade de comer (sem fome)?</Label>
          <Checkbox options={[
            { value: 'stress', label: 'Quando estou stressada' },
            { value: 'aborrecida', label: 'Quando estou aborrecida/com tédio' },
            { value: 'triste', label: 'Quando estou triste' },
            { value: 'ansiosa', label: 'Quando estou ansiosa' },
            { value: 'noite_tv', label: 'À noite a ver TV' },
            { value: 'fim_semana', label: 'Fim-de-semana' },
            { value: 'depois_jantar', label: 'Depois jantar' },
            { value: 'ver_outros', label: 'Quando vejo outras pessoas a comer' },
            { value: 'nao_identifico', label: 'Não identifico padrão claro' }
          ]} />
        </div>
      ),

      // Secção 7 - DIAGNÓSTICO EMOCIONAL
      freq_emocoes: () => (
        <div>
          <Label required>Frequência de cada emoção quando pensas em comida:</Label>
          <div className="space-y-4 bg-orange-50 p-6 rounded-xl">
            {[
              { key: 'cansaco', label: '🔋 CANSAÇO', desc: 'Sem energia, exausta, como para ter energia' },
              { key: 'ansiedade', label: '🌀 ANSIEDADE', desc: 'Nervosa, preocupada, como para acalmar' },
              { key: 'tristeza', label: '💧 TRISTEZA', desc: 'Em baixo, melancólica, como para conforto' },
              { key: 'raiva', label: '🔥 RAIVA', desc: 'Frustrada, irritada, como para descarregar' },
              { key: 'vazio', label: '◯ VAZIO', desc: 'Sem propósito, entediada, como para preencher' },
              { key: 'solidao', label: '🌑 SOLIDÃO', desc: 'Sozinha, isolada, como para companhia' },
              { key: 'negacao', label: '🚫 NEGAÇÃO', desc: 'Evito pensar no que como' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="bg-white p-4 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">{label}</div>
                <div className="text-sm text-gray-600 mb-3">{desc}</div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.freq_emocoes[key]}
                  onChange={(e) => handleEmocaoChange(key, parseInt(e.target.value))}
                  className="w-full h-2 bg-orange-200 rounded-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Nunca</span>
                  <span className="font-bold text-orange-600">{formData.freq_emocoes[key]}</span>
                  <span>Sempre</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),

      emocao_dominante: () => (
        <div>
          <Label required>Qual emoção te DOMINA mais quando sais do plano?</Label>
          <Radio options={[
            { value: 'cansaco', label: '🔋 Cansaço (como porque não tenho energia para resistir)' },
            { value: 'ansiedade', label: '🌀 Ansiedade (como para acalmar nervos)' },
            { value: 'tristeza', label: '💧 Tristeza (como para consolo)' },
            { value: 'raiva', label: '🔥 Raiva/Frustração (como para descarregar)' },
            { value: 'vazio', label: '◯ Vazio/Tédio (como para preencher tempo)' },
            { value: 'solidao', label: '🌑 Solidão (como para companhia)' },
            { value: 'negacao', label: '🚫 Negação (evito pensar, como sem controlo)' },
            { value: 'nao_sei', label: 'Não sei identificar' }
          ]} />
        </div>
      ),

      procura_quando_come: () => (
        <div>
          <Label required>Quando tens vontade FORTE, o que procuras?</Label>
          <Checkbox options={[
            { value: 'energia_rapida', label: 'Energia rápida (açúcar, cafeína)' },
            { value: 'conforto', label: 'Conforto/calor (comida quente, macia)' },
            { value: 'crocante', label: 'Crocante/textura (para descarregar tensão)' },
            { value: 'doce', label: 'Doce (para recompensa/prazer)' },
            { value: 'salgado', label: 'Salgado (para satisfação imediata)' },
            { value: 'mastigar', label: 'Algo para mastigar (ocupar boca/mãos)' },
            { value: 'nao_identifico', label: 'Não identifico padrão' }
          ]} />
        </div>
      ),

      como_sente_depois: () => (
        <div>
          <Label required>Como te sentes DEPOIS de comer emocionalmente?</Label>
          <Radio options={[
            { value: 'culpada', label: 'Culpada e arrependida' },
            { value: 'temp_melhor', label: 'Temporariamente melhor, depois pior' },
            { value: 'entorpecida', label: 'Entorpecida/desligada' },
            { value: 'mais_ansiosa', label: 'Ainda mais ansiosa' },
            { value: 'desconfortavel', label: 'Física e emocionalmente desconfortável' },
            { value: 'nao_paro', label: 'Não consigo parar depois de começar' },
            { value: 'varia', label: 'Varia muito' }
          ]} />
        </div>
      ),

      quando_comecou_padrao: () => (
        <div>
          <Label required>Quando começou este padrão?</Label>
          <Radio options={[
            { value: 'infancia', label: 'Infância/adolescência' },
            { value: 'evento_traumatico', label: 'Depois de evento traumático' },
            { value: 'dietas', label: 'Depois de dietas restritivas' },
            { value: 'gradual', label: 'Gradualmente ao longo dos anos' },
            { value: 'sempre', label: 'Sempre foi assim' },
            { value: 'nao_sei', label: 'Não sei' }
          ]} />
        </div>
      ),

      ja_tentou_sem_comida: () => (
        <div>
          <Label required>Já tentaste lidar com estas emoções SEM comida?</Label>
          <Radio options={[
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' }
          ]} />
        </div>
      ),

      o_que_tentou: () => formData.ja_tentou_sem_comida === 'sim' && (
        <div>
          <Label>O que já tentaste?</Label>
          <TextArea placeholder="Ex: meditação, exercício, terapia..." />
        </div>
      ),

      // Secção 8
      nivel_actividade: () => (
        <div>
          <Label required>Nível de actividade física:</Label>
          <Radio options={[
            { value: 'sedentario', label: 'Sedentário — Trabalho sentada, pouco movimento' },
            { value: 'ligeiro', label: 'Ligeiramente activo — Caminho um pouco' },
            { value: 'moderado', label: 'Moderadamente activo — Exercício 1-3x/semana' },
            { value: 'muito_activo', label: 'Muito activo — Exercício 4-6x/semana' },
            { value: 'extremo', label: 'Extremamente activo — Exercício diário' }
          ]} />
        </div>
      ),

      faz_exercicio: () => (
        <div>
          <Label required>Fazes exercício regularmente?</Label>
          <Radio options={[
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' }
          ]} />
        </div>
      ),

      tipo_exercicio: () => formData.faz_exercicio === 'sim' && (
        <div>
          <Label required>Que tipo de exercício?</Label>
          <Checkbox options={[
            { value: 'ginasio', label: 'Ginásio (musculação)' },
            { value: 'cardio', label: 'Cardio (corrida, bicicleta)' },
            { value: 'aulas', label: 'Aulas grupo (zumba, spinning)' },
            { value: 'caminhadas', label: 'Caminhadas' },
            { value: 'yoga', label: 'Yoga/Pilates' },
            { value: 'desporto', label: 'Desporto (futebol, ténis)' },
            { value: 'danca', label: 'Dança' },
            { value: 'natacao', label: 'Natação' },
            { value: 'casa', label: 'Treino em casa' }
          ]} />
        </div>
      ),

      horas_sono: () => (
        <div>
          <Label required>Horas de sono/noite:</Label>
          <Radio options={[
            { value: '<5', label: 'Menos de 5 horas' },
            { value: '5-6', label: '5-6 horas' },
            { value: '6-7', label: '6-7 horas' },
            { value: '7-8', label: '7-8 horas' },
            { value: '8+', label: 'Mais de 8 horas' }
          ]} />
        </div>
      ),

      qualidade_sono: () => (
        <div>
          <Label required>Qualidade do sono:</Label>
          <Slider min={1} max={5} labelMin="Muito má" labelMax="Excelente" />
        </div>
      ),

      // Secção 9
      situacao_profissional: () => (
        <div>
          <Label required>Situação profissional:</Label>
          <Radio options={[
            { value: 'tempo_inteiro_escritorio', label: 'Trabalho tempo inteiro (escritório)' },
            { value: 'tempo_inteiro_activo', label: 'Trabalho tempo inteiro (activo/em pé)' },
            { value: 'part_time', label: 'Trabalho part-time' },
            { value: 'remoto', label: 'Trabalho remoto/casa' },
            { value: 'estudante', label: 'Estudante' },
            { value: 'desempregada', label: 'Desempregada' },
            { value: 'reformada', label: 'Reformada' },
            { value: 'dona_casa', label: 'Dona de casa' }
          ]} />
        </div>
      ),

      situacao_familiar: () => (
        <div>
          <Label required>Situação familiar:</Label>
          <Radio options={[
            { value: 'sozinha', label: 'Vivo sozinha' },
            { value: 'parceiro', label: 'Vivo com parceiro/marido' },
            { value: 'filhos', label: 'Vivo com filhos' },
            { value: 'familia', label: 'Vivo com família (pais/irmãos)' },
            { value: 'colegas', label: 'Vivo com colegas de casa' }
          ]} />
        </div>
      ),

      filhos_pequenos: () => (
        <div>
          <Label required>Tens filhos pequenos?</Label>
          <Radio options={[
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' }
          ]} />
        </div>
      ),

      quem_cozinha: () => (
        <div>
          <Label required>Quem cozinha?</Label>
          <Radio options={[
            { value: 'eu', label: 'Eu' },
            { value: 'parceiro', label: 'Parceiro/família' },
            { value: 'empregada', label: 'Empregada' },
            { value: 'revezamos', label: 'Revezamos' },
            { value: 'ninguem', label: 'Ninguém — como fora/delivery' }
          ]} />
        </div>
      ),

      nivel_stress: () => (
        <div>
          <Label required>Nível de STRESS:</Label>
          <Slider min={1} max={5} labelMin="Baixo — Vida tranquila" labelMax="Muito alto — Sobrecarregada" />
        </div>
      ),

      // Secção 10
      o_que_atrapalha: () => (
        <div>
          <Label required>O que MAIS te atrapalha?</Label>
          <TextArea placeholder="Ex: Falta de tempo, ansiedade, comer emocional..." rows={4} />
        </div>
      ),

      historico_emagrecimento: () => (
        <div>
          <Label>Já tentaste emagrecer antes?</Label>
          <TextArea placeholder="Conta brevemente: o que funcionou e o que NÃO funcionou" rows={4} />
        </div>
      ),

      o_que_faz_sair_plano: () => (
        <div>
          <Label required>O que te faz SAIR DO PLANO?</Label>
          <Checkbox options={[
            { value: 'stress', label: 'Stress / Ansiedade' },
            { value: 'social', label: 'Eventos sociais' },
            { value: 'fim_semana', label: 'Fim-de-semana' },
            { value: 'emocional', label: 'Comer emocional (tristeza, tédio)' },
            { value: 'tempo', label: 'Falta de tempo para cozinhar' },
            { value: 'familia', label: 'Família (comem diferente de mim)' },
            { value: 'viagens', label: 'Viagens' },
            { value: 'tpm', label: 'TPM / Período menstrual' },
            { value: 'nao_sei', label: 'Não sei identificar' }
          ]} />
        </div>
      ),

      quantas_dietas: () => (
        <div>
          <Label required>Quantas dietas já fizeste?</Label>
          <Radio options={[
            { value: 'nunca', label: 'Nunca fiz dieta formal' },
            { value: '1-2', label: '1-2 vezes' },
            { value: '3-5', label: '3-5 vezes' },
            { value: '6-10', label: '6-10 vezes' },
            { value: '10+', label: 'Mais de 10 vezes (efeito yo-yo)' }
          ]} />
        </div>
      ),

      dieta_que_funcionou: () => (
        <div>
          <Label>Qual dieta MAIS funcionou?</Label>
          <TextArea placeholder="E porque parou de funcionar?" rows={3} />
        </div>
      ),

      // Secção 11
      abordagem_preferida: () => (
        <div>
          <Label required>Abordagem mais REALISTA para ti:</Label>
          <Radio options={[
            { value: 'keto_jejum', label: 'Keto com Jejum 16:8 — Baixo em hidratos, 2-3 refeições/dia' },
            { value: 'lowcarb', label: 'Low-carb moderado — Hidratos controlados, 3-4 refeições' },
            { value: 'equilibrado', label: 'Equilibrado — Todos os grupos, porções controladas' },
            { value: 'nao_sei', label: 'Não sei — quero que me aconselhem' }
          ]} />
        </div>
      ),

      disposta_jejum: () => (
        <div>
          <Label required>Disposta a jejum intermitente?</Label>
          <p className="text-sm text-gray-600 mb-3">Ex: não comer entre 20h e 12h</p>
          <Radio options={[
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' }
          ]} />
        </div>
      ),

      preferencias_alimentares: () => (
        <div>
          <Label required>Preferências alimentares:</Label>
          <Checkbox options={[
            { value: 'muita_proteina', label: 'Gosto de muita proteína (carne, peixe, ovos)' },
            { value: 'massas_arroz', label: 'Gosto de massas/arroz/pão' },
            { value: 'doces', label: 'Adoro doces (difícil eliminar)' },
            { value: 'simples', label: 'Prefiro comida simples' },
            { value: 'experimentar', label: 'Gosto de experimentar receitas novas' },
            { value: 'pouco_tempo', label: 'Tenho pouco tempo para cozinhar' },
            { value: 'rapida', label: 'Preciso comida rápida e prática' }
          ]} />
        </div>
      ),

      medir_pesar_comida: () => (
        <div>
          <Label required>Medir/pesar comida:</Label>
          <Radio options={[
            { value: 'confortavel', label: 'Confortável — já fiz antes' },
            { value: 'disposta', label: 'Disposta a aprender' },
            { value: 'evitar', label: 'Prefiro evitar (muito trabalho)' },
            { value: 'contra', label: 'Totalmente contra (demasiado obsessivo)' }
          ]} />
        </div>
      ),

      acesso_ingredientes: () => (
        <div>
          <Label required>Acesso a ingredientes:</Label>
          <Radio options={[
            { value: 'completo', label: 'Sim, supermercado completo perto' },
            { value: 'limitacoes', label: 'Sim mas com limitações' },
            { value: 'limitado', label: 'Não, opções limitadas' },
            { value: 'orcamento', label: 'Depende do orçamento' }
          ]} />
        </div>
      ),

      // Secção 12
      nivel_acompanhamento: () => (
        <div>
          <Label required>Nível de acompanhamento:</Label>
          <div className="space-y-3">
            {[
              { value: 'essencial', label: '📱 Essencial', price: '2.850 MT/mês', desc: 'Plano + app + acompanhamento automático' },
              { value: 'premium', label: '📞 Premium', price: '4.275 MT/mês', desc: 'Essencial + 2 chamadas mensais Vivianne' },
              { value: 'vip', label: '💬 VIP', price: '5.700 MT/mês', desc: 'Premium + WhatsApp directo 24/7' }
            ].map(opt => (
              <label key={opt.value} className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${value === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                <input
                  type="radio"
                  checked={value === opt.value}
                  onChange={() => handleChange(field, opt.value)}
                  className="hidden"
                />
                <div className="font-semibold text-lg text-gray-800">{opt.label}</div>
                <div className="text-orange-600 font-bold">{opt.price}</div>
                <div className="text-sm text-gray-600">{opt.desc}</div>
              </label>
            ))}
          </div>
        </div>
      ),

      duracao_programa: () => (
        <div>
          <Label required>Duração:</Label>
          <Radio options={[
            { value: '3', label: '3 meses' },
            { value: '6', label: '6 meses (10% desconto)' },
            { value: '9', label: '9 meses (15% desconto)' },
            { value: '12', label: '12 meses (20% desconto)' }
          ]} />
        </div>
      ),

      forma_pagamento: () => (
        <div>
          <Label required>Forma de pagamento:</Label>
          <Radio options={[
            { value: 'mensal_mpesa', label: 'Mensal (débito automático M-Pesa)' },
            { value: 'mensal_banco', label: 'Mensal (transferência bancária)' },
            { value: 'total', label: 'Totalidade adiantada (5% desconto extra)' }
          ]} />
        </div>
      ),

      codigo_promocional: () => (
        <div>
          <Label>Código promocional (opcional):</Label>
          <Input placeholder="Ex: AMIGA10, COMECAR15..." />
        </div>
      ),

      como_conheceu: () => (
        <div>
          <Label required>Como conheceste o Vitalis?</Label>
          <Radio options={[
            { value: 'indicacao', label: 'Indicação de amiga/conhecido' },
            { value: 'instagram', label: 'Instagram' },
            { value: 'facebook', label: 'Facebook' },
            { value: 'google', label: 'Google' },
            { value: 'ja_cliente', label: 'Já fui cliente antes' },
            { value: 'outro', label: 'Outro' }
          ]} />
        </div>
      ),

      // Secção 13
      info_adicional: () => (
        <div>
          <Label>Informação adicional (opcional):</Label>
          <TextArea placeholder="Preocupações, expectativas, histórico médico relevante..." rows={4} />
        </div>
      ),

      o_que_mais_espera: () => (
        <div>
          <Label required>O que MAIS esperas ganhar?</Label>
          <TextArea placeholder="Sê específica..." rows={4} />
        </div>
      ),

      nivel_prontidao: () => (
        <div>
          <Label required>Quão PRONTA estás para fazer mudanças? (1-10)</Label>
          <Slider min={1} max={10} labelMin="1 - Ainda não sei" labelMax="10 - Totalmente comprometida" />
        </div>
      ),

      confirmacoes: () => (
        <div>
          <Label required>Confirmações:</Label>
          <div className="space-y-3 bg-orange-50 p-4 rounded-lg">
            {[
              'Entendo que este é um programa de coaching nutricional e não substitui acompanhamento médico',
              'Comprometo-me a seguir o programa com honestidade e consistência',
              'Autorizo o contacto via WhatsApp para acompanhamento',
              'Li e aceito os Termos de Serviço e Política de Privacidade'
            ].map((text, idx) => (
              <label key={idx} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(text)}
                  onChange={() => handleArrayToggle(field, text)}
                  className="w-5 h-5 mt-1 text-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">{text}</span>
              </label>
            ))}
          </div>
          {value.length < 4 && (
            <p className="text-sm text-red-500 mt-2">Deves aceitar todas as confirmações</p>
          )}
        </div>
      )
    };

    const Component = fieldDefinitions[field];
    return Component ? (
      <div key={field} className="mb-6">
        {Component()}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    ) : null;
  };

  // Navigation
  const handleNext = () => {
    // Simplified validation for now
    setCurrentSection(prev => Math.min(prev + 1, sections.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Por favor, faça login primeiro');
        return;
      }

      // Submit to Supabase
      const { error } = await supabase.from('vitalis_intake').insert([{
        user_id: user.id,
        ...formData,
        // Convert arrays to JSON
        condicoes_saude: JSON.stringify(formData.condicoes_saude),
        alergias_restricoes: JSON.stringify(formData.alergias_restricoes),
        onde_come: JSON.stringify(formData.onde_come),
        tipos_comida_frequente: JSON.stringify(formData.tipos_comida_frequente),
        bebidas_regulares: JSON.stringify(formData.bebidas_regulares),
        o_que_petisca: JSON.stringify(formData.o_que_petisca),
        momentos_vontade_comer: JSON.stringify(formData.momentos_vontade_comer),
        freq_emocoes: JSON.stringify(formData.freq_emocoes),
        procura_quando_come: JSON.stringify(formData.procura_quando_come),
        tipo_exercicio: JSON.stringify(formData.tipo_exercicio),
        o_que_faz_sair_plano: JSON.stringify(formData.o_que_faz_sair_plano),
        preferencias_alimentares: JSON.stringify(formData.preferencias_alimentares),
        confirmacoes: JSON.stringify(formData.confirmacoes)
      }]);

      if (error) throw error;
      handleNext(); // Go to thank you screen
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao submeter. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const section = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-amber-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl pt-20">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-orange-900 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {section.title}
          </h1>
          {!section.isWelcome && !section.isThankYou && (
            <p className="text-sm text-gray-600 mt-4">
              Secção {currentSection} de {sections.length - 2}
            </p>
          )}
        </div>

        {/* Welcome */}
        {section.isWelcome && (
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <div className="text-6xl mb-6">🌱</div>
            <p className="text-lg text-gray-700 mb-8">
              Responde com honestidade. Não há respostas certas ou erradas.<br/>
              <span className="font-semibold text-orange-600">⏱️ 10-15 minutos</span>
            </p>
            <button onClick={handleNext} className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
              Começar →
            </button>
          </div>
        )}

        {/* Thank You */}
        {section.isThankYou && (
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-orange-900 mb-4">
                Muito feliz por começares esta jornada!
              </h2>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex gap-3"><span>1️⃣</span><p>Análise do perfil (24-48h)</p></div>
              <div className="flex gap-3"><span>2️⃣</span><p>Guia de Preparação por WhatsApp</p></div>
              <div className="flex gap-3"><span>3️⃣</span><p>Plano personalizado</p></div>
              <div className="flex gap-3"><span>4️⃣</span><p>Dia 1 da transformação</p></div>
            </div>
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-6 mb-8">
              <p className="font-semibold text-orange-900 mb-2">⭐ Padrão emocional identificado</p>
              <p>Ferramentas específicas no <strong>Espaço de Retorno</strong> da app.</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-orange-900 text-xl">Vivianne Saraiva</p>
              <p className="text-sm text-gray-600">Vitalis — Transformando Vidas 💚</p>
            </div>
          </div>
        )}

        {/* Form */}
        {!section.isWelcome && !section.isThankYou && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              {section.fields.map(field => renderField(field))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t">
              {currentSection > 1 && (
                <button onClick={handlePrevious} className="px-6 py-3 border-2 border-orange-300 text-orange-700 rounded-full font-semibold hover:bg-orange-50">
                  ← Anterior
                </button>
              )}
              <div className={currentSection === 1 ? 'ml-auto' : ''}>
                {currentSection < sections.length - 2 ? (
                  <button onClick={handleNext} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
                    Continuar →
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:shadow-lg disabled:opacity-50">
                    {isSubmitting ? 'A enviar...' : 'Finalizar ✓'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VitalisIntakeQuestionnaire;
