import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { GamificationPanel } from '../shared/GamificationSystem'
import { VENTIS_GAMIFICATION } from '../../lib/ventis/gamificacao'
import { g } from '../../utils/genero'

/**
 * PERFIL VENTIS — Perfil do utilizador no Ventis
 * Mostra: gamificacao completa, stats, badges, config
 * Tema: #5D9B84, #1a2e24, Cormorant Garamond, Folhas
 */

const VENTIS_COLOR = '#5D9B84'
const VENTIS_DARK = '#1a2e24'

export default function PerfilVentis() {
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
        .from('ventis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle()

      setClientData(client)

      // Contar stats para badges
      const [energia, rotinas, pausas, movimento, natureza] = await Promise.all([
        supabase.from('ventis_energia_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ventis_rotinas_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ventis_pausas_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ventis_movimento_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ventis_natureza_log').select('id', { count: 'exact' }).eq('user_id', userData.id)
      ])

      setStats({
        energia_total: energia.count || 0,
        rotinas_total: rotinas.count || 0,
        pausas_total: pausas.count || 0,
        movimento_total: movimento.count || 0,
        natureza_total: natureza.count || 0,
        folhas_total: client?.folhas_total || 0,
        streak_dias: client?.streak_dias || 0
      })
    } catch (error) {
      console.error('PerfilVentis:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: VENTIS_DARK }}>
        <div className="w-12 h-12 border-4 border-[#5D9B84] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: VENTIS_DARK }}>
      <ModuleHeader eco="ventis" title="Meu Perfil Ventis" compact />

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Resumo */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#5D9B84]/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-4xl">🍃</span>
          </div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Nivel: {clientData?.nivel || 'Semente'}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {clientData?.folhas_total || 0} Folhas 🍃
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.energia_total}</p>
            <p className="text-white/40 text-xs">Check-ins</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.rotinas_total}</p>
            <p className="text-white/40 text-xs">Rotinas</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.pausas_total}</p>
            <p className="text-white/40 text-xs">Pausas</p>
          </div>
        </div>

        {/* Gamificacao completa */}
        <GamificationPanel
          eco="ventis"
          config={VENTIS_GAMIFICATION}
          total={clientData?.folhas_total || 0}
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
                {clientData?.created_at ? new Date(clientData.created_at).toLocaleDateString('pt-PT') : '\u2014'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
