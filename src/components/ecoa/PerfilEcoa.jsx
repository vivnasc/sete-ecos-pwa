import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { GamificationPanel } from '../shared/GamificationSystem'
import { ECOA_GAMIFICATION } from '../../lib/ecoa/gamificacao'
import { g } from '../../utils/genero'

/**
 * PERFIL ECOA — Perfil do utilizador no Ecoa
 * Mostra: gamificacao completa, stats, badges, config
 * Tema: #4A90A4, #1a2a34, Playfair Display, Som
 */

const ECOA_COLOR = '#4A90A4'
const ECOA_DARK = '#1a2a34'

export default function PerfilEcoa() {
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
        .from('ecoa_clients')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle()

      setClientData(client)

      // Contar stats para badges
      const [vozRecuperada, cartas, microVoz, exercicios, comunicacao] = await Promise.all([
        supabase.from('ecoa_voz_recuperada').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ecoa_cartas').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ecoa_micro_voz_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ecoa_exercicios_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('ecoa_comunicacao_log').select('id', { count: 'exact' }).eq('user_id', userData.id)
      ])

      // Contar cartas libertadas
      const { count: cartasLibertadas } = await supabase
        .from('ecoa_cartas')
        .select('id', { count: 'exact' })
        .eq('user_id', userData.id)
        .eq('libertada', true)

      // Contar micro-voz desta semana
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count: microVozSemana } = await supabase
        .from('ecoa_micro_voz_log')
        .select('id', { count: 'exact' })
        .eq('user_id', userData.id)
        .gte('created_at', weekAgo.toISOString())

      setStats({
        vozes_recuperadas: vozRecuperada.count || 0,
        cartas_total: cartas.count || 0,
        cartas_libertadas: cartasLibertadas || 0,
        micro_voz_total: microVoz.count || 0,
        micro_voz_semana: microVozSemana || 0,
        exercicios_total: exercicios.count || 0,
        comunicacao_total: comunicacao.count || 0,
        ecos_total: client?.ecos_total || 0,
        streak_dias: client?.streak_dias || 0
      })
    } catch (error) {
      console.error('PerfilEcoa:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: ECOA_DARK }}>
        <div className="w-12 h-12 border-4 border-[#4A90A4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: ECOA_DARK }}>
      <ModuleHeader eco="ecoa" title="Meu Perfil Ecoa" compact />

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Resumo */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#4A90A4]/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-4xl">🔊</span>
          </div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Nivel: {clientData?.nivel || 'Sussurro'}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {clientData?.ecos_total || 0} Ecos 🔊
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.vozes_recuperadas}</p>
            <p className="text-white/40 text-xs">Vozes Recuperadas</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.cartas_total}</p>
            <p className="text-white/40 text-xs">Cartas</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.micro_voz_semana}</p>
            <p className="text-white/40 text-xs">Micro-Voz semana</p>
          </div>
        </div>

        {/* Gamificacao completa */}
        <GamificationPanel
          eco="ecoa"
          config={ECOA_GAMIFICATION}
          total={clientData?.ecos_total || 0}
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
