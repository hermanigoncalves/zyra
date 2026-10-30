const img = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=600&q=75`;
const products = [
 {id:1,name:"Gloss labial hidratante",detail:"Várias cores",category:"Maquiagem",price:10,image:img("1591360236480-4ed861025fa1")},
 {id:2,name:"Máscara de cílios",detail:"Volume intenso",category:"Maquiagem",price:20,image:img("1608248543803-ba4f8c70ae0b")},
 {id:3,name:"Paleta de sombras",detail:"12 tons neutros",category:"Maquiagem",price:20,image:img("1596704017254-9b121068fb31")},
 {id:4,name:"Brinco argola dourada",detail:"Tamanho médio",category:"Bijuterias",price:10,image:img("1506630448388-4e683c67ddb0")},
 {id:5,name:"Colar coração vazado",detail:"Banho dourado",category:"Semijoias",price:20,image:img("1588444837495-c6cfeb53f32d")},
 {id:6,name:"Pulseira de elos",detail:"Fecho lagosta",category:"Bijuterias",price:20,image:img("1611591437281-460bfbe1220a")},
 {id:7,name:"Kit anéis finos",detail:"3 peças",category:"Kits",price:10,image:img("1605100804763-247f67b3557e")},
 {id:8,name:"Pincéis de maquiagem",detail:"5 peças para o dia a dia",category:"Acessórios",price:20,image:img("1512496015851-a90fb38ba796")},
 {id:9,name:"Brinco ponto de luz azul",detail:"Pedra facetada",category:"Semijoias",price:10,image:img("1535632066927-ab7c9ab60908")},
 {id:10,name:"Kit beleza essencial",detail:"Base, pó e pincel",category:"Kits",price:20,image:img("1522335789203-aabd1fc54bc9")},
 {id:11,name:"Pó compacto",detail:"Acabamento natural",category:"Maquiagem",price:10,image:img("1515688594390-b649af70d282")},
 {id:12,name:"Corrente dourada",detail:"45 cm",category:"Bijuterias",price:10,image:img("1602173574767-37ac01994b2a")},
 {id:13,name:"Colar gota",detail:"Pingente delicado",category:"Semijoias",price:20,image:img("1599643478518-a784e5dc4c8f")},
 {id:14,name:"Batom vermelho cremoso",detail:"Alta cobertura",category:"Maquiagem",price:10,image:img("1586495777744-4413f21062fa")}
];
const FREE_SHIPPING = 99, STANDARD = 9.9, EXPRESS = 15;
const money = n => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const load = key => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } };
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

let cart = load('zayraCart').filter(x => products.some(p => p.id === x.id));
let favorites = load('zayraFavorites');
let activeCategory = 'Todos', activePrice = 'Todos', query = '', favoritesOnly = false, toastTimer, lastFocus;
const $ = id => document.getElementById(id);
const grid = $('productGrid'), overlay = $('overlay'), drawer = $('cartDrawer'), checkout = $('checkoutModal');
const background = [document.querySelector('.skip-link'), document.querySelector('.strip'), document.querySelector('.site-header'), $('main'), document.querySelector('.footer')];

function save(){ try { localStorage.setItem('zayraCart', JSON.stringify(cart)); localStorage.setItem('zayraFavorites', JSON.stringify(favorites)) } catch {} }
function toast(message){ const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600) }
function scrollToProducts(){ $('produtos').scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth'}) }
function byId(id){ return products.find(p => p.id === id) }

function fillCounts(){
 document.querySelectorAll('[data-count-price]').forEach(el => el.textContent = plural(products.filter(p => p.price === Number(el.dataset.countPrice)).length, 'produto', 'produtos'));
 document.querySelectorAll('[data-count-category]').forEach(el => el.textContent = products.filter(p => p.category === el.dataset.countCategory).length);
}

function filteredProducts(){
 const q = query.toLowerCase();
 const list = products.filter(p => (activeCategory === 'Todos' || p.category === activeCategory) && (activePrice === 'Todos' || p.price === Number(activePrice)) && (!favoritesOnly || favorites.includes(p.id)) && (!q || `${p.name} ${p.detail} ${p.category}`.toLowerCase().includes(q)));
 const sort = $('sortFilter').value;
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
 $('categoryFilter').value = activeCategory;
 document.querySelectorAll('[data-seg]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.seg === activePrice)));
 document.querySelectorAll('.nav a').forEach(a => a.setAttribute('aria-current', String(!favoritesOnly && (a.dataset.category ? a.dataset.category === activeCategory && activePrice === 'Todos' : a.dataset.price === activePrice && activeCategory === 'Todos'))));
 document.querySelectorAll('.category').forEach(b => b.setAttribute('aria-current', String(b.dataset.category === activeCategory)));
 $('favoritesBtn').setAttribute('aria-pressed', String(favoritesOnly));
 $('clearFilters').classList.toggle('hidden', activeCategory === 'Todos' && activePrice === 'Todos' && !query && !favoritesOnly && $('sortFilter').value === 'featured');
}

function renderProducts(){
 const list = filteredProducts();
 $('productHeading').textContent = heading();
 $('resultSummary').textContent = plural(list.length, 'produto', 'produtos');
 grid.innerHTML = list.map(p => {
  const fav = favorites.includes(p.id);
  return `<article class="product">
  <div class="product-media"><img src="${p.image}" alt="" loading="lazy" width="600" height="600"><button class="fav" type="button" data-favorite="${p.id}" aria-pressed="${fav}" aria-label="Favoritar ${esc(p.name)}">${ic('heart')}</button></div>
  <h3 class="product-name">${esc(p.name)}</h3>
  <p class="product-detail">${esc(p.detail)}</p>
  <div class="product-buy"><p class="product-price"><span>R$</span>${p.price}</p><button class="add" type="button" data-add="${p.id}" aria-label="Adicionar ${esc(p.name)} à sacola">${ic('plus')}Sacola</button></div>
 </article>`}).join('');
 $('emptyState').classList.toggle('hidden', list.length > 0);
 grid.classList.toggle('hidden', list.length === 0);
 setCount($('favoriteCount'), favorites.length);
 syncControls();
}

function setCount(el, n){ el.textContent = n; el.toggleAttribute('data-zero', n === 0) }
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
 $('cartItems').innerHTML = cart.length ? cart.map(item => { const p = byId(item.id); return `<div class="cart-item"><img src="${p.image}" alt=""><div><h3>${esc(p.name)}</h3><span class="price">${money(p.price)}</span><div class="qty"><button type="button" data-qty="${p.id}" data-delta="-1" aria-label="Diminuir quantidade de ${esc(p.name)}">${ic('minus')}</button><output aria-label="Quantidade">${item.qty}</output><button type="button" data-qty="${p.id}" data-delta="1" aria-label="Aumentar quantidade de ${esc(p.name)}">${ic('plus')}</button></div></div><button class="remove" type="button" data-remove="${p.id}" aria-label="Remover ${esc(p.name)}">${ic('trash')}</button></div>` }).join('') : '<div class="cart-empty"><strong>Sua sacola está vazia</strong>Toque em “Sacola” em qualquer produto para adicioná-lo aqui.</div>';
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
function applyCategory(cat){ activeCategory = cat; favoritesOnly = false; renderProducts(); scrollToProducts() }
function applyPrice(price){ activePrice = String(price); favoritesOnly = false; renderProducts(); scrollToProducts() }
function resetFilters(){ activeCategory = 'Todos'; activePrice = 'Todos'; query = ''; favoritesOnly = false; $('searchInput').value = ''; $('sortFilter').value = 'featured'; renderProducts() }

function shippingCost(){ const sub = subtotal(), delivery = document.querySelector('input[name="delivery"]:checked')?.value; return delivery === 'express' ? EXPRESS : sub >= FREE_SHIPPING ? 0 : STANDARD }
function renderCheckout(){
 const sub = subtotal(), ship = shippingCost();
 $('checkoutItems').innerHTML = cart.map(item => { const p = byId(item.id); return `<div class="summary-item"><span>${item.qty} × ${esc(p.name)}</span><span>${money(p.price * item.qty)}</span></div>` }).join('');
 $('standardPrice').textContent = sub >= FREE_SHIPPING ? 'Grátis' : money(STANDARD);
 $('checkoutSubtotal').textContent = money(sub);
 $('checkoutShipping').textContent = ship === 0 ? 'Grátis' : money(ship);
 $('checkoutTotal').textContent = money(sub + ship);
}

grid.addEventListener('click', e => {
 const add = e.target.closest('[data-add]'), fav = e.target.closest('[data-favorite]');
 if (add) addToCart(Number(add.dataset.add));
 if (fav) {
  const id = Number(fav.dataset.favorite), on = !favorites.includes(id);
  favorites = on ? [...favorites, id] : favorites.filter(x => x !== id);
  save(); renderProducts();
  grid.querySelector(`[data-favorite="${id}"]`)?.focus();
  toast(on ? 'Salvo nos favoritos' : 'Removido dos favoritos');
 }
});
document.addEventListener('click', e => {
 const cat = e.target.closest('[data-category]'), price = e.target.closest('[data-price]'), seg = e.target.closest('[data-seg]');
 if (cat) { e.preventDefault(); applyCategory(cat.dataset.category) }
 else if (price) { e.preventDefault(); applyPrice(price.dataset.price) }
 else if (seg) { activePrice = seg.dataset.seg; favoritesOnly = false; renderProducts() }
 const qty = e.target.closest('[data-qty]'), remove = e.target.closest('[data-remove]');
 if (qty) { const item = cart.find(x => x.id === Number(qty.dataset.qty)); if (item) { item.qty += Number(qty.dataset.delta); if (item.qty <= 0) cart = cart.filter(x => x !== item); save(); renderCart(); drawer.focus() } }
 if (remove) { cart = cart.filter(x => x.id !== Number(remove.dataset.remove)); save(); renderCart(); drawer.focus() }
});
$('categoryFilter').addEventListener('change', e => { activeCategory = e.target.value; favoritesOnly = false; renderProducts() });
$('sortFilter').addEventListener('change', renderProducts);
$('searchForm').addEventListener('submit', e => { e.preventDefault(); query = $('searchInput').value.trim(); favoritesOnly = false; renderProducts(); scrollToProducts() });
$('searchInput').addEventListener('input', e => { if (!e.target.value) { query = ''; renderProducts() } });
$('clearFilters').addEventListener('click', resetFilters);
$('emptyReset').addEventListener('click', resetFilters);
$('cartBtn').addEventListener('click', openCart);
$('closeCart').addEventListener('click', closePanels);
$('continueShopping').addEventListener('click', closePanels);
overlay.addEventListener('click', closePanels);
$('favoritesBtn').addEventListener('click', () => {
 favoritesOnly = !favoritesOnly; activeCategory = 'Todos'; activePrice = 'Todos'; query = ''; $('searchInput').value = '';
 renderProducts(); scrollToProducts();
 if (favoritesOnly && !favorites.length) toast('Toque no coração de um produto para salvá-lo aqui');
});
$('accountBtn').addEventListener('click', () => toast('A área de cliente ainda não existe neste protótipo'));
$('goCheckout').addEventListener('click', () => cart.length && openCheckout());
$('closeCheckout').addEventListener('click', closePanels);
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
 const orderId = 'ZY-' + Math.floor(100000 + Math.random() * 900000), total = $('checkoutTotal').textContent;
 $('checkoutLayout').classList.add('hidden');
 const success = $('checkoutSuccess');
 success.innerHTML = `<div class="ok">${ic('check')}</div><h3>Pedido ${orderId} registrado, ${esc(first)}.</h3><p>Total: <strong>${total}</strong>.</p><p class="muted">Como isto é uma simulação, nenhum pagamento foi feito e seus dados não saíram deste navegador.</p><button class="btn" id="finishDemo" type="button">Voltar para a loja</button>`;
 success.classList.remove('hidden'); $('finishDemo').focus();
 $('finishDemo').addEventListener('click', () => { cart = []; save(); form.reset(); renderCart(); closePanels(); toast('Sacola esvaziada. Boas compras!') });
});
$('newsletterForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('E-mail cadastrado (simulação)') });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closePanels() });

fillCounts(); renderProducts(); renderCart();
