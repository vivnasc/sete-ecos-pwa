/**
 * Script para criar utilizador de teste com intake e plano completos
 *
 * Uso:
 * node scripts/criar-usuario-teste-vitalis.js [email_opcional]
 *
 * Exemplo:
 * node scripts/criar-usuario-teste-vitalis.js teste@vitalis.local
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não configurada');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function criarUsuarioTeste() {
  const email = process.argv[2] || `teste-${Date.now()}@vitalis.local`;
  const senha = 'teste123456'; // Senha padrão para testes

  console.log('\n🧪 Criando utilizador de teste Vitalis...\n');
  console.log('📧 Email:', email);
  console.log('🔑 Senha:', senha);
  console.log('');

  try {
    // 1. Criar auth user
    console.log('1️⃣ Criando utilizador no Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: senha,
      options: {
        data: {
          nome: 'Teste Vitalis'
        }
      }
    });

    if (authError) {
      // Se já existe, tentar fazer login
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Utilizador já existe. Tentando login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: senha
        });

        if (loginError) {
          throw new Error('Utilizador existe mas senha incorreta. Tente outro email.');
        }

        authData.user = loginData.user;
        console.log('✅ Login bem-sucedido!');
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Utilizador criado no Auth!');
    }

    const userId = authData.user.id;

    // 2. Criar registo em users
    console.log('2️⃣ Criando registo em users...');
    await supabase.from('users').upsert({
      auth_id: userId,
      email: email,
      nome: 'Teste Vitalis',
      created_at: new Date().toISOString()
    }).select();
    console.log('✅ Registo em users criado!');

    // 3. Criar cliente Vitalis com subscription
    console.log('3️⃣ Criando cliente Vitalis...');
    const clientData = {
      user_id: userId,
      objectivo_principal: 'emagrecer',
      peso_inicial: 75.0,
      peso_actual: 75.0,
      peso_meta: 65.0,
      emocao_dominante: 'ansiedade',
      prontidao_1a10: 8,
      status: 'novo',
      subscription_status: 'trial', // Dar acesso trial
      trial_start: new Date().toISOString(),
      trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias
      fase_actual: 'inducao',
      data_inicio: new Date().toISOString().split('T')[0],
      pacote: 'essencial',
      duracao_programa: '6_meses',
      imc_inicial: 24.2,
      imc_actual: 24.2
    };

    await supabase.from('vitalis_clients').upsert(clientData).select();
    console.log('✅ Cliente Vitalis criado com trial!');

    // 4. Criar intake completo
    console.log('4️⃣ Criando intake completo...');
    const intakeData = {
      user_id: userId,
      nome: 'Teste Vitalis',
      email: email,
      whatsapp: '+258840000000',
      idade: 35,
      sexo: 'feminino',
      altura_cm: 165,
      peso_actual: 75.0,
      peso_meta: 65.0,
      cintura_cm: 85,
      anca_cm: 100,
      objectivo_principal: 'emagrecer',
      prazo: '6m',
      porque_importante: 'Quero sentir-me melhor e ter mais energia',
      abordagem_preferida: 'keto_if',
      restricoes_alimentares: ['Nenhuma'],
      observa_ramadao: 'nao',
      condicoes_saude: ['Nenhuma'],
      medicacao: 'Nenhum',
      refeicoes_dia: '3',
      faz_pequeno_almoco: 'sim',
      pequeno_almoco_opcoes: ['Ovos', 'Café'],
      onde_come: ['Casa'],
      tipos_comida: ['Proteína'],
      agua_litros_dia: '2',
      bebidas: ['Café', 'Chá'],
      freq_doces: '2',
      freq_fritos: '2',
      petisca: false,
      o_que_petisca: [],
      freq_cansaco: 'as_vezes',
      freq_ansiedade: 'frequente',
      freq_tristeza: 'raramente',
      freq_raiva: 'raramente',
      freq_vazio: 'as_vezes',
      freq_solidao: 'raramente',
      freq_negacao: 'nunca',
      emocao_dominante: 'ansiedade',
      o_que_procura_comer: ['Doces'],
      como_sente_depois: ['Culpa'],
      quando_comecou_padrao: 'Ha alguns anos',
      tentou_alternativas: true,
      que_alternativas: 'Caminhadas, respiração',
      nivel_actividade: 'sedentario',
      faz_exercicio: false,
      tipo_exercicio: [],
      horas_sono: '7',
      qualidade_sono: '3',
      situacao_profissional: 'empregado',
      situacao_familiar: 'casado',
      filhos_pequenos: false,
      quem_cozinha: 'eu',
      nivel_stress: '4',
      maior_obstaculo: 'Falta de tempo',
      historico_dietas: ['Low carb'],
      gatilhos_sair_plano: ['Stress'],
      quantas_dietas: '3-5',
      dieta_funcionou: ['Low carb'],
      abordagem_realista: 'flexivel',
      preferencias_alimentares: ['Proteína'],
      medir_pesar_comida: 'talvez',
      acesso_ingredientes: 'bom',
      como_conheceu: ['Instagram'],
      observacoes_adicionais: 'Teste automático',
      o_que_espera_ganhar: 'Saúde e bem-estar',
      autoriza_dados_pesquisa: true,
      prontidao_1a10: '8',
      li_termos: true,
      li_privacidade: true,
      entendo_coaching: true,
      comprometo_programa: true,
      completed_at: new Date().toISOString()
    };

    await supabase.from('vitalis_intakes').upsert(intakeData).select();
    console.log('✅ Intake completo criado!');

    // 5. Criar plano nutricional
    console.log('5️⃣ Criando plano nutricional...');

    // Desativar planos antigos
    await supabase
      .from('vitalis_meal_plans')
      .update({ status: 'inactivo' })
      .eq('user_id', userId)
      .eq('status', 'activo');

    const planoData = {
      user_id: userId,
      versao: 1,
      fase: 'inducao',
      calorias: 1400,
      macros: {
        proteinas: 105,
        gorduras: 93,
        carboidratos: 35,
        proteinas_pct: 30,
        gorduras_pct: 60,
        carboidratos_pct: 10
      },
      refeicoes: {
        pequeno_almoco: {
          nome: 'Pequeno-almoço Keto',
          horario: '08:00',
          alimentos: [
            { nome: 'Ovos mexidos (3 ovos)', quantidade: '150g', calorias: 210, proteina: 18, gordura: 15, carbs: 1 },
            { nome: 'Abacate', quantidade: '50g', calorias: 80, proteina: 1, gordura: 7, carbs: 4 },
            { nome: 'Café com manteiga', quantidade: '1 chávena', calorias: 120, proteina: 1, gordura: 14, carbs: 0 }
          ],
          total_calorias: 410
        },
        almoco: {
          nome: 'Almoço',
          horario: '13:00',
          alimentos: [
            { nome: 'Frango grelhado', quantidade: '150g', calorias: 250, proteina: 45, gordura: 7, carbs: 0 },
            { nome: 'Salada verde', quantidade: '100g', calorias: 20, proteina: 2, gordura: 0, carbs: 4 },
            { nome: 'Azeite', quantidade: '15ml', calorias: 120, proteina: 0, gordura: 14, carbs: 0 }
          ],
          total_calorias: 390
        },
        jantar: {
          nome: 'Jantar',
          horario: '19:00',
          alimentos: [
            { nome: 'Salmão', quantidade: '150g', calorias: 310, proteina: 35, gordura: 18, carbs: 0 },
            { nome: 'Brócolos', quantidade: '100g', calorias: 35, proteina: 3, gordura: 0, carbs: 7 },
            { nome: 'Manteiga', quantidade: '10g', calorias: 75, proteina: 0, gordura: 8, carbs: 0 }
          ],
          total_calorias: 420
        }
      },
      orientacoes: [
        'Beber 2L de água por dia',
        'Evitar carboidratos processados',
        'Priorizar proteína em cada refeição',
        'Comer vegetais de baixo carb'
      ],
      dicas_jejum: [
        'Iniciar com jejum 16:8 (16h jejum, 8h alimentação)',
        'Janela alimentar: 12:00 - 20:00',
        'Beber água, café ou chá sem açúcar durante o jejum'
      ],
      substituicoes: {
        'Frango': ['Peru', 'Peixe branco'],
        'Ovos': ['Tofu mexido (baixo carb)'],
        'Salmão': ['Atum', 'Sardinha']
      },
      status: 'activo',
      data_inicio: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    await supabase.from('vitalis_meal_plans').insert([planoData]).select();
    console.log('✅ Plano nutricional criado!');

    // 6. Resumo
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ UTILIZADOR DE TESTE CRIADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Credenciais:');
    console.log(`   Email:    ${email}`);
    console.log(`   Senha:    ${senha}`);
    console.log(`   User ID:  ${userId}`);
    console.log('\n📊 Status:');
    console.log('   ✅ Intake completo');
    console.log('   ✅ Plano nutricional gerado');
    console.log('   ✅ Trial ativo (14 dias)');
    console.log('\n🚀 Próximos passos:');
    console.log('   1. Fazer login com as credenciais acima');
    console.log('   2. Ir para /vitalis/dashboard');
    console.log('   3. Verificar que o plano aparece corretamente');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Erro ao criar utilizador de teste:', error.message);
    console.error(error);
    process.exit(1);
  }
}

criarUsuarioTeste();
