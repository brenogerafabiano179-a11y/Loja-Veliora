import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { ProductArt, type Custom } from "@/art/ProductArt";
import { useStore } from "@/context/StoreContext";
import { FREE_SHIPPING, INK_COLORS, PERSONALIZATION_PRICE, PIX_OFF, PRODUCTS, ZONES_BY_KIND, byId, bySlug, categoryOf, sizeGuideFor } from "@/data/catalog";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Accordion, Modal } from "@/components/ui/Modal";
import { Price } from "@/components/product/ProductCard";
import { Personalizer } from "@/components/product/Personalizer";
import { BackPreview, Photo } from "@/components/product/ProductMedia";
import { ProductRail } from "@/components/product/ProductRail";
import { brl, cn, installments, maskCep, simulateShipping, type ShippingOption } from "@/lib/format";
import NotFound from "./NotFound";

function eta(days: number) {
  const d = new Date();
  let n = 0;
  while (n < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() % 6 !== 0) n++;
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}

const SAMPLE_REVIEWS = [
  { name: "Rafael M.", city: "Vitória/ES", stars: 5, size: "M", text: "A malha é pesada de verdade e o caimento ficou perfeito. O nome nas costas veio exatamente como na prévia." },
  { name: "Juliana P.", city: "Recife/PE", stars: 5, size: "P", text: "Comprei de presente e chegou em 6 dias, com uma embalagem linda. Já pedi a segunda cor." },
  { name: "Caio T.", city: "Florianópolis/SC", stars: 4, size: "G", text: "Ótima qualidade. Achei um pouco maior que o esperado, pegaria um tamanho abaixo." },
];

type Slide = { key: string; node: JSX.Element };

