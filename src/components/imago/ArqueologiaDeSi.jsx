import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import AudioPlayerBar from '../shared/AudioPlayerBar'
import { CAMADAS_ARQUEOLOGIA } from '../../lib/imago/gamificacao'

/**
 * ArqueologiaDeSi — Escavacao profunda de identidade atraves de camadas de vida.
 * Componente CORE do modulo IMAGO.
 *
 * Fluxo:
 *  1. Mostrar 5 camadas como cards clicaveis
 *  2. Ao seleccionar, mostrar perguntas e campos de reflexao
 *  3. Listar entradas anteriores da camada
 *  4. Guardar no imago_arqueologia (log, multiplas entradas por user)
 */
export default function ArqueologiaDeSi() {
  const navigate = useNavigate()
  const { user, userRecord } = useAuth()

  // Estado da UI
  const [camadaSelecionada, setCamadaSelecionada] = useState(null)
  const [antesDeX, setAntesDeX] = useState('')
  const [versaoPresa, setVersaoPresa] = useState('')
  const [identidadeAlheia, setIdentidadeAlheia] = useState('')
  const [reflexao, setReflexao] = useState('')

  // Estado de dados
  const [entradasAnteriores, setEntradasAnteriores] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingEntradas, setLoadingEntradas] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState(null)

  // Buscar userId do utilizador
  const getUserId = useCallback(async () => {
    if (userRecord?.id) return userRecord.id
    if (!user) return null
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle()
    return data?.id || null
  }, [user, userRecord])

  // Carregar entradas anteriores para a camada seleccionada
  const carregarEntradas = useCallback(async (camadaId) => {
    setLoadingEntradas(true)
    try {
      const userId = await getUserId()
      if (!userId) return

      const { data, error } = await supabase
        .from('imago_arqueologia')
        .select('*')
        .eq('user_id', userId)
        .eq('camada', camadaId)
        .order('data', { ascending: false })
        .limit(20)

      if (error) throw error
      setEntradasAnteriores(data || [])
    } catch (err) {
      console.error('Erro ao carregar entradas:', err)
      setEntradasAnteriores([])
    } finally {
      setLoadingEntradas(false)
    }
  }, [getUserId])

  // Quando a camada muda, carregar entradas
  useEffect(() => {
    if (camadaSelecionada) {
      carregarEntradas(camadaSelecionada.id)
    } else {
      setEntradasAnteriores([])
    }
  }, [camadaSelecionada, carregarEntradas])

  // Guardar nova escavacao
  const guardarEscavacao = async () => {
    if (!antesDeX.trim() && !versaoPresa.trim() && !identidadeAlheia.trim() && !reflexao.trim()) {
      setErro('Escreve pelo menos numa das areas antes de guardar.')
      return
    }

    setLoading(true)
    setErro(null)
    setSucesso(false)

    try {
      const userId = await getUserId()
      if (!userId) {
        setErro('Nao foi possivel identificar o utilizador.')
        return
      }

      const { error } = await supabase
        .from('imago_arqueologia')
        .insert([{
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          camada: camadaSelecionada.id,
          antes_de_x: antesDeX.trim() || null,
          versao_presa: versaoPresa.trim() || null,
          identidade_alheia: identidadeAlheia.trim() || null,
          reflexao: reflexao.trim() || null
        }])

      if (error) throw error

      setSucesso(true)
      setAntesDeX('')
      setVersaoPresa('')
      setIdentidadeAlheia('')
      setReflexao('')

      // Recarregar entradas
      await carregarEntradas(camadaSelecionada.id)

      // Limpar mensagem de sucesso apos 4 segundos
      setTimeout(() => setSucesso(false), 4000)
    } catch (err) {
      console.error('Erro ao guardar escavacao:', err)
      setErro('Erro ao guardar. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Limpar formulario ao mudar de camada
  const seleccionarCamada = (camada) => {
    setCamadaSelecionada(camada)
    setAntesDeX('')
    setVersaoPresa('')
    setIdentidadeAlheia('')
    setReflexao('')
    setSucesso(false)
    setErro(null)
  }

  const voltarAsCamadas = () => {
    setCamadaSelecionada(null)
    setAntesDeX('')
    setVersaoPresa('')
    setIdentidadeAlheia('')
    setReflexao('')
    setSucesso(false)
    setErro(null)
  }

  // Formatar data para exibicao
  const formatarData = (dataStr) => {
    try {
      const d = new Date(dataStr)
      return d.toLocaleDateString('pt', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return dataStr
    }
  }

  // ======================== RENDER: SELECCAO DE CAMADA ========================
  if (!camadaSelecionada) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModuleHeader
          eco="imago"
          title="Arqueologia de Si"
          subtitle="Escavar as camadas da tua identidade"
        />

        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Intro */}
          <div className="mb-6 p-5 rounded-2xl border border-purple-200 bg-white">
            <p className="text-gray-700 leading-relaxed">
              Cada camada da tua vida deixou marcas na tua identidade.
              Algumas {g('escolhidos', 'escolhidas')} por ti, outras {g('impostos', 'impostas')} pelo mundo.
              Aqui, vais escavar cada uma para descobrir quem es por baixo de tudo.
            </p>
          </div>

          {/* Grid de camadas */}
          <div className="space-y-3">
            {CAMADAS_ARQUEOLOGIA.map((camada) => (
              <button
                key={camada.id}
                onClick={() => seleccionarCamada(camada)}
                className="w-full p-5 bg-white rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: '#8B7BA520' }}
                  >
                    {camada.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-lg group-hover:text-purple-700 transition-colors"
                      style={{ color: '#8B7BA5' }}
                    >
                      {camada.nome}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                      {camada.pergunta_central}
                    </p>
                  </div>
                  <div className="text-gray-300 group-hover:text-purple-400 transition-colors shrink-0 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ======================== RENDER: CAMADA SELECCIONADA ========================
  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleHeader
        eco="imago"
        title={camadaSelecionada.nome}
        subtitle="Arqueologia de Si"
        backTo="history"
      />

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Botao voltar */}
        <button
          onClick={voltarAsCamadas}
          className="mb-4 text-sm flex items-center gap-1 hover:underline"
          style={{ color: '#8B7BA5' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Todas as camadas
        </button>

        {/* Pergunta central */}
        <div
          className="p-6 rounded-2xl mb-6 text-white"
          style={{ background: 'linear-gradient(135deg, #8B7BA5 0%, #6B5B85 100%)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{camadaSelecionada.icon}</span>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              {camadaSelecionada.nome}
            </h2>
          </div>
          <p className="text-white/90 text-lg leading-relaxed">
            {camadaSelecionada.pergunta_central}
          </p>
        </div>

        {/* Sub-perguntas como prompts */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Perguntas para te guiar
          </h3>
          <div className="space-y-2">
            {camadaSelecionada.sub_perguntas.map((pergunta, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-purple-100 text-gray-700 text-sm leading-relaxed"
              >
                <span className="text-purple-400 mr-2">&#8226;</span>
                {pergunta}
              </div>
            ))}
          </div>
        </div>

        {/* Guided audio — Infância */}
        <div className="mb-4">
          <AudioPlayerBar
            eco="journaling"
            slug="imago-03-infancia"
            accentColor="#8B7BA5"
            titulo="Meditação: A Criança Interior"
          />
        </div>

        {/* Campos de reflexao */}
        <div className="space-y-5">
          {/* Antes de X */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#8B7BA5' }}>
              {g('Quem era eu antes de isto acontecer?', 'Quem era eu antes de isto acontecer?')}
            </label>
            <textarea
              value={antesDeX}
              onChange={(e) => setAntesDeX(e.target.value)}
              placeholder={g('Descreve quem eras antes...', 'Descreve quem eras antes...')}
              rows={4}
              className="w-full p-4 bg-white border border-purple-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
            />
          </div>

          {/* Versao presa */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#8B7BA5' }}>
              {g('Que versao minha ficou presa?', 'Que versao minha ficou presa?')}
            </label>
            <textarea
              value={versaoPresa}
              onChange={(e) => setVersaoPresa(e.target.value)}
              placeholder={g('Que parte de ti ficou parada nesse momento...', 'Que parte de ti ficou parada nesse momento...')}
              rows={4}
              className="w-full p-4 bg-white border border-purple-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
            />
          </div>

          {/* Identidade alheia */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#8B7BA5' }}>
              {g('Que identidade assumi que nao e minha?', 'Que identidade assumi que nao e minha?')}
            </label>
            <textarea
              value={identidadeAlheia}
              onChange={(e) => setIdentidadeAlheia(e.target.value)}
              placeholder={g('Que papel, mascara ou expectativa adoptaste...', 'Que papel, mascara ou expectativa adoptaste...')}
              rows={4}
              className="w-full p-4 bg-white border border-purple-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
            />
          </div>

          {/* Reflexao final */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#8B7BA5' }}>
              Reflexao final
            </label>
            <textarea
              value={reflexao}
              onChange={(e) => setReflexao(e.target.value)}
              placeholder={g('O que descobriste sobre ti mesmo nesta escavacao...', 'O que descobriste sobre ti mesma nesta escavacao...')}
              rows={5}
              className="w-full p-4 bg-white border border-purple-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
            />
          </div>
        </div>

        {/* Mensagens de erro / sucesso */}
        {erro && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            Escavacao {g('guardado', 'guardada')} com sucesso.
          </div>
        )}

        {/* Botao guardar */}
        <button
          onClick={guardarEscavacao}
          disabled={loading}
          className="w-full mt-6 py-4 rounded-2xl text-white font-semibold transition-all disabled:opacity-50"
          style={{
            background: loading
              ? '#a89bc0'
              : 'linear-gradient(135deg, #8B7BA5 0%, #6B5B85 100%)'
          }}
        >
          {loading ? 'A guardar...' : 'Guardar escavacao'}
        </button>

        {/* Entradas anteriores */}
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Escavacoes anteriores — {camadaSelecionada.nome}
          </h3>

          {loadingEntradas ? (
            <div className="text-center py-8 text-gray-400">A carregar...</div>
          ) : entradasAnteriores.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <p className="text-2xl mb-2">&#9901;</p>
              <p className="text-sm">
                Ainda nao tens escavacoes nesta camada.
                <br />
                A tua primeira reflexao fica {g('registado', 'registada')} aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entradasAnteriores.map((entrada) => (
                <div
                  key={entrada.id || `${entrada.data}-${entrada.camada}`}
                  className="p-4 bg-white rounded-xl border border-purple-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-400">
                      {formatarData(entrada.data)}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#8B7BA520', color: '#8B7BA5' }}
                    >
                      {camadaSelecionada.icon} {camadaSelecionada.nome}
                    </span>
                  </div>

                  {entrada.antes_de_x && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-500 mb-0.5">
                        Antes de acontecer
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {entrada.antes_de_x}
                      </p>
                    </div>
                  )}

                  {entrada.versao_presa && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-500 mb-0.5">
                        Versao que ficou presa
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {entrada.versao_presa}
                      </p>
                    </div>
                  )}

                  {entrada.identidade_alheia && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-500 mb-0.5">
                        Identidade que nao e minha
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {entrada.identidade_alheia}
                      </p>
                    </div>
                  )}

                  {entrada.reflexao && (
                    <div className="mt-2 pt-2 border-t border-purple-50">
                      <p className="text-xs font-semibold text-gray-500 mb-0.5">
                        Reflexao
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed italic">
                        {entrada.reflexao}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
