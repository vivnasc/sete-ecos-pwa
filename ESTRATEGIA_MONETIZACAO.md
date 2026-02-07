# ESTRATEGIA DE MONETIZACAO - SETE ECOS

> Documento estrategico para maximizar receita do ecossistema SETE ECOS.
> Criado: Fevereiro 2026

---

## DIAGNOSTICO ATUAL

### O que ja funciona
- Produto diferenciado (7 Ecos, abordagem holistica feminina)
- Credibilidade da coach (Vivianne: Precision Nutrition L1, ISSA, autora)
- Funil free-to-paid (LUMINA gratuito → VITALIS pago)
- Mercado sub-servido (wellness em portugues para Africa/Portugal)
- Gamificacao robusta (30+ conquistas, XP, streaks)
- Suporte emocional unico (Espaco de Retorno)

### Problemas criticos de monetizacao

| Problema | Impacto | Prioridade |
|----------|---------|------------|
| Trial de 0 dias no Vitalis | Sem experiencia do produto antes de pagar | CRITICA |
| Sem bundle Vitalis + Aurea | Perde receita de cross-sell | ALTA |
| Sem sistema de referral | Crescimento organico limitado | ALTA |
| Sem upsell apos leitura Lumina | Funil incompleto | ALTA |
| Sem incentivos de renovacao | Churn evitavel | MEDIA |
| Comunidade totalmente gratuita | Valor nao monetizado | MEDIA |
| Dependencia de uma unica coach | Escalabilidade limitada | MEDIA-LONGA |

---

## ESTRATEGIA 1: TRIAL GRATUITO DE 7 DIAS (IMPLEMENTADO)

**Problema**: Com 0 dias de trial, a utilizadora tem de pagar antes de experimentar qualquer feature do Vitalis. Isto cria uma barreira enorme de conversao.

**Solucao**: Ativar trial de 7 dias no Vitalis (ja existe no Aurea).

**Impacto esperado**: Aumento de 30-50% na taxa de conversao.

**Mecanica**:
- Utilizadora faz registo → Acesso completo por 7 dias
- Dia 5: Notificacao "Faltam 2 dias"
- Dia 7: Expira → Redireciona para pagamento
- Banner permanente durante trial mostrando dias restantes

**Ficheiro alterado**: `src/lib/subscriptions.js` → `TRIAL_DAYS: 7`

---

## ESTRATEGIA 2: BUNDLE VITALIS + AUREA (IMPLEMENTADO)

**Problema**: Quem usa Vitalis provavelmente quer Aurea, mas nao ha incentivo para comprar os dois juntos. Sao vendidos separadamente sem desconto combinado.

**Solucao**: Criar planos bundle com 25% de desconto vs comprar separadamente.

**Precos bundle**:

| Plano | Preco Individual | Preco Bundle | Desconto |
|-------|-----------------|--------------|----------|
| Mensal | 3.475 MZN ($53) | 2.600 MZN ($40) | 25% |
| Semestral | 17.765 MZN ($271) | 13.300 MZN ($204) | 25% |
| Anual | 30.945 MZN ($473) | 23.200 MZN ($355) | 25% |

**Impacto esperado**: Aumento de 15-25% no ARPU (receita media por utilizadora).

**Ficheiro alterado**: `src/lib/subscriptions.js` → `BUNDLE_PLANS`

---

## ESTRATEGIA 3: SISTEMA DE REFERRAL (IMPLEMENTADO)

**Problema**: Crescimento depende exclusivamente de marketing direto da Vivianne. Sem viralidade organica.

**Solucao**: Sistema "Convida & Ganha" onde:
- Quem convida: Ganha 7 dias gratis adicionados a subscricao
- Quem e convidada: Ganha 7 dias de trial gratis
- Limite: 10 convites ativos por utilizadora

**Mecanica**:
1. Utilizadora gera link pessoal de referral
2. Nova utilizadora regista-se com o link
3. Nova utilizadora recebe 7 dias trial
4. Quando nova utilizadora PAGA, a referrer ganha +7 dias
5. Tracking via `referral_codes` e `referral_uses`

**Impacto esperado**: 20-40% de novas aquisicoes via referral em 6 meses.

**Ficheiro criado**: `src/lib/referrals.js`

---