export default function ProductPage() {
  const { slug = "" } = useParams();
  const product = bySlug(slug);
  const location = useLocation();
  const incoming = location.state as { custom?: Custom; colorName?: string } | null;
  const { addItem, wishlist, toggleWish, pushRecent, recent } = useStore();

  const [color, setColor] = useState(product?.colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [personalize, setPersonalize] = useState(false);
  const [custom, setCustom] = useState<Custom>({ zone: "costas", text: "", font: "bloco", color: "#161616" });
  const [slide, setSlide] = useState(0);
  const [guide, setGuide] = useState(false);
  const [cep, setCep] = useState("");
  const [ship, setShip] = useState<ShippingOption[] | null>(null);
  const [shipLoading, setShipLoading] = useState(false);
  const [sticky, setSticky] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product) return;
    const z = ZONES_BY_KIND[product.kind][0];
    setColor(product.colors[0]);
    setSize(product.sizes.length === 1 ? product.sizes[0] : null);
    setQty(1);
    setPersonalize(false);
    setCustom({ zone: z.id, text: "", number: z.withNumber ? "" : undefined, font: "bloco", color: "#161616" });
    if (incoming?.custom) {
      setPersonalize(true);
      setCustom(incoming.custom);
      const c = product.colors.find((x) => x.name === incoming.colorName);
      if (c) setColor(c);
    }
    setShip(null);
    setSlide(0);
    railRef.current?.scrollTo({ left: 0 });
    pushRecent(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, pushRecent]);

  // cor de tinta que contrasta com o tecido escolhido
  useEffect(() => {
    if (!color || incoming?.custom) return;
    const dark = parseInt(color.hex.slice(1, 3), 16) < 120;
    setCustom((c) => (c.text || c.number ? c : { ...c, color: dark ? "#F4F2EC" : "#161616" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    obs.observe(el);
    return () => obs.disconnect();
  }, [product]);

  const activeCustom = personalize && (custom.text || custom.number) ? custom : null;
  const backShot = product && color && custom.zone === "costas" ? product.back?.[color.name] : undefined;

  const slides: Slide[] = useMemo(() => {
    if (!product || !color) return [];
    const list: Slide[] = [];
    if (personalize) {
      const preview = { ...custom, text: custom.text || "Seu nome", number: custom.zone === "costas" ? custom.number || "10" : custom.number };
      list.push({
        key: "preview",
        node: backShot ? (
          <BackPreview shot={backShot} custom={preview} alt="Prévia da personalização nas costas" className="h-full w-full" />
        ) : (
          <ProductArt kind={product.kind} color={color.hex} print={product.print} view={custom.zone === "costas" ? 1 : 2} custom={preview} className="h-full w-full" title="Prévia da personalização" />
        ),
      });
    }
    if (color.images?.length) color.images.forEach((src, i) => list.push({ key: src, node: <Photo src={src} alt={`${product.name} ${color.name}, foto ${i + 1}`} eager={i < 2} /> }));
    else [0, 1, 2].forEach((v) => list.push({ key: `art${v}`, node: <ProductArt kind={product.kind} color={color.hex} print={product.print} view={v as 0 | 1 | 2} className="h-full w-full" title={`${product.name} ${color.name}`} /> }));
    return list;
  }, [product, color, personalize, custom, backShot]);

  useEffect(() => {
    if (personalize) {
      railRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      setSlide(0);
    }
  }, [personalize]);

  if (!product || !color) return <NotFound />;

  const cat = categoryOf(product.category);
  const unit = product.price + (activeCustom ? PERSONALIZATION_PRICE : 0);
  const guideData = sizeGuideFor(product.category);
  const liked = wishlist.includes(product.id);
  const extraDays = activeCustom ? 2 : 0;

  const add = () => {
    if (!size) {
      setSizeError(true);
      toast.error("Escolha um tamanho");
      setTimeout(() => setSizeError(false), 700);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (personalize && !activeCustom) {
      toast.error("Escreva o texto da personalização", { description: "Ou desmarque a opção Personalizar." });
      return;
    }
    addItem(product, { color, size, qty, custom: activeCustom });
  };

  const calc = (e: FormEvent) => {
    e.preventDefault();
    if (cep.replace(/\D/g, "").length !== 8) {
      toast.error("O CEP precisa ter 8 números");
      return;
    }
    setShipLoading(true);
    setTimeout(() => {
      setShip(simulateShipping(cep, unit * qty, FREE_SHIPPING));
      setShipLoading(false);
    }, 600);
  };

  const recents = recent.filter((id) => id !== product.id).map((id) => byId(id)).filter((p): p is NonNullable<typeof p> => !!p).slice(0, 8);
  const complete = PRODUCTS.filter((p) => p.category !== product.category && p.colors[0].images?.length).sort((a, b) => b.popularity - a.popularity).slice(0, 8);

  return (
    <>
      <div className="lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(380px,1fr)]">
        {/* ===== galeria ===== */}
        <div className="min-w-0">
          {/* celular */}
          <div className="relative lg:hidden">
            <div ref={railRef} onScroll={() => { const el = railRef.current; if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth)); }} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
              {slides.map((s) => <div key={s.key} className="aspect-[3/4] w-full shrink-0 snap-center overflow-hidden bg-paper">{s.node}</div>)}
            </div>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {slides.map((s, i) => <span key={s.key} className={cn("h-[3px] transition-all", slide === i ? "w-6 bg-ink" : "w-3 bg-ink/25")} />)}
            </div>
            {personalize && <span className="label absolute left-3 top-3 bg-bone/95 px-2 py-1 text-[10px]">Prévia</span>}
          </div>
          {/* desktop */}
          <div className="hidden grid-cols-2 gap-[2px] lg:grid">
            <AnimatePresence initial={false}>
              {slides.map((s, i) => (
                <motion.div
                  key={s.key}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn("relative aspect-[3/4] overflow-hidden bg-paper", slides.length % 2 === 1 && i === 0 && "col-span-2 aspect-[3/2]")}
                >
                  {s.node}
                  {s.key === "preview" && <span className="label absolute left-4 top-4 bg-bone/95 px-2 py-1 text-[10px]">Prévia da personalização</span>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ===== informações ===== */}
        <div className="min-w-0">
          <div className="container-x pt-6 lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:px-12 lg:pb-12 lg:pt-10 xl:px-16 no-scrollbar">
            <nav className="text-[12px] text-graphite">
              <Link to="/" className="hover:text-ink">Início</Link> / <Link to={`/loja/${cat.id}`} className="hover:text-ink">{cat.plural}</Link> / <span>{product.line}</span>
            </nav>

            <div className="mt-4 flex items-start justify-between gap-4">
              <h1 className="font-display text-[28px] font-normal sm:text-[32px]">{product.name}</h1>
              <button aria-label={liked ? "Remover dos favoritos" : "Salvar nos favoritos"} onClick={() => toggleWish(product.id)} className="-mr-2 p-2">
                <Heart className={cn("h-5 w-5", liked && "fill-ink")} strokeWidth={1.4} />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <Price price={unit} compareAt={product.compareAt && !activeCustom ? product.compareAt : undefined} className="text-[17px]" />
              <a href="#avaliacoes" className="flex items-center gap-1 text-[12px] text-graphite hover:text-ink">
                <Star className="h-3 w-3 fill-ink text-ink" /> {product.rating.toFixed(1)} ({product.reviews})
              </a>
            </div>
            <p className="mt-1 text-[12px] text-graphite">{installments(unit)} ou {brl(unit * (1 - PIX_OFF))} no Pix</p>

            {product.badge && <p className="label mt-5 inline-block border border-line px-2 py-1 text-[10px] text-graphite">{product.badge}</p>}

            {/* cor */}
            <div className="mt-8">
              <p className="text-[13px]">Cor <span className="text-graphite">· {color.name}</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) =>
                  c.images?.length ? (
                    <button key={c.name} aria-label={c.name} onClick={() => setColor(c)} className={cn("w-14 overflow-hidden border transition-colors", color.name === c.name ? "border-ink" : "border-transparent hover:border-line")}>
                      <div className="aspect-[3/4] bg-paper"><Photo src={c.images[0]} alt={c.name} /></div>
                    </button>
                  ) : (
                    <button key={c.name} aria-label={c.name} onClick={() => setColor(c)} className={cn("h-8 w-8 rounded-full border border-ink/15 transition-shadow", color.name === c.name && "shadow-[0_0_0_2px_rgb(var(--bone)),0_0_0_3px_rgb(var(--ink))]")} style={{ background: c.hex }} />
                  ),
                )}
              </div>
            </div>

            {/* tamanho */}
            <div className="mt-7" id="size-picker">
              <div className="flex items-center justify-between">
                <p className="text-[13px]">Tamanho {size && <span className="text-graphite">· {size}</span>}</p>
                {guideData && <button onClick={() => setGuide(true)} className="text-[12px] text-graphite underline underline-offset-4 hover:text-ink">Guia de medidas</button>}
              </div>
              <div className={cn("mt-3 grid grid-cols-5 gap-1.5", product.sizes.length > 6 && "grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 xl:grid-cols-8", product.sizes.length === 1 && "grid-cols-3", sizeError && "animate-shake")}>
                {product.sizes.map((s) => {
                  const out = product.soldOut?.includes(s);
                  return (
                    <button
                      key={s}
                      disabled={out}
                      onClick={() => { setSize(s); setSizeError(false); }}
                      className={cn(
                        "h-11 border text-[13px] transition-colors",
                        size === s ? "border-ink bg-ink text-bone" : "border-line bg-white hover:border-ink",
                        out && "cursor-not-allowed bg-transparent text-graphite/40 line-through",
                        sizeError && !out && size !== s && "border-coral",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[12px] text-graphite">
                {size && product.lowStock?.includes(size) ? <span className="text-coral">Últimas unidades neste tamanho. </span> : null}
                {product.fit}
              </p>
            </div>

            {/* personalização */}
            <div className="mt-7 border-y border-line">
              <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
                <span>
                  <span className="block text-[13px]">Personalizar</span>
                  <span className="block text-[12px] text-graphite">{ZONES_BY_KIND[product.kind].map((z) => z.label.toLowerCase()).join(" ou ")} · + {brl(PERSONALIZATION_PRICE)} · 2 dias úteis</span>
                </span>
                <input id="personalizar" type="checkbox" checked={personalize} onChange={(e) => setPersonalize(e.target.checked)} className="peer sr-only" />
                <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", personalize ? "bg-ink" : "bg-line")}>
                  <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", personalize ? "left-[18px]" : "left-0.5")} />
                </span>
              </label>
              <AnimatePresence initial={false}>
                {personalize && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                    <div className="pb-6">
                      <Personalizer kind={product.kind} value={custom} onChange={setCustom} />
                      <p className="mt-4 text-[12px] text-graphite">A prévia aparece na primeira imagem. Peças personalizadas só são trocadas em caso de defeito.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* compra */}
            <div ref={ctaRef} className="mt-6 flex gap-2">
              <QuantityStepper value={qty} onChange={setQty} />
              <Button size="lg" fullWidth onClick={add}>Adicionar à sacola · {brl(unit * qty)}</Button>
            </div>
            <p className="mt-4 text-[12px] text-graphite">Receba entre <span className="text-ink">{eta(4 + extraDays)}</span> e <span className="text-ink">{eta(8 + extraDays)}</span>. Frete grátis acima de {brl(FREE_SHIPPING)}.</p>

            <form onSubmit={calc} className="mt-4 flex border-b border-line">
              <input id="cep-produto" inputMode="numeric" value={cep} onChange={(e) => setCep(maskCep(e.target.value))} placeholder="Calcular frete: digite o CEP" aria-label="CEP" className="h-11 min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-graphite" />
              <button type="submit" className="px-1 text-[12px] font-medium uppercase tracking-[0.14em] disabled:opacity-40" disabled={shipLoading}>{shipLoading ? "…" : "Calcular"}</button>
            </form>
            <AnimatePresence>
              {ship && (
                <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-[13px]">
                  {ship.map((s) => (
                    <li key={s.id} className="flex justify-between border-b border-line py-2.5">
                      <span>{s.name} <span className="text-graphite">· {s.days}</span></span>
                      <span className={s.price === 0 ? "text-success" : undefined}>{s.price === 0 ? "Grátis" : brl(s.price)}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <div className="mt-6 border-t border-line">
              <Accordion title="Descrição" defaultOpen>{product.description}</Accordion>
              {product.printStory && <Accordion title={`Estampa ${product.printStory.name}`}>{product.printStory.story}</Accordion>}
              <Accordion title="Composição e caimento">
                <ul className="space-y-1">{product.details.map((d) => <li key={d}>{d}</li>)}</ul>
                <p className="mt-2">{product.fit}</p>
              </Accordion>
              <Accordion title="Personalização">Escolha o local, escreva o texto e defina a letra e a cor. Fazemos à mão em até 2 dias úteis. Cores disponíveis: {INK_COLORS.map((c) => c.name).join(", ")}.</Accordion>
              <Accordion title="Entrega e trocas">Enviamos para todo o Brasil. Troca grátis em 30 dias para peças sem personalização.</Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* avaliações */}
      <section id="avaliacoes" className="container-x scroll-mt-20 pt-20 sm:pt-28">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <div>
            <h2 className="font-display text-[28px]">Avaliações</h2>
            <p className="mt-4 flex items-baseline gap-2"><span className="font-display text-[48px] font-normal">{product.rating.toFixed(1)}</span><span className="text-[13px] text-graphite">de 5 · {product.reviews} avaliações</span></p>
            <p className="mt-3 text-[12px] text-graphite">Avaliações ilustrativas: esta é uma loja demonstrativa.</p>
          </div>
          <ul className="grid gap-8 md:grid-cols-3">
            {SAMPLE_REVIEWS.map((r) => (
              <li key={r.name} className="border-t border-line pt-5">
                <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={cn("h-3 w-3", i < r.stars ? "fill-ink text-ink" : "text-line")} />)}</div>
                <p className="mt-3 text-[14px] leading-relaxed">{r.text}</p>
                <p className="mt-4 text-[12px] text-graphite">{r.name} · {r.city} · Tamanho {r.size}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProductRail eyebrow="Combina com" title="Complete o look" products={complete} />
      {recents.length > 0 && <ProductRail eyebrow="Seu histórico" title="Vistos recentemente" products={recents} />}

      {guideData && (
        <Modal open={guide} onClose={() => setGuide(false)} title="Guia de medidas">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-[13px]">
              <thead><tr className="border-b border-ink">{guideData.cols.map((c) => <th key={c} className="py-2 pr-3 font-medium">{c}</th>)}</tr></thead>
              <tbody>
                {guideData.rows.map((r) => (
                  <tr key={String(r[0])} className={cn("border-b border-line", String(r[0]) === size && "bg-paper")}>
                    {r.map((v, i) => <td key={i} className={cn("py-2.5 pr-3 tabular-nums", i > 0 && "text-graphite")}>{String(v).replace(".", ",")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] text-graphite">Medidas da peça estendida. Compare com uma peça sua que veste bem.</p>
        </Modal>
      )}

      <AnimatePresence>
        {sticky && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bone/95 pt-3 backdrop-blur-md lg:hidden"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))", paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" }}
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px]">{product.name}</p>
                <p className="text-[12px] text-graphite">{brl(unit)}{size ? ` · ${size}` : ""}</p>
              </div>
              <Button onClick={add}>Adicionar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
