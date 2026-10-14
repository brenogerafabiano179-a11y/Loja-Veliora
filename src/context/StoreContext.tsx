import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Custom } from "@/art/ProductArt";
import { COUPONS, FREE_SHIPPING, PERSONALIZATION_PRICE, byId, type Color, type Product } from "@/data/catalog";

export type CartItem = {
  key: string;
  productId: string;
  color: Color;
  size: string;
  qty: number;
  custom: Custom | null;
  unitPrice: number;
  note?: string;
};

export type Order = {
  number: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  pixOff: number;
  total: number;
  payment: "pix" | "card";
  email: string;
  name: string;
  address: string;
  eta: string;
};

type AddOpts = { color: Color; size: string; qty?: number; custom?: Custom | null; priceOverride?: number; note?: string; silent?: boolean };

type Store = {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  coupon: string | null;
  freeShippingLeft: number;
  cartOpen: boolean;
  searchOpen: boolean;
  wishlist: string[];
  recent: string[];
  lastOrder: Order | null;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  addItem: (p: Product, o: AddOpts) => void;
  updateQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  toggleWish: (id: string) => void;
  pushRecent: (id: string) => void;
  placeOrder: (o: Omit<Order, "number" | "items" | "subtotal" | "discount">) => Order;
};

const Ctx = createContext<Store | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* navegação privada: segue em memória */
  }
}

const customKey = (c: Custom | null | undefined) => (c && (c.text || c.number) ? `${c.zone}|${c.text}|${c.number ?? ""}|${c.font}|${c.color}` : "");

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => load<CartItem[]>("veliora-cart-v2", []).filter((i) => byId(i.productId)));
  const [wishlist, setWishlist] = useState<string[]>(() => load("veliora-wish-v2", []));
  const [recent, setRecent] = useState<string[]>(() => load("veliora-recent-v2", []));
  const [coupon, setCoupon] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  useEffect(() => save("veliora-cart-v2", items), [items]);
  useEffect(() => save("veliora-wish-v2", wishlist), [wishlist]);
  useEffect(() => save("veliora-recent-v2", recent), [recent]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, searchOpen]);

  const addItem = useCallback((p: Product, o: AddOpts) => {
    const custom = o.custom && (o.custom.text || o.custom.number) ? o.custom : null;
    const unitPrice = o.priceOverride ?? p.price + (custom ? PERSONALIZATION_PRICE : 0);
    const key = [p.id, o.color.name, o.size, customKey(custom), o.note ?? ""].join("~");
    const qty = o.qty ?? 1;
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(10, i.qty + qty) } : i));
      return [...prev, { key, productId: p.id, color: o.color, size: o.size, qty, custom, unitPrice, note: o.note }];
    });
    if (!o.silent) {
      setCartOpen(true);
      toast.success("Na sacola", { description: `${p.name} · ${o.color.name} · ${o.size}${custom ? " · personalizado" : ""}` });
    }
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)));
  }, []);

  const removeItem = useCallback(
    (key: string) => {
      const index = items.findIndex((i) => i.key === key);
      if (index < 0) return;
      const removed = items[index];
      setItems((prev) => prev.filter((i) => i.key !== key));
      toast("Item removido", {
        description: byId(removed.productId)?.name,
        action: {
          label: "Desfazer",
          onClick: () =>
            setItems((cur) => {
              if (cur.some((i) => i.key === removed.key)) return cur;
              const next = [...cur];
              next.splice(Math.min(index, next.length), 0, removed);
              return next;
            }),
        },
      });
    },
    [items],
  );

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.unitPrice * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const discount = useMemo(() => {
    const c = coupon ? COUPONS[coupon] : null;
    if (!c) return 0;
    return c.type === "percent" ? subtotal * (c.value / 100) : Math.min(c.value, subtotal);
  }, [coupon, subtotal]);

  const applyCoupon = useCallback((raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) return { ok: false, message: "Digite o código do cupom" };
    const c = COUPONS[code];
    if (!c) return { ok: false, message: "Esse cupom não existe ou já expirou" };
    setCoupon(code);
    return { ok: true, message: `Cupom ${code} aplicado: ${c.label}` };
  }, []);

  const toggleWish = useCallback((id: string) => {
    setWishlist((prev) => {
      const on = prev.includes(id);
      toast(on ? "Removido dos favoritos" : "Salvo nos favoritos", { description: byId(id)?.name });
      return on ? prev.filter((x) => x !== id) : [id, ...prev];
    });
  }, []);

  const pushRecent = useCallback((id: string) => {
    setRecent((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 8));
  }, []);

  const placeOrder: Store["placeOrder"] = useCallback(
    (o) => {
      const order: Order = { ...o, number: `VLR-${Math.floor(100000 + Math.random() * 900000)}`, items, subtotal, discount };
      setLastOrder(order);
      setItems([]);
      setCoupon(null);
      return order;
    },
    [items, subtotal, discount],
  );

  const value: Store = {
    items, count, subtotal, discount, coupon,
    freeShippingLeft: Math.max(0, FREE_SHIPPING - (subtotal - discount)),
    cartOpen, searchOpen, wishlist, recent, lastOrder,
    setCartOpen, setSearchOpen, addItem, updateQty, removeItem, applyCoupon,
    removeCoupon: () => setCoupon(null),
    toggleWish, pushRecent, placeOrder,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return s;
}
