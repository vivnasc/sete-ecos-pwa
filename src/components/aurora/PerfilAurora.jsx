import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { GamificationPanel } from '../shared/GamificationSystem'
import { AURORA_GAMIFICATION } from '../../lib/aurora/gamificacao'
import { g } from '../../utils/genero'

/**
 * PERFIL AURORA — Perfil do utilizador na Aurora
 * Mostra: raios, badges, certificado de graduacao, subscricao, exportar dados
 * Tema: #D4A5A5, #2e1a1a, Cormorant Garamond, Raios de Aurora
 */

const AURORA_COLOR = '#D4A5A5'
const AURORA_DARK = '#2e1a1a'

export default function PerfilAurora() {
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
        .from('aurora_clients')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle()

      setClientData(client)

      // Contar stats para badges
      const [checkins, mentoria, rituais, renovacao] = await Promise.all([
        supabase.from('aurora_checkins').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('aurora_mentoria').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('aurora_rituais_log').select('id', { count: 'exact' }).eq('user_id', userData.id),
        supabase.from('aurora_renovacao').select('id', { count: 'exact' }).eq('user_id', userData.id)
      ])

      setStats({
        graduacao_feita: !!client?.graduacao_data,
        manutencao_meses: checkins.count || 0,
        mentoria_total: mentoria.count || 0,
        rituais_total: rituais.count || 0,
        renovacao_feita: (renovacao.count || 0) > 0,
        ecos_completados: client?.ecos_completados || 0,
        raios_total: client?.raios_total || 0
      })
    } catch (error) {
      console.error('PerfilAurora:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!userId) return

    try {
      const [checkins, mentoria, rituais, renovacao] = await Promise.all([
        supabase.from('aurora_checkins').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('aurora_mentoria').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('aurora_rituais_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('aurora_renovacao').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ])

      const exportData = {
        exportado_em: new Date().toISOString(),
        modulo: 'Aurora — Integracao Final',
        raios: clientData?.raios_total || 0,
        graduacao_data: clientData?.graduacao_data || null,
        ecos_completados: clientData?.ecos_completados || 0,
        checkins_mensais: checkins.data || [],
        mentoria: mentoria.data || [],
        rituais_matinais: rituais.data || [],
        renovacao: renovacao.data || []
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `aurora-dados-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: AURORA_DARK }}>
        <div className="w-12 h-12 border-4 border-[#D4A5A5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: AURORA_DARK }}>
      <ModuleHeader eco="aurora" title="Perfil Aurora" compact />

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Resumo */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#D4A5A5]/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-4xl">🌅</span>
          </div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {clientData?.graduacao_data ? g('Graduado', 'Graduada') : 'Em jornada'}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {clientData?.raios_total || 0} Raios de Aurora
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.manutencao_meses}</p>
            <p className="text-white/40 text-xs">Check-ins</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.mentoria_total}</p>
            <p className="text-white/40 text-xs">Mentorias</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.rituais_total}</p>
            <p className="text-white/40 text-xs">Rituais</p>
          </div>
        </div>

        {/* Certificado de graduacao */}
        {clientData?.graduacao_data && (
          <div
            className="rounded-2xl border p-5 text-center"
            style={{ background: `${AURORA_COLOR}10`, borderColor: `${AURORA_COLOR}25` }}
          >
            <span className="text-3xl block mb-2">🎓</span>
            <h3
              className="text-white font-semibold text-lg mb-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Certificado de Graduacao
            </h3>
            <p className="text-white/50 text-sm">
              {g('Graduado', 'Graduada')} em {new Date(clientData.graduacao_data).toLocaleDateString('pt-PT')}
            </p>
            <p className="text-white/30 text-xs mt-2">
              {clientData.ecos_completados || 0} ecos completados
            </p>
          </div>
        )}

        {/* Gamificacao completa */}
        <GamificationPanel
          eco="aurora"
          config={AURORA_GAMIFICATION}
          total={clientData?.raios_total || 0}
          streak={0}
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
