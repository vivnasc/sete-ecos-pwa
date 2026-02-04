import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Configurar cliente com persistência de sessão
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persistir sessão no localStorage
    persistSession: true,
    // Auto-refresh do token antes de expirar
    autoRefreshToken: true,
    // Detectar sessão em outras tabs/janelas
    detectSessionInUrl: true,
    // Storage key para a sessão
    storageKey: 'sete-ecos-auth',
    // Usar localStorage (mais persistente que sessionStorage)
    storage: window.localStorage
  }
})

export async function saveCheckin(userId, checkinData) {
  const { data, error } = await supabase
    .from('lumina_checkins')
    .insert([{ user_id: userId, ...checkinData }])
    .select()
  if (error) throw error
  return data[0]
}

export async function saveLeitura(userId, checkinId, leituraData) {
  const { data, error } = await supabase
    .from('lumina_leituras')
    .insert([{ user_id: userId, checkin_id: checkinId, ...leituraData }])
    .select()
  if (error) throw error
  return data[0]
}

export async function getHistorico(userId, dias = 7) {
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - dias)
  const { data, error } = await supabase
    .from('lumina_checkins')
    .select(`*, lumina_leituras(*)`)
    .eq('user_id', userId)
    .gte('created_at', dataLimite.toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getCheckinHoje(userId) {
  const hoje = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('lumina_checkins')
    .select(`*, lumina_leituras(*)`)
    .eq('user_id', userId)
    .eq('data', hoje)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}
