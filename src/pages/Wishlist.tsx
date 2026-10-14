import { useNavigate } from "react-router-dom";
import { useStore } from "@/context/StoreContext";
import { byId } from "@/data/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";

export default function Wishlist() {
  const { wishlist } = useStore();
  const navigate = useNavigate();
  const items = wishlist.map((id) => byId(id)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <div className="container-x pt-10">
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-display text-[34px] font-normal sm:text-[44px]">Favoritos</h1>
        <p className="text-[13px] text-graphite">{items.length} {items.length === 1 ? "produto" : "produtos"}</p>
      </div>
      {items.length === 0 ? (
        <div className="py-28 text-center">
          <p className="font-display text-[24px]">Nenhum favorito ainda</p>
          <p className="mx-auto mt-2 max-w-sm text-[14px] text-graphite">Toque no coração de qualquer produto para guardar aqui e decidir depois.</p>
          <Button className="mt-6" onClick={() => navigate("/loja")}>Ver produtos</Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
