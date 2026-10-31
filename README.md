# Lua Belly — protótipo de e-commerce

Protótipo front-end responsivo em HTML, CSS e JavaScript puro para a loja Lua Belly (slogan: "Seu brilho é a sua presença").

## Como executar
Com Node.js instalado (não há dependências para instalar):

```bash
npm run dev
```

Isso gera o site em `dist/` e abre em http://localhost:8685. Para usar outra porta: `PORT=3000 npm run dev`.

## Como o site é montado
O site é gerado por `build.js` (Node, sem dependências) a partir de `src/data.js`:

- `src/data.js`: produtos, categorias, faixas de preço, frete e o endereço do site. **Edite aqui para adicionar ou mudar produtos.**
- `build.js`: cria uma página para a home, cada categoria, cada faixa de preço (`/tudo-por-10-reais/`), cada produto (`/produtos/nome-do-produto/`), "Sobre" e "Entrega e frete", além de `robots.txt`, `sitemap.xml` e `404.html`.
- `shared.js`: o cartão de produto e funções usadas tanto no build quanto no navegador.
- `script.js` e `styles.css`: comportamento (filtros, busca, sacola, checkout) e visual.

`npm run build` só gera o `dist/`. O domínio usado em canonical, sitemap e dados estruturados vem de `site.url` em `src/data.js`, ou da variável `SITE_URL`:

```bash
SITE_URL=https://www.luabelly.com.br npm run build
```

No Vercel, o `vercel.json` já roda `npm run build` e publica a pasta `dist/`.

## O que já funciona
- Layout responsivo para desktop e celular.
- Busca de produtos.
- Filtros por categoria e preço (R$ 10 / R$ 20).
- Ordenação de produtos.
- Favoritos salvos no navegador.
- Carrinho com adicionar, remover e alterar quantidades.
- Resumo do carrinho e estimativa demonstrativa de frete grátis acima de R$ 99.
- Checkout de demonstração com validação HTML dos campos, entrega e escolha de pagamento.
- Tela de confirmação simulada.
- Newsletter demonstrativa.

## Importante
- Produtos, preços, estoque, imagens e regras de frete são exemplos e precisam ser confirmados.
- As imagens de produtos e hero usam URLs externas do Unsplash; é necessária internet para carregá-las.
- O checkout é apenas uma simulação: não processa pagamentos, não envia pedidos a um servidor e não persiste os dados pessoais.
- Antes de vender de verdade, integrar backend/API, banco de dados, estoque, cálculo de frete, gateway de pagamento, políticas da loja, LGPD e segurança.
- A logomarca original está em `assets/logo-luabelly.webp`. O site usa versões reduzidas geradas a partir dela (`logo-luabelly-352.jpg`, `logo-luabelly-512.jpg`, favicons e `og-luabelly.jpg` para compartilhamento).
