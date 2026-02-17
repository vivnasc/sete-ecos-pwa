import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { GamificationPanel } from '../shared/GamificationSystem'
import { IMAGO_GAMIFICATION } from '../../lib/imago/gamificacao'
import { g } from '../../utils/genero'

/**
 * PERFIL IMAGO — Perfil do utilizador no Imago
 * Mostra: nivel + estrelas, gamificacao completa, stats, badges, subscricao, exportar
 * Tema: #8B7BA5, #1a1a2e, Playfair Display, Estrelas
 */

const IMAGO_COLOR = '#8B7BA5'
const IMAGO_DARK = '#1a1a2e'

export default function PerfilImago() {
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
        .from('imago_clients')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle()

      setClientData(client)

      // Contar stats para badges
      const [espelho, arqueologia, meditacoes, integracoes, valores, nomeacao] = await Promise.all([
        supabase.from('imago_espelho_triplo').select('id, essencia, mascara', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('imago_arqueologia').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('imago_meditacoes_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('imago_integracoes_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('imago_valores').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('imago_nomeacao').select('id', { count: 'exact' }).eq('user_id', userData.id)
      ])

      // Contar mascaras identificadas no espelho
      const mascarasTotal = (espelho.data || []).filter(e => e.mascara).length

      setStats({
        espelho_completado: client?.espelho_completado || false,
        mascaras_total: mascarasTotal,
        arqueologia_total: arqueologia.count || 0,
        meditacoes_total: meditacoes.count || 0,
        integracoes_total: integracoes.count || 0,
        valores_definidos: (valores.count || 0) >= 3,
        nomeacao_feita: (nomeacao.count || 0) > 0,
        estrelas_total: client?.estrelas_total || 0,
        streak_dias: client?.streak_dias || 0
      })
    } catch (error) {
      console.error('PerfilImago:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!userId) return

    try {
      // Buscar todos os dados do utilizador
      const [espelho, arqueologia, valores, nomeacao] = await Promise.all([
        supabase.from('imago_espelho_triplo').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('imago_arqueologia').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('imago_valores').select('*').eq('user_id', userId),
        supabase.from('imago_nomeacao').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ])

      const exportData = {
        exportado_em: new Date().toISOString(),
        modulo: 'Imago — Identidade & Espelho',
        nivel: clientData?.nivel || 'Reflexo',
        estrelas: clientData?.estrelas_total || 0,
        espelho_triplo: espelho.data || [],
        arqueologia: arqueologia.data || [],
        valores: valores.data || [],
        nomeacao: nomeacao.data || []
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `imago-dados-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: IMAGO_DARK }}>
        <div className="w-12 h-12 border-4 border-[#8B7BA5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: IMAGO_DARK }}>
      <ModuleHeader eco="imago" title="Perfil Imago" compact />

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Resumo */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#8B7BA5]/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-4xl">⭐</span>
          </div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Nivel: {clientData?.nivel || 'Reflexo'}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {clientData?.estrelas_total || 0} Estrelas
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.arqueologia_total}</p>
            <p className="text-white/40 text-xs">Escavacoes</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.meditacoes_total}</p>
            <p className="text-white/40 text-xs">Meditacoes</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.integracoes_total}</p>
            <p className="text-white/40 text-xs">Integracoes</p>
          </div>
        </div>

        {/* Gamificacao completa */}
        <GamificationPanel
          eco="imago"
          config={IMAGO_GAMIFICATION}
          total={clientData?.estrelas_total || 0}
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

        {/* Exportar dados */}
        <button
          onClick={handleExport}
          className="w-full py-3 rounded-xl text-white/70 font-medium text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          Exportar os meus dados
        </button>
      </div>
    </div>
  )
}
