// ==========================================================
// Ilustrações dos produtos Veliora (SVG em React).
// Tudo é desenhado em código: muda de cor, troca de estampa e
// mostra a personalização do cliente em tempo real.
// viewBox 400 × 500  ·  view 0 = principal · 1 = costas/cena · 2 = detalhe
// ==========================================================
import { memo, useId } from "react";
import { accentOn, darken, edgeOf, inkOn, lighten, luminance, mix } from "./color";
import { PatternDef, PrintGraphic, SailMark, type PrintId } from "./prints";

export type ArtKind =
  | "tee" | "oversized" | "resort"
  | "shorts-sarja" | "shorts-moletom" | "shorts-tactel"
  | "cap-dad" | "cap-trucker" | "cap-5panel"
  | "court" | "runner" | "sapatenis-couro" | "sapatenis-camurca"
  | "slide" | "flipflop";

export type ZoneId = "costas" | "peito" | "bolso" | "perna" | "frente" | "lateral" | "calcanhar" | "tira" | "palmilha";
export type FontId = "bloco" | "varsity" | "assinatura";
export type Custom = { zone: ZoneId; text: string; number?: string; font: FontId; color: string };

type ZoneSpot = { view: 0 | 1; x: number; y: number; size: number; maxW: number; rotate?: number };

/** Onde cada personalização aparece no desenho. */
export const ZONE_SPOTS: Partial<Record<ArtKind, Partial<Record<ZoneId, ZoneSpot>>>> = {
  tee: { costas: { view: 1, x: 200, y: 196, size: 30, maxW: 150 }, peito: { view: 0, x: 248, y: 170, size: 15, maxW: 52 } },
  oversized: { costas: { view: 1, x: 200, y: 200, size: 32, maxW: 170 }, peito: { view: 0, x: 252, y: 176, size: 15, maxW: 56 } },
  resort: { bolso: { view: 0, x: 256, y: 226, size: 15, maxW: 38 } },
  "shorts-sarja": { perna: { view: 0, x: 152, y: 352, size: 16, maxW: 70, rotate: -4 } },
  "shorts-moletom": { perna: { view: 0, x: 152, y: 352, size: 16, maxW: 70, rotate: -4 } },
  "shorts-tactel": { perna: { view: 0, x: 152, y: 352, size: 16, maxW: 70, rotate: -4 } },
  "cap-dad": { frente: { view: 0, x: 200, y: 222, size: 26, maxW: 120 }, lateral: { view: 0, x: 262, y: 246, size: 12, maxW: 34, rotate: 12 } },
  "cap-trucker": { frente: { view: 0, x: 200, y: 222, size: 26, maxW: 110 }, lateral: { view: 0, x: 266, y: 246, size: 12, maxW: 30, rotate: 12 } },
  "cap-5panel": { frente: { view: 0, x: 200, y: 222, size: 24, maxW: 90 }, lateral: { view: 0, x: 266, y: 246, size: 12, maxW: 30, rotate: 12 } },
  court: { lateral: { view: 0, x: 228, y: 290, size: 15, maxW: 70 }, calcanhar: { view: 0, x: 326, y: 286, size: 11, maxW: 22 } },
  runner: { lateral: { view: 0, x: 232, y: 282, size: 15, maxW: 70 }, calcanhar: { view: 0, x: 330, y: 280, size: 11, maxW: 22 } },
  "sapatenis-couro": { lateral: { view: 0, x: 236, y: 292, size: 14, maxW: 66 }, calcanhar: { view: 0, x: 322, y: 292, size: 11, maxW: 22 } },
  "sapatenis-camurca": { lateral: { view: 0, x: 236, y: 292, size: 14, maxW: 66 }, calcanhar: { view: 0, x: 322, y: 292, size: 11, maxW: 22 } },
  slide: { tira: { view: 0, x: 255, y: 196, size: 17, maxW: 70 } },
  flipflop: { palmilha: { view: 0, x: 255, y: 372, size: 15, maxW: 60 } },
};

const FOCUS: Record<ArtKind, [number, number]> = {
  tee: [200, 250], oversized: [200, 256], resort: [222, 190],
  "shorts-sarja": [170, 250], "shorts-moletom": [200, 180], "shorts-tactel": [180, 260],
  "cap-dad": [200, 214], "cap-trucker": [200, 214], "cap-5panel": [200, 214],
  court: [240, 280], runner: [240, 280], "sapatenis-couro": [240, 286], "sapatenis-camurca": [240, 286],
  slide: [145, 210], flipflop: [145, 210],
};

