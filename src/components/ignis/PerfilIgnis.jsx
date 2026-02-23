import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { GamificationPanel } from '../shared/GamificationSystem'
import { IGNIS_GAMIFICATION } from '../../lib/ignis/gamificacao'
import { g } from '../../utils/genero'

/**
 * PERFIL IGNIS — Perfil do utilizador no Ignis
 * Mostra: gamificacao completa, stats, badges, config
 * Tema: #C1634A, #2e1a14, Playfair Display, Chamas
 */

const IGNIS_COLOR = '#C1634A'
const IGNIS_DARK = '#2e1a14'

export default function PerfilIgnis() {
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
        .from('ignis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle()

      setClientData(client)

      // Contar stats para badges
      const [escolhas, focoSessions, dispersoes, conquistas, desafios, cortes, valores] = await Promise.all([
        supabase.from('ignis_escolhas').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ignis_foco_sessions').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ignis_dispersao_log').select('id', { count: 'exact' }).eq('user_id', userData.id).eq('disse_sim_queria_nao', true),
        supabase.from('ignis_conquistas_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ignis_desafios_log').select('categoria', { count: 'exact' }).eq('user_id', userData.id).eq('completou', true),
        supabase.from('ignis_dispersao_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ignis_valores').select('id', { count: 'exact' }).eq('user_id', userData.id)
      ])

      // Contar desafios de coragem especificamente
      const desafiosCoragem = (desafios.data || []).filter(d => d.categoria === 'coragem').length

      setStats({
        escolhas_total: escolhas.count || 0,
        foco_total: focoSessions.count || 0,
        dispersoes_cortadas: dispersoes.count || 0,
        conquistas_total: conquistas.count || 0,
        cortes_total: cortes.count || 0,
        desafios_coragem: desafiosCoragem,
        valores_definidos: (valores.count || 0) >= 5,
        chamas_total: client?.chamas_total || 0,
        streak_dias: client?.streak_dias || 0
      })
    } catch (error) {
      console.error('PerfilIgnis:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: IGNIS_DARK }}>
        <div className="w-12 h-12 border-4 border-[#C1634A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: IGNIS_DARK }}>
      <ModuleHeader eco="ignis" title="Meu Perfil Ignis" compact />

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Resumo */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#C1634A]/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-4xl">🔥</span>
          </div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Nivel: {clientData?.nivel || 'Faisca'}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {clientData?.chamas_total || 0} Chamas 🔥
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.escolhas_total}</p>
            <p className="text-white/40 text-xs">Escolhas</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.foco_total}</p>
            <p className="text-white/40 text-xs">Foco sessoes</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.dispersoes_cortadas}</p>
            <p className="text-white/40 text-xs">Dispersoes cortadas</p>
          </div>
        </div>

        {/* Gamificacao completa */}
        <GamificationPanel
          eco="ignis"
          config={IGNIS_GAMIFICATION}
          total={clientData?.chamas_total || 0}
          streak={clientData?.streak_dias || 0}
          userData={stats}
        />

        {/* Info da subscrição */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Subscrição</h3>
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
                {clientData?.created_at ? new Date(clientData.created_at).toLocaleDateString('pt-PT') : '\u2014'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
