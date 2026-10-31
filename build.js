// Gera o site estático em dist/: uma página por categoria, faixa de preço e produto, com HTML pronto para o Google.
// Uso: npm run build   (SITE_URL=https://www.seudominio.com.br npm run build para trocar o domínio)
const fs = require('fs');
const path = require('path');
const {site, shop, categories, prices, products} = require('./src/data');
const {esc, money, ic, photo, srcset, productCard} = require('./shared');

const OUT = path.join(__dirname, 'dist');
const today = new Date().toISOString().slice(0, 10);
const pages = [];
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const byCategory = name => products.filter(p => p.category === name);
const byPrice = v => products.filter(p => p.price === v);
const abs = p => `${site.url}/${p}`;

const ICONS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></symbol>
    <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.5"/><path d="M4 21a8 8 0 0 1 16 0"/></symbol>
    <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8 2.6c0 5.9-8 10.6-8 10.6Z"/></symbol>
    <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></symbol>
    <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
    <symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
    <symbol id="i-trash" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></symbol>
  </svg>`;

function layout({file, title, description, body, current = '', jsonld = [], noindex = false, base: forcedBase}) {
  const depth = file.split('/').length - 1;
  const base = forcedBase ?? '../'.repeat(depth);
  const home = base || './';
  const canonical = abs(file.replace(/index\.html$/, ''));
  const navLink = (href, label, key, cls = '') => `<a href="${base}${href}"${cls ? ` class="${cls}"` : ''}${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  const ld = jsonld.map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n  ');
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#3b1029">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
  <meta property="og:type" content="${jsonld.some(o => o['@type'] === 'Product') ? 'product' : 'website'}">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${abs('assets/og-luabelly.jpg')}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${base}assets/favicon-48.png" type="image/png" sizes="48x48">
  <link rel="icon" href="${base}assets/favicon-96.png" type="image/png" sizes="96x96">
  <link rel="icon" href="${base}assets/icon-192.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="${base}assets/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Parisienne&display=swap">
  <link rel="stylesheet" href="${base}styles.css">
  ${ld}
</head>
<body data-base="${base}">
  ${ICONS}

  <a class="skip-link" href="#main">Pular para o conteúdo</a>
  <p class="strip">Frete grátis em compras a partir de R$ ${shop.freeShipping}</p>

  <header class="site-header">
    <div class="header-row wrap">
      <a class="brand" href="${home}" aria-label="${site.name}, página inicial"><img src="${base}assets/logo-luabelly-352.jpg" alt="" width="176" height="176"></a>
      <form class="search" id="searchForm" role="search" action="${home}" method="get">
        <label class="sr-only" for="searchInput">Buscar produtos</label>
        ${ic('search')}
        <input id="searchInput" name="q" type="search" placeholder="Buscar brinco, batom, colar…" autocomplete="off">
      </form>
      <div class="header-actions">
        <button class="icon-btn" id="accountBtn" type="button" aria-label="Minha conta">${ic('user')}</button>
        <button class="icon-btn" id="favoritesBtn" type="button" aria-pressed="false" aria-label="Mostrar favoritos">${ic('heart')}<span class="count" id="favoriteCount" data-zero>0</span></button>
        <button class="icon-btn" id="cartBtn" type="button" aria-label="Abrir sacola">${ic('bag')}<span class="count" id="cartCount" data-zero>0</span></button>
      </div>
    </div>
    <nav class="nav" aria-label="Categorias">
      <div class="nav-inner wrap">
        ${categories.map(c => navLink(`${c.slug}/`, c.name, c.slug)).join('\n        ')}
        ${prices.map(pr => navLink(`${pr.slug}/`, `Tudo de R$ ${pr.value}`, pr.slug, 'nav-price')).join('\n        ')}
      </div>
    </nav>
  </header>

  <main id="main">
${body}
  </main>

  <footer class="footer">
    <div class="footer-inner wrap">
      <div class="footer-brand">
        <img src="${base}assets/logo-luabelly-352.jpg" alt="${site.legalName}" width="132" height="132" loading="lazy">
        <p class="slogan">${site.slogan}</p>
      </div>
      <nav class="footer-col" aria-label="Categorias no rodapé">
        <h2>Categorias</h2>
        ${categories.map(c => `<a href="${base}${c.slug}/">${c.name}</a>`).join('\n        ')}
      </nav>
      <nav class="footer-col" aria-label="Sobre a loja">
        <h2>A ${site.name}</h2>
        <a href="${base}sobre/">Sobre a loja</a>
        <a href="${base}entrega-e-frete/">Entrega e frete</a>
        ${prices.map(pr => `<a href="${base}${pr.slug}/">Tudo por R$ ${pr.value}</a>`).join('\n        ')}
      </nav>
      <div class="footer-col footer-news">
        <h2>Novidades por e-mail</h2>
        <p>Peças novas toda semana. Um e-mail quando chegarem.</p>
        <form id="newsletterForm">
          <label class="sr-only" for="newsEmail">Seu e-mail</label>
          <input id="newsEmail" type="email" required placeholder="seu@email.com" autocomplete="email">
          <button class="btn btn-gold" type="submit">Assinar</button>
        </form>
      </div>
      <p class="fineprint">© ${new Date().getFullYear()} ${site.name}. Protótipo: produtos, preços e pagamentos são exemplos. Aceitaremos Pix, cartão e boleto.</p>
    </div>
  </footer>

  <div class="overlay hidden" id="overlay"></div>

  <aside class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle" aria-hidden="true" tabindex="-1">
    <div class="drawer-header">
      <div><p class="dialog-title" id="cartTitle">Sacola</p><p id="cartSubtitle"></p></div>
      <button class="icon-btn" id="closeCart" type="button" aria-label="Fechar sacola">${ic('x')}</button>
    </div>
    <div class="cart-items" id="cartItems"></div>
    <div class="cart-footer">
      <div class="ship">
        <p id="shippingNote"></p>
        <div class="ship-meter" aria-hidden="true"><span id="shipBar"></span></div>
      </div>
      <div class="totals"><span>Subtotal</span><strong id="cartSubtotal">R$ 0,00</strong></div>
      <div class="totals muted"><span>Frete</span><span id="shippingValue">Calculado no pagamento</span></div>
      <button class="btn btn-block" id="goCheckout" type="button">Ir para o pagamento</button>
      <button class="link-btn center" id="continueShopping" type="button">Continuar comprando</button>
    </div>
  </aside>

  <section class="checkout-modal hidden" id="checkoutModal" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle" tabindex="-1">
    <div class="checkout-top">
      <div><p class="dialog-title" id="checkoutTitle">Finalizar pedido</p><p>Esta é uma simulação: nada é cobrado e nenhum dado sai do seu navegador.</p></div>
      <button class="icon-btn" id="closeCheckout" type="button" aria-label="Fechar">${ic('x')}</button>
    </div>
    <div class="checkout-layout" id="checkoutLayout">
      <form id="checkoutForm" class="checkout-form" novalidate>
        <fieldset>
          <legend>Seus dados</legend>
          <div class="form-grid">
            <label>Nome completo<input name="name" required autocomplete="name"></label>
            <label>E-mail<input type="email" name="email" required autocomplete="email"></label>
            <label>Telefone ou WhatsApp<input name="phone" type="tel" required autocomplete="tel" placeholder="(00) 00000-0000"></label>
            <label>CEP<input name="cep" required inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="00000-000" pattern="\\d{5}-?\\d{3}"></label>
            <label class="full">Endereço e número<input name="address" required autocomplete="street-address"></label>
            <label>Bairro<input name="neighborhood" required></label>
            <label>Cidade<input name="city" required autocomplete="address-level2"></label>
            <label>Estado<input name="state" required maxlength="2" autocomplete="address-level1" placeholder="UF"></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Entrega</legend>
          <label class="choice"><input type="radio" name="delivery" value="standard" checked><span>Padrão</span><small id="standardPrice">${money(shop.standard)}</small></label>
          <label class="choice"><input type="radio" name="delivery" value="express"><span>Expressa</span><small>${money(shop.express)}</small></label>
        </fieldset>
        <fieldset>
          <legend>Pagamento</legend>
          <div class="choice-row">
            <label class="choice"><input type="radio" name="payment" value="pix" checked><span>Pix</span></label>
            <label class="choice"><input type="radio" name="payment" value="card"><span>Cartão</span></label>
            <label class="choice"><input type="radio" name="payment" value="boleto"><span>Boleto</span></label>
          </div>
        </fieldset>
        <p class="form-error hidden" id="formError" role="alert"></p>
        <button class="btn btn-block" type="submit">Finalizar pedido</button>
      </form>
      <aside class="order-summary" aria-labelledby="summaryTitle">
        <p class="dialog-subtitle" id="summaryTitle">Seu pedido</p>
        <div id="checkoutItems"></div>
        <div class="totals"><span>Subtotal</span><span id="checkoutSubtotal">R$ 0,00</span></div>
        <div class="totals"><span>Frete</span><span id="checkoutShipping">${money(shop.standard)}</span></div>
        <div class="totals grand-total"><span>Total</span><strong id="checkoutTotal">R$ 0,00</strong></div>
      </aside>
    </div>
    <div class="success-state hidden" id="checkoutSuccess"></div>
  </section>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script src="${base}shared.js"></script>
  <script src="${base}products.js"></script>
  <script src="${base}script.js"></script>
</body>
</html>
`;
}

function page(file, opts) { pages.push({file, html: layout({file, ...opts}), indexable: !opts.noindex}) }

// Pedaços reaproveitados
const grid = (list, base, attrs = '') => `<div class="product-grid" id="productGrid"${attrs}>
${list.map(p => productCard(p, base)).join('\n')}
      </div>
      <div class="empty-state hidden" id="emptyState">
        <h3>Nenhum produto encontrado</h3>
        <p>Confira a grafia ou tente um termo mais simples, como “brinco” ou “batom”.</p>
        <a class="btn" href="${base || './'}">Ver todos os produtos</a>
      </div>`;
const seg = `<div class="seg" role="group" aria-label="Filtrar por preço">
          <button type="button" data-seg="Todos" aria-pressed="true">Todos</button>
          ${prices.map(pr => `<button type="button" data-seg="${pr.value}" aria-pressed="false">R$ ${pr.value}</button>`).join('\n          ')}
        </div>`;
const categorySelect = `<label class="field">Categoria
          <select id="categoryFilter"><option value="Todos">Todas</option>${categories.map(c => `<option>${c.name}</option>`).join('')}</select>
        </label>`;
const sortSelect = `<label class="field">Ordenar
          <select id="sortFilter"><option value="featured">Destaques</option><option value="priceAsc">Menor preço</option><option value="priceDesc">Maior preço</option><option value="name">Nome, A a Z</option></select>
        </label>`;
const toolbar = controls => `<div class="toolbar">
        ${controls.join('\n        ')}
        <button class="link-btn hidden" id="clearFilters" type="button">Limpar filtros</button>
      </div>`;
const crumbs = (base, items) => `<nav class="breadcrumb wrap" aria-label="Você está em">
      <a href="${base || './'}">Início</a>${items.map((it, i) => i === items.length - 1 ? `<span aria-current="page">${esc(it.name)}</span>` : `<a href="${base}${it.path}">${esc(it.name)}</a>`).join('')}
    </nav>`;
const breadcrumbLd = items => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [{name: 'Início', path: ''}, ...items].map((it, i) => ({'@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path)}))
});
const storeId = `${site.url}/#loja`;

// Home
page('index.html', {
  title: `Bijuterias, Semijoias e Maquiagem por R$ 10 e R$ 20 | ${site.name}`,
  description: `Brincos, colares, semijoias e maquiagem com só dois preços: R$ 10 ou R$ 20. Frete grátis a partir de R$ ${shop.freeShipping}. ${site.slogan}.`,
  jsonld: [{
    '@context': 'https://schema.org', '@type': 'OnlineStore', '@id': storeId,
    name: site.name, alternateName: site.legalName, slogan: site.slogan, url: `${site.url}/`,
    logo: abs('assets/logo-luabelly-512.jpg'), image: abs('assets/og-luabelly.jpg'), description: site.description
  }, {
    '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: `${site.url}/`,
    potentialAction: {'@type': 'SearchAction', target: `${site.url}/?q={search_term_string}`, 'query-input': 'required name=search_term_string'}
  }],
  body: `    <section class="hero">
      <div class="hero-inner wrap">
        <div class="hero-copy">
          <h1>Maquiagem, bijuterias e semijoias por R$&nbsp;10 ou R$&nbsp;20.</h1>
          <p>A loja inteira tem só dois preços. Escolha o seu e veja tudo o que cabe nele.</p>
          <p class="slogan">${site.slogan}</p>
        </div>
        <div class="hero-tags">
          ${prices.map(pr => `<div class="tag-hang"><a class="price-tag tag-${pr.value}" href="${pr.slug}/"><span class="tag-cur">R$</span><span class="tag-value">${pr.value}</span><span class="tag-meta">${plural(byPrice(pr.value).length, 'produto', 'produtos')}</span><span class="sr-only">: ver tudo por R$ ${pr.value}</span></a></div>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="categories wrap" aria-labelledby="categoriesTitle">
      <h2 id="categoriesTitle">Compre por categoria</h2>
      <div class="category-row">
        ${categories.map(c => `<a class="category" href="${c.slug}/"><img src="${photo(c.image, 480).replace(/&h=480/, '&h=600')}" alt="" loading="lazy" width="480" height="600"><span class="category-name">${c.name}</span><span class="category-count">${byCategory(c.name).length}</span></a>`).join('\n        ')}
      </div>
    </section>

    <section class="products wrap" id="produtos" aria-labelledby="productHeading">
      <div class="products-head">
        <h2 id="productHeading">Todos os produtos</h2>
        <p id="resultSummary" aria-live="polite">${plural(products.length, 'produto', 'produtos')}</p>
      </div>
      ${toolbar([seg, categorySelect, sortSelect])}
      ${grid(products, '', ' data-home')}
    </section>`
});

// Categorias
categories.forEach(c => {
  const base = '../', list = byCategory(c.name);
  page(`${c.slug}/index.html`, {
    current: c.slug, title: `${c.title} | ${site.name}`, description: c.description,
    jsonld: [breadcrumbLd([{name: c.name, path: `${c.slug}/`}])],
    body: `    ${crumbs(base, [{name: c.name, path: `${c.slug}/`}])}
    <section class="page-head wrap">
      <h1>${c.name} por R$ 10 e R$ 20</h1>
      <p>${esc(c.intro)}</p>
    </section>
    <section class="products wrap" id="produtos" aria-labelledby="productHeading">
      <div class="products-head">
        <h2 id="productHeading">Produtos</h2>
        <p id="resultSummary" aria-live="polite">${plural(list.length, 'produto', 'produtos')}</p>
      </div>
      ${toolbar([seg, sortSelect])}
      ${grid(list, base, ` data-category="${c.name}"`)}
    </section>`
  });
});

// Faixas de preço
prices.forEach(pr => {
  const base = '../', list = byPrice(pr.value);
  page(`${pr.slug}/index.html`, {
    current: pr.slug, title: `${pr.title} | ${site.name}`, description: pr.description,
    jsonld: [breadcrumbLd([{name: `Tudo por R$ ${pr.value}`, path: `${pr.slug}/`}])],
    body: `    ${crumbs(base, [{name: `Tudo por R$ ${pr.value}`, path: `${pr.slug}/`}])}
    <section class="page-head wrap">
      <h1>Tudo por R$ ${pr.value}</h1>
      <p>${esc(pr.intro)}</p>
    </section>
    <section class="products wrap" id="produtos" aria-labelledby="productHeading">
      <div class="products-head">
        <h2 id="productHeading">Produtos</h2>
        <p id="resultSummary" aria-live="polite">${plural(list.length, 'produto', 'produtos')}</p>
      </div>
      ${toolbar([categorySelect, sortSelect])}
      ${grid(list, base, ` data-price="${pr.value}"`)}
    </section>`
  });
});

// Produtos
products.forEach(p => {
  const base = '../../', cat = categories.find(c => c.name === p.category);
  const priceInfo = prices.find(pr => pr.value === p.price);
  const related = products.filter(o => o.price === p.price && o.id !== p.id).slice(0, 4);
  const path_ = `produtos/${p.slug}/`;
  page(`${path_}index.html`, {
    current: cat.slug,
    title: `${p.name} por R$ ${p.price} | ${site.name}`,
    description: `${p.name} (${p.detail.toLowerCase()}) por R$ ${p.price} na ${site.name}. Frete grátis a partir de R$ ${shop.freeShipping}. Pague com Pix, cartão ou boleto.`,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'Product',
      name: p.name, description: `${p.name}. ${p.detail}.`, sku: `LB-${String(p.id).padStart(4, '0')}`,
      image: [photo(p.image, 1200)], category: p.category,
      offers: {
        '@type': 'Offer', url: abs(path_), priceCurrency: 'BRL', price: p.price.toFixed(2),
        availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition',
        seller: {'@type': 'Organization', '@id': storeId, name: site.name}
      }
    }, breadcrumbLd([{name: cat.name, path: `${cat.slug}/`}, {name: p.name, path: path_}])],
    body: `    ${crumbs(base, [{name: cat.name, path: `${cat.slug}/`}, {name: p.name, path: path_}])}
    <article class="product-page wrap">
      <div class="product-page-media">
        <img src="${photo(p.image, 900)}" srcset="${[450, 700, 900, 1200].map(w => `${photo(p.image, w)} ${w}w`).join(', ')}" sizes="(max-width:960px) 100vw, 560px" alt="${esc(p.alt)}" width="900" height="900">
      </div>
      <div class="product-page-info">
        <a class="product-page-cat" href="${base}${cat.slug}/">${cat.name}</a>
        <h1>${esc(p.name)}</h1>
        <p class="product-page-detail">${esc(p.detail)}</p>
        <p class="product-price product-page-price"><span>R$</span>${p.price}</p>
        <div class="product-page-actions">
          <button class="btn" type="button" data-add="${p.id}">${ic('plus')}Adicionar à sacola</button>
          <button class="fav fav-inline" type="button" data-favorite="${p.id}" aria-pressed="false" aria-label="Favoritar ${esc(p.name)}">${ic('heart')}</button>
        </div>
        <ul class="product-facts">
          <li>Frete grátis a partir de R$ ${shop.freeShipping}. Abaixo disso, entrega padrão por ${money(shop.standard)}.</li>
          <li>Pagamento com Pix, cartão ou boleto.</li>
          <li><a href="${base}entrega-e-frete/">Como funciona a entrega</a></li>
        </ul>
      </div>
    </article>
    <section class="products wrap" aria-labelledby="relatedTitle">
      <div class="products-head">
        <h2 id="relatedTitle">Mais por R$ ${p.price}</h2>
        <a class="link-btn" href="${base}${priceInfo.slug}/">Ver tudo por R$ ${p.price}</a>
      </div>
      <div class="product-grid">
${related.map(o => productCard(o, base)).join('\n')}
      </div>
    </section>`
  });
});

// Institucionais (só com o que o site já afirma; políticas de troca, contato e CNPJ dependem da loja)
page('sobre/index.html', {
  title: `Sobre a ${site.name} | ${site.slogan}`,
  description: `${site.name}: maquiagem, bijuterias e semijoias com dois preços, R$ 10 ou R$ 20. ${site.slogan}.`,
  jsonld: [breadcrumbLd([{name: 'Sobre a loja', path: 'sobre/'}])],
  body: `    ${crumbs('../', [{name: 'Sobre a loja', path: 'sobre/'}])}
    <article class="info-page wrap">
      <h1>Sobre a ${site.name}</h1>
      <p class="slogan">${site.slogan}</p>
      <p>A ${site.name} vende maquiagem, bijuterias e semijoias com uma regra simples: cada produto custa R$ 10 ou R$ 20. Você escolhe pelo preço, monta o pedido e sabe o total antes mesmo de chegar à sacola.</p>
      <h2>O que você encontra aqui</h2>
      <ul>
        ${categories.map(c => `<li><a href="../${c.slug}/">${c.name}</a>: ${plural(byCategory(c.name).length, 'produto', 'produtos')}</li>`).join('\n        ')}
      </ul>
      <h2>Como comprar</h2>
      <p>Adicione os produtos à sacola, preencha seus dados de entrega e escolha entre Pix, cartão ou boleto. Pedidos a partir de R$ ${shop.freeShipping} têm frete grátis. Veja os detalhes em <a href="../entrega-e-frete/">Entrega e frete</a>.</p>
    </article>`
});

page('entrega-e-frete/index.html', {
  title: `Entrega e Frete | ${site.name}`,
  description: `Frete grátis em compras a partir de R$ ${shop.freeShipping}. Entrega padrão por ${money(shop.standard)} e expressa por ${money(shop.express)}.`,
  jsonld: [breadcrumbLd([{name: 'Entrega e frete', path: 'entrega-e-frete/'}])],
  body: `    ${crumbs('../', [{name: 'Entrega e frete', path: 'entrega-e-frete/'}])}
    <article class="info-page wrap">
      <h1>Entrega e frete</h1>
      <table class="info-table">
        <thead><tr><th scope="col">Pedido</th><th scope="col">Entrega padrão</th><th scope="col">Entrega expressa</th></tr></thead>
        <tbody>
          <tr><td>Abaixo de R$ ${shop.freeShipping}</td><td>${money(shop.standard)}</td><td>${money(shop.express)}</td></tr>
          <tr><td>A partir de R$ ${shop.freeShipping}</td><td>Grátis</td><td>${money(shop.express)}</td></tr>
        </tbody>
      </table>
      <p>O valor do frete aparece na sacola e é confirmado no pagamento. Como cada produto custa R$ 10 ou R$ 20, cinco produtos de R$ 20 ou dez de R$ 10 já garantem o frete grátis.</p>
      <p>Os prazos de entrega por região serão informados no lançamento da loja.</p>
      <p><a class="btn" href="../">Ver os produtos</a></p>
    </article>`
});

page('404.html', {
  title: `Página não encontrada | ${site.name}`, description: 'Esta página não existe.', noindex: true, base: '/',
  body: `    <article class="info-page wrap">
      <h1>Esta página não existe</h1>
      <p>O endereço pode ter mudado. Volte para a vitrine ou escolha uma categoria no menu.</p>
      <p><a class="btn" href="/">Ir para a página inicial</a></p>
    </article>`
});

// Gravação
fs.rmSync(OUT, {recursive: true, force: true});
const write = (file, content) => { const f = path.join(OUT, file); fs.mkdirSync(path.dirname(f), {recursive: true}); fs.writeFileSync(f, content) };
pages.forEach(p => write(p.file, p.html));
['styles.css', 'script.js', 'shared.js'].forEach(f => fs.copyFileSync(path.join(__dirname, f), path.join(OUT, f)));
fs.cpSync(path.join(__dirname, 'assets'), path.join(OUT, 'assets'), {recursive: true});
const clientProducts = products.map(({id, name, detail, category, price, image, alt, slug}) => ({id, name, detail, category, price, image, alt, slug}));
write('products.js', `window.LB_PRODUCTS=${JSON.stringify(clientProducts)};\nwindow.LB_SHOP=${JSON.stringify(shop)};\n`);
write('robots.txt', `User-agent: *\nDisallow: /*?q=\nDisallow: /*?favoritos=\n\nSitemap: ${abs('sitemap.xml')}\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter(p => p.indexable).map(p => `  <url><loc>${abs(p.file.replace(/index\.html$/, ''))}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log(`${pages.length} páginas geradas em dist/ (${site.url})`);
