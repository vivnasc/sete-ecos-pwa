// Regras de Ouro por abordagem alimentar
// Baseado no plano keto manual da Vivianne — adaptado para todas as abordagens
// Usado em: DashboardVitalis (card colapsável) e PlanoHTML (página de regras)

export const REGRAS_OURO = {
  keto_if: [
    {
      titulo: 'Janela alimentar',
      descricao: 'Não comes nada fora da tua janela. Água, chá e café preto são livres.',
      emoji: '⏰'
    },
    {
      titulo: 'Açúcar e farinha = ZERO',
      descricao: 'Sem pão, arroz, massas, batata, fruta (excepto frutos vermelhos pontualmente).',
      emoji: '🚫'
    },
    {
      titulo: 'Gordura é amiga',
      descricao: 'Azeite, manteiga, óleo de coco, abacate. A gordura é o teu combustível.',
      emoji: '🥑'
    },
    {
      titulo: 'Proteína moderada',
      descricao: 'Uma palma por refeição. Suficiente para manter, não tanto que tire a cetose.',
      emoji: '🍗'
    },
    {
      titulo: 'Vegetais verdes à vontade',
      descricao: 'Couve, alface, espinafre, brócolos, pepino. Evita cenoura, beterraba, batata-doce.',
      emoji: '🥬'
    },
    {
      titulo: 'Sal, água e eletrólitos',
      descricao: 'Bebe 2.5-3L de água. Sal generoso na comida. Magnésio à noite.',
      emoji: '💧'
    },
    {
      titulo: 'Mede além da balança',
      descricao: 'Cintura e ancas a cada 2 semanas. A fita métrica não mente.',
      emoji: '📏'
    }
  ],
  low_carb: [
    {
      titulo: 'Reduz hidratos, não elimines',
      descricao: 'Uma mão por refeição no máximo. Prefere arroz integral, batata-doce.',
      emoji: '🍚'
    },
    {
      titulo: 'Proteína em cada refeição',
      descricao: 'Uma palma de proteína sempre. Frango, peixe, ovos, feijão.',
      emoji: '🍗'
    },
    {
      titulo: 'Legumes primeiro',
      descricao: 'Começa pelo prato de legumes. Enche o estômago com fibra.',
      emoji: '🥗'
    },
    {
      titulo: 'Açúcar processado = mínimo',
      descricao: 'Elimina refrigerantes, sumos, bolos. Fruta inteira está OK.',
      emoji: '🚫'
    },
    {
      titulo: 'Gordura com medida',
      descricao: 'Um polegar por refeição. Azeite, abacate, nozes.',
      emoji: '🥑'
    },
    {
      titulo: 'Água: 2.5L mínimo',
      descricao: 'Bebe ao longo do dia. Sede confunde-se com fome.',
      emoji: '💧'
    }
  ],
  equilibrado: [
    {
      titulo: 'Método da mão',
      descricao: '1 palma proteína + 1 punho legumes + 1 mão hidratos + 1 polegar gordura.',
      emoji: '✋'
    },
    {
      titulo: 'Come devagar',
      descricao: '20 minutos mínimo por refeição. Mastiga bem.',
      emoji: '🍽️'
    },
    {
      titulo: 'Sem saltar refeições',
      descricao: 'Mantém horários regulares. Jejum prolongado não faz parte deste plano.',
      emoji: '⏰'
    },
    {
      titulo: 'Fruta: 2-3 porções/dia',
      descricao: 'Prefere fruta inteira, não sumos. Varia as cores.',
      emoji: '🍎'
    },
    {
      titulo: 'Água: 2L mínimo',
      descricao: 'Garrafa sempre contigo. Meta: 8 copos.',
      emoji: '💧'
    },
    {
      titulo: 'Movimento diário',
      descricao: 'Pelo menos 30 minutos de caminhada ou actividade que gostes.',
      emoji: '🚶‍♀️'
    }
  ]
};

// Meta de hidratação por abordagem (litros/dia)
// Keto perde mais água por menor retenção de glicogénio → precisa de mais
export const META_AGUA_POR_ABORDAGEM = {
  keto_if: 3,
  low_carb: 2.5,
  equilibrado: 2
};

export const obterRegrasOuro = (abordagem) => {
  return REGRAS_OURO[abordagem] || REGRAS_OURO.equilibrado;
};

export const obterMetaAgua = (abordagem) => {
  return META_AGUA_POR_ABORDAGEM[abordagem] || 2;
};