## ESTRATEGIA 4: UPSELL INTELIGENTE LUMINA → VITALIS (IMPLEMENTADO)

**Problema**: A utilizadora faz o check-in Lumina, recebe a leitura, e... nada. Nao ha ponte para o Vitalis. O funil quebra.

**Solucao**: Apos cada leitura Lumina, mostrar recomendacao contextual:

| Padrao Lumina | Mensagem de Upsell |
|---------------|-------------------|
| corpoGrita, esgotamento | "O teu corpo esta a pedir atencao. O Vitalis pode ajudar-te com um plano personalizado." |
| menteSabota, falsaClareza | "A tua mente precisa de equilibrio. No Aurea encontras micro-praticas para isso." |
| crit_* (criticos) | "Precisas de apoio real. A coach Vivianne esta no Vitalis para te guiar." |
| forcaMax, alinhamento | "Estas no teu melhor! Maximiza este momento com o plano Vitalis." |

**Mecanica**:
- Aparece como card elegante apos a leitura
- Botao "Experimentar 7 dias gratis"
- So aparece para quem NAO tem Vitalis/Aurea
- Nao e invasivo - aparece como sugestao natural

**Ficheiro criado**: `src/components/UpsellCard.jsx`

---

## ESTRATEGIA 5: INCENTIVOS DE RENOVACAO (IMPLEMENTADO)

**Problema**: Quando a subscricao expira, a utilizadora simplesmente perde acesso. Nao ha incentivo para renovar vs abandonar.

**Solucao**: Sistema de incentivos progressivos:

| Momento | Acao |
|---------|------|
| 14 dias antes de expirar | Banner: "Renova agora e ganha 10% desconto" |
| 7 dias antes | Banner: "Ultima semana! 15% desconto na renovacao" |
| Dia da expiracao | Banner: "Renova hoje e mantem as tuas conquistas" |
| 7 dias depois | Email: "Sentimos a tua falta. 20% desconto para voltar" |

**Mecanica**:
- Descontos de renovacao aplicados automaticamente
- Conquistas e streaks CONGELADOS (nao perdidos) para quem renova em 30 dias
- "Win-back" emails automaticos via coach dashboard

**Ficheiro alterado**: `src/lib/subscriptions.js` → `RENEWAL_INCENTIVES`

---

## ESTRATEGIA 6: MONETIZAR COMUNIDADE (FUTURA)

**Problema**: A Comunidade e totalmente gratuita mas tem features premium-worthy.

**Solucao em fases**:

### Fase 1 (Agora): Manter gratuita como retencao
- A comunidade REDUZ churn de utilizadoras pagas
- "Lock-in" social: quem tem conexoes na comunidade cancela menos
- Manter gratuita enquanto base de utilizadoras < 500

### Fase 2 (500+ utilizadoras): Freemium comunitario
- **Gratis**: O Rio (reflexoes), Fogueira (diaria)
- **Premium (incluido no Vitalis/Aurea)**: Circulos privados, Sussurros ilimitados
- **Premium standalone**: 500 MZN/mes ($8)

### Fase 3 (1000+ utilizadoras): Marketplace
- Circulos tematicos pagos (liderados por facilitadoras certificadas)
- Workshops virtuais (one-time payments)
- Revenue share 70/30 (facilitadora/plataforma)

---

## ESTRATEGIA 7: IMAGO COMO PRODUTO PREMIUM ONE-TIME (FUTURA)

O modulo IMAGO (jornada de identidade de 8 semanas) deve ser um **pagamento unico**, nao subscricao.

**Preco sugerido**: 15.000 MZN ($230 USD)

**Justificacao**:
- E uma jornada com inicio e fim (8 semanas)
- Valor percebido alto (transformacao de identidade)
- Pagamento unico remove barreira de compromisso recorrente
- Pode ser vendido como "graduacao" apos Vitalis + Aurea

---

## ESTRATEGIA 8: WORKSHOPS E EVENTOS PAGOS (FUTURA)

**Formato**: Workshops online ao vivo com Vivianne

**Exemplos**:
- "Jejum Intermitente no Ramadao" (sazonal, 3.000 MZN)
- "Detox Emocional de 3 Dias" (trimestral, 2.500 MZN)
- "Planeamento Alimentar Semanal" (mensal, 1.500 MZN)

