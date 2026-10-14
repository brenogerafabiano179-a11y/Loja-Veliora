import { useRef, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/data/catalog";
import { ProductCard } from "./ProductCard";

/** Carrossel horizontal com scroll-snap. */
export function ProductRail({ eyebrow, title, products, action }: { eyebrow?: string; title: string; products: Product[]; action?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: 1 | -1) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.75, behavior: "smooth" });
  return (
    <section className="pt-20 sm:pt-28">
      <div className="container-x mb-8 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="label mb-3 text-graphite">{eyebrow}</p>}
          <h2 className="font-display text-[28px] sm:text-[36px]">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-6">
          {action}
          <div className="hidden gap-2 sm:flex">
            {([-1, 1] as const).map((d) => (
              <button key={d} aria-label={d < 0 ? "Anterior" : "Próximo"} onClick={() => go(d)} className="flex h-10 w-10 items-center justify-center border border-line transition-colors hover:border-ink">
                {d < 0 ? <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> : <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div ref={ref} className="no-scrollbar container-x flex snap-x snap-mandatory gap-3 overflow-x-auto sm:gap-5" style={{ scrollPaddingLeft: "max(16px, env(safe-area-inset-left, 0px))" }}>
        {products.map((p) => (
          <div key={p.id} className="w-[70%] shrink-0 snap-start sm:w-[40%] md:w-[30%] lg:w-[23%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
