// src/lib/vitalis/alimentosDb.js
// Base de dados de alimentos com dados nutricionais reais (por 100g)
// ~400+ alimentos: internacional, moçambicano, português, brasileiro

export const CATEGORIAS_ALIMENTOS = {
  proteina: { label: 'Proteína', emoji: '🫲', cor: 'rose', medidaMao: 'palma' },
  hidrato: { label: 'Hidratos', emoji: '🤲', cor: 'amber', medidaMao: 'concha' },
  gordura: { label: 'Gordura', emoji: '👍', cor: 'purple', medidaMao: 'polegar' },
  legume: { label: 'Legumes', emoji: '✊', cor: 'green', medidaMao: 'punho' },
  fruta: { label: 'Frutas', emoji: '🍎', cor: 'pink', medidaMao: 'punho' },
  lacteo: { label: 'Lacticínios', emoji: '🥛', cor: 'blue', medidaMao: 'concha' },
  bebida: { label: 'Bebidas', emoji: '☕', cor: 'cyan', medidaMao: null },
  snack: { label: 'Snacks', emoji: '🍫', cor: 'orange', medidaMao: 'concha' },
  condimento: { label: 'Condimentos', emoji: '🧂', cor: 'gray', medidaMao: 'polegar' },
  prato_composto: { label: 'Pratos', emoji: '🍽️', cor: 'teal', medidaMao: null }
};

// Helper para criar alimento
function a(id, nome, cat, sub, orig, cal, prot, carb, gord, fibra, porcG, porcDesc, maoTipo, maoG, tags, icon) {
  return { id, nome, categoria: cat, subcategoria: sub, origem: orig, calorias_100g: cal, proteina_100g: prot, carboidratos_100g: carb, gordura_100g: gord, fibra_100g: fibra, porcao_padrao_g: porcG, porcao_padrao_desc: porcDesc, porcao_mao_tipo: maoTipo, porcao_mao_g: maoG, tags, icon, fonte: 'sistema' };
}

