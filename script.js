const {esc, money, ic, photo, productCard} = window.LB;
const products = window.LB_PRODUCTS || [];
const {freeShipping: FREE_SHIPPING, standard: STANDARD, express: EXPRESS} = window.LB_SHOP;
const base = document.body.dataset.base || '';
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const load = key => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } };
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const $ = id => document.getElementById(id);
const on = (id, type, fn) => $(id)?.addEventListener(type, fn);

// As chaves mantêm o nome antigo para não esvaziar sacolas já salvas nos navegadores.
let cart = load('zayraCart').filter(x => products.some(p => p.id === x.id));
let favorites = load('zayraFavorites');
let toastTimer, lastFocus;
const grid = $('productGrid'), overlay = $('overlay'), drawer = $('cartDrawer'), checkout = $('checkoutModal');
const isHome = !!grid?.hasAttribute('data-home');
const scope = {category: grid?.dataset.category || 'Todos', price: grid?.dataset.price || 'Todos'};
const params = new URLSearchParams(location.search);
let activeCategory = scope.category, activePrice = scope.price;
let query = isHome ? (params.get('q') || '').trim() : '', favoritesOnly = isHome && params.has('favoritos');
const background = ['.skip-link', '.strip', '.site-header', '#main', '.footer'].map(s => document.querySelector(s));

