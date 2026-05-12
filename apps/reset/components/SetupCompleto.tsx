'use client'

// Setup completo da Vivianne · uma única página que captura TUDO o que a
// coach precisa para deixar de fazer perguntas básicas.
// Acessível em /definicoes/setup. Mostra o estado de cada campo (registado /
// em falta) e permite preencher tudo num só sítio.

import { useEffect, useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { getProfile, saveProfile, type Profile } from '@/lib/profile'
import { pesoUltimo } from '@/lib/storage'
import { cn } from '@/lib/utils'

type Estado = 'completo' | 'parcial' | 'falta'

export default function SetupCompleto() {
  const [perfil, setPerfil] = useState<Profile>(() => getProfile())

  useEffect(() => {
    const refresh = () => setPerfil(getProfile())
    window.addEventListener('fenixfit:profile', refresh)
    return () => window.removeEventListener('fenixfit:profile', refresh)
  }, [])

  const guardar = (p: Partial<Profile>) => {
    const novo = saveProfile(p)
    setPerfil(novo)
  }

  const peso = pesoUltimo()

  const estados: Record<string, { estado: Estado; razao: string }> = {
    identidade: {
      estado: perfil.nome && perfil.sexo ? 'completo' : 'falta',
      razao: 'nome e sexo'
    },
    biometria: {
      estado: perfil.alturaCm && perfil.idade ? 'completo' : (perfil.alturaCm || perfil.idade ? 'parcial' : 'falta'),
      razao: 'altura e idade para Mifflin-St Jeor'
    },
    actividade: {
      estado: perfil.nivelActividade ? 'completo' : 'falta',
      razao: 'nível actividade para TDEE'
    },
    peso: {
      estado: peso ? 'completo' : 'falta',
      razao: 'pesa-te ao menos 1× para a coach saber onde estás'
    },
    historico: {
      estado: perfil.historicoClinico && perfil.historicoClinico.trim().length > 10 ? 'completo' : 'falta',
      razao: 'medicação, condições, GLP-1, perimenopausa, etc.'
    },
    protocolo: {
      estado: perfil.preferenciasAlimentares && perfil.preferenciasAlimentares.trim().length > 5 ? 'completo' : 'falta',
      razao: 'keto, jejum, restrições · evita prescrições erradas'
    },
    metas: {
      estado: perfil.metas.calorias && perfil.metas.proteinaG ? 'completo' : 'falta',
      razao: 'kcal/macros · podes calcular com a coach'
    }
  }

  const completos = Object.values(estados).filter(e => e.estado === 'completo').length
  const total = Object.keys(estados).length

  return (
    <div className="space-y-6">
      <section className="card-feature space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="label-cap">setup da coach</span>
          <span className="tnum text-[12px]" style={{ color: completos === total ? '#7B9A4F' : completos >= 5 ? '#D4A14E' : '#C9614E' }}>
            {completos}/{total}
          </span>
        </div>
        <p className="text-faint text-[11.5px] leading-relaxed">
          a coach usa estes dados em <strong>cada</strong> conversa. preenche uma vez · ela passa a ter contexto sem ter de perguntar.
        </p>
        <ul className="space-y-1.5 pt-1">
          {Object.entries(estados).map(([key, info]) => (
            <li key={key} className="flex items-baseline gap-2 text-[12px]">
              {info.estado === 'completo'
                ? <Check size={11} strokeWidth={2.5} className="text-oliva shrink-0 mt-0.5" />
                : <AlertCircle size={11} strokeWidth={2} className={info.estado === 'parcial' ? 'text-ouro shrink-0 mt-0.5' : 'text-terracota shrink-0 mt-0.5'} />}
              <span className={info.estado === 'completo' ? 'text-soft' : 'text-tinta dark:text-creme'}>{labels[key]}</span>
              <span className="text-faint">· {info.razao}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* IDENTIDADE */}
      <Bloco estado={estados.identidade.estado} titulo="identidade">
        <Campo label="Nome">
          <input
            type="text"
            value={perfil.nome}
            onChange={e => guardar({ nome: e.target.value })}
            className="input-base"
            placeholder="como te chamo"
          />
        </Campo>
        <Campo label="Sexo">
          <div className="flex gap-2">
            {(['F', 'M', 'O'] as const).map(s => (
              <button
                key={s}
                onClick={() => guardar({ sexo: s })}
                className={cn(
                  'flex-1 rounded-md py-2 text-[12px] transition-elegant active:scale-95',
                  perfil.sexo === s ? 'bg-tinta text-creme dark:bg-ouro dark:text-tinta' : 'bg-[var(--surface-soft)] text-soft'
                )}
              >{s === 'F' ? 'feminino' : s === 'M' ? 'masculino' : 'outro'}</button>
            ))}
          </div>
        </Campo>
      </Bloco>

      {/* BIOMETRIA */}
      <Bloco estado={estados.biometria.estado} titulo="biometria">
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Altura · cm">
            <input
              type="number"
              inputMode="numeric"
              value={perfil.alturaCm ?? ''}
              onChange={e => guardar({ alturaCm: e.target.value ? Number(e.target.value) : null })}
              className="input-base"
              placeholder="ex: 168"
            />
          </Campo>
          <Campo label="Idade">
            <input
              type="number"
              inputMode="numeric"
              value={perfil.idade ?? ''}
              onChange={e => guardar({ idade: e.target.value ? Number(e.target.value) : null })}
              className="input-base"
              placeholder="anos"
            />
          </Campo>
        </div>
      </Bloco>

      {/* ACTIVIDADE */}
      <Bloco estado={estados.actividade.estado} titulo="nível de actividade">
        <select
          value={perfil.nivelActividade ?? ''}
          onChange={e => guardar({ nivelActividade: (e.target.value || null) as Profile['nivelActividade'] })}
          className="input-base"
        >
          <option value="">— escolher —</option>
          <option value="sedentaria">sedentária · escritório, pouco movimento</option>
          <option value="leve">leve · 1-2× treino/sem ou caminhar dia a dia</option>
          <option value="moderada">moderada · 3-4× treino/sem</option>
          <option value="activa">activa · 5-6× treino/sem ou trabalho físico</option>
        </select>
      </Bloco>

      {/* HISTÓRICO CLÍNICO */}
      <Bloco estado={estados.historico.estado} titulo="histórico clínico · medicação">
        <textarea
          rows={5}
          value={perfil.historicoClinico ?? ''}
          onChange={e => guardar({ historicoClinico: e.target.value })}
          className="input-base resize-none text-[13px]"
          placeholder={'tudo o que importa para a coach saber:\n\nex:\n- parei Mounjaro há 1 mês (18 meses, descontinuação gradual q15d)\n- perimenopausa\n- musculação séria dez-fev\n- atleta histórico (10K em 31:13 · jejum em cetose)\n- ferro baixo histórico'}
        />
        <p className="text-faint text-[10.5px] leading-relaxed">
          escreve em pontos · a coach lê isto em <strong>cada</strong> conversa e factor-iza na análise.
        </p>
      </Bloco>

      {/* PROTOCOLO ALIMENTAR */}
      <Bloco estado={estados.protocolo.estado} titulo="protocolo alimentar">
        <textarea
          rows={4}
          value={perfil.preferenciasAlimentares ?? ''}
          onChange={e => guardar({ preferenciasAlimentares: e.target.value })}
          className="input-base resize-none text-[13px]"
          placeholder={'ex:\n- keto adaptada (anos)\n- tecto carbo: 50g em dias soltos · alvo <30g\n- proteína 1.2-1.5g/kg (NÃO 2.2g/kg · tira da cetose)\n- jejum 14-16h · janela 9-19h\n- sem glúten'}
        />
        <p className="text-faint text-[10.5px] leading-relaxed">
          a coach adapta as recomendações ao protocolo · não dá conselhos genéricos.
        </p>
      </Bloco>

      {/* METAS */}
      <Bloco estado={estados.metas.estado} titulo="metas · kcal e macros">
        <div className="grid grid-cols-2 gap-2">
          <Campo label="kcal">
            <input
              type="number"
              inputMode="numeric"
              value={perfil.metas.calorias ?? ''}
              onChange={e => guardar({ metas: { ...perfil.metas, calorias: e.target.value ? Number(e.target.value) : null } })}
              className="input-base"
              placeholder="ex: 1500"
            />
          </Campo>
          <Campo label="Proteína g">
            <input
              type="number"
              inputMode="numeric"
              value={perfil.metas.proteinaG ?? ''}
              onChange={e => guardar({ metas: { ...perfil.metas, proteinaG: e.target.value ? Number(e.target.value) : null } })}
              className="input-base"
              placeholder="ex: 110"
            />
          </Campo>
          <Campo label="Carbo g">
            <input
              type="number"
              inputMode="numeric"
              value={perfil.metas.carboG ?? ''}
              onChange={e => guardar({ metas: { ...perfil.metas, carboG: e.target.value ? Number(e.target.value) : null } })}
              className="input-base"
              placeholder="ex: 30"
            />
          </Campo>
          <Campo label="Gordura g">
            <input
              type="number"
              inputMode="numeric"
              value={perfil.metas.gorduraG ?? ''}
              onChange={e => guardar({ metas: { ...perfil.metas, gorduraG: e.target.value ? Number(e.target.value) : null } })}
              className="input-base"
              placeholder="ex: 115"
            />
          </Campo>
        </div>
        <p className="text-faint text-[10.5px] leading-relaxed">
          se preferires que a coach calcule, deixa em branco e diz-lhe &ldquo;calcula metas&rdquo;.
        </p>
      </Bloco>
    </div>
  )
}

const labels: Record<string, string> = {
  identidade: 'identidade',
  biometria: 'altura + idade',
  actividade: 'nível actividade',
  peso: 'peso registado',
  historico: 'histórico clínico',
  protocolo: 'protocolo alimentar',
  metas: 'metas'
}

function Bloco({ estado, titulo, children }: { estado: Estado; titulo: string; children: React.ReactNode }) {
  return (
    <section className="card-solid space-y-3">
      <div className="flex items-center gap-2">
        {estado === 'completo'
          ? <Check size={12} strokeWidth={2.5} className="text-oliva" />
          : <AlertCircle size={12} strokeWidth={2} className={estado === 'parcial' ? 'text-ouro' : 'text-terracota'} />}
        <span className="label-cap">{titulo}</span>
      </div>
      {children}
    </section>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="label-cap text-[10px]">{label}</span>
      {children}
    </label>
  )
}