const FAMILY: Record<ArtKind, "camisa" | "bermuda" | "bone" | "calcado" | "chinelo"> = {
  tee: "camisa", oversized: "camisa", resort: "camisa",
  "shorts-sarja": "bermuda", "shorts-moletom": "bermuda", "shorts-tactel": "bermuda",
  "cap-dad": "bone", "cap-trucker": "bone", "cap-5panel": "bone",
  court: "calcado", runner: "calcado", "sapatenis-couro": "calcado", "sapatenis-camurca": "calcado",
  slide: "chinelo", flipflop: "chinelo",
};

/** Enquadramento base de cada família dentro do quadro 400×500. */
const BASE: Record<string, string> = {
  calcado: "translate(200 262) scale(1.2) translate(-205 -285)",
  bone: "translate(200 252) scale(1.18) translate(-200 -222)",
};
const SHADOW_Y: Record<string, number> = { camisa: 446, bermuda: 430, bone: 372, calcado: 356, chinelo: 450 };

const NEUTRAL = [["#F2F1ED", "#ECEAE5"], ["#ECE9E2", "#E4E0D7"]] as const;
const BACKDROPS = { camisa: NEUTRAL, bermuda: NEUTRAL, bone: NEUTRAL, calcado: NEUTRAL, chinelo: NEUTRAL } as const;

/* ---------- texto personalizado ---------- */
const FONT_STYLE: Record<FontId, { family: string; weight: number; stretch?: string; upper: boolean; w: number }> = {
  bloco: { family: "Archivo, Arial Narrow, sans-serif", weight: 900, stretch: "62.5%", upper: true, w: 0.5 },
  varsity: { family: "Alfa Slab One, Georgia, serif", weight: 400, upper: true, w: 0.78 },
  assinatura: { family: "Yellowtail, cursive", weight: 400, upper: false, w: 0.46 },
};

function CustomText({ text, spot, font, color, size }: { text: string; spot: ZoneSpot; font: FontId; color: string; size?: number }) {
  if (!text) return null;
  const f = FONT_STYLE[font];
  const s = size ?? spot.size;
  const shown = f.upper ? text.toUpperCase() : text;
  const est = shown.length * s * f.w;
  const fit = est > spot.maxW;
  return (
    <text
      x={spot.x}
      y={spot.y}
      textAnchor="middle"
      fontFamily={f.family}
      fontWeight={f.weight}
      fontSize={s}
      fill={color}
      stroke={darken(color, 0.35)}
      strokeWidth={s > 40 ? 1.2 : 0.5}
      paintOrder="stroke"
      style={f.stretch ? { fontStretch: f.stretch } : undefined}
      transform={spot.rotate ? `rotate(${spot.rotate} ${spot.x} ${spot.y})` : undefined}
      {...(fit ? { textLength: spot.maxW, lengthAdjust: "spacingAndGlyphs" } : {})}
    >
      {shown}
    </text>
  );
}

/* ---------- peças ---------- */
type ShapeProps = { c: string; uid: string; print?: PrintId; view: 0 | 1 | 2; custom?: Custom | null };

const TEE = "M120 122 L165 100 Q200 128 235 100 L280 122 L332 176 L296 208 L272 190 L272 402 Q200 414 128 402 L128 190 L104 208 L68 176 Z";
const TEE_OS = "M106 128 L160 104 Q200 130 240 104 L294 128 L342 204 L302 230 L286 214 L288 412 Q200 424 112 412 L114 214 L98 230 L58 204 Z";