**Mecanica**:
- Venda via app com pagamento integrado
- Gravacao disponivel por 30 dias
- Participantes do workshop ganham 15% desconto na subscricao

---

## ESTRATEGIA 9: PROGRAMA DE COACHES CERTIFICADAS (LONGO PRAZO)

**Problema**: Vivianne e a unica coach. Isto limita escalabilidade.

**Solucao**: Certificacao "Facilitadora SETE ECOS"

**Modelo**:
- Formacao: 25.000 MZN ($385)
- As coaches certificadas usam a plataforma com as suas clientes
- Plataforma cobra 15% das subscricoes geradas pela coach
- Coach ganha 85% das subscricoes dos seus clientes

**Receita potencial com 20 coaches**:
- 20 coaches x 15 clientes cada x $38/mes x 15% = $1.710/mes passivo

---

## ESTRATEGIA 10: CONTEUDO COMO LEAD MAGNET (MARKETING)

**Objectivo**: Gerar leads qualificadas que se convertem em utilizadoras pagas.

**Lead magnets sugeridos**:
1. **PDF gratuito**: "7 Sinais de que o Teu Corpo Precisa de Atencao" (captura email)
2. **Mini-curso WhatsApp**: 5 dias de dicas de nutricao via broadcast
3. **Quiz online**: "Qual Eco Precisas Agora?" (resultado = landing page do eco)
4. **Instagram Reels**: Demonstracoes do app + testemunhos reais

**Funil**:
```
Lead Magnet → Email/WhatsApp → LUMINA (gratis) → Trial 7 dias → Pagamento
```

---

## PROJECAO DE RECEITA

### Cenario Conservador (6 meses)

| Fonte | Utilizadoras | Receita Mensal |
|-------|-------------|----------------|
| Vitalis mensal | 30 | $1.140 |
| Vitalis semestral | 15 | $475 |
| Vitalis anual | 10 | $267 |
| Aurea mensal | 20 | $300 |
| Bundle mensal | 10 | $400 |
| **Total** | **85** | **$2.582/mes** |

### Cenario Otimista (12 meses)

| Fonte | Utilizadoras | Receita Mensal |
|-------|-------------|----------------|
| Vitalis (todos planos) | 120 | $3.200 |
| Aurea (todos planos) | 60 | $900 |
| Bundles | 40 | $1.600 |
| Workshops (trimestral) | 30 | $375 |
| **Total** | **250** | **$6.075/mes** |

### Cenario Ambicioso (24 meses, com coaches)

| Fonte | Receita Mensal |
|-------|----------------|
| Subscricoes diretas | $8.000 |
| Coaches certificadas (20) | $1.710 |
| Workshops/eventos | $1.500 |
| IMAGO one-time (5/mes) | $1.150 |
| **Total** | **$12.360/mes** |

---

## PRIORIDADES DE IMPLEMENTACAO

### Sprint 1 (Esta sessao) ✅
1. ~~Ativar trial 7 dias no Vitalis~~
2. ~~Criar bundle Vitalis + Aurea~~
3. ~~Sistema de referral~~
4. ~~Upsell Lumina → Vitalis~~
5. ~~Incentivos de renovacao~~

### Sprint 2 (Proximo)
1. Landing page do bundle
2. Emails automaticos de trial expiring
3. UI de referral no perfil da utilizadora
4. Dashboard de metricas de conversao para coach
5. Integrar upsell card no fluxo Lumina

### Sprint 3 (Futuro)
1. Freemium comunitario
2. Sistema de workshops
3. IMAGO como produto one-time
4. Programa de coaches

---

## METRICAS A ACOMPANHAR

| Metrica | Meta 6 meses | Como medir |
|---------|-------------|------------|
| Taxa de conversao trial→pago | 25% | `subscription_log` |
| ARPU (receita/utilizadora) | $45/mes | `payment_logs` |
| Churn mensal | <8% | Subscricoes expiradas/total |
| Referrals por utilizadora | 1.5 | `referral_uses` |
| Lumina→Vitalis conversao | 10% | Tracking upsell clicks |
| Bundle adoption rate | 20% | Bundle vs individual |

---

*Este documento deve ser revisto mensalmente com base nos dados reais do coach dashboard.*
