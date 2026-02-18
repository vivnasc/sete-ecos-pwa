import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { GamificationPanel } from '../shared/GamificationSystem'
import { SERENA_GAMIFICATION } from '../../lib/serena/gamificacao'
import { g } from '../../utils/genero'

/**
 * PERFIL SERENA — Perfil do utilizador no Serena
 * Mostra: gamificacao completa, stats, badges, config
 */

export default function PerfilSerena() {
  const { user } = useAuth()
  const [userId, setUserId] = useState(null)
  const [clientData, setClientData] = useState(null)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      // Buscar userId
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) return
      setUserId(userData.id)

      // Buscar dados do cliente
      const { data: client } = await supabase
        .from('serena_clients')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle()

      setClientData(client)

      // Contar stats para badges
      const [emocoes, respiracoes, praticas, rituais] = await Promise.all([
        supabase.from('serena_emocoes_log').select('emocao', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('serena_respiracao_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('serena_praticas_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('serena_rituais_log').select('id', { count: 'exact' }).eq('user_id', userData.id)
      ])

      // Contar emocoes unicas
      const emocoesUnicas = new Set((emocoes.data || []).map(e => e.emocao)).size

      setStats({
        emocoes_total: emocoes.count || 0,
        emocoes_unicas: emocoesUnicas,
        respiracoes_total: respiracoes.count || 0,
        praticas_total: praticas.count || 0,
        rituais_total: rituais.count || 0,
        gotas_total: client?.gotas_total || 0,
        streak_dias: client?.streak_dias || 0,
        sos_usado: false // TODO: tracking
      })
    } catch (error) {
      console.error('PerfilSerena:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a2e3a' }}>
        <div className="w-12 h-12 border-4 border-[#6B8E9B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#1a2e3a' }}>
      <ModuleHeader eco="serena" title="Meu Perfil Serena" compact />

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Resumo */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#6B8E9B]/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-4xl">🌊</span>
          </div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Nivel: {clientData?.nivel || 'Nascente'}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {clientData?.gotas_total || 0} Gotas recolhidas
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.emocoes_total}</p>
            <p className="text-white/40 text-xs">Emocoes</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.respiracoes_total}</p>
            <p className="text-white/40 text-xs">Respiracoes</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.praticas_total + stats.rituais_total}</p>
            <p className="text-white/40 text-xs">Praticas</p>
          </div>
        </div>

        {/* Gamificacao completa */}
        <GamificationPanel
          eco="serena"
          config={SERENA_GAMIFICATION}
          total={clientData?.gotas_total || 0}
          streak={clientData?.streak_dias || 0}
          userData={stats}
        />

        {/* Info da subscricao */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Subscricao</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Estado</span>
              <span className="text-white capitalize">{clientData?.subscription_status || 'Nenhuma'}</span>
            </div>
            {clientData?.subscription_expires && (
              <div className="flex justify-between">
                <span className="text-white/40">Expira</span>
                <span className="text-white">
                  {new Date(clientData.subscription_expires).toLocaleDateString('pt-PT')}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/40">Membro desde</span>
              <span className="text-white">
                {clientData?.created_at ? new Date(clientData.created_at).toLocaleDateString('pt-PT') : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
