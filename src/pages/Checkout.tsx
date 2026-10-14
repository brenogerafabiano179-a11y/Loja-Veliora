import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, CreditCard, Lock, QrCode, ShoppingBag, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { SailMark } from "@/art/prints";
import { useStore } from "@/context/StoreContext";
import { COUPONS, FREE_SHIPPING, PIX_OFF } from "@/data/catalog";
import { CartLine } from "@/components/cart/CartDrawer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { brl, cn, maskCard, maskCep, maskExpiry, maskPhone, simulateShipping } from "@/lib/format";

type Form = {
  email: string; name: string; phone: string;
  cep: string; street: string; number: string; complement: string; district: string; city: string; state: string;
  cardNumber: string; cardName: string; cardExpiry: string; cardCvv: string; installments: string;
};
const EMPTY: Form = { email: "", name: "", phone: "", cep: "", street: "", number: "", complement: "", district: "", city: "", state: "", cardNumber: "", cardName: "", cardExpiry: "", cardCvv: "", installments: "1" };

function addBusinessDays(days: number) {
  const d = new Date();
  let n = 0;
  while (n < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() % 6 !== 0) n++;
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

export default function Checkout() {
  const { items, subtotal, discount, placeOrder } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [payment, setPayment] = useState<"pix" | "card">("pix");
  const [shipId, setShipId] = useState("pac");
  const [cepLoading, setCepLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (k: keyof Form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const cepDigits = form.cep.replace(/\D/g, "");
  const afterCoupon = subtotal - discount;
  const options = useMemo(() => (cepDigits.length === 8 ? simulateShipping(cepDigits, afterCoupon, FREE_SHIPPING) : null), [cepDigits, afterCoupon]);
  const ship = options?.find((o) => o.id === shipId);
  const shipping = ship?.price ?? 0;
  const pixOff = payment === "pix" ? afterCoupon * PIX_OFF : 0;
  const total = afterCoupon - pixOff + shipping;
  const hasCustom = items.some((i) => i.custom);
  const shipDays = ship ? Number(ship.days.match(/a (\d+)/)?.[1] ?? 8) : 8;
  const etaText = addBusinessDays(shipDays + (hasCustom ? 2 : 0));

  useEffect(() => {
    if (cepDigits.length !== 8) return;
    setCepLoading(true);
    const t = setTimeout(() => {
      setForm((f) => ({ ...f, street: f.street || "Avenida Beira-Mar", district: f.district || "Praia do Canto", city: f.city || "Vitória", state: f.state || "ES" }));
      setCepLoading(false);
    }, 550);
    return () => clearTimeout(t);
  }, [cepDigits]);

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Esse e-mail parece incompleto";
    if (form.name.trim().split(/\s+/).length < 2) e.name = "Escreva nome e sobrenome";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Inclua o DDD";
    if (cepDigits.length !== 8) e.cep = "O CEP tem 8 números";
    if (!form.street) e.street = "Informe a rua";
    if (!form.number) e.number = "Informe o número";
    if (!form.city) e.city = "Informe a cidade";
    if (payment === "card") {
      if (form.cardNumber.replace(/\D/g, "").length !== 16) e.cardNumber = "O cartão tem 16 números";
      if (form.cardName.trim().length < 3) e.cardName = "Como está impresso no cartão";
      if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) e.cardExpiry = "Use MM/AA";
      if (form.cardCvv.length < 3) e.cardCvv = "3 ou 4 números";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Faltam alguns dados", { description: "Os campos com erro estão destacados." });
      document.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSending(true);
    setTimeout(() => {
      placeOrder({
        shipping, pixOff, total, payment, email: form.email, name: form.name, eta: etaText,
        address: `${form.street}, ${form.number}${form.complement ? `, ${form.complement}` : ""} · ${form.district} · ${form.city}/${form.state} · ${form.cep}`,
      });
      navigate("/pedido-confirmado");
    }, 1500);
  };

  if (items.length === 0 && !sending) {
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="h-10 w-10 text-graphite" strokeWidth={1.3} />
        <h1 className="mt-4 font-display text-[28px]">Sua sacola está vazia</h1>
        <p className="mt-2 text-graphite">Adicione peças para finalizar a compra.</p>
        <Button className="mt-6" onClick={() => navigate("/loja")}>Ver a loja</Button>
      </div>
    );
  }

  const summary = <Summary shippingKnown={!!options} shipping={shipping} pixOff={pixOff} total={total} />;

  return (
    <div className="container-x pt-6">
      <div className="mb-6 flex items-end justify-between gap-3">
        <h1 className="font-display text-[34px] font-normal sm:text-[44px]">Finalizar compra</h1>
        <span className="label hidden items-center gap-1.5 text-graphite sm:flex"><Lock className="h-3.5 w-3.5" /> Compra segura</span>
      </div>

      <MobileSummary total={total}>{summary}</MobileSummary>

      <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
        <div className="min-w-0 space-y-4">
          <Step n={1} title="Contato">
            <div className="grid gap-3">
              <Input id="email" label="E-mail" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} hint="A confirmação e o rastreio chegam aqui" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input id="nome" label="Nome completo" autoComplete="name" value={form.name} onChange={(e) => set("name")(e.target.value)} error={errors.name} />
                <Input id="celular" label="Celular" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone")(maskPhone(e.target.value))} error={errors.phone} />
              </div>
            </div>
          </Step>

          <Step n={2} title="Entrega">
            <div className="grid gap-3">
              <div className="relative sm:w-1/2">
                <Input id="cep" label="CEP" inputMode="numeric" autoComplete="postal-code" value={form.cep} onChange={(e) => set("cep")(maskCep(e.target.value))} error={errors.cep} />
                {cepLoading && <span className="absolute right-4 top-[18px] h-5 w-5 animate-spin rounded-full border-2 border-line border-t-ink" />}
              </div>
              <AnimatePresence>
                {cepDigits.length === 8 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid gap-3 overflow-hidden">
                    <Input id="rua" label="Rua" autoComplete="address-line1" value={form.street} onChange={(e) => set("street")(e.target.value)} error={errors.street} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input id="numero" label="Número" inputMode="numeric" value={form.number} onChange={(e) => set("number")(e.target.value)} error={errors.number} />
                      <Input id="complemento" label="Complemento" value={form.complement} onChange={(e) => set("complement")(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-[1fr_1fr_72px] gap-3">
                      <Input id="bairro" label="Bairro" value={form.district} onChange={(e) => set("district")(e.target.value)} />
                      <Input id="cidade" label="Cidade" value={form.city} onChange={(e) => set("city")(e.target.value)} error={errors.city} />
                      <Input id="uf" label="UF" maxLength={2} value={form.state} onChange={(e) => set("state")(e.target.value.toUpperCase())} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {options && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-2">
                  {options.map((o) => (
                    <button
                      type="button"
                      key={o.id}
                      onClick={() => setShipId(o.id)}
                      className={cn("flex w-full items-center gap-3 border p-4 text-left transition-colors", shipId === o.id ? "border-ink bg-paper" : "border-line hover:border-ink/50")}
                    >
                      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", shipId === o.id ? "border-ink" : "border-line")}>
                        {shipId === o.id && <motion.span layoutId="ship-dot" className="h-2.5 w-2.5 rounded-full bg-ink" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">{o.name}</span>
                        <span className="block text-xs text-graphite">{o.days}{hasCustom ? " + 2 dias de produção" : ""}</span>
                      </span>
                      <span className={cn("tabular-nums text-sm", o.price === 0 && "text-success")}>{o.price === 0 ? "Grátis" : brl(o.price)}</span>
                    </button>
                  ))}
                  <p className="pt-1 text-[13px]">Previsão de entrega: <b>até {etaText}</b></p>
                </motion.div>
              )}
            </AnimatePresence>
          </Step>

          <Step n={3} title="Pagamento">
            <div className="grid grid-cols-2 gap-1 bg-line/60 p-1">
              {[
                { id: "pix" as const, label: "Pix", icon: QrCode, tag: "−5%" },
                { id: "card" as const, label: "Cartão", icon: CreditCard, tag: "6x" },
              ].map((m) => (
                <button type="button" key={m.id} onClick={() => setPayment(m.id)} className={cn("relative flex h-12 items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em]", payment === m.id ? "text-bone" : "text-ink")}>
                  {payment === m.id && <motion.span layoutId="pay" className="absolute inset-0 bg-ink" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                  <m.icon className="relative h-4 w-4" />
                  <span className="relative">{m.label}</span>
                  <span className={cn("relative tabular-nums text-[10px]", payment === m.id ? "text-bone/70" : "text-graphite")}>{m.tag}</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {payment === "pix" ? (
                <motion.div key="pix" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-4 flex gap-3 bg-success/10 p-4 text-sm">
                  <QrCode className="h-6 w-6 shrink-0 text-success" />
                  <p><b>Você economiza {brl(pixOff)}.</b> O QR Code aparece depois de confirmar e o pagamento é aprovado na hora.</p>
                </motion.div>
              ) : (
                <motion.div key="card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-4 space-y-3">
                  <CardPreview number={form.cardNumber} name={form.cardName} expiry={form.cardExpiry} />
                  <Input id="cartao" label="Número do cartão" inputMode="numeric" autoComplete="cc-number" value={form.cardNumber} onChange={(e) => set("cardNumber")(maskCard(e.target.value))} error={errors.cardNumber} />
                  <Input id="nome-cartao" label="Nome impresso no cartão" autoComplete="cc-name" value={form.cardName} onChange={(e) => set("cardName")(e.target.value.toUpperCase())} error={errors.cardName} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input id="validade" label="Validade (MM/AA)" inputMode="numeric" autoComplete="cc-exp" value={form.cardExpiry} onChange={(e) => set("cardExpiry")(maskExpiry(e.target.value))} error={errors.cardExpiry} />
                    <Input id="cvv" label="CVV" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={form.cardCvv} onChange={(e) => set("cardCvv")(e.target.value.replace(/\D/g, ""))} error={errors.cardCvv} />
                  </div>
                  <select id="parcelas" value={form.installments} onChange={(e) => set("installments")(e.target.value)} className="h-14 w-full border border-line bg-paper px-4 text-[15px] outline-none focus:border-ink">
                    {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}x de {brl(total / n)} sem juros</option>)}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </Step>

          <div className="lg:hidden"><PayButton total={total} loading={sending} /></div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            {summary}
            <PayButton total={total} loading={sending} />
          </div>
        </aside>
      </form>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <motion.section initial={{ y: 12 }} animate={{ y: 0 }} transition={{ delay: n * 0.05 }} className="border-t border-line pt-6 pb-4">
      <h2 className="mb-5 flex items-center gap-3">
        <span className="text-[12px] tabular-nums text-graphite">0{n}</span>
        <span className="font-display text-[22px]">{title}</span>
      </h2>
      {children}
    </motion.section>
  );
}

function PayButton({ total, loading }: { total: number; loading: boolean }) {
  return (
    <div>
      <Button type="submit" size="lg" variant="anil" fullWidth loading={loading} leftIcon={<Lock className="h-4 w-4" />}>
        {loading ? "Processando pagamento" : `Pagar ${brl(total)}`}
      </Button>
      <p className="mt-2.5 text-center text-xs text-graphite">Loja demonstrativa: o pagamento é simulado e nada é cobrado.</p>
    </div>
  );
}

function CardPreview({ number, name, expiry }: { number: string; name: string; expiry: string }) {
  const shown = number.replace(/\D/g, "").padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim();
  return (
    <motion.div initial={{ rotateX: -20, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} className="relative mx-auto aspect-[1.6/1] w-full max-w-[320px] overflow-hidden rounded-xl bg-anil p-5 text-bone shadow-lift">
      <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 320 200" preserveAspectRatio="none" aria-hidden>
        {[40, 70, 100, 130, 160].map((y) => <path key={y} d={`M0 ${y} q 40 -18 80 0 t 80 0 t 80 0 t 80 0`} fill="none" stroke="#EFECE6" strokeWidth="2" />)}
      </svg>
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="h-7 w-10 rounded bg-sol" />
          <SailMark color="#EFECE6" size={22} />
        </div>
        <p className="tabular-nums text-lg tracking-widest tabular-nums">{shown}</p>
        <div className="flex justify-between tabular-nums text-[11px] uppercase">
          <span className="max-w-[70%] truncate">{name || "Seu nome"}</span>
          <span>{expiry || "MM/AA"}</span>
        </div>
      </div>
    </motion.div>
  );
}

function Summary({ shippingKnown, shipping, pixOff, total }: { shippingKnown: boolean; shipping: number; pixOff: number; total: number }) {
  const { items, subtotal, discount, coupon, applyCoupon, removeCoupon } = useStore();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const couponId = `cupom${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const apply = () => {
    const r = applyCoupon(code);
    if (r.ok) {
      toast.success(r.message);
      setCode("");
      setErr(null);
    } else setErr(r.message);
  };
  return (
    <div className="bg-paper p-6">
      <p className="text-[12px] font-medium uppercase tracking-[0.14em]">Resumo do pedido</p>
      <ul className="mt-5 max-h-80 space-y-5 overflow-y-auto pr-1">
        {items.map((i) => <li key={i.key}><CartLine item={i} compact /></li>)}
      </ul>

      <div className="mt-5 border-t border-line pt-4">
        {coupon ? (
          <div className="flex items-center justify-between bg-success/10 px-3 py-2.5 text-sm">
            <span className="flex items-center gap-2 font-semibold text-success"><Check className="h-4 w-4" /> {coupon} · {COUPONS[coupon]?.label}</span>
            <button type="button" aria-label="Remover cupom" onClick={removeCoupon} className="p-1"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <div>
            <div className={cn("flex gap-2", err && "animate-shake")}>
              <div className="relative min-w-0 flex-1">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
                <input
                  id={couponId}
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
                  placeholder="Cupom"
                  aria-label="Cupom de desconto"
                  className={cn("h-11 w-full border bg-bone pl-9 pr-3 tabular-nums text-sm uppercase outline-none focus:border-ink", err ? "border-coral" : "border-line")}
                />
              </div>
              <Button type="button" variant="outline" onClick={apply}>Aplicar</Button>
            </div>
            <p className={cn("mt-1.5 text-xs", err ? "text-coral" : "text-graphite")}>{err ?? "Primeira compra? Use VELIORA10"}</p>
          </div>
        )}
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
        <Row k="Subtotal" v={brl(subtotal)} />
        {discount > 0 && <Row k="Cupom" v={`− ${brl(discount)}`} good />}
        {pixOff > 0 && <Row k="Pix (5%)" v={`− ${brl(pixOff)}`} good />}
        <Row k="Frete" v={!shippingKnown ? "Informe o CEP" : shipping === 0 ? "Grátis" : brl(shipping)} good={shippingKnown && shipping === 0} />
      </dl>
      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
        <span className="font-medium uppercase tracking-[0.14em]">Total</span>
        <motion.span key={total.toFixed(2)} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="tabular-nums text-[19px]">{brl(total)}</motion.span>
      </div>
    </div>
  );
}

function Row({ k, v, good }: { k: string; v: string; good?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-graphite">{k}</dt>
      <dd className={cn("tabular-nums", good && "text-success")}>{v}</dd>
    </div>
  );
}

function MobileSummary({ total, children }: { total: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5 lg:hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between border border-ink px-4 py-3.5 text-sm">
        <span className="flex items-center gap-2 font-medium uppercase tracking-[0.14em]"><ShoppingBag className="h-4 w-4" /> {open ? "Ocultar" : "Ver"} resumo <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} /></span>
        <span className="tabular-nums">{brl(total)}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="pt-2">{children}</div></motion.div>}
      </AnimatePresence>
      <p className="mt-2 text-center text-xs"><Link to="/loja" className="text-graphite underline underline-offset-4">Continuar comprando</Link></p>
    </div>
  );
}
