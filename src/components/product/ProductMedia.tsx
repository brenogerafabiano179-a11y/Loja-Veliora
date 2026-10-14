import { useEffect, useState } from "react";
import { ProductArt, type Custom } from "@/art/ProductArt";
import type { BackShot, Color, Product } from "@/data/catalog";
import { cn } from "@/lib/format";

/** Foto com fade-in suave; mantém o espaço reservado enquanto carrega. */
export function Photo({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(false), [src]);
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={() => setOk(true)}
      className={cn("h-full w-full object-cover transition-opacity duration-500", ok ? "opacity-100" : "opacity-0", className)}
    />
  );
}

/** Imagem do produto: foto real quando existe, desenho técnico quando não. */
export function ProductMedia({
  product, color, index = 0, custom, className, eager,
}: { product: Product; color: Color; index?: number; custom?: Custom | null; className?: string; eager?: boolean }) {
  const images = color.images ?? [];
  return (
    <div className={cn("relative overflow-hidden bg-paper", className)}>
      {images.length > 0 ? (
        <Photo src={images[index % images.length]} alt={`${product.name} na cor ${color.name}`} eager={eager} />
      ) : (
        <ProductArt kind={product.kind} color={color.hex} print={product.print} view={(index % 3) as 0 | 1 | 2} custom={custom} className="h-full w-full" title={`${product.name} na cor ${color.name}`} />
      )}
    </div>
  );
}

const FONT_CSS: Record<Custom["font"], React.CSSProperties> = {
  bloco: { fontFamily: "Archivo, Arial Narrow, sans-serif", fontWeight: 900, fontStretch: "62.5%", textTransform: "uppercase", letterSpacing: "0.02em" },
  varsity: { fontFamily: "Alfa Slab One, Georgia, serif", textTransform: "uppercase" },
  assinatura: { fontFamily: "Yellowtail, cursive" },
};

/** Prévia da personalização desenhada sobre a foto real das costas. */
export function BackPreview({ shot, custom, alt, className }: { shot: BackShot; custom: Custom; alt: string; className?: string }) {
  const light = parseInt(custom.color.slice(1, 3), 16) > 160;
  const style: React.CSSProperties = {
    ...FONT_CSS[custom.font],
    color: custom.color,
    mixBlendMode: light ? "normal" : "multiply",
    opacity: light ? 0.94 : 0.9,
    position: "absolute",
    left: `${shot.cx}%`,
    transform: "translate(-50%, -50%)",
    whiteSpace: "nowrap",
    lineHeight: 1,
    textShadow: light ? "0 1px 1px rgba(0,0,0,.25)" : "none",
  };
  const name = custom.text || "";
  const nameSize = Math.min(7.2, 46 / Math.max(6, name.length));
  return (
    <div className={cn("relative overflow-hidden bg-paper [container-type:inline-size]", className)} style={{ aspectRatio: "820 / 1136" }}>
      <Photo src={shot.src} alt={alt} eager />
      {name && <span style={{ ...style, top: `${shot.nameY}%`, fontSize: `${nameSize}cqw` }}>{name}</span>}
      {custom.number && (
        <span style={{ ...style, ...(custom.font === "assinatura" ? FONT_CSS.bloco : {}), top: `${shot.numY}%`, fontSize: "21cqw" }}>{custom.number}</span>
      )}
    </div>
  );
}
