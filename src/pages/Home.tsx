import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { Atelier, Campaign, Categories, Looks, Prints, Promises, Statement } from "@/components/home/Sections";
import { ProductRail } from "@/components/product/ProductRail";
import { bestSellers, newArrivals } from "@/data/catalog";

const all = (
  <Link to="/loja" className="group hidden items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] md:flex">
    Ver tudo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
  </Link>
);

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <ProductRail eyebrow="Acabou de chegar" title="Novidades" products={newArrivals} action={all} />
      <Categories />
      <Campaign />
      <ProductRail eyebrow="Os favoritos" title="Mais vendidos" products={bestSellers} action={all} />
      <Atelier />
      <Prints />
      <Looks />
      <Promises />
    </>
  );
}
