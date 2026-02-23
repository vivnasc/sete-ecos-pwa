import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getConversas, getOuCriarConversa, contarNaoLidas, tempoRelativo, CANAIS } from '../../lib/messenger'
import { useI18n } from '../../contexts/I18nContext'

export default function MessengerInbox({ userId }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [conversas, setConversas] = useState([])

  useEffect(() => {
    if (userId) carregarConversas()
  }, [userId])

  const carregarConversas = async () => {
    setLoading(true)
    try {
      const data = await getConversas(userId)
      setConversas(data)
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    }
    setLoading(false)
  }

  const handleIniciarConversa = async (canal) => {
    try {
      const conversa = await getOuCriarConversa(userId, canal)
      if (conversa) {
        navigate(`/messenger/${conversa.id}`)
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
    }
  }

  const handleAbrirConversa = (conversaId) => {
    navigate(`/messenger/${conversaId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(180deg, #FAFAFE 0%, #F5F3FF 100%)' }}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center text-2xl animate-pulse shadow-sm">
          💬
        </div>
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          {t('messenger.loading')}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FAFAFE 0%, #F5F3FF 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label={t('common.back')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
                {t('messenger.title')}
              </h1>
              <p className="text-xs text-gray-400">{t('messenger.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Canais disponíveis */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-1">
            {t('messenger.channels')}
          </p>

          {Object.entries(CANAIS).map(([key, canal]) => {
            const conversaExistente = conversas.find(c => c.canal === key)

            return (
              <button
                key={key}
                onClick={() => conversaExistente ? handleAbrirConversa(conversaExistente.id) : handleIniciarConversa(key)}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all active:scale-[0.98]"
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${canal.cor}15` }}
                >
                  {canal.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{canal.label}</p>
                    {conversaExistente?.last_message_at && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                        {tempoRelativo(conversaExistente.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conversaExistente?.last_message || canal.descricao}
                  </p>
                </div>

                {/* Badge não lidas */}
                {conversaExistente?.unread_user > 0 && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: canal.cor }}
                  >
                    {conversaExistente.unread_user}
                  </div>
                )}

                {/* Seta */}
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )
          })}
        </div>

        {/* Estado vazio explicativo */}
        {conversas.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">
              💬
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              {t('messenger.welcome_title')}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
              {t('messenger.welcome_desc')}
            </p>
          </div>
        )}

        {/* Info card */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100/50">
          <div className="flex gap-3">
            <span className="text-lg flex-shrink-0">ℹ️</span>
            <div>
              <p className="text-xs font-medium text-purple-800 mb-1">{t('messenger.info_title')}</p>
              <p className="text-[11px] text-purple-600 leading-relaxed">
                {t('messenger.info_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