function Tee({ c, uid, print, view, custom, oversized }: ShapeProps & { oversized?: boolean }) {
  const e = edgeOf(c), d = darken(c), dd = darken(c, 0.38), l = lighten(c);
  const ink = inkOn(c), acc = accentOn(c);
  const back = view === 1;
  const body = oversized ? TEE_OS : TEE;
  const neck = oversized
    ? back ? "M160 104 Q200 116 240 104" : "M160 104 Q200 146 240 104"
    : back ? "M165 100 Q200 112 235 100" : "M165 100 Q200 142 235 100";
  const spots = ZONE_SPOTS[oversized ? "oversized" : "tee"]!;
  const costas = custom?.zone === "costas" ? custom : null;
  const peito = custom?.zone === "peito" ? custom : null;
  const gy = oversized ? 262 : 252;
  return (
    <g>
      <path d={body} fill={c} stroke={e} strokeWidth="1.3" strokeLinejoin="round" />
      <path d={neck} stroke={d} strokeWidth="6" fill="none" />
      {!back && <path d={`${neck.replace("M", "M")} Z`} fill={dd} opacity=".85" />}
      <path d={oversized ? "M116 214 L146 132 M284 214 L254 132" : "M128 190 L150 128 M272 190 L250 128"} stroke={d} strokeWidth="1.3" fill="none" opacity=".5" />
      <path d={`M${oversized ? 126 : 138} 220 Q${oversized ? 136 : 148} 310 ${oversized ? 124 : 136} 398`} stroke={d} strokeWidth="10" fill="none" opacity=".16" strokeLinecap="round" />
      <path d={`M${oversized ? 272 : 262} 220 Q${oversized ? 262 : 254} 300 ${oversized ? 276 : 266} 398`} stroke={d} strokeWidth="8" fill="none" opacity=".18" strokeLinecap="round" />
      <path d={`M176 ${oversized ? 300 : 290} Q206 330 192 380`} stroke={l} strokeWidth="12" fill="none" opacity=".18" strokeLinecap="round" />
      <path d={oversized ? "M116 404 Q200 416 284 404" : "M130 396 Q200 408 270 396"} stroke={d} strokeWidth="1.6" fill="none" strokeDasharray="4 4" opacity=".6" />

      {!back && print && (
        <g transform={`translate(200 ${gy}) scale(${oversized ? 0.95 : 0.85})`}>
          <PrintGraphic print={print} ink={ink} accent={acc} uid={uid} />
        </g>
      )}
      {!back && !peito && (
        <g transform={`translate(${oversized ? 246 : 242} ${oversized ? 162 : 158})`} opacity=".85">
          <path d="M0 0 L5 10 L5 0 Z M6.5 3 L6.5 10 L11 3 Z" fill={ink} />
        </g>
      )}
      {back && (
        <>
          <rect x="186" y={oversized ? 112 : 108} width="28" height="10" rx="1.5" fill={dd} />
          <text x="200" y={oversized ? 120 : 116} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="6.5" fill={lighten(dd, 0.6)}>VELIORA</text>
          {!costas && print && (
            <g transform={`translate(200 ${oversized ? 196 : 190}) scale(.42)`} opacity=".95">
              <PrintGraphic print={print} ink={ink} accent={acc} uid={`${uid}b`} />
            </g>
          )}
        </>
      )}
      {back && costas && (
        <>
          <CustomText text={costas.text} spot={spots.costas!} font={costas.font} color={costas.color} />
          {costas.number && (
            <CustomText
              text={costas.number}
              spot={{ ...spots.costas!, y: oversized ? 318 : 306, maxW: 160 }}
              font={costas.font === "assinatura" ? "bloco" : costas.font}
              color={costas.color}
              size={118}
            />
          )}
        </>
      )}
      {!back && peito && <CustomText text={peito.text} spot={spots.peito!} font={peito.font} color={peito.color} />}
    </g>
  );
}

function Resort({ c, uid, print = "fauna", custom }: ShapeProps) {
  const e = edgeOf(c), d = darken(c), ink = inkOn(c), acc = accentOn(c);
  const body = "M122 120 L172 102 L200 152 L228 102 L278 120 L326 178 L292 206 L274 192 L276 404 L124 404 L126 192 L108 206 L74 178 Z";
  const bolso = custom?.zone === "bolso" ? custom : null;
  return (
    <g>
      <defs><PatternDef id={`p${uid}`} print={print} base={c} ink={mix(ink, c, 0.15)} accent={acc} scale={0.95} /></defs>
      <path d={body} fill={`url(#p${uid})`} stroke={e} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M172 100 Q200 92 228 100 L224 110 Q200 103 176 110 Z" fill={d} />
      <path d="M172 100 L200 154 L180 172 L148 120 Z" fill={`url(#p${uid})`} stroke={e} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M228 100 L200 154 L220 172 L252 120 Z" fill={`url(#p${uid})`} stroke={e} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M180 172 L148 120 M220 172 L252 120" stroke={darken(c, 0.4)} strokeWidth="1.2" opacity=".5" />
      <path d="M200 154 L200 404" stroke={e} strokeWidth="1.6" />
      {[196, 246, 296, 346, 392].map((y) => <circle key={y} cx="205" cy={y} r="3.6" fill={lighten(c, 0.6)} stroke={e} strokeWidth="1" />)}
      <rect x="236" y="188" width="42" height="50" rx="2" fill={`url(#p${uid})`} stroke={e} strokeWidth="1.6" />
      <path d="M236 196 L278 196" stroke={e} strokeWidth="1" strokeDasharray="3 2" />
      <path d="M128 190 L150 128 M272 190 L250 128" stroke={d} strokeWidth="1.3" fill="none" opacity=".45" />
      <rect x="124" y="190" width="152" height="214" fill="#000" opacity=".03" />
      <path d="M140 220 Q150 310 138 398" stroke="#000" strokeWidth="12" opacity=".06" fill="none" strokeLinecap="round" />
      {bolso && <CustomText text={bolso.text} spot={ZONE_SPOTS.resort!.bolso!} font={bolso.font} color={bolso.color} />}
    </g>
  );
}

