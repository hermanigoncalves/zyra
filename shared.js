// Funções usadas no navegador (script.js) e no gerador (build.js), para o HTML ser idêntico nos dois lados.
(function (root) {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => n.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  const ic = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const photo = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${w}&q=72`;
  const srcset = id => [300, 450, 600].map(w => `${photo(id, w)} ${w}w`).join(', ');

  function productCard(p, base, fav) {
   const url = `${base}produtos/${p.slug}/`;
   return `<article class="product">
  <div class="product-media"><a href="${url}" tabindex="-1" aria-hidden="true"><img src="${photo(p.image, 600)}" srcset="${srcset(p.image)}" sizes="(max-width:640px) 46vw, (max-width:960px) 30vw, 230px" alt="${esc(p.alt)}" loading="lazy" width="600" height="600"></a><button class="fav" type="button" data-favorite="${p.id}" aria-pressed="${!!fav}" aria-label="Favoritar ${esc(p.name)}">${ic('heart')}</button></div>
  <h3 class="product-name"><a href="${url}">${esc(p.name)}</a></h3>
  <p class="product-detail">${esc(p.detail)}</p>
  <div class="product-buy"><p class="product-price"><span>R$</span>${p.price}</p><button class="add" type="button" data-add="${p.id}" aria-label="Adicionar ${esc(p.name)} à sacola">${ic('plus')}Sacola</button></div>
 </article>`;
  }

  const api = {esc, money, ic, photo, srcset, productCard};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LB = api;
})(this);
