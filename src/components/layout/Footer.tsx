import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES } from "@/data/catalog";
import { Logo } from "./Logo";

export function Footer() {
  const [email, setEmail] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Esse e-mail parece incompleto");
      return;
    }
    toast.success("Inscrição confirmada", { description: "Seu cupom VELIORA10 chega no seu e-mail." });
    setEmail("");
  };

  return (
    <footer className="mt-28 border-t border-line">
      <div className="container-x grid gap-14 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <p className="font-display text-[26px] leading-tight">Receba os drops antes de todo mundo.</p>
          <form onSubmit={submit} className="mt-6">
            <label htmlFor="newsletter" className="sr-only">Seu e-mail</label>
            <div className="flex border-b border-ink">
              <input id="newsletter" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail" className="h-12 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-graphite" />
              <button aria-label="Inscrever" className="px-1 transition-transform hover:translate-x-1"><ArrowRight className="h-5 w-5" strokeWidth={1.5} /></button>
            </div>
            <p className="mt-3 text-[12px] text-graphite">10% na primeira compra. Sem spam.</p>
          </form>
        </div>
        <FooterCol title="Loja" links={CATEGORIES.map((c) => ({ label: c.plural, to: `/loja/${c.id}` }))} />
        <FooterCol
          title="Ajuda"
          links={[
            { label: "Rastrear pedido", to: "/" },
            { label: "Trocas e devoluções", to: "/" },
            { label: "Guia de medidas", to: "/loja/camisas" },
            { label: "Personalização", to: "/#atelie" },
          ]}
        />
        <div>
          <p className="label mb-5 text-graphite">Contato</p>
          <ul className="space-y-2.5 text-[14px]">
            <li className="select-all">atendimento@veliora.com.br</li>
            <li className="text-graphite">Seg. a sáb., 9h às 18h</li>
            <li className="pt-2"><span className="text-graphite">Instagram</span> @veliora</li>
          </ul>
        </div>
      </div>
      <div className="container-x"><Logo className="block py-8 text-[clamp(40px,13vw,200px)] tracking-[0.2em] text-ink/[0.08]" /></div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-3 py-6 text-[12px] text-graphite sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Veliora. Loja demonstrativa para portfólio: nenhum pedido é cobrado.</p>
          <p>Pix · Visa · Mastercard · Elo · Amex</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="label mb-5 text-graphite">{title}</p>
      <ul className="space-y-2.5 text-[14px]">
        {links.map((l) => <li key={l.label}><Link to={l.to} className="transition-opacity hover:opacity-60">{l.label}</Link></li>)}
      </ul>
    </div>
  );
}
