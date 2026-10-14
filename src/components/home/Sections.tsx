import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import type { Custom } from "@/art/ProductArt";
import { ProductArt } from "@/art/ProductArt";
import { useStore } from "@/context/StoreContext";
import { CATEGORIES, LOOKS, LOOK_OFF, PERSONALIZATION_PRICE, PRINTED, byCategory, byId, img } from "@/data/catalog";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Personalizer } from "@/components/product/Personalizer";
import { BackPreview, Photo, ProductMedia } from "@/components/product/ProductMedia";
import { brl, cn } from "@/lib/format";

const reveal = { initial: { y: 24 }, whileInView: { y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } };

/* ---------------- manifesto ---------------- */
export function Statement() {
  return (
    <section className="container-x pt-20 sm:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="label text-graphite">Veliora</p>
        <p className="font-display mt-6 text-[24px] font-normal leading-[1.25] sm:text-[34px]">
          Roupa de praia feita no Brasil, com estampas desenhadas no litoral e <span className="font-editorial">o seu nome</span> em qualquer peça.
        </p>
      </div>
    </section>
  );
}

/* ---------------- categorias ---------------- */
export function Categories() {
  const photo = CATEGORIES.filter((c) => c.cover);
  const flat = CATEGORIES.filter((c) => c.flat);
  return (
    <section className="container-x pt-20 sm:pt-28">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-display text-[28px] sm:text-[36px]">Compre por categoria</h2>
        <Link to="/loja" className="group hidden items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] sm:flex">Ver tudo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} /></Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-5">
        {photo.map((c, i) => (
          <motion.div key={c.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
            <Link to={`/loja/${c.id}`} className="group block">
              <div className="aspect-[4/5] overflow-hidden bg-paper">
                <Photo src={c.cover!} alt={c.plural} className="transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-[15px]">{c.plural}</p>
                <p className="text-[12px] text-graphite">{c.blurb}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-5">
        {flat.map((c) => (
          <Link key={c.id} to={`/loja/${c.id}`} className="group flex items-center gap-4 border border-line bg-white p-3 transition-colors hover:border-ink">
            <div className="w-16 shrink-0 overflow-hidden bg-paper"><ProductArt kind={c.flat!.kind} color={c.flat!.color} className="aspect-square w-full" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px]">{c.plural}</p>
              <p className="text-[12px] text-graphite">{c.blurb} · {byCategory(c.id).length} modelos</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-graphite transition-colors group-hover:text-ink" strokeWidth={1.5} />
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------------- campanha ---------------- */
export function Campaign() {
  const p = byId("v03")!;
  return (
    <section className="pt-20 sm:pt-28">
      <div className="grid lg:grid-cols-2">
        <motion.div {...reveal} className="aspect-[4/5] overflow-hidden bg-paper lg:aspect-auto lg:min-h-[760px]">
          <Photo src={img("sol-areia-1")} alt="Camiseta Sol de Costa na praia" />
        </motion.div>
        <div className="container-x flex flex-col justify-center py-14 lg:px-20">
          <p className="label text-graphite">Estampa · Edição limitada de 300 peças</p>
          <h2 className="font-display mt-5 text-[44px] font-normal leading-none sm:text-[64px]">Sol de <span className="font-editorial">Costa</span></h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-graphite">{p.printStory!.story} Cada camiseta sai com um degradê único, do creme ao laranja, e nenhuma é igual à outra.</p>
          <div className="mt-8 flex items-center gap-6">
            <Link to={`/produto/${p.slug}`}><Button rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.5} />}>Ver a camiseta</Button></Link>
            <span className="text-[14px] tabular-nums">{brl(p.price)}</span>
          </div>
          <div className="mt-14 hidden w-48 lg:block">
            <div className="aspect-[3/4] overflow-hidden bg-paper"><Photo src={img("sol-noite-1")} alt="Versão Noite da camiseta Sol de Costa" /></div>
            <p className="mt-2 text-[12px] text-graphite">Também na cor Noite</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- ateliê ---------------- */
export function Atelier() {
  const navigate = useNavigate();
  const product = byId("v01")!;
  const [colorName, setColorName] = useState<"Preto" | "Off-white">("Preto");
  const [custom, setCustom] = useState<Custom>({ zone: "costas", text: "Breno", number: "10", font: "bloco", color: "#F4F2EC" });
  const shot = product.back![colorName];
  const pickColor = (c: "Preto" | "Off-white") => {
    setColorName(c);
    setCustom((v) => ({ ...v, color: c === "Preto" ? "#F4F2EC" : "#1F3A5C" }));
  };
  const effective: Custom = { ...custom, zone: "costas" };

  return (
    <section id="atelie" className="mt-20 scroll-mt-16 bg-ink text-bone sm:mt-28">
      <div className="container-x grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_440px] lg:gap-20">
        <motion.div {...reveal} className="min-w-0">
          <BackPreview shot={shot} custom={effective} alt={`Prévia da Camiseta Essencial ${colorName} com nome e número nas costas`} className="w-full" />
        </motion.div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="label text-bone/60">Ateliê Veliora</p>
          <h2 className="font-display mt-5 text-[40px] font-normal leading-none sm:text-[56px]">Seu nome, <span className="font-editorial">na peça.</span></h2>
          <p className="mt-5 text-[15px] leading-relaxed text-bone/70">Escreva o nome e o número e veja como fica nas costas. Também bordamos boné, gravamos tênis e marcamos chinelo. + {brl(PERSONALIZATION_PRICE)} por peça, produção em 2 dias úteis.</p>

          <div className="mt-8 flex gap-2">
            {(["Preto", "Off-white"] as const).map((c) => (
              <button key={c} onClick={() => pickColor(c)} className={cn("flex items-center gap-2 border px-3 py-2 text-[13px] transition-colors", colorName === c ? "border-bone" : "border-bone/25 hover:border-bone/60")}>
                <span className="h-3 w-3 rounded-full border border-bone/40" style={{ background: product.colors.find((x) => x.name === c)!.hex }} /> {c}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Personalizer kind="tee" value={effective} onChange={(c) => setCustom({ ...c, zone: "costas" })} dark />
          </div>
          <button
            onClick={() => navigate(`/produto/${product.slug}`, { state: { custom: effective, colorName } })}
            className="mt-8 inline-flex h-[52px] items-center justify-center gap-3 bg-bone text-[12px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white"
          >
            Escolher tamanho <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- estampas ---------------- */
export function Prints() {
  return (
    <section className="container-x pt-20 sm:pt-28">
      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="label mb-3 text-graphite">Desenhadas pela Veliora</p>
          <h2 className="font-display text-[28px] sm:text-[36px]">As estampas do Drop 01</h2>
        </div>
        <p className="max-w-sm text-[14px] text-graphite">Cada estampa nasce de uma lembrança do litoral e sai em tiragem curta.</p>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-5 sm:px-0">
        {PRINTED.map((p, i) => (
          <motion.div key={p.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="w-[62%] shrink-0 snap-start sm:w-auto">
            <Link to={`/produto/${p.slug}`} className="group block">
              <ProductMedia product={p} color={p.colors[0]} className="aspect-[3/4]" />
              <p className="label mt-4 text-graphite">0{i + 1}</p>
              <p className="mt-1 text-[15px]">{p.printStory!.name}</p>
              <p className="mt-1 text-[13px] leading-snug text-graphite">{p.printStory!.story}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- looks ---------------- */
export function Looks() {
  const { addItem, setCartOpen } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const look = LOOKS.find((l) => l.id === open);

  const confirm = () => {
    if (!look) return;
    const items = look.items.map((id) => byId(id)!);
    const missing = items.find((p) => p.sizes.length > 1 && !sizes[p.id]);
    if (missing) {
      toast.error(`Escolha o tamanho de: ${missing.name}`);
      return;
    }
    items.forEach((p) => addItem(p, { color: p.colors[0], size: sizes[p.id] ?? p.sizes[0], priceOverride: +(p.price * (1 - LOOK_OFF)).toFixed(2), note: `${look.name} · 10% off`, silent: true }));
    toast.success(`${look.name} na sacola`, { description: `${items.length} peças com 10% de desconto` });
    setOpen(null);
    setSizes({});
    setCartOpen(true);
  };

  return (
    <section id="looks" className="container-x scroll-mt-16 pt-20 sm:pt-28">
      <div className="mb-8">
        <p className="label mb-3 text-graphite">Leve junto e pague menos</p>
        <h2 className="font-display text-[28px] sm:text-[36px]">Looks completos</h2>
      </div>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-5">
        {LOOKS.map((l) => {
          const items = l.items.map((id) => byId(id)!);
          const full = items.reduce((s, p) => s + p.price, 0);
          return (
            <motion.div key={l.id} {...reveal}>
              <div className="relative aspect-[4/5] overflow-hidden bg-paper sm:aspect-[5/4]">
                <Photo src={l.cover} alt={l.name} />
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  {items.map((p) => (
                    <Link key={p.id} to={`/produto/${p.slug}`} className="w-[22%] max-w-[92px] border border-white/60 bg-paper shadow-card transition-transform hover:-translate-y-1">
                      <ProductMedia product={p} color={p.colors[0]} className="aspect-[3/4]" />
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[15px]">{l.name}</p>
                  <p className="text-[13px] text-graphite">{l.note} · {items.length} peças</p>
                </div>
                <div className="flex items-center gap-5">
                  <p className="text-[14px] tabular-nums"><span className="mr-2 text-graphite line-through">{brl(full)}</span>{brl(full * (1 - LOOK_OFF))}</p>
                  <Button variant="outline" size="sm" onClick={() => setOpen(l.id)}>Levar o look</Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Modal open={!!look} onClose={() => setOpen(null)} title={look?.name ?? ""}>
        {look && (
          <div className="space-y-6">
            {look.items.map((id) => {
              const p = byId(id)!;
              return (
                <div key={id} className="flex gap-4">
                  <div className="w-16 shrink-0"><ProductMedia product={p} color={p.colors[0]} className="aspect-[3/4]" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px]">{p.name} <span className="text-graphite">· {p.colors[0].name}</span></p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.sizes.map((s) => {
                        const out = p.soldOut?.includes(s);
                        const on = (sizes[p.id] ?? (p.sizes.length === 1 ? p.sizes[0] : "")) === s;
                        return (
                          <button key={s} disabled={out} onClick={() => setSizes((v) => ({ ...v, [p.id]: s }))} className={cn("h-9 min-w-[2.6rem] border px-2 text-[12px] transition-colors", on ? "border-ink bg-ink text-bone" : "border-line hover:border-ink", out && "text-graphite/40 line-through")}>
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <Button size="lg" fullWidth onClick={confirm}>Adicionar {look.items.length} peças</Button>
          </div>
        )}
      </Modal>
    </section>
  );
}

/* ---------------- compromissos ---------------- */
export function Promises() {
  const items = [
    { t: "Feito no Brasil", d: "Confecção em Fortaleza e calçados em Franca, com algodão nacional." },
    { t: "Personalização em 2 dias", d: "Bordado, silk ou gravação feitos sob encomenda e conferidos à mão." },
    { t: "Troca grátis em 30 dias", d: "Para peças sem personalização. A coleta é por nossa conta." },
  ];
  return (
    <section className="container-x pt-20 sm:pt-28">
      <div className="grid gap-10 border-t border-line pt-12 sm:grid-cols-3">
        {items.map((i) => (
          <div key={i.t}>
            <p className="text-[15px]">{i.t}</p>
            <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-graphite">{i.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
