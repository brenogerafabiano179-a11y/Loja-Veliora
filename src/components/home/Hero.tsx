import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { img } from "@/data/catalog";
import { Photo } from "@/components/product/ProductMedia";

/** Hero dividido (feminino / masculino), com a foto ocupando a tela. */
export function Hero() {
  const reduce = useReducedMotion();
  const fade = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: d, ease: [0.22, 1, 0.36, 1] as const } });

  return (
    <section className="relative">
      <div className="grid h-[min(88svh,920px)] min-h-[560px] grid-cols-1 md:grid-cols-2">
        {[
          { src: img("flor-2"), alt: "Modelo com a Camiseta Flor de Restinga na praia", to: "/loja?linha=Feminino", pos: "50% 30%" },
          { src: img("sol-areia-2"), alt: "Modelo com a Camiseta Sol de Costa segurando uma prancha", to: "/loja?linha=Masculino", pos: "50% 25%" },
        ].map((h, i) => (
          <Link key={h.to} to={h.to} className={i === 0 ? "relative block overflow-hidden" : "relative hidden overflow-hidden md:block"} aria-label={h.alt}>
            <motion.div className="h-full w-full" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
              <Photo src={h.src} alt={h.alt} eager className="h-full w-full" />
            </motion.div>
          </Link>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="container-x pb-10 text-white sm:pb-14">
          <motion.p {...fade(0.2)} className="label text-white/85">Drop 01 · Verão 2026</motion.p>
          <motion.h1 {...fade(0.3)} className="font-display mt-4 max-w-3xl text-[44px] font-normal leading-[0.98] sm:text-[76px]">
            Feito pra <span className="font-editorial">maré</span> e pro asfalto.
          </motion.h1>
          <motion.div {...fade(0.45)} className="pointer-events-auto mt-8 flex flex-wrap gap-3">
            <Link to="/loja?linha=Feminino" className="inline-flex h-12 items-center bg-white px-7 text-[12px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white/85">Comprar feminino</Link>
            <Link to="/loja?linha=Masculino" className="inline-flex h-12 items-center border border-white/80 px-7 text-[12px] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-ink">Comprar masculino</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
