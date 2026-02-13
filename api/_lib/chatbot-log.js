/**
 * Chatbot Logging — Supabase
 *
 * Regista todas as conversas do chatbot WhatsApp para análise e histórico.
 * Tabela: chatbot_mensagens
 *
 * SQL para criar a tabela:
 * CREATE TABLE chatbot_mensagens (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   telefone TEXT NOT NULL,
 *   nome TEXT,
 *   mensagem_in TEXT NOT NULL,
 *   mensagem_out TEXT NOT NULL,
 *   chave_detectada TEXT,
 *   notificou_coach BOOLEAN DEFAULT false,
 *   canal TEXT DEFAULT 'whatsapp',
 *   sessao_id TEXT
 * );
 *
 * CREATE INDEX idx_chatbot_telefone ON chatbot_mensagens(telefone);
 * CREATE INDEX idx_chatbot_created ON chatbot_mensagens(created_at DESC);
 */

import { createClient } from '@supabase/supabase-js';

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _supabase = createClient(url, key);
  return _supabase;
}

/**
 * Registar mensagem de chatbot no Supabase
 * Não bloqueia — erros são silenciosos (log apenas no console)
 */
export async function logMensagem({ telefone, nome, mensagemIn, mensagemOut, chave, notificouCoach, canal = 'whatsapp', sessaoId }) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.log('Chatbot log: Supabase não configurado, skip');
      return;
    }

    const { error } = await supabase
      .from('chatbot_mensagens')
      .insert({
        telefone: telefone || 'desconhecido',
        nome: nome || null,
        mensagem_in: mensagemIn,
        mensagem_out: mensagemOut.slice(0, 5000), // limitar tamanho
        chave_detectada: chave || null,
        notificou_coach: !!notificouCoach,
        canal,
        sessao_id: sessaoId || null,
      });

    if (error) {
      // Não bloqueia — apenas log
      console.error('Chatbot log erro Supabase:', error.message);
    }
  } catch (err) {
    console.error('Chatbot log erro:', err.message);
  }
}