function Shorts({ c, uid, view, custom, variant, print }: ShapeProps & { variant: "sarja" | "moletom" | "tactel" }) {
  const e = edgeOf(c), d = darken(c), dd = darken(c, 0.35), l = lighten(c), ink = inkOn(c), acc = accentOn(c);
  const legs = "M110 172 L290 172 L304 384 L212 396 L200 262 L188 396 L96 384 Z";
  const fill = variant === "tactel" ? `url(#p${uid})` : c;
  const perna = custom?.zone === "perna" ? custom : null;
  void view;
  return (
    <g>
      {variant === "tactel" && <defs><PatternDef id={`p${uid}`} print={print ?? "mare"} base={c} ink={mix(ink, c, 0.35)} accent={acc} scale={1.1} /></defs>}
      <path d={legs} fill={fill} stroke={e} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M112 140 L288 140 L290 174 L110 174 Z" fill={variant === "sarja" ? c : d} stroke={e} strokeWidth="1.3" />
      {variant === "sarja" && (
        <>
          {[132, 172, 228, 268].map((x) => <rect key={x} x={x} y="136" width="7" height="26" rx="1.5" fill={d} stroke={e} strokeWidth="1" />)}
          <circle cx="200" cy="156" r="5" fill={lighten(c, 0.5)} stroke={e} />
          <path d="M200 174 Q206 220 200 262" stroke={dd} strokeWidth="1.3" fill="none" />
          <path d="M120 178 Q136 214 112 240 M280 178 Q264 214 288 240" stroke={dd} strokeWidth="1.3" fill="none" />
          <path d="M112 146 L288 146 M110 168 L290 168" stroke={l} strokeWidth="1" strokeDasharray="3 3" opacity=".7" />
          <path d="M100 372 L188 382 M212 382 L300 372" stroke={l} strokeWidth="1.2" strokeDasharray="3 3" opacity=".8" />
        </>
      )}
      {variant !== "sarja" && (
        <>
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${120 + i * 11} 142 L${120 + i * 11} 172`} stroke={dd} strokeWidth="1" opacity=".35" />)}
          <path d="M194 166 Q186 210 178 232 M206 166 Q214 206 220 228" stroke={variant === "tactel" ? "#F7F5F0" : lighten(c, 0.7)} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <rect x="174" y="228" width="8" height="10" rx="2" fill={dd} /><rect x="216" y="224" width="8" height="10" rx="2" fill={dd} />
          <path d="M120 178 Q132 210 114 234 M280 178 Q268 210 286 234" stroke={dd} strokeWidth="1.3" fill="none" opacity=".7" />
          {variant === "moletom" && <path d="M98 366 L188 376 M212 376 L302 366" stroke={dd} strokeWidth="5" opacity=".1" />}
          {variant === "tactel" && <path d="M106 300 L100 380 M294 300 L300 380" stroke="#F7F5F0" strokeWidth="5" opacity=".8" />}
        </>
      )}
      <path d="M140 200 Q150 300 128 378" stroke="#000" strokeWidth="12" opacity=".07" fill="none" strokeLinecap="round" />
      <path d="M248 210 Q262 300 274 372" stroke="#fff" strokeWidth="12" opacity=".12" fill="none" strokeLinecap="round" />
      {!perna && <g transform="translate(264 352)"><SailMarkSvg color={variant === "tactel" ? "#F7F5F0" : ink} /></g>}
      {perna && <CustomText text={perna.text} spot={ZONE_SPOTS["shorts-sarja"]!.perna!} font={perna.font} color={perna.color} />}
    </g>
  );
}

function SailMarkSvg({ color, s = 1 }: { color: string; s?: number }) {
  return (
    <g transform={`scale(${s})`} opacity=".85">
      <path d="M0 0 L7 14 L7 0 Z M9 4 L9 14 L15 4 Z" fill={color} />
    </g>
  );
}

function Cap({ c, custom, variant }: ShapeProps & { variant: "dad" | "trucker" | "5panel" }) {
  const e = edgeOf(c), d = darken(c), dd = darken(c, 0.35), l = lighten(c), ink = inkOn(c);
  const crown = "M106 264 Q104 150 200 136 Q296 150 294 264 Z";
  const front = custom?.zone === "frente" ? custom : null;
  const side = custom?.zone === "lateral" ? custom : null;
  const kind = variant === "dad" ? "cap-dad" : variant === "trucker" ? "cap-trucker" : "cap-5panel";
  const foam = variant === "trucker" ? "#F4F1EA" : c;
  const textOnFront = variant === "trucker" ? "#141618" : ink;
  return (
    <g>
      <defs>
        <pattern id={`mesh${c.slice(1)}`} width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill={c} />
          <circle cx="3.5" cy="3.5" r="1.6" fill={dd} />
        </pattern>
      </defs>
      <path d={crown} fill={variant === "trucker" ? `url(#mesh${c.slice(1)})` : c} stroke={e} strokeWidth="1.3" />
      {variant === "trucker" && <path d="M138 264 Q134 166 200 138 Q266 166 262 264 Z" fill={foam} stroke={edgeOf(foam)} strokeWidth="1.6" />}
      {variant === "5panel" && <path d="M146 264 L146 168 Q200 146 254 168 L254 264 Z" fill={c} stroke={e} strokeWidth="1.6" />}
      {variant === "dad" && (
        <>
          <path d="M200 136 L200 264" stroke={d} strokeWidth="1.6" />
          <path d="M200 136 Q150 170 140 264 M200 136 Q250 170 260 264" stroke={d} strokeWidth="1.6" fill="none" />
        </>
      )}
      {variant === "trucker" && <path d="M200 140 L200 264" stroke={edgeOf(foam)} strokeWidth="1.2" opacity=".6" />}
      <circle cx="200" cy="138" r="7" fill={variant === "trucker" ? c : d} stroke={e} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={[150, 200, 250][i]} cy={[188, 166, 188][i]} r="2.4" fill={dd} opacity={variant === "5panel" ? 0 : 0.7} />
      ))}
      <path d="M118 210 Q132 168 170 150" stroke={l} strokeWidth="9" opacity=".1" fill="none" strokeLinecap="round" />
      {/* aba */}
      <path d="M92 258 Q200 236 308 258 Q314 292 200 306 Q86 292 92 258 Z" fill={variant === "trucker" ? c : c} stroke={e} strokeWidth="1.3" />
      <path d="M104 266 Q200 248 296 266" stroke={d} strokeWidth="1.4" strokeDasharray="4 3" fill="none" />
      <path d="M112 276 Q200 260 288 276" stroke={d} strokeWidth="1.4" strokeDasharray="4 3" fill="none" />
      <path d="M100 286 Q200 306 300 286 Q290 300 200 306 Q110 300 100 286 Z" fill={dd} opacity=".35" />
      {/* bordado padrão */}
      {!front && (
        <g>
          {variant === "5panel" ? (
            <g>
              <rect x="170" y="200" width="60" height="30" rx="3" fill={inkOn(c) === "#141618" ? "#141618" : "#EFECE6"} />
              <text x="200" y="220" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="900" fontSize="13" fill={c} style={{ fontStretch: "62.5%" }}>VELIORA</text>
            </g>
          ) : (
            <g>
              <g transform="translate(190 186) scale(1.3)"><SailMarkSvg color={textOnFront} /></g>
              <text x="200" y="236" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="900" fontSize="22" fill={textOnFront} style={{ fontStretch: "62.5%" }} letterSpacing="1">VELIORA</text>
            </g>
          )}
        </g>
      )}
      {front && <CustomText text={front.text} spot={ZONE_SPOTS[kind]!.frente!} font={front.font} color={front.color} />}
      {side && <CustomText text={side.text} spot={ZONE_SPOTS[kind]!.lateral!} font={side.font} color={side.color} />}
    </g>
  );
}

