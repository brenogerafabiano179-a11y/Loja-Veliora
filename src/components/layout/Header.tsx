import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { CATEGORIES, FREE_SHIPPING, byCategory, img } from "@/data/catalog";
import { Photo } from "@/components/product/ProductMedia";
import { brl, cn } from "@/lib/format";
import { Logo } from "./Logo";

const MESSAGES = [
  `Frete grátis acima de ${brl(FREE_SHIPPING).replace(",00", "")}`,
  "Personalize qualquer peça com seu nome",
  "10% na primeira compra com VELIORA10",
];

function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-ink text-bone">
      <div className="container-x flex h-8 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="label text-[10px] tracking-[0.18em]">
            {MESSAGES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-x-0 top-full border-y border-line bg-bone"
      onMouseLeave={onClose}
    >
      <div className="container-x grid grid-cols-[1fr_1fr_2fr] gap-12 py-10">
        <div>
          <p className="label mb-5 text-graphite">Roupas</p>
          <ul className="space-y-3 text-[15px]">
            <li><Link onClick={onClose} to="/loja?ordem=novos" className="hover:text-graphite">Novidades</Link></li>
            {CATEGORIES.filter((c) => ["camisas", "bermudas", "bones"].includes(c.id)).map((c) => (
              <li key={c.id}><Link onClick={onClose} to={`/loja/${c.id}`} className="hover:text-graphite">{c.plural} <span className="text-graphite">({byCategory(c.id).length})</span></Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label mb-5 text-graphite">Calçados</p>
          <ul className="space-y-3 text-[15px]">
            {CATEGORIES.filter((c) => ["tenis", "sapatenis", "chinelos"].includes(c.id)).map((c) => (
              <li key={c.id}><Link onClick={onClose} to={`/loja/${c.id}`} className="hover:text-graphite">{c.plural} <span className="text-graphite">({byCategory(c.id).length})</span></Link></li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { to: "/loja/camisas?linha=Feminino", src: img("flor-2"), label: "Feminino" },
            { to: "/loja/camisas?linha=Masculino", src: img("sol-areia-1"), label: "Masculino" },
          ].map((t) => (
            <Link key={t.label} onClick={onClose} to={t.to} className="group block">
              <div className="aspect-[4/3] overflow-hidden bg-paper"><Photo src={t.src} alt={t.label} className="transition-transform duration-700 group-hover:scale-[1.03]" /></div>
              <p className="mt-2 text-[13px]">{t.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Header() {
  const { count, wishlist, setCartOpen, setSearchOpen } = useStore();
  const { pathname } = useLocation();
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isCheckout = pathname.startsWith("/checkout");
  const transparent = pathname === "/" && !scrolled && !mega;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setMega(false);
    setMobile(false);
  }, [pathname]);

  const link = "text-[12px] font-medium uppercase tracking-[0.14em] transition-opacity hover:opacity-60";

  return (
    <>
      {!isCheckout && <AnnouncementBar />}
      <header
        className={cn("sticky z-40 transition-colors duration-500", transparent ? "bg-transparent text-white" : "border-b border-line bg-bone/95 text-ink backdrop-blur-md")}
        style={{ top: "env(safe-area-inset-top, 0px)", marginBottom: pathname === "/" ? "-64px" : undefined }}
      >
        <div className="container-x relative grid h-16 grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-8">
            {!isCheckout && (
              <button aria-label="Abrir menu" onClick={() => setMobile(true)} className="-ml-2 p-2 lg:hidden">
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
            )}
            {!isCheckout && (
              <nav className="hidden items-center gap-8 lg:flex">
                <button onMouseEnter={() => setMega(true)} onClick={() => setMega((v) => !v)} aria-expanded={mega} className={link}>Loja</button>
                <Link to="/loja?linha=Feminino" className={link}>Feminino</Link>
                <Link to="/loja?linha=Masculino" className={link}>Masculino</Link>
                <Link to="/#atelie" className={link}>Ateliê</Link>
              </nav>
            )}
          </div>

          <Link to="/" aria-label="Veliora, página inicial">
            <Logo light={transparent} />
          </Link>

          <div className="flex items-center justify-end gap-1 sm:gap-5">
            {!isCheckout && (
              <>
                <button aria-label="Buscar" onClick={() => setSearchOpen(true)} className="p-2 transition-opacity hover:opacity-60 sm:p-0">
                  <Search className="h-[18px] w-[18px] sm:hidden" strokeWidth={1.5} />
                  <span className={cn(link, "hidden sm:inline")}>Buscar</span>
                </button>
                <Link to="/favoritos" className={cn(link, "hidden sm:inline")}>Favoritos{wishlist.length ? ` (${wishlist.length})` : ""}</Link>
              </>
            )}
            <button aria-label={`Abrir sacola com ${count} itens`} onClick={() => setCartOpen(true)} className={cn(link, "-mr-1 flex items-center gap-1 whitespace-nowrap p-1")}>
              <ShoppingBag className="h-[18px] w-[18px] sm:hidden" strokeWidth={1.5} />
              <span className="sm:hidden">{count}</span>
              <span className="hidden sm:inline">Sacola ({count})</span>
            </button>
          </div>
        </div>
        <AnimatePresence>{mega && <div className="text-ink"><MegaMenu onClose={() => setMega(false)} /></div>}</AnimatePresence>
      </header>

      <AnimatePresence>
        {mobile && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-bone"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)", paddingLeft: "env(safe-area-inset-left, 0px)" }}
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Logo />
                <button aria-label="Fechar menu" onClick={() => setMobile(false)} className="-mr-2 p-2"><X className="h-5 w-5" strokeWidth={1.5} /></button>
              </div>
              <nav className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
                <div className="mb-6 grid grid-cols-2 gap-3">
                  {[
                    { to: "/loja?linha=Feminino", src: img("flor-1"), label: "Feminino" },
                    { to: "/loja?linha=Masculino", src: img("ess-off-1"), label: "Masculino" },
                  ].map((t) => (
                    <Link key={t.label} to={t.to}>
                      <div className="aspect-[3/4] overflow-hidden bg-paper"><Photo src={t.src} alt={t.label} /></div>
                      <p className="mt-2 text-[13px]">{t.label}</p>
                    </Link>
                  ))}
                </div>
                <ul className="divide-y divide-line border-y border-line">
                  <li><Link to="/loja?ordem=novos" className="flex justify-between py-3.5 text-[15px]">Novidades</Link></li>
                  {CATEGORIES.map((c) => (
                    <li key={c.id}>
                      <Link to={`/loja/${c.id}`} className="flex justify-between py-3.5 text-[15px]">
                        {c.plural}<span className="text-graphite">{byCategory(c.id).length}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-3 text-[14px] text-graphite">
                  <Link to="/#atelie" className="block">Ateliê de personalização</Link>
                  <Link to="/favoritos" className="block">Favoritos ({wishlist.length})</Link>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
