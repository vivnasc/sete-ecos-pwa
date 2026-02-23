import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../contexts/I18nContext'
import MessengerInbox from './MessengerInbox'
import MessengerChat from './MessengerChat'

export default function Messenger() {
  const { conversaId } = useParams()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { t } = useI18n()

  useEffect(() => {
    inicializar()
  }, [])

  const inicializar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userData) {
        setUserId(userData.id)
      }
    } catch (error) {
      console.error('Erro ao inicializar messenger:', error)
    }
    setLoading(false)
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

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: 'linear-gradient(180deg, #FAFAFE 0%, #F5F3FF 100%)' }}>
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center text-4xl shadow-inner">
          🔒
        </div>
        <p className="text-gray-500 text-center text-sm">{t('messenger.login_required')}</p>
        <button
          onClick={() => navigate('/login', { state: { from: '/messenger' } })}
          className="text-sm font-medium px-6 py-2.5 rounded-xl text-white transition-all active:scale-95 shadow-sm"
          style={{ backgroundColor: '#8B5CF6' }}
        >
          {t('nav.login')}
        </button>
      </div>
    )
  }

  // Se tem conversaId no URL, mostra o chat; senão, mostra o inbox
  if (conversaId) {
    return <MessengerChat userId={userId} conversaId={conversaId} />
  }

  return <MessengerInbox userId={userId} />
}
