// Fonte única dos dados da loja: usada pelo gerador (build.js) e enviada ao navegador como products.js.
const site = {
  name: 'Lua Belly',
  legalName: 'Lua Belly Bijuterias e Semijoias',
  slogan: 'Seu brilho é a sua presença',
  // Troque pelo domínio definitivo quando existir (ou rode com SITE_URL=https://... npm run build).
  url: (process.env.SITE_URL || 'https://lojazayra.vercel.app').replace(/\/$/, ''),
  description: 'Loja online de maquiagem, bijuterias e semijoias com dois preços: R$ 10 ou R$ 20.'
};

const shop = { freeShipping: 99, standard: 9.9, express: 15 };

const categories = [
  {name: 'Maquiagem', slug: 'maquiagem', image: '1512496015851-a90fb38ba796',
   title: 'Maquiagem por R$ 10 e R$ 20: Gloss, Batom e Paletas',
   description: 'Gloss, batom, máscara de cílios, pó compacto e paletas de sombra por R$ 10 ou R$ 20. Frete grátis a partir de R$ 99.',
   intro: 'Gloss, batom, máscara de cílios, pó compacto e paleta de sombras. Cada item custa R$ 10 ou R$ 20, então dá para montar a necessaire sem fazer conta.'},
  {name: 'Bijuterias', slug: 'bijuterias', image: '1602173574767-37ac01994b2a',
   title: 'Bijuterias por R$ 10 e R$ 20: Brincos, Correntes e Pulseiras',
   description: 'Brincos, correntes e pulseiras por R$ 10 ou R$ 20. Escolha pelo preço e ganhe frete grátis a partir de R$ 99.',
   intro: 'Brincos, correntes e pulseiras para usar todo dia ou combinar com uma produção especial, todos por R$ 10 ou R$ 20.'},
  {name: 'Semijoias', slug: 'semijoias', image: '1599643478518-a784e5dc4c8f',
   title: 'Semijoias por R$ 10 e R$ 20: Colares e Brincos',
   description: 'Colares e brincos semijoia por R$ 10 ou R$ 20. Veja os detalhes de cada peça e ganhe frete grátis a partir de R$ 99.',
   intro: 'Colares e brincos com acabamento mais delicado. Os detalhes de cada peça estão na página do produto.'},
  {name: 'Acessórios', slug: 'acessorios', image: '1598452963314-b09f397a5c48',
   title: 'Acessórios de Maquiagem por R$ 10 e R$ 20',
   description: 'Pincéis e acessórios de maquiagem por R$ 10 ou R$ 20. Frete grátis a partir de R$ 99.',
   intro: 'Pincéis e acessórios para aplicar a maquiagem, por R$ 10 ou R$ 20.'},
  {name: 'Kits', slug: 'kits', image: '1605100804763-247f67b3557e',
   title: 'Kits de Bijuterias e Maquiagem por R$ 10 e R$ 20',
   description: 'Kits de anéis e de maquiagem com várias peças pelo preço de uma: R$ 10 ou R$ 20. Frete grátis a partir de R$ 99.',
   intro: 'Conjuntos com mais de uma peça pelo mesmo preço único da loja. Bons para presente.'}
];

const prices = [
  {value: 10, slug: 'tudo-por-10-reais',
   title: 'Tudo por R$ 10: Bijuterias, Maquiagem e Acessórios',
   description: 'Todos os produtos da Lua Belly que custam R$ 10: brincos, gloss, batom, pó compacto e mais. Frete grátis a partir de R$ 99.',
   intro: 'Tudo nesta página custa R$ 10. Junte peças até R$ 99 e o frete sai de graça.'},
  {value: 20, slug: 'tudo-por-20-reais',
   title: 'Tudo por R$ 20: Semijoias, Paletas e Kits',
   description: 'Todos os produtos da Lua Belly que custam R$ 20: colares, pulseiras, paletas, kits e mais. Frete grátis a partir de R$ 99.',
   intro: 'Tudo nesta página custa R$ 20. Cinco peças já passam de R$ 99 e garantem o frete grátis.'}
];

const products = [
  {id: 1, name: 'Gloss labial hidratante', detail: 'Várias cores', category: 'Maquiagem', price: 10, image: '1591360236480-4ed861025fa1', alt: 'Gloss labial rosa com aplicador'},
  {id: 2, name: 'Máscara de cílios', detail: 'Volume intenso', category: 'Maquiagem', price: 20, image: '1608248543803-ba4f8c70ae0b', alt: 'Tubo de máscara de cílios'},
  {id: 3, name: 'Paleta de sombras', detail: '12 tons neutros', category: 'Maquiagem', price: 20, image: '1596704017254-9b121068fb31', alt: 'Paleta de sombras aberta com tons variados'},
  {id: 4, name: 'Brinco argola dourada', detail: 'Tamanho médio', category: 'Bijuterias', price: 10, image: '1506630448388-4e683c67ddb0', alt: 'Brincos dourados pendurados'},
  {id: 5, name: 'Colar coração vazado', detail: 'Banho dourado', category: 'Semijoias', price: 20, image: '1588444837495-c6cfeb53f32d', alt: 'Colar com pingente de coração vazado'},
  {id: 6, name: 'Pulseira de elos', detail: 'Fecho lagosta', category: 'Bijuterias', price: 20, image: '1611591437281-460bfbe1220a', alt: 'Pulseira dourada de elos sobre fundo rosa'},
  {id: 7, name: 'Kit anéis finos', detail: '3 peças', category: 'Kits', price: 10, image: '1605100804763-247f67b3557e', alt: 'Anéis finos com pedras'},
  {id: 8, name: 'Pincéis de maquiagem', detail: '5 peças para o dia a dia', category: 'Acessórios', price: 20, image: '1512496015851-a90fb38ba796', alt: 'Pincéis de maquiagem ao lado de paleta e batons'},
  {id: 9, name: 'Brinco ponto de luz azul', detail: 'Pedra facetada', category: 'Semijoias', price: 10, image: '1535632066927-ab7c9ab60908', alt: 'Brincos com pedra azul facetada'},
  {id: 10, name: 'Kit beleza essencial', detail: 'Base, pó e pincel', category: 'Kits', price: 20, image: '1522335789203-aabd1fc54bc9', alt: 'Itens de maquiagem reunidos sobre a mesa'},
  {id: 11, name: 'Pó compacto', detail: 'Acabamento natural', category: 'Maquiagem', price: 10, image: '1515688594390-b649af70d282', alt: 'Pó compacto e pincéis de maquiagem'},
  {id: 12, name: 'Corrente dourada', detail: '45 cm', category: 'Bijuterias', price: 10, image: '1602173574767-37ac01994b2a', alt: 'Corrente dourada de elos'},
  {id: 13, name: 'Colar gota', detail: 'Pingente delicado', category: 'Semijoias', price: 20, image: '1599643478518-a784e5dc4c8f', alt: 'Colar com pingente em formato de gota'},
  {id: 14, name: 'Batom vermelho cremoso', detail: 'Alta cobertura', category: 'Maquiagem', price: 10, image: '1586495777744-4413f21062fa', alt: 'Batom vermelho aberto'}
];

const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
products.forEach(p => { p.slug = slugify(p.name); p.categorySlug = categories.find(c => c.name === p.category).slug; });

module.exports = {site, shop, categories, prices, products};
