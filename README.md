# Zayra — protótipo de e-commerce

Protótipo front-end responsivo em HTML, CSS e JavaScript puro para a loja Zayra.

## Como executar
Com Node.js instalado (não há dependências para instalar):

```bash
npm run dev
```

Abra http://localhost:8685. Para usar outra porta: `PORT=3000 npm run dev`.

Também funciona abrindo `index.html` direto no navegador.

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
- A logomarca enviada foi incluída em `assets/logo-zayra.jpg`.
