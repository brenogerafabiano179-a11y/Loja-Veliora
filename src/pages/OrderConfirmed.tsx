import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { ProductMedia } from "@/components/product/ProductMedia";
import { useStore } from "@/context/StoreContext";
import { byId } from "@/data/catalog";
import { customSummary } from "@/components/cart/CartDrawer";
import { Button } from "@/components/ui/Button";
import { brl, cn } from "@/lib/format";

function Confetti() {
  const reduce = useReducedMotion();
  const bits = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({ i, x: (Math.random() - 0.5) * 760, y: -(160 + Math.random() * 280), r: Math.random() * 600, c: ["#16324F", "#D8CBB0", "#141413", "#AC3E28", "#EDEBE3"][i % 5], d: Math.random() * 0.2 })),
    [],
  );
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-28">
      {bits.map((b) => (
        <motion.span key={b.i} className="absolute h-3 w-1.5" style={{ background: b.c }} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: b.x, y: [0, b.y, b.y + 560], opacity: [1, 1, 0], rotate: b.r }} transition={{ duration: 2.3, delay: b.d, ease: [0.2, 0.7, 0.4, 1] }} />
      ))}
    </div>
  );
}

function FakeQr() {
  const cells = useMemo(() => Array.from({ length: 441 }, () => Math.random() > 0.5), []);
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
  return (
    <svg viewBox="0 0 21 21" className="h-40 w-40" shapeRendering="crispEdges" role="img" aria-label="QR Code Pix de exemplo">
      <rect width="21" height="21" fill="#fff" />
      {cells.map((on, i) => {
        const x = i % 21, y = Math.floor(i / 21);
        return on && !finder(x, y) ? <rect key={i} x={x} y={y} width="1" height="1" fill="#141618" /> : null;
      })}
      {[[0, 0], [14, 0], [0, 14]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <rect x={x} y={y} width="7" height="7" fill="#141618" />
          <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#16324F" />
        </g>
      ))}
    </svg>
  );
}

export default function OrderConfirmed() {
  const { lastOrder: o } = useStore();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  if (!o) return <Navigate to="/" replace />;
  const custom = o.items.some((i) => i.custom);
  const steps = [
    { t: "Pedido recebido", d: "Agora", done: true },
    { t: o.payment === "pix" ? "Pagamento via Pix" : "Pagamento aprovado", d: o.payment === "pix" ? "Aguardando" : "Agora", done: o.payment === "card" },
    ...(custom ? [{ t: "Produção da personalização", d: "Até 2 dias úteis", done: false }] : []),
    { t: "Enviado", d: "Código de rastreio por e-mail", done: false },
    { t: "Entregue", d: `Até ${o.eta}`, done: false },
  ];

  const copy = async () => {
    try { await navigator.clipboard.writeText(`00020126VELIORA${o.number}PIXDEMO`); } catch { /* segue */ }
    setCopied(true);
    toast.success("Código Pix copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container-x relative max-w-4xl pt-10">
      <Confetti />
      <div className="relative">
        <p className="label text-graphite">Pedido {o.number}</p>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 18 }} className="mt-4 font-display text-[clamp(40px,10vw,64px)] font-normal">
          Valeu, {o.name.split(" ")[0]}!
        </motion.h1>
        <p className="mt-3 max-w-lg text-[15px] text-graphite">Seu pedido foi confirmado. Enviamos os detalhes para <b className="text-ink">{o.email}</b>.</p>
      </div>

      <div className="relative mt-10 grid gap-4 md:grid-cols-[1fr_1fr]">
        {o.payment === "pix" ? (
          <div className="flex flex-col items-center gap-4 bg-paper p-8 text-center">
            <FakeQr />
            <div>
              <p className="font-bold">Pague {brl(o.total)} com Pix</p>
              <p className="mt-1 text-sm text-graphite">O código vale por 30 minutos.</p>
            </div>
            <Button variant="outline" leftIcon={copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />} onClick={copy}>{copied ? "Copiado" : "Copiar código Pix"}</Button>
          </div>
        ) : (
          <div className="bg-paper p-8">
            <p className="font-display text-[26px]">Pagamento aprovado</p>
            <p className="mt-2 text-sm text-graphite">Cartão de crédito · {brl(o.total)}</p>
          </div>
        )}

        <ol className="border border-line p-8">
          {steps.map((s, i) => (
            <motion.li key={s.t} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="relative flex gap-3 pb-5 last:pb-0">
              {i < steps.length - 1 && <span className="absolute left-[11px] top-6 h-full w-px bg-line" />}
              <span className={cn("relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2", s.done ? "border-success bg-success text-white" : "border-line bg-bone")}>
                {s.done && <Check className="h-3.5 w-3.5" />}
              </span>
              <div>
                <p className="text-sm font-bold">{s.t}</p>
                <p className="text-[13px] text-graphite">{s.d}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="mt-4 border border-line p-6 sm:p-8">
        <ul className="divide-y divide-line">
          {o.items.map((i) => {
            const p = byId(i.productId)!;
            const s = customSummary(i);
            return (
              <li key={i.key} className="flex items-center gap-3 py-3">
                <div className="w-14 shrink-0"><ProductMedia product={p} color={p.colors.find((c) => c.name === i.color.name) ?? i.color} custom={i.custom} className="aspect-[3/4]" /></div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-[12px] text-graphite">{i.qty}x · {i.color.name} · {i.size}</p>
                  {s && <p className="text-[12px] text-anil">{s}</p>}
                </div>
                <span className="tabular-nums text-sm">{brl(i.unitPrice * i.qty)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><dt className="text-graphite">Subtotal</dt><dd className="tabular-nums">{brl(o.subtotal)}</dd></div>
          {o.discount > 0 && <div className="flex justify-between text-success"><dt>Cupom</dt><dd className="tabular-nums">− {brl(o.discount)}</dd></div>}
          {o.pixOff > 0 && <div className="flex justify-between text-success"><dt>Pix</dt><dd className="tabular-nums">− {brl(o.pixOff)}</dd></div>}
          <div className="flex justify-between"><dt className="text-graphite">Frete</dt><dd className="tabular-nums">{o.shipping === 0 ? "Grátis" : brl(o.shipping)}</dd></div>
          <div className="flex justify-between pt-2 text-[15px]"><dt>Total</dt><dd className="tabular-nums">{brl(o.total)}</dd></div>
        </dl>
        <p className="mt-4 border-t border-line pt-3 text-[13px] text-graphite">Entrega em: {o.address}</p>
      </div>

      <Button size="lg" fullWidth className="mt-6" onClick={() => navigate("/")}>Voltar para a loja</Button>
    </div>
  );
}
