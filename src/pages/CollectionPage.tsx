import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, PRODUCTS, type CategoryId, type Product } from "@/data/catalog";
import { cn } from "@/lib/format";
import NotFound from "./NotFound";

const SORTS = [
  { id: "relevancia", label: "Relevância" },
  { id: "novos", label: "Novidades" },
  { id: "populares", label: "Mais vendidos" },
  { id: "menor", label: "Menor preço" },
  { id: "maior", label: "Maior preço" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

const PRICES = [
  { id: "ate150", label: "Até R$ 150", test: (v: number) => v <= 150 },
  { id: "150a300", label: "R$ 150 a R$ 300", test: (v: number) => v > 150 && v <= 300 },
  { id: "acima300", label: "Acima de R$ 300", test: (v: number) => v > 300 },
];

type Filters = { sizes: string[]; colors: string[]; price: string | null; sale: boolean; cats: CategoryId[] };
const EMPTY: Filters = { sizes: [], colors: [], price: null, sale: false, cats: [] };

const matches = (p: Product, f: Filters) =>
  (!f.cats.length || f.cats.includes(p.category)) &&
  (!f.sizes.length || p.sizes.some((s) => f.sizes.includes(s) && !p.soldOut?.includes(s))) &&
  (!f.colors.length || p.colors.some((c) => f.colors.includes(c.name))) &&
  (!f.price || PRICES.find((x) => x.id === f.price)!.test(p.price)) &&
  (!f.sale || !!p.compareAt);

export default function CollectionPage() {
  const { categoria } = useParams();
  const [params, setParams] = useSearchParams();
  const sort = (params.get("ordem") as SortId) || "relevancia";
  const linha = params.get("linha") as "Feminino" | "Masculino" | null;
  const category = categoria ? CATEGORIES.find((c) => c.id === categoria) : null;
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [panel, setPanel] = useState(false);

  const base = useMemo(
    () => PRODUCTS.filter((p) => (!category || p.category === category.id) && (!linha || p.line === linha || p.line === "Unissex")),
    [category, linha],
  );
  const allSizes = useMemo(() => [...new Set(base.flatMap((p) => p.sizes))], [base]);
  const allColors = useMemo(() => {
    const m = new Map<string, string>();
    base.forEach((p) => p.colors.forEach((c) => m.set(c.name, c.hex)));
    return [...m.entries()];
  }, [base]);

  const list = useMemo(() => {
    let r = base.filter((p) => matches(p, filters));
    if (sort === "relevancia") r = [...r].sort((a, b) => Number(!!b.colors[0].images?.length) - Number(!!a.colors[0].images?.length));
    if (sort === "novos") r = [...r].sort((a, b) => b.fresh - a.fresh);
    if (sort === "populares") r = [...r].sort((a, b) => b.popularity - a.popularity);
    if (sort === "menor") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "maior") r = [...r].sort((a, b) => b.price - a.price);
    return r;
  }, [base, filters, sort]);

  if (categoria && !category) return <NotFound />;

  const title = category ? category.plural : linha ? linha : sort === "novos" ? "Novidades" : "Todos os produtos";
  const setParam = (k: string, v: string | null) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v); else p.delete(k);
    setParams(p, { replace: true });
  };
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const active = filters.cats.length + filters.sizes.length + filters.colors.length + (filters.price ? 1 : 0) + (filters.sale ? 1 : 0);

  return (
    <div className="container-x pt-10">
      <p className="text-[12px] text-graphite"><Link to="/" className="hover:text-ink">Início</Link> / {title}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-[34px] font-normal sm:text-[44px]">{title}</h1>
        <p className="text-[13px] text-graphite">{list.length} {list.length === 1 ? "produto" : "produtos"}</p>
      </div>

      {/* navegação de categorias */}
      <div className="no-scrollbar -mx-4 mt-6 flex gap-6 overflow-x-auto border-b border-line px-4 text-[13px] sm:mx-0 sm:px-0">
        {[{ id: null, label: "Tudo" }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.plural }))].map((c) => {
          const on = (category?.id ?? null) === c.id;
          const qs = new URLSearchParams(params).toString();
          return (
            <Link key={c.label} to={`${c.id ? `/loja/${c.id}` : "/loja"}${qs ? `?${qs}` : ""}`} className={cn("relative shrink-0 pb-3 transition-colors", on ? "text-ink" : "text-graphite hover:text-ink")}>
              {c.label}
              {on && <motion.span layoutId="cat-line" className="absolute inset-x-0 -bottom-px h-px bg-ink" />}
            </Link>
          );
        })}
      </div>

      {/* barra */}
      <div className="sticky z-20 -mx-4 flex items-center justify-between gap-4 bg-bone/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0" style={{ top: "calc(4rem + env(safe-area-inset-top, 0px))" }}>
        <div className="flex items-center gap-5 text-[12px]">
          <button onClick={() => { setDraft(filters); setPanel(true); }} className="font-medium uppercase tracking-[0.14em]">Filtrar{active ? ` (${active})` : ""}</button>
          <div className="hidden gap-4 sm:flex">
            {(["Feminino", "Masculino"] as const).map((l) => (
              <button key={l} onClick={() => setParam("linha", linha === l ? null : l)} className={cn("transition-colors", linha === l ? "text-ink underline underline-offset-4" : "text-graphite hover:text-ink")}>{l}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-[12px]">
          <span className="text-graphite">Ordenar</span>
          <select id="ordenar" value={sort} onChange={(e) => setParam("ordem", e.target.value)} className="bg-transparent outline-none">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {active > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px]">
          {[...filters.cats.map((c) => CATEGORIES.find((x) => x.id === c)!.plural), ...filters.sizes.map((s) => `Tam. ${s}`), ...filters.colors, ...(filters.price ? [PRICES.find((x) => x.id === filters.price)!.label] : []), ...(filters.sale ? ["Em promoção"] : [])].map((l) => (
            <span key={l} className="border border-line px-2.5 py-1">{l}</span>
          ))}
          <button onClick={() => setFilters(EMPTY)} className="flex items-center gap-1 px-1 text-graphite hover:text-ink"><X className="h-3 w-3" /> Limpar</button>
        </div>
      )}

      {list.length === 0 ? (
        <div className="py-28 text-center">
          <p className="font-display text-[26px]">Nenhum produto com esses filtros</p>
          <p className="mt-2 text-[14px] text-graphite">Remova um filtro ou veja todos os produtos.</p>
          <Button className="mt-6" variant="outline" onClick={() => setFilters(EMPTY)}>Limpar filtros</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      <AnimatePresence>
        {panel && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanel(false)} />
            <motion.aside
              role="dialog"
              aria-label="Filtros"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-bone"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingLeft: "env(safe-area-inset-left, 0px)" }}
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-6">
                <p className="text-[12px] font-medium uppercase tracking-[0.14em]">Filtrar</p>
                <button aria-label="Fechar filtros" onClick={() => setPanel(false)} className="-mr-2 p-2"><X className="h-5 w-5" strokeWidth={1.5} /></button>
              </div>
              <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
                {!category && (
                  <Group title="Categoria">
                    {CATEGORIES.map((c) => <Check key={c.id} on={draft.cats.includes(c.id)} onClick={() => setDraft((d) => ({ ...d, cats: toggle(d.cats, c.id) }))}>{c.plural}</Check>)}
                  </Group>
                )}
                <Group title="Tamanho" grid>
                  {allSizes.map((s) => (
                    <button key={s} onClick={() => setDraft((d) => ({ ...d, sizes: toggle(d.sizes, s) }))} className={cn("h-10 border text-[12px] transition-colors", draft.sizes.includes(s) ? "border-ink bg-ink text-bone" : "border-line hover:border-ink")}>{s}</button>
                  ))}
                </Group>
                <Group title="Cor">
                  {allColors.map(([name, hex]) => (
                    <Check key={name} on={draft.colors.includes(name)} onClick={() => setDraft((d) => ({ ...d, colors: toggle(d.colors, name) }))}>
                      <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-ink/15" style={{ background: hex }} />{name}</span>
                    </Check>
                  ))}
                </Group>
                <Group title="Preço">
                  {PRICES.map((p) => <Check key={p.id} on={draft.price === p.id} onClick={() => setDraft((d) => ({ ...d, price: d.price === p.id ? null : p.id }))}>{p.label}</Check>)}
                  <Check on={draft.sale} onClick={() => setDraft((d) => ({ ...d, sale: !d.sale }))}>Só promoções</Check>
                </Group>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-line p-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}>
                <Button variant="outline" onClick={() => setDraft(EMPTY)}>Limpar</Button>
                <Button onClick={() => { setFilters(draft); setPanel(false); }}>Ver {base.filter((p) => matches(p, draft)).length}</Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Group({ title, children, grid }: { title: string; children: React.ReactNode; grid?: boolean }) {
  return (
    <div>
      <p className="label mb-3 text-graphite">{title}</p>
      <div className={grid ? "grid grid-cols-4 gap-1.5" : "space-y-1"}>{children}</div>
    </div>
  );
}

function Check({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 py-1.5 text-left text-[14px]">
      <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center border transition-colors", on ? "border-ink bg-ink" : "border-ink/30")}>
        {on && <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden><path d="M2 6.5 5 9l5-6" fill="none" stroke="#fff" strokeWidth="1.6" /></svg>}
      </span>
      {children}
    </button>
  );
}
