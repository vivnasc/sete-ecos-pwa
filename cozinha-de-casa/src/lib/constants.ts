export const STOCK_CATEGORIES = [
  "Proteínas",
  "Vegetais",
  "Frutas",
  "Cereais/Grãos",
  "Lacticínios",
  "Temperos/Especiarias",
  "Óleos/Gorduras",
  "Conservas/Enlatados",
  "Congelados",
  "Bebidas",
  "Limpeza/Casa",
  "Outros",
] as const;

export const STOCK_LOCATIONS = [
  { value: "fridge", label: "Frigorífico", emoji: "🧊" },
  { value: "freezer", label: "Congelador", emoji: "❄️" },
  { value: "pantry", label: "Despensa", emoji: "🏠" },
  { value: "shelf", label: "Prateleira", emoji: "📦" },
] as const;

export const STOCK_UNITS = [
  "kg", "g", "litro", "ml", "un", "molho", "lata", "pacote", "garrafa", "dúzia", "fatia",
] as const;

export const RECIPE_CATEGORIES = [
  "Prato principal",
  "Acompanhamento",
  "Sopa",
  "Lancheira",
  "Pequeno-almoço",
  "Sobremesa",
  "Lanche",
  "Bebida",
] as const;

export const RECIPE_CUISINES = [
  "Moçambicana",
  "Portuguesa",
  "Asiática",
  "Italiana",
  "Outra",
] as const;

export const RECIPE_TAGS = [
  "Moçambicana",
  "Portuguesa",
  "Internacional",
  "Rápida",
  "Low Carb",
  "Sem Leite",
  "Sem Trigo",
  "Sem Ovos",
  "Comfort Food",
  "Para Congelar",
] as const;

export const RECIPE_DIFFICULTIES = ["Fácil", "Médio", "Difícil"] as const;

export const SHOPPING_SECTIONS = [
  { value: "Mercado", label: "Mercado / Barraca", emoji: "🥬" },
  { value: "Supermercado", label: "Supermercado", emoji: "🛒" },
  { value: "Talho", label: "Talho / Peixaria", emoji: "🥩" },
  { value: "Komatipoort", label: "Komatipoort", emoji: "🇿🇦" },
  { value: "Outros", label: "Outros", emoji: "📦" },
] as const;

export const MENU_SLOTS = [
  { value: "lunchbox_lowcarb", label: "🥗 Lancheira Low Carb", sublabel: "Vivianne" },
  { value: "lunchbox_school", label: "🎒 Lancheira Escolar", sublabel: "Ticy + Breno" },
  { value: "dinner", label: "🍽️ Jantar", sublabel: "Família" },
  { value: "dinner_adapted", label: "🥦 Adaptação Vivianne", sublabel: "Sem leite/trigo" },
] as const;

export const DAYS_OF_WEEK = [
  "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo",
] as const;
