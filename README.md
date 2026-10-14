# Veliora — loja de streetwear personalizado (front-end)

Loja demonstrativa para portfólio. React + Vite + TypeScript + Tailwind CSS, animações com Motion, ícones Lucide e notificações Sonner. Não tem backend: catálogo, cupons, frete e pagamento são simulados.

Camisas, bermudas e tênis usam fotos reais (pasta `public/img`). Bonés, sapatênis e chinelos usam desenhos técnicos em SVG até você ter fotos deles: basta adicionar `images` na cor do produto em `src/data/catalog.ts`.

**Créditos das fotos:** dados de exemplo dos projetos open source Sylius (licença MIT) e Bagisto (licença MIT). Para uso comercial com cliente real, substitua pelas fotos do cliente.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera /dist
```

## Publicar na Vercel

1. Suba a pasta num repositório do GitHub.
2. Na Vercel: **Add New → Project → Import**. Framework: Vite (detectado sozinho).
3. Deploy. O `vercel.json` já faz as rotas funcionarem ao recarregar a página.

## O que tem

- **Home**: hero dividido (Drop 01 + Ateliê com nomes trocando sozinhos), faixa de estampas, categorias, mais vendidos, ateliê interativo, as 6 estampas, "Monte o look" com 10% OFF, Clube Veliora, novidades.
- **Coleção**: filtros por peça, tamanho, cor, preço e promoção; chips de filtros ativos; ordenação; grade de 3 ou 4 colunas.
- **Produto**: galeria (frente, costas/cena, detalhe), outras estampas no mesmo corte, cores, tamanhos com esgotado e últimas unidades, guia de medidas, **personalização ao vivo** (local, texto, número, letra, cor), previsão de entrega, frete por CEP, avaliações, "Completa o look", vistos recentemente, barra fixa no celular.
- **Busca** instantânea, **favoritos**, **sacola lateral** com barra de frete grátis e sugestão.
- **Checkout** em uma página: cupom, endereço, frete, Pix (5% OFF) ou cartão (6x), e tela de pedido confirmado com linha do tempo.

## Para testar

- Cupons: `VELIORA10` (10%) e `MARE20` (R$ 20)
- Qualquer CEP com 8 números funciona
- Cartão: qualquer número de 16 dígitos. Nada é cobrado.

## Onde mexer

| O quê | Arquivo |
|---|---|
| Cores da marca | `src/index.css` (variáveis no topo) |
| Produtos, preços, tamanhos, cupons | `src/data/catalog.ts` |
| Estampas | `src/art/prints.tsx` |
| Ilustrações das peças | `src/art/ProductArt.tsx` |
| Painel de personalização | `src/components/product/Personalizer.tsx` |

Para usar fotos reais no lugar das ilustrações, troque o componente `ProductArt` por `<img>` nos cards e na página de produto.
