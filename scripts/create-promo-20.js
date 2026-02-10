/**
 * Script para criar código promo de 20% de desconto
 *
 * Uso:
 * node scripts/create-promo-20.js
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

async function createPromo20() {
  const code = 'VEMVITALIS20';
  const discount = 20;
  const maxUses = 500; // Limite de usos
  const expiresInDays = 90; // Válido por 90 dias

  console.log('\n🎁 Criando código promo de 20% de desconto...\n');

  try {
    const insertData = {
      code: code,
      type: 'promo',
      max_uses: maxUses,
      uses_count: 0,
      notes: `${discount}`, // Percentagem de desconto
      active: true,
      created_at: new Date().toISOString()
    };

    if (expiresInDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiresInDays);
      insertData.expires_at = expiryDate.toISOString();
    }

    const { data, error } = await supabase
      .from('vitalis_invite_codes')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // Check if code already exists
      if (error.code === '23505') {
        console.log('⚠️  Código já existe. Atualizando...');

        const { error: updateError } = await supabase
          .from('vitalis_invite_codes')
          .update({
            max_uses: maxUses,
            notes: `${discount}`,
            active: true,
            expires_at: insertData.expires_at
          })
          .eq('code', code);

        if (updateError) throw updateError;

        console.log('✅ Código atualizado com sucesso!\n');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Código criado com sucesso!\n');
    }

    console.log('📋 Detalhes do código promo:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Código:           ${code}`);
    console.log(`Desconto:         ${discount}%`);
    console.log(`Máximo de usos:   ${maxUses}`);
    console.log(`Válido até:       ${new Date(insertData.expires_at).toLocaleDateString('pt-PT')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 Os utilizadores podem usar este código em /vitalis/pagamento\n');

  } catch (error) {
    console.error('❌ Erro ao criar código promo:', error.message);
    process.exit(1);
  }
}

createPromo20();
