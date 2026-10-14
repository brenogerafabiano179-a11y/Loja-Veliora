import { useNavigate } from "react-router-dom";
import { img } from "@/data/catalog";
import { Photo } from "@/components/product/ProductMedia";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="container-x grid min-h-[60vh] items-center gap-10 py-16 md:grid-cols-2">
      <div>
        <p className="label text-graphite">Página não encontrada</p>
        <h1 className="font-display mt-4 text-[40px] font-normal leading-none sm:text-[56px]">A maré levou <span className="font-editorial">esta página.</span></h1>
        <p className="mt-4 max-w-sm text-[14px] text-graphite">O endereço pode estar errado ou o produto saiu de linha.</p>
        <Button className="mt-8" onClick={() => navigate("/")}>Voltar para a loja</Button>
      </div>
      <div className="aspect-[4/5] overflow-hidden bg-paper"><Photo src={img("lado-1")} alt="Homem olhando o mar" /></div>
    </div>
  );
}
