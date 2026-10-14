import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { PRODUCTS, categoryOf } from "@/data/catalog";
import { ProductMedia } from "@/components/product/ProductMedia";
import { brl } from "@/lib/format";

const POPULAR = ["Camiseta", "Bermuda jeans", "Feminino", "Boné", "Sol de Costa", "Tênis"];
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) setTimeout(() => ref.current?.focus(), 80);
    else setQ("");
  }, [searchOpen]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return [];
    return PRODUCTS.filter((p) => {
      const hay = norm([p.name, p.line, categoryOf(p.category).plural, p.printStory?.name ?? "", p.colors.map((c) => c.name).join(" ")].join(" "));
      return t.split(/\s+/).every((w) => hay.includes(w));
    }).slice(0, 8);
  }, [q]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSearchOpen(false)} />
          <motion.div
            role="dialog"
            aria-label="Buscar produtos"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-0 z-50 max-h-[92vh] overflow-y-auto bg-bone"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <div className="container-x py-6">
              <div className="flex items-center gap-4 border-b border-ink pb-3">
                <input
                  ref={ref}
                  id="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="O que você procura?"
                  className="h-12 min-w-0 flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-graphite/60 sm:text-4xl"
                />
                <button aria-label="Fechar busca" onClick={() => setSearchOpen(false)} className="p-2"><X className="h-5 w-5" strokeWidth={1.5} /></button>
              </div>
              {!q ? (
                <div className="py-8">
                  <p className="label mb-4 text-graphite">Mais buscados</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
                    {POPULAR.map((p) => <button key={p} onClick={() => setQ(p)} className="underline-offset-4 hover:underline">{p}</button>)}
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <p className="label mb-5 text-graphite">{results.length} {results.length === 1 ? "resultado" : "resultados"}</p>
                  {results.length === 0 ? (
                    <p className="text-graphite">Nada encontrado. Tente “camiseta”, “feminino” ou o nome de uma estampa.</p>
                  ) : (
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
                      {results.map((p) => (
                        <li key={p.id}>
                          <Link to={`/produto/${p.slug}`} onClick={() => setSearchOpen(false)} className="group block">
                            <ProductMedia product={p} color={p.colors[0]} className="aspect-[3/4]" />
                            <p className="mt-3 text-[13px]">{p.name}</p>
                            <p className="text-[13px] text-graphite">{brl(p.price)}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
