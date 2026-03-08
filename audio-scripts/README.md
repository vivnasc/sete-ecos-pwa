# Scripts de Áudio — SETE ECOS
**Total: 19 áudios a produzir** | Prazo: 13 de Março de 2026

---

## Como usar este repositório

Cada ficheiro `.md` contém:
- Metadados do áudio (módulo, duração, tipo, nível de acesso)
- **Script completo** para leitura/gravação
- Notas de entoação para o estúdio

**Voz**: Feminina, suave, ritmo lento. Pausas respeitadas.
**Língua**: Português (PT/MZ) — manter acentos sempre.
**Formato final de ficheiro**: `.mp3` estéreo, 44.1kHz, 128kbps mínimo.

---

## Índice completo

### ÁUREA — 8 áudios (🔴 PRIORIDADE MÁXIMA)
> Player já funcional na app. Assim que a URL for adicionada, fica disponível.

| # | Ficheiro | Título | Duração | Tipo | Nível |
|---|----------|--------|---------|------|-------|
| 01 | [AUREA/01-valor-nao-se-ganha.md](./AUREA/01-valor-nao-se-ganha.md) | O Teu Valor Não Se Ganha | 5–7 min | Meditação | Bronze |
| 02 | [AUREA/02-eu-sou-prioridade.md](./AUREA/02-eu-sou-prioridade.md) | Eu Sou Prioridade | 3–4 min | Afirmações | Bronze |
| 03 | [AUREA/03-culpa-nao-te-pertence.md](./AUREA/03-culpa-nao-te-pertence.md) | A Culpa Que Não Te Pertence | 6–8 min | Meditação | Prata |
| 04 | [AUREA/04-ritual-auto-cuidado.md](./AUREA/04-ritual-auto-cuidado.md) | Pequeno Ritual de Auto-Cuidado | 4–5 min | Guiado | Bronze |
| 05 | [AUREA/05-espelho-interior.md](./AUREA/05-espelho-interior.md) | O Espelho Interior | 5–6 min | Meditação | Prata |
| 06 | [AUREA/06-abundancia-merecimento.md](./AUREA/06-abundancia-merecimento.md) | Abundância e Merecimento | 3–4 min | Afirmações | Prata |
| 07 | [AUREA/07-soltar-o-dia.md](./AUREA/07-soltar-o-dia.md) | Soltar o Dia | 5–6 min | Ritual noturno | Bronze |
| 08 | [AUREA/08-lembrete-1-minuto.md](./AUREA/08-lembrete-1-minuto.md) | Lembrete de 1 Minuto | 1 min | Quick reminder | Bronze |

**Total ÁUREA: ~35–45 min de gravação**

---

### IMAGO — 5 áudios (🟡 PRIORIDADE MÉDIA)
> Player atual é baseado em texto. Áudio seria narração de fundo opcional mas com grande impacto.

| # | Ficheiro | Título | Duração | Tipo |
|---|----------|--------|---------|------|
| 09 | [IMAGO/09-sem-rotulos.md](./IMAGO/09-sem-rotulos.md) | Quem sou sem rótulos? | 10 min | Meditação |
| 10 | [IMAGO/10-eu-essencial.md](./IMAGO/10-eu-essencial.md) | O meu eu essencial | 12 min | Meditação |
| 11 | [IMAGO/11-integracao-7-ecos.md](./IMAGO/11-integracao-7-ecos.md) | Integração dos 7 Ecos | 15 min | Meditação |
| 12 | [IMAGO/12-soltar-versoes.md](./IMAGO/12-soltar-versoes.md) | Soltar versões antigas | 12 min | Ritual |
| 13 | [IMAGO/13-corpo-identidade.md](./IMAGO/13-corpo-identidade.md) | O corpo como identidade | 8 min | Meditação |

**Total IMAGO: ~55–60 min de gravação**

---

### SERENA — 6 áudios (🟢 PRIORIDADE OPCIONAL)
> Exige também mudança no componente `RespiracaoGuiada.jsx` para reproduzir áudio.
> Gravar se sobrar tempo e créditos.

| # | Ficheiro | Técnica | Duração | Uso |
|---|----------|---------|---------|-----|
| 14 | [SERENA/14-respiracao-4-7-8.md](./SERENA/14-respiracao-4-7-8.md) | Respiração 4-7-8 | ~4 min | Ansiedade, insónia |
| 15 | [SERENA/15-respiracao-box.md](./SERENA/15-respiracao-box.md) | Respiração Box | ~4 min | Stress, foco |
| 16 | [SERENA/16-respiracao-oceanica.md](./SERENA/16-respiracao-oceanica.md) | Respiração Oceânica | ~4 min | Calma, presença |
| 17 | [SERENA/17-suspiro-fisiologico.md](./SERENA/17-suspiro-fisiologico.md) | Suspiro Fisiológico | ~2 min | Pânico, emergência |
| 18 | [SERENA/18-respiracao-alternada.md](./SERENA/18-respiracao-alternada.md) | Respiração Alternada | ~4 min | Equilíbrio, clareza |
| 19 | [SERENA/19-coerencia-cardiaca.md](./SERENA/19-coerencia-cardiaca.md) | Coerência Cardíaca | ~5 min | Regulação emocional |

**Total SERENA: ~25 min de gravação**

---

## Ordem de produção recomendada

```
DIA 1-2:  ÁUREA 01, 02, 07, 08 (os mais curtos — testar a voz)
DIA 3:    ÁUREA 03, 04, 05, 06 (os mais longos)
DIA 4-5:  IMAGO 09–13 (se ainda houver créditos)
DEPOIS:   SERENA 14–19 (requer mudança no código também)
```

---

## Depois de gravar — o que fazer

1. Fazer upload dos ficheiros `.mp3` para o Supabase Storage ou outro host
2. Copiar a URL pública de cada ficheiro
3. Abrir `src/components/aurea/AudioMeditacoes.jsx`
4. Procurar `audio_url: null` para cada áudio e substituir pela URL
5. Para IMAGO: atualizar o componente `MeditacoesEssencia.jsx` (requer desenvolvimento)
6. Para SERENA: requer alteração no componente (avisar Vivianne)

---

*Gerado em: 8 de Março de 2026*
