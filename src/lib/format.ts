export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const installments = (v: number, max = 6) => {
  const n = Math.min(max, Math.max(1, Math.floor(v / 50)));
  return `${n}x de ${brl(v / n)} sem juros`;
};

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const maskCep = (v: string) =>
  v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export const maskCard = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

export const maskExpiry = (v: string) =>
  v.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");

export const maskPhone = (v: string) =>
  v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");

/** Frete simulado: varia pela região (1º dígito do CEP). */
export type ShippingOption = { id: string; name: string; days: string; price: number };

export function simulateShipping(cep: string, subtotal: number, freeAbove: number): ShippingOption[] {
  const region = Number(cep.replace(/\D/g, "")[0] ?? 0);
  const base = 14.9 + region * 2.4;
  const free = subtotal >= freeAbove;
  return [
    { id: "pac", name: "Econômico", days: `${5 + Math.ceil(region / 2)} a ${8 + Math.ceil(region / 2)} dias úteis`, price: free ? 0 : base },
    { id: "sedex", name: "Expresso", days: `${1 + Math.ceil(region / 3)} a ${3 + Math.ceil(region / 3)} dias úteis`, price: base * 1.9 },
  ];
}