export const ALIMENTOS_DB = [
  // ═══════════════════════════════════════
  // PROTEÍNAS — Carnes Brancas
  // ═══════════════════════════════════════
  a('frango-peito','Frango — peito grelhado','proteina','carne_branca','internacional',165,31,0,3.6,0,120,'1 peito médio','palma',120,['sem_gluten','sem_lactose','halal'],'🍗'),
  a('frango-coxa','Frango — coxa grelhada','proteina','carne_branca','internacional',209,26,0,11,0,100,'1 coxa','palma',120,['sem_gluten','sem_lactose','halal'],'🍗'),
  a('frango-asa','Frango — asa grelhada','proteina','carne_branca','internacional',203,30,0,8,0,80,'2 asas','palma',120,['sem_gluten','sem_lactose','halal'],'🍗'),
  a('peru-peito','Peru — peito grelhado','proteina','carne_branca','internacional',135,30,0,1,0,120,'1 fatia grande','palma',120,['sem_gluten','sem_lactose','halal'],'🦃'),
  a('peru-fiambre','Fiambre de peru','proteina','carne_branca','internacional',104,18,2,3,0,30,'2 fatias','palma',120,['sem_gluten','sem_lactose','halal'],'🦃'),

  // Carnes Vermelhas
  a('vaca-bife','Bife de vaca grelhado','proteina','carne_vermelha','internacional',250,26,0,15,0,120,'1 bife médio','palma',120,['sem_gluten','sem_lactose'],'🥩'),
  a('vaca-moida','Carne moída (magra)','proteina','carne_vermelha','internacional',176,20,0,10,0,100,'1 porção','palma',120,['sem_gluten','sem_lactose'],'🥩'),
  a('vaca-entrecosto','Entrecosto','proteina','carne_vermelha','internacional',291,25,0,21,0,150,'1 porção','palma',120,['sem_gluten','sem_lactose'],'🥩'),
  a('borrego-costeleta','Borrego — costeleta','proteina','carne_vermelha','internacional',282,25,0,20,0,100,'2 costeletas','palma',120,['sem_gluten','sem_lactose','halal'],'🥩'),
  a('porco-lombo','Porco — lombo grelhado','proteina','carne_vermelha','internacional',196,27,0,9,0,120,'1 fatia grossa','palma',120,['sem_gluten','sem_lactose'],'🥩'),
  a('porco-costeleta','Porco — costeleta','proteina','carne_vermelha','internacional',231,25,0,14,0,100,'1 costeleta','palma',120,['sem_gluten','sem_lactose'],'🥩'),
  a('cabrito','Cabrito assado','proteina','carne_vermelha','mocambicana',143,27,0,3,0,120,'1 porção','palma',120,['sem_gluten','sem_lactose','halal'],'🥩'),

  // Peixes
  a('salmao','Salmão grelhado','proteina','peixe','internacional',208,20,0,13,0,130,'1 posta','palma',130,['sem_gluten','sem_lactose'],'🐟'),
  a('atum-fresco','Atum fresco grelhado','proteina','peixe','internacional',132,29,0,1,0,130,'1 posta','palma',130,['sem_gluten','sem_lactose'],'🐟'),
  a('atum-lata','Atum em lata (água)','proteina','peixe','internacional',108,24,0,1,0,80,'1 lata escorrida','palma',120,['sem_gluten','sem_lactose'],'🐠'),
  a('sardinha-grelhada','Sardinha grelhada','proteina','peixe','portuguesa',208,25,0,11,0,100,'3 sardinhas','palma',120,['sem_gluten','sem_lactose'],'🐟'),
  a('sardinha-lata','Sardinha em lata','proteina','peixe','internacional',208,25,0,11,0,80,'1 lata','palma',120,['sem_gluten','sem_lactose'],'🐟'),
  a('bacalhau-cozido','Bacalhau cozido','proteina','peixe','portuguesa',82,18,0,0.7,0,150,'1 posta','palma',130,['sem_gluten','sem_lactose'],'🐟'),
  a('pescada-grelhada','Pescada grelhada','proteina','peixe','internacional',96,18,0,2,0,130,'1 filete','palma',130,['sem_gluten','sem_lactose'],'🐟'),
  a('tilapia','Tilápia grelhada','proteina','peixe','mocambicana',128,26,0,2.6,0,120,'1 filete','palma',120,['sem_gluten','sem_lactose','halal'],'🐟'),
  a('dourada','Dourada grelhada','proteina','peixe','portuguesa',100,20,0,2,0,150,'1 posta','palma',130,['sem_gluten','sem_lactose'],'🐟'),
  a('carapau','Carapau grelhado','proteina','peixe','portuguesa',131,20,0,5,0,100,'2 carapaus','palma',120,['sem_gluten','sem_lactose'],'🐟'),
  a('robalo','Robalo grelhado','proteina','peixe','portuguesa',97,18,0,2,0,130,'1 filete','palma',130,['sem_gluten','sem_lactose'],'🐟'),

  // Marisco
  a('camarao','Camarão cozido','proteina','marisco','mocambicana',99,24,0,0.3,0,100,'8-10 camarões','palma',120,['sem_gluten','sem_lactose','halal'],'🦐'),
  a('lula','Lula grelhada','proteina','marisco','internacional',92,15,3,1.4,0,100,'1 porção','palma',120,['sem_gluten','sem_lactose'],'🦑'),
  a('polvo','Polvo cozido','proteina','marisco','portuguesa',82,15,2,1,0,100,'1 porção','palma',120,['sem_gluten','sem_lactose'],'🐙'),
  a('mexilhao','Mexilhão cozido','proteina','marisco','portuguesa',86,12,4,2,0,100,'10 mexilhões','palma',120,['sem_gluten','sem_lactose'],'🦪'),
  a('caranguejo','Caranguejo','proteina','marisco','mocambicana',87,18,0,1.1,0,100,'1 porção','palma',120,['sem_gluten','sem_lactose','halal'],'🦀'),

  // Ovos
  a('ovo-inteiro','Ovo inteiro cozido','proteina','ovo','internacional',155,13,1.1,11,0,50,'1 ovo','palma',120,['sem_gluten','sem_lactose','vegetariano'],'🥚'),
  a('ovo-mexido','Ovo mexido','proteina','ovo','internacional',166,11,2,13,0,100,'2 ovos','palma',120,['sem_gluten','vegetariano'],'🥚'),
  a('ovo-estrelado','Ovo estrelado','proteina','ovo','internacional',196,14,0.6,15,0,50,'1 ovo','palma',120,['sem_gluten','vegetariano'],'🍳'),
  a('clara-ovo','Clara de ovo','proteina','ovo','internacional',52,11,0.7,0.2,0,33,'1 clara','palma',120,['sem_gluten','sem_lactose','vegetariano'],'🥚'),

  // Leguminosas
  a('feijao-nhemba','Feijão nhemba cozido','proteina','leguminosa','mocambicana',116,8,21,0.5,7,150,'1 concha','palma',120,['sem_gluten','sem_lactose','halal','vegano'],'🫘'),
  a('feijao-preto','Feijão preto cozido','proteina','leguminosa','internacional',132,9,24,0.5,8,150,'1 concha','palma',120,['sem_gluten','sem_lactose','halal','vegano'],'🫘'),
  a('feijao-encarnado','Feijão encarnado cozido','proteina','leguminosa','internacional',127,9,22,0.5,7,150,'1 concha','palma',120,['sem_gluten','sem_lactose','halal','vegano'],'🫘'),
  a('feijao-manteiga','Feijão manteiga cozido','proteina','leguminosa','mocambicana',115,8,21,0.4,7,150,'1 concha','palma',120,['sem_gluten','sem_lactose','halal','vegano'],'🫘'),
  a('grao-bico','Grão-de-bico cozido','proteina','leguminosa','internacional',164,9,27,2.6,8,150,'1 concha','palma',120,['sem_gluten','sem_lactose','halal','vegano'],'🫘'),
  a('lentilhas','Lentilhas cozidas','proteina','leguminosa','internacional',116,9,20,0.4,8,150,'1 concha','palma',120,['sem_gluten','sem_lactose','halal','vegano'],'🫘'),
  a('ervilhas','Ervilhas cozidas','proteina','leguminosa','internacional',81,5,14,0.4,5,100,'1 concha pequena','palma',120,['sem_gluten','sem_lactose','halal','vegano'],'🫛'),
  a('tofu','Tofu firme','proteina','leguminosa','internacional',144,17,3,9,2,120,'1 fatia grossa','palma',120,['sem_gluten','sem_lactose','halal','vegano'],'🫘'),
  a('tempeh','Tempeh','proteina','leguminosa','internacional',192,20,8,11,0,100,'1 porção','palma',120,['sem_gluten','sem_lactose','vegano'],'🫘'),

  // Whey/Suplementos
  a('whey-proteina','Whey proteína (pó)','proteina','suplemento','internacional',400,80,8,6,0,30,'1 scoop','palma',120,['sem_gluten'],'🥤'),

  // ═══════════════════════════════════════
  // HIDRATOS DE CARBONO
  // ═══════════════════════════════════════
  a('arroz-branco','Arroz branco cozido','hidrato','cereal','internacional',130,2.7,28,0.3,0.4,150,'1 concha cheia','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🍚'),
  a('arroz-integral','Arroz integral cozido','hidrato','cereal','internacional',123,2.7,26,1,1.6,150,'1 concha cheia','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🍚'),
  a('arroz-basmati','Arroz basmati cozido','hidrato','cereal','internacional',121,3.5,25,0.4,0.4,150,'1 concha cheia','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🍚'),
  a('xima','Xima (papa de milho)','hidrato','cereal','mocambicana',120,2.5,27,0.3,0.8,200,'1 porção (punho)','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🍛'),
  a('massa-esparguete','Massa esparguete cozida','hidrato','massa','internacional',131,5,25,1.1,1.8,150,'1 concha','concha',130,['sem_lactose','halal','vegano'],'🍝'),
  a('massa-penne','Massa penne cozida','hidrato','massa','internacional',131,5,25,1.1,1.8,150,'1 concha','concha',130,['sem_lactose','halal','vegano'],'🍝'),
  a('massa-integral','Massa integral cozida','hidrato','massa','internacional',124,5,25,1.1,3.2,150,'1 concha','concha',130,['sem_lactose','halal','vegano'],'🍝'),
  a('batata-cozida','Batata cozida','hidrato','raiz','internacional',87,1.9,20,0.1,1.8,150,'1 batata média','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🥔'),
  a('batata-assada','Batata assada','hidrato','raiz','internacional',93,2.5,21,0.1,1.6,150,'1 batata média','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🥔'),
  a('batata-frita','Batata frita','hidrato','raiz','internacional',312,3.4,41,15,3.8,100,'1 porção pequena','concha',130,['sem_gluten','sem_lactose','vegano'],'🍟'),
  a('batata-doce','Batata-doce cozida','hidrato','raiz','internacional',90,2,21,0.1,3,150,'1 batata média','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🍠'),
  a('mandioca-cozida','Mandioca cozida','hidrato','raiz','mocambicana',160,1.4,38,0.3,1.8,150,'2-3 pedaços','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🫚'),
  a('inhame-cozido','Inhame cozido','hidrato','raiz','mocambicana',118,1.5,28,0.2,3.9,150,'1 porção','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🫚'),
  a('pao-branco','Pão branco','hidrato','pao','internacional',265,9,49,3.2,2.7,50,'1 fatia/pãozinho','concha',130,['sem_lactose','halal','vegano'],'🍞'),
  a('pao-integral','Pão integral','hidrato','pao','internacional',247,13,41,3.4,6.8,50,'1 fatia/pãozinho','concha',130,['sem_lactose','halal','vegano'],'🍞'),
  a('pao-centeio','Pão de centeio','hidrato','pao','internacional',259,9,48,3.3,5.8,50,'1 fatia','concha',130,['sem_lactose','halal','vegano'],'🍞'),
  a('pao-milho','Pão de milho','hidrato','pao','portuguesa',268,7,50,3.5,2,60,'1 broa pequena','concha',130,['sem_lactose','halal','vegano'],'🍞'),
  a('tortilla-milho','Tortilla de milho','hidrato','pao','internacional',218,6,44,3,4,30,'1 tortilla','concha',130,['sem_lactose','halal','vegano'],'🫓'),
  a('aveia','Aveia (flocos secos)','hidrato','cereal','internacional',389,17,66,7,11,30,'3 col. sopa','concha',130,['sem_lactose','halal','vegano'],'🥣'),
  a('aveia-cozida','Papas de aveia','hidrato','cereal','internacional',68,2.5,12,1.4,1.7,200,'1 tigela','concha',130,['sem_lactose','vegano'],'🥣'),
  a('quinoa','Quinoa cozida','hidrato','cereal','internacional',120,4.4,21,1.9,2.8,150,'1 concha','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🌾'),
  a('cuscuz','Cuscuz cozido','hidrato','cereal','internacional',112,3.8,23,0.2,1.4,150,'1 concha','concha',130,['sem_lactose','halal','vegano'],'🌾'),
  a('mapira','Mapira/sorgo cozido','hidrato','cereal','mocambicana',120,4,26,1.2,1.6,150,'1 concha','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🌾'),
  a('mexoeira','Mexoeira/milho-miúdo','hidrato','cereal','mocambicana',119,3.5,24,1,1.3,150,'1 concha','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🌾'),
  a('cereais-muesli','Muesli','hidrato','cereal','internacional',369,10,64,8,8,40,'1 tigela','concha',130,['sem_lactose','vegetariano'],'🥣'),
  a('granola','Granola','hidrato','cereal','internacional',471,10,64,20,5,40,'1 punhado','concha',130,['vegetariano'],'🥣'),
  a('crackers','Crackers/tostas','hidrato','pao','internacional',421,10,72,10,3,30,'4 crackers','concha',130,['sem_lactose','vegano'],'🍘'),
  a('farinha-milho','Farinha de milho (seca)','hidrato','cereal','mocambicana',361,7,77,2,1.9,100,'para xima','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🌽'),

  // ═══════════════════════════════════════
  // GORDURAS
  // ═══════════════════════════════════════
  a('azeite','Azeite extra-virgem','gordura','azeite_oleo','portuguesa',884,0,0,100,0,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano','keto'],'🫒'),
  a('oleo-coco','Óleo de coco','gordura','azeite_oleo','internacional',862,0,0,100,0,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano','keto'],'🥥'),
  a('oleo-girassol','Óleo de girassol','gordura','azeite_oleo','internacional',884,0,0,100,0,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🌻'),
  a('manteiga','Manteiga','gordura','azeite_oleo','internacional',717,0.9,0.1,81,0,10,'1 col. chá','polegar',15,['sem_gluten','vegetariano','keto'],'🧈'),
  a('abacate','Abacate','gordura','fruto','internacional',160,2,9,15,7,50,'¼ abacate','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🥑'),
  a('amendoim','Amendoim torrado','gordura','frutos_secos','mocambicana',567,26,16,49,8,15,'1 punhado (~12)','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🥜'),
  a('pasta-amendoim','Pasta de amendoim','gordura','frutos_secos','internacional',588,25,20,50,6,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🥜'),
  a('cajus','Cajus torrados','gordura','frutos_secos','mocambicana',553,18,30,44,3,15,'~15 cajus','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🥜'),
  a('amendoas','Amêndoas','gordura','frutos_secos','internacional',579,21,22,50,12,15,'~15 amêndoas','polegar',15,['sem_gluten','sem_lactose','halal','vegano','keto'],'🥜'),
  a('nozes','Nozes','gordura','frutos_secos','internacional',654,15,14,65,7,15,'~7 nozes','polegar',15,['sem_gluten','sem_lactose','halal','vegano','keto'],'🥜'),
  a('sementes-girassol','Sementes de girassol','gordura','sementes','internacional',584,21,20,51,9,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🌻'),
  a('sementes-chia','Sementes de chia','gordura','sementes','internacional',486,17,42,31,34,10,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🌱'),
  a('sementes-linhaca','Sementes de linhaça','gordura','sementes','internacional',534,18,29,42,27,10,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🌱'),
  a('sementes-abobora','Sementes de abóbora','gordura','sementes','internacional',559,30,11,49,6,15,'1 punhado','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🎃'),
  a('leite-coco','Leite de coco','gordura','azeite_oleo','mocambicana',230,2.3,6,24,0,30,'2 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🥥'),
  a('coco-ralado','Coco ralado','gordura','fruto','mocambicana',660,6,24,64,16,20,'2 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🥥'),
  a('tahini','Tahini (pasta de sésamo)','gordura','sementes','internacional',595,17,22,54,9,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🫘'),
  a('azeitonas','Azeitonas','gordura','fruto','portuguesa',115,0.8,6,11,3,20,'6 azeitonas','polegar',15,['sem_gluten','sem_lactose','halal','vegano','keto'],'🫒'),

  // ═══════════════════════════════════════
  // LEGUMES
  // ═══════════════════════════════════════
  a('matapa','Matapa (folha mandioca)','legume','folha_verde','mocambicana',60,4,5,3,3,150,'1 porção','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥬'),
  a('cacana','Cacana','legume','folha_verde','mocambicana',45,3,6,1,3,150,'1 porção','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥬'),
  a('brocolis','Brócolos cozidos','legume','crucifero','internacional',34,2.8,7,0.4,2.6,100,'5-6 ramalhetes','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥦'),
  a('couve','Couve galega cozida','legume','folha_verde','portuguesa',28,3,4,0.4,2,100,'3-4 folhas','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥬'),
  a('espinafres','Espinafres cozidos','legume','folha_verde','internacional',23,2.9,3.6,0.4,2.2,100,'1 porção','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥬'),
  a('alface','Alface','legume','folha_verde','internacional',15,1.4,2.9,0.2,1.3,80,'1 tigela','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥬'),
  a('rucula','Rúcula','legume','folha_verde','internacional',25,2.6,3.7,0.7,1.6,30,'1 punhado','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥬'),
  a('tomate','Tomate','legume','fruto_legume','internacional',18,0.9,3.9,0.2,1.2,120,'1 tomate médio','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍅'),
  a('pepino','Pepino','legume','fruto_legume','internacional',15,0.7,3.6,0.1,0.5,100,'½ pepino','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥒'),
  a('cenoura','Cenoura cozida','legume','raiz_legume','internacional',35,0.8,8,0.2,2.8,80,'1 cenoura grande','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥕'),
  a('cenoura-crua','Cenoura crua','legume','raiz_legume','internacional',41,0.9,10,0.2,2.8,80,'1 cenoura média','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥕'),
  a('pimento-verde','Pimento verde','legume','fruto_legume','internacional',20,0.9,4.6,0.2,1.7,120,'1 pimento','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🫑'),
  a('pimento-vermelho','Pimento vermelho','legume','fruto_legume','internacional',31,1,6,0.3,2.1,120,'1 pimento','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🫑'),
  a('cebola','Cebola','legume','raiz_legume','internacional',40,1.1,9,0.1,1.7,100,'1 cebola média','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🧅'),
  a('alho','Alho','legume','raiz_legume','internacional',149,6,33,0.5,2.1,5,'2 dentes','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🧄'),
  a('cogumelos','Cogumelos cozidos','legume','cogumelo','internacional',28,2.2,5,0.5,2,100,'5-6 cogumelos','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍄'),
  a('beringela','Beringela grelhada','legume','fruto_legume','internacional',25,1,6,0.2,3,100,'½ beringela','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍆'),
  a('curgete','Curgete/abobrinha','legume','fruto_legume','internacional',17,1.2,3.1,0.3,1,100,'½ curgete','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥒'),
  a('couve-flor','Couve-flor cozida','legume','crucifero','internacional',23,1.8,4.1,0.5,2,100,'5-6 ramalhetes','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥦'),
  a('feijao-verde','Feijão verde cozido','legume','vagem','internacional',35,1.8,8,0.1,3.4,100,'1 porção','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🫛'),
  a('milho-doce','Milho doce cozido','legume','cereal','internacional',96,3.4,21,1.5,2.4,100,'1 espiga','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🌽'),
  a('abobora','Abóbora cozida','legume','raiz_legume','internacional',26,1,7,0.1,0.5,100,'1 fatia','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🎃'),
  a('quiabo','Quiabo cozido','legume','vagem','mocambicana',33,1.9,7,0.2,3.2,100,'1 porção','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥒'),
  a('salada-mista','Salada mista','legume','misto','internacional',20,1.2,3.5,0.3,1.5,150,'1 tigela','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥗'),
  a('nabo','Nabo cozido','legume','raiz_legume','portuguesa',22,0.7,5,0.1,2,100,'1 porção','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🫚'),
  a('agriao','Agrião','legume','folha_verde','portuguesa',11,2.3,1.3,0.1,0.5,50,'1 molho','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥬'),

  // ═══════════════════════════════════════
  // FRUTAS
  // ═══════════════════════════════════════
  a('banana','Banana','fruta','tropical','internacional',89,1.1,23,0.3,2.6,120,'1 banana média','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍌'),
  a('maca','Maçã','fruta','pomo','internacional',52,0.3,14,0.2,2.4,180,'1 maçã média','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍎'),
  a('laranja','Laranja','fruta','citrico','internacional',47,0.9,12,0.1,2.4,180,'1 laranja média','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍊'),
  a('manga','Manga','fruta','tropical','mocambicana',60,0.8,15,0.4,1.6,200,'½ manga','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥭'),
  a('papaia','Papaia','fruta','tropical','mocambicana',43,0.5,11,0.3,1.7,150,'1 fatia grossa','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍈'),
  a('abacaxi','Abacaxi/ananás','fruta','tropical','internacional',50,0.5,13,0.1,1.4,150,'2 rodelas','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍍'),
  a('melancia','Melancia','fruta','melon','internacional',30,0.6,8,0.2,0.4,200,'1 fatia','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍉'),
  a('melao','Melão','fruta','melon','internacional',34,0.8,8,0.2,0.9,200,'1 fatia','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍈'),
  a('morango','Morangos','fruta','baga','internacional',32,0.7,8,0.3,2,150,'8-10 morangos','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍓'),
  a('uva','Uvas','fruta','baga','internacional',69,0.7,18,0.2,0.9,100,'1 cacho pequeno','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍇'),
  a('pera','Pêra','fruta','pomo','internacional',57,0.4,15,0.1,3.1,180,'1 pêra média','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍐'),
  a('pessego','Pêssego','fruta','drupa','internacional',39,0.9,10,0.3,1.5,150,'1 pêssego','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍑'),
  a('kiwi','Kiwi','fruta','baga','internacional',61,1.1,15,0.5,3,75,'1 kiwi','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥝'),
  a('tangerina','Tangerina','fruta','citrico','internacional',53,0.8,13,0.3,1.8,80,'1 tangerina','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍊'),
  a('lima','Lima/limão','fruta','citrico','internacional',30,0.7,10,0.2,2.8,50,'1 limão','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍋'),
  a('coco-fresco','Coco fresco','fruta','tropical','mocambicana',354,3.3,15,33,9,40,'1 pedaço','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🥥'),
  a('goiaba','Goiaba','fruta','tropical','mocambicana',68,2.6,14,1,5.4,150,'1 goiaba','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍈'),
  a('maracuja','Maracujá','fruta','tropical','brasileira',97,2.2,23,0.7,10,50,'2 maracujás','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍈'),
  a('ameixa','Ameixa','fruta','drupa','internacional',46,0.7,11,0.3,1.4,66,'1 ameixa','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🫐'),
  a('framboesa','Framboesas','fruta','baga','internacional',52,1.2,12,0.7,6.5,100,'1 chávena','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🫐'),
  a('mirtilo','Mirtilos','fruta','baga','internacional',57,0.7,14,0.3,2.4,100,'1 chávena','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🫐'),
  a('tamara','Tâmara','fruta','drupa','internacional',277,1.8,75,0.2,7,30,'3 tâmaras','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🌴'),
  a('banana-seca','Banana seca','fruta','seca','mocambicana',346,3.9,88,1.8,10,30,'1 punhado','punho',150,['sem_gluten','sem_lactose','halal','vegano'],'🍌'),

  // ═══════════════════════════════════════
  // LACTICÍNIOS
  // ═══════════════════════════════════════
  a('leite-mg','Leite meio-gordo','lacteo','leite','internacional',46,3.2,5,1.6,0,200,'1 copo','concha',130,['sem_gluten','halal','vegetariano'],'🥛'),
  a('leite-magro','Leite magro','lacteo','leite','internacional',34,3.4,5,0.1,0,200,'1 copo','concha',130,['sem_gluten','halal','vegetariano'],'🥛'),
  a('leite-gordo','Leite gordo','lacteo','leite','internacional',61,3.2,4.8,3.3,0,200,'1 copo','concha',130,['sem_gluten','halal','vegetariano'],'🥛'),
  a('iogurte-natural','Iogurte natural','lacteo','iogurte','internacional',61,3.5,4.7,3.3,0,125,'1 iogurte','concha',130,['sem_gluten','halal','vegetariano'],'🥛'),
  a('iogurte-grego','Iogurte grego','lacteo','iogurte','internacional',97,9,3.6,5,0,170,'1 iogurte','concha',130,['sem_gluten','halal','vegetariano'],'🥛'),
  a('iogurte-magro','Iogurte magro','lacteo','iogurte','internacional',56,10,3.6,0.7,0,170,'1 iogurte','concha',130,['sem_gluten','halal','vegetariano'],'🥛'),
  a('iogurte-skyr','Skyr','lacteo','iogurte','internacional',63,11,4,0.2,0,170,'1 iogurte','concha',130,['sem_gluten','halal','vegetariano'],'🥛'),
  a('queijo-fresco','Queijo fresco','lacteo','queijo','portuguesa',103,11,2,6,0,60,'1 queijo','concha',130,['sem_gluten','halal','vegetariano'],'🧀'),
  a('queijo-flamengo','Queijo flamengo','lacteo','queijo','portuguesa',350,23,0,28,0,30,'2 fatias','polegar',15,['sem_gluten','vegetariano'],'🧀'),
  a('queijo-mozzarella','Mozzarella','lacteo','queijo','internacional',280,28,3,17,0,30,'1 bola pequena','concha',130,['sem_gluten','halal','vegetariano'],'🧀'),
  a('queijo-cottage','Cottage cheese','lacteo','queijo','internacional',98,11,3.4,4.3,0,100,'1 porção','concha',130,['sem_gluten','halal','vegetariano'],'🧀'),
  a('queijo-parmesao','Parmesão ralado','lacteo','queijo','internacional',431,38,4,29,0,10,'1 col. sopa','polegar',15,['sem_gluten','vegetariano'],'🧀'),
  a('natas','Natas','lacteo','creme','internacional',340,2.1,2.8,35,0,15,'1 col. sopa','polegar',15,['sem_gluten','vegetariano'],'🥛'),
  a('requeijao','Requeijão','lacteo','queijo','portuguesa',174,11,3,13,0,30,'1 porção','concha',130,['sem_gluten','halal','vegetariano'],'🧀'),

  // Leites vegetais
  a('leite-amêndoa','Leite de amêndoa','lacteo','leite_vegetal','internacional',17,0.6,0.3,1.1,0.2,200,'1 copo','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🥛'),
  a('leite-aveia','Leite de aveia','lacteo','leite_vegetal','internacional',48,1,7,1.4,0.8,200,'1 copo','concha',130,['sem_lactose','halal','vegano'],'🥛'),
  a('leite-soja','Leite de soja','lacteo','leite_vegetal','internacional',33,2.8,1.8,1.8,0.4,200,'1 copo','concha',130,['sem_gluten','sem_lactose','halal','vegano'],'🥛'),

  // ═══════════════════════════════════════
  // BEBIDAS
  // ═══════════════════════════════════════
  a('cafe-sem-acucar','Café sem açúcar','bebida','cafe','internacional',2,0.3,0,0,0,60,'1 chávena','concha',null,['sem_gluten','sem_lactose','halal','vegano'],'☕'),
  a('cafe-com-leite','Café com leite','bebida','cafe','internacional',22,1.2,2,0.8,0,200,'1 chávena','concha',null,['sem_gluten'],'☕'),
  a('cha-verde','Chá verde','bebida','cha','internacional',1,0,0,0,0,200,'1 chávena','concha',null,['sem_gluten','sem_lactose','halal','vegano'],'🍵'),
  a('cha-preto','Chá preto','bebida','cha','internacional',1,0,0,0,0,200,'1 chávena','concha',null,['sem_gluten','sem_lactose','halal','vegano'],'🍵'),
  a('sumo-laranja','Sumo de laranja natural','bebida','sumo','internacional',45,0.7,10,0.2,0.2,200,'1 copo','concha',null,['sem_gluten','sem_lactose','halal','vegano'],'🧃'),
  a('sumo-manga','Sumo de manga','bebida','sumo','mocambicana',51,0.3,13,0.1,0,200,'1 copo','concha',null,['sem_gluten','sem_lactose','halal','vegano'],'🧃'),
  a('agua-coco','Água de coco','bebida','natural','mocambicana',19,0.7,3.7,0.2,1.1,250,'1 copo','concha',null,['sem_gluten','sem_lactose','halal','vegano'],'🥥'),
  a('smoothie-fruta','Smoothie de fruta','bebida','smoothie','internacional',50,0.8,12,0.3,1,250,'1 copo','concha',null,['sem_gluten','sem_lactose','halal','vegano'],'🥤'),
  a('coca-cola','Coca-Cola/refrigerante','bebida','refrigerante','internacional',42,0,11,0,0,330,'1 lata','concha',null,['sem_gluten','sem_lactose','vegano'],'🥤'),
  a('cerveja','Cerveja','bebida','alcool','internacional',43,0.5,3.6,0,0,330,'1 garrafa','concha',null,['sem_lactose','vegano'],'🍺'),

  // ═══════════════════════════════════════
  // SNACKS & DOCES
  // ═══════════════════════════════════════
  a('chocolate-negro','Chocolate negro (70%+)','snack','doce','internacional',598,8,46,43,11,25,'3-4 quadrados','concha',130,['sem_lactose','vegetariano'],'🍫'),
  a('chocolate-leite','Chocolate de leite','snack','doce','internacional',535,8,60,30,2,25,'3-4 quadrados','concha',130,['vegetariano'],'🍫'),
  a('barra-cereais','Barra de cereais','snack','barra','internacional',400,7,65,14,3,30,'1 barra','concha',130,['vegetariano'],'🍫'),
  a('barra-proteina','Barra de proteína','snack','barra','internacional',350,30,30,10,5,50,'1 barra','concha',130,[],'🍫'),
  a('bolachas-maria','Bolachas Maria','snack','bolacha','internacional',436,7,74,13,2,25,'4 bolachas','concha',130,['sem_lactose','vegano'],'🍪'),
  a('bolachas-aveia','Bolachas de aveia','snack','bolacha','internacional',450,7,65,18,5,30,'3 bolachas','concha',130,['vegetariano'],'🍪'),
  a('pipocas-sem-manteiga','Pipocas (sem manteiga)','snack','cereal','internacional',375,11,74,4,15,30,'1 saco pequeno','concha',130,['sem_lactose','vegano'],'🍿'),
  a('mel','Mel','snack','doce','mocambicana',304,0.3,82,0,0.2,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegetariano'],'🍯'),
  a('acucar','Açúcar','snack','doce','internacional',387,0,100,0,0,5,'1 col. chá','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🧂'),
  a('pastel-nata','Pastel de nata','snack','doce','portuguesa',300,4,35,16,0.5,60,'1 pastel','concha',130,['vegetariano'],'🥐'),
  a('bolo-cenoura','Bolo de cenoura','snack','doce','brasileira',325,5,43,16,1,80,'1 fatia','concha',130,['vegetariano'],'🍰'),

  // ═══════════════════════════════════════
  // CONDIMENTOS
  // ═══════════════════════════════════════
  a('sal','Sal','condimento','tempero','internacional',0,0,0,0,0,1,'1 pitada','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🧂'),
  a('pimenta','Pimenta','condimento','tempero','internacional',251,10,64,3,25,1,'1 pitada','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🌶️'),
  a('piripiri','Piripiri/malagueta','condimento','tempero','mocambicana',40,2,9,0.4,1.5,5,'a gosto','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🌶️'),
  a('molho-soja','Molho de soja','condimento','molho','internacional',53,5,5,0.6,0.4,15,'1 col. sopa','polegar',15,['sem_lactose','halal','vegano'],'🥢'),
  a('vinagre','Vinagre','condimento','molho','internacional',18,0,0.6,0,0,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🫗'),
  a('mostarda','Mostarda','condimento','molho','internacional',66,4,6,4,3,10,'1 col. chá','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🟡'),
  a('ketchup','Ketchup','condimento','molho','internacional',112,1,28,0.1,0.3,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose','halal','vegano'],'🔴'),
  a('maionese','Maionese','condimento','molho','internacional',680,1,1,75,0,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose'],'🥚'),
  a('maionese-light','Maionese light','condimento','molho','internacional',325,0.5,6,33,0,15,'1 col. sopa','polegar',15,['sem_gluten','sem_lactose'],'🥚'),

  // ═══════════════════════════════════════
  // PRATOS COMPOSTOS — Moçambicanos
  // ═══════════════════════════════════════
  a('caril-camarao','Caril de camarão','prato_composto','caril','mocambicana',95,12,3,4,0.5,250,'1 prato','palma',null,['sem_gluten','halal'],'🍛'),
  a('caril-frango','Caril de frango','prato_composto','caril','mocambicana',130,15,5,5,0.5,250,'1 prato','palma',null,['sem_gluten','sem_lactose','halal'],'🍛'),
  a('matapa-camarao','Matapa com camarão','prato_composto','tradicional','mocambicana',85,8,5,4,2,250,'1 prato','palma',null,['sem_gluten','sem_lactose','halal'],'🥬'),
  a('galinha-zambezia','Galinha à zambeziana','prato_composto','tradicional','mocambicana',155,18,4,7,1,250,'1 prato','palma',null,['sem_gluten','sem_lactose','halal'],'🍗'),
  a('peixe-grelhado-limao','Peixe grelhado com limão','prato_composto','grelhado','mocambicana',110,20,1,3,0,200,'1 porção','palma',null,['sem_gluten','sem_lactose','halal'],'🐟'),
  a('arroz-feijao','Arroz com feijão','prato_composto','tradicional','mocambicana',145,6,27,1,3,250,'1 prato','concha',null,['sem_gluten','sem_lactose','halal','vegano'],'🍚'),
  a('xima-caril','Xima com caril','prato_composto','tradicional','mocambicana',135,8,22,2,1,300,'1 prato','concha',null,['sem_gluten','sem_lactose','halal'],'🍛'),

  // Pratos Portugueses
  a('bacalhau-broas','Bacalhau à Brás','prato_composto','tradicional','portuguesa',165,14,10,8,1,250,'1 prato','palma',null,['sem_gluten','sem_lactose'],'🐟'),
  a('caldo-verde','Caldo verde','prato_composto','sopa','portuguesa',45,2,5,2,1.5,300,'1 tigela','concha',null,['sem_gluten','sem_lactose'],'🥣'),
  a('sopa-legumes','Sopa de legumes','prato_composto','sopa','portuguesa',35,1.5,5,1,2,300,'1 tigela','concha',null,['sem_gluten','sem_lactose','halal','vegano'],'🥣'),
  a('bifana','Bifana','prato_composto','sanduiche','portuguesa',280,18,25,12,1,200,'1 bifana','palma',null,['sem_lactose'],'🥙'),
  a('francesinha','Francesinha','prato_composto','sanduiche','portuguesa',320,18,25,16,1,350,'1 francesinha','palma',null,[],'🥙'),

  // Pratos Internacionais
  a('omelete','Omelete (2 ovos)','prato_composto','ovo','internacional',154,11,1,12,0,120,'1 omelete','palma',null,['sem_gluten','sem_lactose','vegetariano'],'🍳'),
  a('omelete-legumes','Omelete de legumes','prato_composto','ovo','internacional',130,10,3,9,1,150,'1 omelete','palma',null,['sem_gluten','sem_lactose','vegetariano'],'🍳'),
  a('sanduiche-frango','Sanduíche de frango','prato_composto','sanduiche','internacional',230,18,22,7,2,180,'1 sanduíche','palma',null,['sem_lactose'],'🥪'),
  a('salada-atum','Salada de atum','prato_composto','salada','internacional',75,10,3,3,1,250,'1 prato','punho',null,['sem_gluten','sem_lactose'],'🥗'),
  a('salada-caesar','Salada Caesar','prato_composto','salada','internacional',120,8,7,7,1.5,250,'1 prato','punho',null,['sem_gluten'],'🥗'),
  a('wrap-frango','Wrap de frango','prato_composto','sanduiche','internacional',195,15,18,7,2,200,'1 wrap','palma',null,['sem_lactose'],'🌯'),
  a('sushi-misto','Sushi misto (8 peças)','prato_composto','japones','internacional',145,6,28,1.5,0.5,200,'8 peças','concha',null,['sem_lactose','halal'],'🍣'),
  a('pizza-margherita','Pizza Margherita','prato_composto','italiano','internacional',271,11,33,10,2,120,'1 fatia','concha',null,['vegetariano'],'🍕'),
  a('hamburguer','Hambúrguer com pão','prato_composto','sanduiche','internacional',295,17,24,15,1,200,'1 hambúrguer','palma',null,[],'🍔'),
  a('arroz-frango-salada','Arroz + frango + salada','prato_composto','refeicao','internacional',140,12,16,3,1,300,'1 prato completo','palma',null,['sem_gluten','sem_lactose','halal'],'🍽️'),
  a('massa-bolonhesa','Massa à bolonhesa','prato_composto','italiano','internacional',145,8,17,5,2,300,'1 prato','concha',null,['sem_lactose'],'🍝'),
  a('stir-fry-legumes','Stir-fry de legumes','prato_composto','asiatico','internacional',65,3,8,3,2,200,'1 porção','punho',null,['sem_gluten','sem_lactose','halal','vegano'],'🥘'),

  // Brasileiros
  a('acai','Açaí (polpa pura)','prato_composto','brasileiro','brasileira',58,0.8,6,3.5,2.6,200,'1 tigela','concha',null,['sem_gluten','sem_lactose','halal','vegano'],'🟣'),
  a('tapioca','Tapioca com queijo','prato_composto','brasileiro','brasileira',140,5,22,4,0,80,'1 tapioca','concha',null,['sem_gluten','vegetariano'],'🫓'),
  a('pao-queijo','Pão de queijo','prato_composto','brasileiro','brasileira',363,6,48,16,0,25,'1 pão','concha',null,['sem_gluten','vegetariano'],'🧀'),
];

// ═══════════════════════════════════════
// PESQUISA LOCAL
// ═══════════════════════════════════════

/**
 * Normalizar texto para pesquisa (remover acentos, lowercase)
 */
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

/**
 * Pesquisar alimentos na base local
 * @param {string} query - texto de pesquisa
 * @param {Object} opcoes - { categoria, tags, origem, limite }
 * @returns {Array} alimentos encontrados, ordenados por relevância
 */
export function pesquisarAlimentosLocal(query, opcoes = {}) {
  const { categoria, tags, origem, limite = 20 } = opcoes;

  let resultados = ALIMENTOS_DB;

  // Filtrar por categoria
  if (categoria) {
    resultados = resultados.filter(a => a.categoria === categoria);
  }

  // Filtrar por tags
  if (tags && tags.length > 0) {
    resultados = resultados.filter(a =>
      tags.every(tag => a.tags && a.tags.includes(tag))
    );
  }

  // Filtrar por origem
  if (origem) {
    resultados = resultados.filter(a => a.origem === origem);
  }

  // Se não há query, devolver tudo (filtrado)
  if (!query || query.trim().length < 1) {
    return resultados.slice(0, limite);
  }

  const q = normalizar(query.trim());
  const palavras = q.split(/\s+/).filter(Boolean);

  // Pontuar cada resultado
  const pontuados = resultados.map(alimento => {
    const nome = normalizar(alimento.nome);
    const nomeParts = nome.split(/\s+/);
    let score = 0;

    // Match exacto no nome
    if (nome === q) score += 100;
    // Nome começa com a query
    else if (nome.startsWith(q)) score += 80;
    // Alguma palavra do nome começa com a query
    else if (nomeParts.some(p => p.startsWith(q))) score += 60;
    // Nome contém a query
    else if (nome.includes(q)) score += 40;
    // Todas as palavras da query estão no nome
    else if (palavras.every(p => nome.includes(p))) score += 30;
    // Pelo menos uma palavra está no nome
    else if (palavras.some(p => nome.includes(p))) score += 10;
    // Nenhum match
    else return null;

    // Bonus: match na categoria ou subcategoria
    if (alimento.subcategoria && normalizar(alimento.subcategoria).includes(q)) score += 5;

    return { ...alimento, _score: score };
  }).filter(Boolean);

  // Ordenar por pontuação
  pontuados.sort((a, b) => b._score - a._score);

  return pontuados.slice(0, limite).map(({ _score, ...rest }) => rest);
}
