import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import type { Product } from "@/data/catalog";
import { brl, cn } from "@/lib/format";
import { ProductMedia } from "./ProductMedia";

export function Price({ price, compareAt, className }: { price: number; compareAt?: number; className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 tabular-nums", className)}>
      <span className={compareAt ? "text-coral" : undefined}>{brl(price)}</span>
      {compareAt && <span className="text-graphite line-through">{brl(compareAt)}</span>}
    </span>
  );
}

export function Badge({ children }: { children: string }) {
  return <span className="bg-bone/95 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ink">{children}</span>;
}

export function ProductCard({ product: p }: { product: Product; index?: number }) {
  const { addItem, wishlist, toggleWish } = useStore();
  const [color, setColor] = useState(p.colors[0]);
  const [quick, setQuick] = useState(false);
  const liked = wishlist.includes(p.id);
  const hasSecond = (color.images?.length ?? 0) > 1 || !color.images?.length;

  return (
    <article className="group relative min-w-0" onMouseLeave={() => setQuick(false)}>
      <div className="relative">
        <Link to={`/produto/${p.slug}`} aria-label={p.name} className="block">
          <ProductMedia product={p} color={color} className="aspect-[3/4]" />
          {hasSecond && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 lg:group-hover:opacity-100">
              <ProductMedia product={p} color={color} index={1} className="h-full w-full" />
            </div>
          )}
        </Link>
        {p.badge && <div className="pointer-events-none absolute left-3 top-3"><Badge>{p.badge}</Badge></div>}
        <button
          aria-label={liked ? `Remover ${p.name} dos favoritos` : `Salvar ${p.name} nos favoritos`}
          onClick={() => toggleWish(p.id)}
          className="absolute right-2 top-2 p-2"
        >
          <Heart className={cn("h-[17px] w-[17px] transition-colors", liked ? "fill-ink text-ink" : "text-ink/70")} strokeWidth={1.4} />
        </button>

        {/* adição rápida */}
        <div className="absolute inset-x-0 bottom-0 hidden p-3 lg:block">
          <AnimatePresence>
            {quick ? (
              <motion.div key="s" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="bg-bone/95 p-3 backdrop-blur">
                <p className="mb-2 text-center text-[11px] text-graphite">Escolha o tamanho</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {p.sizes.map((s) => {
                    const out = p.soldOut?.includes(s);
                    return (
                      <button
                        key={s}
                        disabled={out}
                        onClick={() => { addItem(p, { color, size: s }); setQuick(false); }}
                        className={cn("h-8 min-w-[2.4rem] px-1.5 text-[12px] transition-colors", out ? "text-graphite/40 line-through" : "hover:bg-ink hover:text-bone")}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() => (p.sizes.length === 1 ? addItem(p, { color, size: p.sizes[0] }) : setQuick(true))}
                className="w-full bg-bone/95 py-3 text-[11px] font-medium uppercase tracking-[0.16em] opacity-0 backdrop-blur transition-all duration-300 hover:bg-ink hover:text-bone group-hover:opacity-100"
              >
                Adicionar rápido
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 space-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/produto/${p.slug}`} className="min-w-0 text-[13px] leading-snug">{p.name}</Link>
          <Price price={p.price} compareAt={p.compareAt} className="shrink-0 text-[13px]" />
        </div>
        <p className="text-[12px] text-graphite">
          {color.name}
          {p.colors.length > 1 && ` · ${p.colors.length} cores`}
        </p>
        {p.colors.length > 1 && (
          <div className="flex gap-1.5 pt-1.5">
            {p.colors.map((c) => (
              <button
                key={c.name}
                aria-label={`Ver em ${c.name}`}
                onMouseEnter={() => setColor(c)}
                onClick={() => setColor(c)}
                className={cn("h-3 w-3 rounded-full border transition-shadow", color.name === c.name ? "border-ink shadow-[0_0_0_2px_rgb(var(--bone)),0_0_0_3px_rgb(var(--ink))]" : "border-ink/15")}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