function save(){ try { localStorage.setItem('zayraCart', JSON.stringify(cart)); localStorage.setItem('zayraFavorites', JSON.stringify(favorites)) } catch {} }
function toast(message){ const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600) }
function scrollToProducts(){ $('produtos')?.scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth'}) }
function byId(id){ return products.find(p => p.id === id) }
function setCount(el, n){ el.textContent = n; el.toggleAttribute('data-zero', n === 0) }

function filteredProducts(){
 const q = query.toLowerCase();
 const list = products.filter(p => (activeCategory === 'Todos' || p.category === activeCategory) && (activePrice === 'Todos' || p.price === Number(activePrice)) && (!favoritesOnly || favorites.includes(p.id)) && (!q || `${p.name} ${p.detail} ${p.category}`.toLowerCase().includes(q)));
 const sort = $('sortFilter')?.value;
 if (sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
 if (sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
 if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
 return list;
}

function heading(){
 if (favoritesOnly) return 'Seus favoritos';
 if (query) return `Resultados para “${query}”`;
 const price = activePrice !== 'Todos' ? `R$ ${activePrice}` : '';
 if (activeCategory !== 'Todos') return price ? `${activeCategory} de ${price}` : activeCategory;
 return price ? `Tudo de ${price}` : 'Todos os produtos';
}

function syncControls(){
 if ($('categoryFilter')) $('categoryFilter').value = activeCategory;
 document.querySelectorAll('[data-seg]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.seg === activePrice)));
 $('favoritesBtn').setAttribute('aria-pressed', String(favoritesOnly));
 $('clearFilters')?.classList.toggle('hidden', activeCategory === scope.category && activePrice === scope.price && !query && !favoritesOnly && $('sortFilter')?.value === 'featured');
}

function syncFavoriteButtons(){
 document.querySelectorAll('[data-favorite]').forEach(b => b.setAttribute('aria-pressed', String(favorites.includes(Number(b.dataset.favorite)))));
 setCount($('favoriteCount'), favorites.length);
}

function renderProducts(){
 if (!grid) return;
 const list = filteredProducts();
 if (isHome) $('productHeading').textContent = heading();
 $('resultSummary').textContent = plural(list.length, 'produto', 'produtos');
 grid.innerHTML = list.map(p => productCard(p, base, favorites.includes(p.id))).join('');
 $('emptyState').classList.toggle('hidden', list.length > 0);
 grid.classList.toggle('hidden', list.length === 0);
 syncControls();
}

function cartQty(){ return cart.reduce((s, x) => s + x.qty, 0) }
function subtotal(){ return cart.reduce((s, x) => s + x.qty * byId(x.id).price, 0) }

function renderCart(){
 const qty = cartQty(), sub = subtotal(), missing = Math.max(0, FREE_SHIPPING - sub);
 setCount($('cartCount'), qty);
 $('cartBtn').setAttribute('aria-label', qty ? `Abrir sacola, ${plural(qty, 'item', 'itens')}` : 'Abrir sacola');
 $('cartSubtitle').textContent = qty ? plural(qty, 'item', 'itens') : 'Nenhum item ainda';
 $('cartSubtotal').textContent = money(sub);
 $('shippingNote').textContent = !qty ? `Frete grátis a partir de ${money(FREE_SHIPPING)}.` : missing ? `Faltam ${money(missing)} para o frete grátis.` : 'Seu pedido tem frete grátis.';
 $('shipBar').style.width = Math.min(100, sub / FREE_SHIPPING * 100) + '%';
 $('shippingValue').textContent = sub >= FREE_SHIPPING ? 'Grátis' : 'Calculado no pagamento';
 $('goCheckout').disabled = !qty;
 $('cartItems').innerHTML = cart.length ? cart.map(item => { const p = byId(item.id); return `<div class="cart-item"><img src="${photo(p.image, 150)}" alt="" width="72" height="72"><div><a class="cart-item-name" href="${base}produtos/${p.slug}/">${esc(p.name)}</a><span class="price">${money(p.price)}</span><div class="qty"><button type="button" data-qty="${p.id}" data-delta="-1" aria-label="Diminuir quantidade de ${esc(p.name)}">${ic('minus')}</button><output aria-label="Quantidade">${item.qty}</output><button type="button" data-qty="${p.id}" data-delta="1" aria-label="Aumentar quantidade de ${esc(p.name)}">${ic('plus')}</button></div></div><button class="remove" type="button" data-remove="${p.id}" aria-label="Remover ${esc(p.name)}">${ic('trash')}</button></div>` }).join('') : '<div class="cart-empty"><strong>Sua sacola está vazia</strong>Toque em “Sacola” em qualquer produto para adicioná-lo aqui.</div>';
}

function openPanel(panel){
 if (!checkout.contains(document.activeElement) && !drawer.contains(document.activeElement)) lastFocus = document.activeElement;
 background.forEach(el => el && (el.inert = true));
 overlay.classList.remove('hidden');
 panel.setAttribute('aria-hidden', 'false');
 panel.focus();
}
function closePanels(){
 overlay.classList.add('hidden');
 drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
 checkout.classList.add('hidden');
 background.forEach(el => el && (el.inert = false));
 if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
function openCart(){ checkout.classList.add('hidden'); renderCart(); drawer.classList.add('open'); openPanel(drawer) }
function openCheckout(){
 drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
 $('checkoutLayout').classList.remove('hidden'); $('checkoutSuccess').classList.add('hidden'); $('formError').classList.add('hidden');
 checkout.classList.remove('hidden'); renderCheckout(); checkout.scrollTop = 0; openPanel(checkout);
}

function addToCart(id){ const item = cart.find(x => x.id === id); if (item) item.qty++; else cart.push({id, qty:1}); save(); renderCart(); toast(`${byId(id).name} adicionado à sacola`) }
function resetFilters(){ activeCategory = scope.category; activePrice = scope.price; query = ''; favoritesOnly = false; $('searchInput').value = ''; if ($('sortFilter')) $('sortFilter').value = 'featured'; if (isHome) history.replaceState(null, '', location.pathname); renderProducts() }

function shippingCost(){ const sub = subtotal(), delivery = document.querySelector('input[name="delivery"]:checked')?.value; return delivery === 'express' ? EXPRESS : sub >= FREE_SHIPPING ? 0 : STANDARD }
function renderCheckout(){
 const sub = subtotal(), ship = shippingCost();
 $('checkoutItems').innerHTML = cart.map(item => { const p = byId(item.id); return `<div class="summary-item"><span>${item.qty} × ${esc(p.name)}</span><span>${money(p.price * item.qty)}</span></div>` }).join('');
 $('standardPrice').textContent = sub >= FREE_SHIPPING ? 'Grátis' : money(STANDARD);
 $('checkoutSubtotal').textContent = money(sub);
 $('checkoutShipping').textContent = ship === 0 ? 'Grátis' : money(ship);
 $('checkoutTotal').textContent = money(sub + ship);
}

document.addEventListener('click', e => {
 const add = e.target.closest('[data-add]'), fav = e.target.closest('[data-favorite]'), seg = e.target.closest('[data-seg]');
 const qty = e.target.closest('[data-qty]'), remove = e.target.closest('[data-remove]');
 if (add) addToCart(Number(add.dataset.add));
 if (fav) {
  const id = Number(fav.dataset.favorite), turnOn = !favorites.includes(id);
  favorites = turnOn ? [...favorites, id] : favorites.filter(x => x !== id);
  save();
  if (favoritesOnly) { renderProducts(); grid.querySelector(`[data-favorite="${id}"]`)?.focus() }
  syncFavoriteButtons();
  toast(turnOn ? 'Salvo nos favoritos' : 'Removido dos favoritos');
 }
 if (seg) { activePrice = seg.dataset.seg; favoritesOnly = false; renderProducts() }
 if (qty) { const item = cart.find(x => x.id === Number(qty.dataset.qty)); if (item) { item.qty += Number(qty.dataset.delta); if (item.qty <= 0) cart = cart.filter(x => x !== item); save(); renderCart(); drawer.focus() } }
 if (remove) { cart = cart.filter(x => x.id !== Number(remove.dataset.remove)); save(); renderCart(); drawer.focus() }
});
on('categoryFilter', 'change', e => { activeCategory = e.target.value; favoritesOnly = false; renderProducts() });
on('sortFilter', 'change', renderProducts);
on('clearFilters', 'click', resetFilters);
// Fora da home, a busca envia o formulário para a home (?q=); na home, filtra sem recarregar.
on('searchForm', 'submit', e => {
 if (!isHome) return;
 e.preventDefault(); query = $('searchInput').value.trim(); favoritesOnly = false;
 history.replaceState(null, '', query ? `?q=${encodeURIComponent(query)}` : location.pathname);
 renderProducts(); scrollToProducts();
});
on('searchInput', 'input', e => { if (isHome && !e.target.value && query) { query = ''; history.replaceState(null, '', location.pathname); renderProducts() } });
on('favoritesBtn', 'click', () => {
 if (!isHome) { location.href = `${base || './'}?favoritos=1#produtos`; return }
 favoritesOnly = !favoritesOnly; activeCategory = 'Todos'; activePrice = 'Todos'; query = ''; $('searchInput').value = '';
 history.replaceState(null, '', favoritesOnly ? '?favoritos=1' : location.pathname);
 renderProducts(); scrollToProducts();
 if (favoritesOnly && !favorites.length) toast('Toque no coração de um produto para salvá-lo aqui');
});
on('cartBtn', 'click', openCart);
on('closeCart', 'click', closePanels);
on('continueShopping', 'click', closePanels);
overlay.addEventListener('click', closePanels);
on('accountBtn', 'click', () => toast('A área de cliente ainda não existe neste protótipo'));
on('goCheckout', 'click', () => cart.length && openCheckout());
on('closeCheckout', 'click', closePanels);
document.querySelectorAll('input[name="delivery"]').forEach(el => el.addEventListener('change', renderCheckout));

const form = $('checkoutForm');
form.addEventListener('input', e => { if (e.target.matches('[aria-invalid="true"]') && e.target.checkValidity()) e.target.removeAttribute('aria-invalid') });
form.addEventListener('submit', e => {
 e.preventDefault();
 const invalid = [...form.querySelectorAll('input[required]')].filter(input => !input.checkValidity());
 form.querySelectorAll('input').forEach(input => input.toggleAttribute('aria-invalid', invalid.includes(input)));
 if (invalid.length) {
  invalid.forEach(input => input.setAttribute('aria-invalid', 'true'));
  $('formError').textContent = invalid.length === 1 ? 'Falta preencher 1 campo, marcado em vermelho.' : `Faltam ${invalid.length} campos, marcados em vermelho.`;
  $('formError').classList.remove('hidden'); invalid[0].focus(); return;
 }
 const data = new FormData(form), first = String(data.get('name')).trim().split(' ')[0];
 const orderId = 'LB-' + Math.floor(100000 + Math.random() * 900000), total = $('checkoutTotal').textContent;
 $('checkoutLayout').classList.add('hidden');
 const success = $('checkoutSuccess');
 success.innerHTML = `<div class="ok">${ic('check')}</div><p class="dialog-title">Pedido ${orderId} registrado, ${esc(first)}.</p><p class="slogan">Seu brilho é a sua presença</p><p>Total: <strong>${total}</strong>.</p><p class="muted">Como isto é uma simulação, nenhum pagamento foi feito e seus dados não saíram deste navegador.</p><button class="btn" id="finishDemo" type="button">Voltar para a loja</button>`;
 success.classList.remove('hidden'); $('finishDemo').focus();
 $('finishDemo').addEventListener('click', () => { cart = []; save(); form.reset(); renderCart(); closePanels(); toast('Sacola esvaziada. Boas compras!') });
});
on('newsletterForm', 'submit', e => { e.preventDefault(); e.target.reset(); toast('E-mail cadastrado (simulação)') });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closePanels() });

if (query) $('searchInput').value = query;
if (isHome && (query || favoritesOnly)) renderProducts(); else syncControls();
syncFavoriteButtons(); renderCart();