function Sneaker({ c, custom, variant }: ShapeProps & { variant: "court" | "runner" }) {
  const e = edgeOf(c), d = darken(c), dd = darken(c, 0.38), l = lighten(c);
  const sole = luminance(c) > 0.8 ? "#E9E4DA" : "#F5F2EC";
  const kind = variant;
  const lat = custom?.zone === "lateral" ? custom : null;
  const heel = custom?.zone === "calcanhar" ? custom : null;
  const accent = luminance(c) > 0.55 ? "#16324F" : "#B9A47E";
  if (variant === "court") {
    return (
      <g>
        <path d="M70 302 Q76 246 140 232 L206 206 Q240 198 252 228 L300 258 Q344 268 340 306 L80 314 Z" fill={c} stroke={e} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M252 228 L300 258 Q344 268 340 306 L292 308 Q302 274 252 228 Z" fill={l} opacity=".5" />
        <path d="M212 210 Q240 202 252 228 Q232 222 216 228 Z" fill={dd} opacity=".7" />
        <path d="M70 302 Q72 262 102 250 L110 314 L80 314 Z" fill={d} opacity=".3" />
        <path d="M150 238 Q196 252 216 304" stroke={d} strokeWidth="1.8" fill="none" opacity=".55" />
        {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={92 + (i % 3) * 9} cy={272 + Math.floor(i / 3) * 9} r="1.8" fill={dd} opacity=".6" />)}
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${196 + i * 14} ${214 + i * 6} L${210 + i * 14} ${232 + i * 6}`} stroke={lighten(c, 0.55)} strokeWidth="4" strokeLinecap="round" />)}
        <path d="M316 262 Q340 268 340 300 L316 302 Z" fill={accent} />
        {!lat && <path d="M206 296 L222 260 L222 296 Z M226 296 L226 270 L240 296 Z" fill={accent} opacity=".9" />}
        <path d="M62 312 L345 304 Q354 328 336 340 L76 344 Q58 336 62 312 Z" fill={sole} stroke="#B8AE9F" strokeWidth="1.3" />
        <path d="M70 326 L342 320" stroke="#B8AE9F" strokeWidth="1.4" strokeDasharray="5 4" />
        {lat && <CustomText text={lat.text} spot={ZONE_SPOTS[kind]!.lateral!} font={lat.font} color={lat.color} />}
        {heel && <CustomText text={heel.text} spot={ZONE_SPOTS[kind]!.calcanhar!} font={heel.font} color={heel.color} />}
      </g>
    );
  }
  return (
    <g>
      <path d="M66 300 Q70 250 130 236 L200 196 Q236 186 250 214 L298 244 Q348 252 346 300 L80 312 Z" fill={c} stroke={e} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M120 240 Q170 260 196 300 M150 226 Q200 250 226 300" stroke={accent} strokeWidth="7" fill="none" strokeLinecap="round" opacity=".9" />
      <path d="M250 214 L298 244 Q348 252 346 300 L300 304 Q306 262 250 214 Z" fill={d} opacity=".35" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${190 + i * 13} ${206 + i * 8} L${204 + i * 13} ${222 + i * 8}`} stroke={lighten(c, 0.6)} strokeWidth="4" strokeLinecap="round" />)}
      <path d="M312 250 Q346 256 346 296 L322 298 Q326 268 312 250 Z" fill={dd} opacity=".5" />
      <path d="M54 304 Q120 294 200 302 Q280 288 352 294 Q362 330 342 348 L70 352 Q48 342 54 304 Z" fill={sole} stroke="#B8AE9F" strokeWidth="1.3" />
      <path d="M62 324 Q140 314 210 322 Q290 308 350 316" stroke={accent} strokeWidth="3" fill="none" opacity=".8" />
      <path d="M68 340 L342 336" stroke="#B8AE9F" strokeWidth="1.2" strokeDasharray="3 4" />
      {lat && <CustomText text={lat.text} spot={ZONE_SPOTS.runner!.lateral!} font={lat.font} color={lat.color} />}
      {heel && <CustomText text={heel.text} spot={ZONE_SPOTS.runner!.calcanhar!} font={heel.font} color={heel.color} />}
    </g>
  );
}

