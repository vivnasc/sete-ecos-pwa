# SETE ECOS - PWA

Sistema de Transmutação Feminina

## Setup

### 1. Instalar dependências

    npm install

### 2. Configurar Supabase

Cria um ficheiro `.env` na raiz do projecto:

    VITE_SUPABASE_URL=https://vvvdtogvlutrybultffx.supabase.co
    VITE_SUPABASE_ANON_KEY=sua_chave_publishable_completa

**IMPORTANTE:** Vai ao Supabase Dashboard > Settings > API Keys e copia a chave "Publishable key" completa.

### 3. Executar em desenvolvimento

    npm run dev

A app abre em `http://localhost:3000`

### 4. Build para produção

    npm run build

## Estrutura

    src/
    ├── components/     # Componentes reutilizáveis
    │   ├── Auth.jsx           # Login/Registo
    │   ├── LuminaCheckin.jsx  # Check-in 7 inputs
    │   ├── LuminaLeitura.jsx  # Resultado da leitura
    │   └── Navigation.jsx     # Menu inferior
    ├── pages/          # Páginas
    │   ├── Home.jsx           # Página inicial
    │   └── Lumina.jsx         # Módulo LUMINA
    ├── lib/            # Lógica
    │   ├── supabase.js        # Cliente e funções Supabase
    │   └── lumina-leituras.js # Sistema de leituras (23 padrões)
    ├── styles/         # Estilos
    │   └── global.css         # Variáveis e reset
    └── App.jsx         # Routing e autenticação

## Módulos

* [x] **LUMINA** - Diagnóstico (grátis)
* [ ] **VITALIS** - Corpo/Nutrição
* [ ] **SERENA** - Emoção
* [ ] **IGNIS** - Vontade/Foco
* [ ] **VENTIS** - Energia/Ritmo
* [ ] **ECOA** - Expressão/Voz
* [ ] **IMAGO** - Identidade

## Deploy

Recomendado: **Vercel**

1. Push para GitHub
2. Conecta Vercel ao repo
3. Adiciona variáveis de ambiente
4. Deploy automático

* * *

© Vivianne dos Santos
