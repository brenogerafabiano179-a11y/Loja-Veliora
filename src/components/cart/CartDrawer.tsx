import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useStore, type CartItem } from "@/context/StoreContext";
import { FREE_SHIPPING, FONTS, INK_COLORS, PRODUCTS, ZONES_BY_KIND, byId } from "@/data/catalog";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ProductMedia } from "@/components/product/ProductMedia";
import { brl, installments } from "@/lib/format";

export function customSummary(item: CartItem) {
  const c = item.custom;
  if (!c) return null;
  const p = byId(item.productId);
  const zone = p ? ZONES_BY_KIND[p.kind].find((z) => z.id === c.zone)?.label : c.zone;
  const font = FONTS.find((f) => f.id === c.font)?.label;
  const ink = INK_COLORS.find((k) => k.hex === c.color)?.name;
  return `${zone}: “${c.text}${c.number ? ` ${c.number}` : ""}” · ${font} · ${ink}`;
}

export function CartLine({ item, compact }: { item: CartItem; compact?: boolean }) {
  const { updateQty, removeItem, setCartOpen } = useStore();
  const p = byId(item.productId)!;
  const color = p.colors.find((c) => c.name === item.color.name) ?? item.color;
  const s = customSummary(item);
  return (
    <div className="flex gap-4">
      <Link to={`/produto/${p.slug}`} onClick={() => setCartOpen(false)} className={compact ? "w-16 shrink-0" : "w-24 shrink-0"}>
        <ProductMedia product={p} color={color} custom={item.custom} className="aspect-[3/4]" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col text-[13px]">
        <div className="flex justify-between gap-3">
          <p className="min-w-0">{p.name}</p>
          <p className="shrink-0 tabular-nums">{brl(item.unitPrice * item.qty)}</p>
        </div>
        <p className="mt-0.5 text-graphite">{item.color.name} · {item.size}</p>
        {s && <p className="mt-1 break-words text-[12px] text-anil">Personalizado. {s}</p>}
        {item.note && <p className="mt-1 text-[12px] text-success">{item.note}</p>}
        {!compact && (
          <div className="mt-auto flex items-center justify-between pt-3">
            <QuantityStepper size="sm" value={item.qty} onChange={(q) => updateQty(item.key, q)} />
            <button onClick={() => removeItem(item.key)} className="text-[12px] text-graphite underline-offset-4 hover:text-ink hover:underline">Remover</button>
          </div>
        )}
        {compact && <p className="mt-1 text-graphite">Qtd. {item.qty}</p>}
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, items, count, subtotal, discount, freeShippingLeft, addItem } = useStore();
  const navigate = useNavigate();
  const total = subtotal - discount;
  const progress = Math.min(100, (total / FREE_SHIPPING) * 100);
  const inCart = new Set(items.map((i) => byId(i.productId)?.category));
  const upsell = (["bones", "bermudas", "chinelos", "camisas"] as const)
    .filter((c) => !inCart.has(c))
    .map((c) => PRODUCTS.filter((p) => p.category === c).sort((a, b) => Number(!!b.colors[0].images) - Number(!!a.colors[0].images) || b.popularity - a.popularity)[0])[0];

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [setCartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} />
          <motion.aside
            role="dialog"
            aria-label="Sacola"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-bone sm:max-w-[460px]"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingRight: "env(safe-area-inset-right, 0px)" }}
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-6">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em]">Sacola ({count})</p>
              <button aria-label="Fechar sacola" onClick={() => setCartOpen(false)} className="-mr-2 p-2"><X className="h-5 w-5" strokeWidth={1.5} /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <p className="font-display text-[24px]">Sua sacola está vazia</p>
                <p className="mt-2 text-[14px] text-graphite">Comece pelas novidades do Drop 01.</p>
                <Button className="mt-6" onClick={() => { setCartOpen(false); navigate("/loja?ordem=novos"); }}>Ver novidades</Button>
              </div>
            ) : (
              <>
                <div className="px-6 pt-5">
                  <p className="text-[12px] text-graphite">
                    {freeShippingLeft > 0 ? <>Faltam <span className="text-ink">{brl(freeShippingLeft)}</span> para o frete grátis</> : <span className="text-success">Você ganhou frete grátis</span>}
                  </p>
                  <div className="mt-2 h-[2px] bg-line"><motion.div className="h-full bg-ink" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} /></div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <ul className="space-y-6">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.li key={item.key} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <CartLine item={item} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  {upsell && (
                    <div className="mt-10 border-t border-line pt-6">
                      <p className="label mb-4 text-graphite">Combina com</p>
                      <div className="flex items-center gap-4">
                        <div className="w-16 shrink-0"><ProductMedia product={upsell} color={upsell.colors[0]} className="aspect-[3/4]" /></div>
                        <div className="min-w-0 flex-1 text-[13px]">
                          <p>{upsell.name}</p>
                          <p className="text-graphite">{brl(upsell.price)}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => addItem(upsell, { color: upsell.colors[0], size: upsell.sizes[Math.min(2, upsell.sizes.length - 1)] })}>Adicionar</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-line px-6 pt-5" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex justify-between"><span className="text-graphite">Subtotal</span><span className="tabular-nums">{brl(subtotal)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-success"><span>Cupom</span><span className="tabular-nums">− {brl(discount)}</span></div>}
                    <div className="flex justify-between"><span className="text-graphite">Frete</span><span>Calculado no checkout</span></div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                    <span className="text-[14px]">Total</span>
                    <div className="text-right">
                      <p className="text-[17px] tabular-nums">{brl(total)}</p>
                      <p className="text-[12px] text-graphite">{installments(total)}</p>
                    </div>
                  </div>
                  <Button size="lg" fullWidth className="mt-5" onClick={() => { setCartOpen(false); navigate("/checkout"); }}>Finalizar compra</Button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