function Sapatenis({ c, uid, custom, variant }: ShapeProps & { variant: "couro" | "camurca" }) {
  const e = edgeOf(c), d = darken(c), dd = darken(c, 0.4), l = lighten(c);
  const kind = variant === "couro" ? "sapatenis-couro" : "sapatenis-camurca";
  const lat = custom?.zone === "lateral" ? custom : null;
  const heel = custom?.zone === "calcanhar" ? custom : null;
  return (
    <g>
      <defs>
        <pattern id={`suede${uid}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill={c} />
          <circle cx="1.5" cy="2" r=".8" fill={dd} opacity=".1" />
          <circle cx="4.5" cy="4.5" r=".7" fill={l} opacity=".35" />
        </pattern>
      </defs>
      <path d="M70 306 Q72 266 128 256 L208 236 Q248 230 262 250 L304 268 Q340 276 338 308 L80 316 Z" fill={variant === "camurca" ? `url(#suede${uid})` : c} stroke={e} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M92 290 Q104 262 150 256 Q186 254 200 270" stroke={dd} strokeWidth="1.6" strokeDasharray="4 3" fill="none" />
      <path d="M200 244 Q218 238 238 248 L232 268 Q214 262 200 268 Z" fill={d} opacity=".6" />
      {[0, 1].map((i) => <circle key={i} cx={212 + i * 16} cy={252 + i * 4} r="3" fill={lighten(c, 0.6)} stroke={dd} />)}
      <path d="M212 252 Q222 240 232 256 Q240 268 228 256" stroke={lighten(c, 0.6)} strokeWidth="2.4" fill="none" />
      {variant === "couro" && <path d="M110 268 Q160 252 210 248" stroke="#fff" strokeWidth="6" opacity=".1" fill="none" strokeLinecap="round" />}
      <path d="M262 250 L304 268 Q340 276 338 308 L300 310 Q304 278 262 250 Z" fill={dd} opacity=".1" />
      <path d="M62 310 L342 304 Q348 322 332 330 L74 332 Q58 328 62 310 Z" fill={variant === "couro" ? "#2a2420" : "#EDE7DC"} stroke={variant === "couro" ? "#141210" : "#B8AE9F"} strokeWidth="1.3" />
      <path d="M70 318 L338 312" stroke={variant === "couro" ? "#6b5a4c" : "#B8AE9F"} strokeWidth="1.2" strokeDasharray="4 3" />
      {!lat && <g transform="translate(252 282)"><SailMarkSvg color={lighten(c, 0.7)} s={0.9} /></g>}
      {lat && <CustomText text={lat.text} spot={ZONE_SPOTS[kind]!.lateral!} font={lat.font} color={lat.color} />}
      {heel && <CustomText text={heel.text} spot={ZONE_SPOTS[kind]!.calcanhar!} font={heel.font} color={heel.color} />}
    </g>
  );
}

const FOOT = "M112 128 Q110 88 145 86 Q182 88 182 130 L186 300 Q190 360 182 392 Q172 420 146 420 Q118 420 110 392 Q102 360 106 300 Z";

function Slide({ c, custom }: ShapeProps) {
  const e = edgeOf(c), d = darken(c), dd = darken(c, 0.35);
  const bed = luminance(c) > 0.6 ? darken(c, 0.12) : lighten(c, 0.12);
  const tira = custom?.zone === "tira" ? custom : null;
  const ink = inkOn(c);
  const one = (dx: number, mirror: boolean, showText: boolean) => (
    <g transform={`translate(${dx} 0)`}>
      <g transform={mirror ? "translate(290 0) scale(-1 1)" : undefined}>
        <path d={FOOT} fill={bed} stroke={e} strokeWidth="1.3" />
        <path d="M120 140 Q118 100 146 98 Q172 100 172 140 L176 300 Q178 380 146 404 Q116 380 116 300 Z" fill={darken(bed, 0.06)} />
        {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M126 ${300 + i * 22} L166 ${300 + i * 22}`} stroke={dd} strokeWidth="1.2" opacity=".1" />)}
        <path d="M98 150 Q146 132 194 150 L198 238 Q146 254 94 238 Z" fill={c} stroke={e} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M100 162 Q146 146 192 162" stroke={d} strokeWidth="1.4" strokeDasharray="3 3" fill="none" />
        <path d="M98 228 Q146 244 196 228" stroke={d} strokeWidth="1.4" strokeDasharray="3 3" fill="none" />
        <path d="M104 170 Q120 158 150 156" stroke="#fff" strokeWidth="6" opacity=".18" fill="none" strokeLinecap="round" />
      </g>
      {!showText && (
        <text x={145 + dx} y="202" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="900" fontSize="20" fill={ink} style={{ fontStretch: "62.5%" }} letterSpacing="1">VELIORA</text>
      )}
    </g>
  );
  return (
    <g>
      {one(0, false, false)}
      {one(110, true, !!tira)}
      {tira && <CustomText text={tira.text} spot={ZONE_SPOTS.slide!.tira!} font={tira.font} color={tira.color} />}
    </g>
  );
}

function Flipflop({ c, uid, print = "mare", custom }: ShapeProps) {
  const e = edgeOf(c), dd = darken(c, 0.35);
  const ink = inkOn(c), acc = accentOn(c);
  const strap = luminance(c) > 0.6 ? "#141618" : "#EFECE6";
  const pal = custom?.zone === "palmilha" ? custom : null;
  const one = (dx: number, mirror: boolean) => (
    <g transform={`translate(${dx} 0)`}>
      <g transform={mirror ? "translate(290 0) scale(-1 1)" : undefined}>
        <path d={FOOT} fill={darken(c, 0.25)} stroke={e} strokeWidth="1.3" />
        <path d="M118 132 Q116 96 145 94 Q176 96 176 134 L180 300 Q184 356 176 386 Q168 410 146 410 Q122 410 116 386 Q108 356 112 300 Z" fill={`url(#p${uid})`} />
        <path d="M150 134 Q132 170 112 222" stroke={strap} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M150 134 Q168 170 182 224" stroke={strap} strokeWidth="9" fill="none" strokeLinecap="round" />
        <circle cx="150" cy="134" r="7" fill={strap} stroke={dd} />
      </g>
    </g>
  );
  return (
    <g>
      <defs><PatternDef id={`p${uid}`} print={print} base={c} ink={ink} accent={acc} scale={0.85} /></defs>
      {one(0, false)}
      {one(110, true)}
      {pal && (
        <g>
          <rect x="216" y="352" width="78" height="30" rx="6" fill={darken(c, 0.15)} opacity=".85" />
          <CustomText text={pal.text} spot={ZONE_SPOTS.flipflop!.palmilha!} font={pal.font} color={pal.color} />
        </g>
      )}
    </g>
  );
}

/* ---------- componente principal ---------- */
export type ProductArtProps = {
  kind: ArtKind;
  color: string;
  print?: PrintId;
  view?: 0 | 1 | 2;
  custom?: Custom | null;
  caption?: string;
  className?: string;
  title?: string;
  /** sem fundo de estúdio (para compor sobre cores da marca) */
  bare?: boolean;
};

function ProductArtBase({ kind, color, print, view = 0, custom, caption, className, title, bare }: ProductArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const family = FAMILY[kind];
  const [b1, b2] = BACKDROPS[family][view === 1 ? 1 : 0];
  const hasCustom = !!custom && !!(custom.text || custom.number);
  const spot = hasCustom ? ZONE_SPOTS[kind]?.[custom!.zone] : undefined;

  // Na vista "1", peças que não são camisetas aparecem como cena (leve giro)
  const isTee = kind === "tee" || kind === "oversized";
  const drawView: 0 | 1 | 2 = isTee && view === 1 ? 1 : view === 2 && spot?.view === 1 ? 1 : 0;

  const shapeProps: ShapeProps = { c: color, uid, print, view: drawView, custom: hasCustom ? custom : null };
  let shape: JSX.Element;
  switch (kind) {
    case "tee": shape = <Tee {...shapeProps} />; break;
    case "oversized": shape = <Tee {...shapeProps} oversized />; break;
    case "resort": shape = <Resort {...shapeProps} />; break;
    case "shorts-sarja": shape = <Shorts {...shapeProps} variant="sarja" />; break;
    case "shorts-moletom": shape = <Shorts {...shapeProps} variant="moletom" />; break;
    case "shorts-tactel": shape = <Shorts {...shapeProps} variant="tactel" />; break;
    case "cap-dad": shape = <Cap {...shapeProps} variant="dad" />; break;
    case "cap-trucker": shape = <Cap {...shapeProps} variant="trucker" />; break;
    case "cap-5panel": shape = <Cap {...shapeProps} variant="5panel" />; break;
    case "court": shape = <Sneaker {...shapeProps} variant="court" />; break;
    case "runner": shape = <Sneaker {...shapeProps} variant="runner" />; break;
    case "sapatenis-couro": shape = <Sapatenis {...shapeProps} variant="couro" />; break;
    case "sapatenis-camurca": shape = <Sapatenis {...shapeProps} variant="camurca" />; break;
    case "slide": shape = <Slide {...shapeProps} />; break;
    case "flipflop": shape = <Flipflop {...shapeProps} />; break;
  }

  let transform = "";
  if (view === 2) {
    let [fx, fy] = spot ? [spot.x, spot.y - spot.size * 0.3] : FOCUS[kind];
    if (family === "calcado") { fx = 200 + (fx - 205) * 1.2; fy = 262 + (fy - 285) * 1.2; }
    if (family === "bone") { fx = 200 + (fx - 200) * 1.18; fy = 252 + (fy - 222) * 1.18; }
    const z = spot && spot.size < 20 ? 2.6 : 2;
    transform = `translate(200 250) scale(${z}) translate(${-fx} ${-fy})`;
  } else if (view === 1 && !isTee) {
    transform = "translate(200 262) rotate(-7) scale(.9) translate(-200 -250)";
  }

  return (
    <svg viewBox="0 0 400 500" className={className} role="img" aria-label={title} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={b1} />
          <stop offset="1" stopColor={b2} />
        </linearGradient>
        <radialGradient id={`sh${uid}`}>
          <stop offset="0" stopColor="#000" stopOpacity=".12" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      {!bare && <rect width="400" height="500" fill={`url(#bg${uid})`} />}
      
      {view !== 2 && <ellipse cx="200" cy={SHADOW_Y[family]} rx="150" ry="16" fill={`url(#sh${uid})`} />}
      <g transform={transform || undefined}>
        <g transform={BASE[family]}>{shape}</g>
      </g>
      {caption && view !== 2 && (
        <text x="20" y="484" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="1.5" fill="#141618" opacity=".45">{caption}</text>
      )}
    </svg>
  );
}

export const ProductArt = memo(ProductArtBase);
export { SailMark };
