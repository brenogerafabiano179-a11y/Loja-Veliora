// ==========================================================
// ESTAMPAS VELIORA — Drop 01 "Maré Cheia"
// Cada estampa existe em duas formas:
//  - Graphic: arte localizada (peito/costas) num quadro de 120×120
//  - PatternDef: corrido (all-over) para camisas resort, tactel e chinelos
// ==========================================================

export type PrintId = "mare" | "rosa" | "coqueiral" | "sol" | "velas" | "fauna";

export const PRINTS: Record<PrintId, { name: string; story: string }> = {
  mare: { name: "Maré Cheia", story: "Quatro linhas de onda no traço de um mapa de marés." },
  rosa: { name: "Rosa dos Ventos", story: "A bússola dos barcos de pesca, com os pontos em português." },
  coqueiral: { name: "Coqueiral", story: "Três coqueiros no fim de tarde, recortados contra o sol." },
  sol: { name: "Sol de Costa", story: "O pôr do sol listrado das placas de praia dos anos 70." },
  velas: { name: "Vela Latina", story: "Velas triangulares de jangada alinhadas no horizonte." },
  fauna: { name: "Fauna Atlântica", story: "Cardume de peixes do litoral, desenhado à mão livre." },
};

type G = { ink: string; accent: string; uid: string };

/* ---------- artes localizadas (centradas em 0,0, ~120 de largura) ---------- */

function Mare({ ink, accent, uid }: G) {
  return (
    <g>
      <clipPath id={`mc${uid}`}><circle r="52" /></clipPath>
      <circle r="56" fill="none" stroke={ink} strokeWidth="3" />
      <g clipPath={`url(#mc${uid})`}>
        {[-26, -8, 10, 28, 46].map((y, i) => (
          <path
            key={y}
            d={`M-70 ${y} q 17 -14 35 0 t 35 0 t 35 0 t 35 0`}
            fill="none"
            stroke={i % 2 ? accent : ink}
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}
        <circle cx="22" cy="-30" r="11" fill={accent} />
      </g>
      <text y="80" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="2.5" fill={ink}>MARÉ CHEIA · 01</text>
    </g>
  );
}

function Rosa({ ink, accent }: G) {
  const pts = (r1: number, r2: number, rot = 0) =>
    Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4 + rot;
      const r = i % 2 ? r2 : r1;
      return `${Math.sin(a) * r},${-Math.cos(a) * r}`;
    }).join(" ");
  return (
    <g>
      <circle r="50" fill="none" stroke={ink} strokeWidth="1.5" strokeDasharray="2 4" />
      <polygon points={pts(50, 12, Math.PI / 8)} fill={accent} opacity=".9" />
      <polygon points={pts(58, 10)} fill={ink} />
      <polygon points="0,-58 6,-10 0,0" fill={accent} />
      <circle r="5" fill={accent} stroke={ink} strokeWidth="2" />
      {[
        ["N", 0, -66], ["S", 0, 74], ["L", 70, 4], ["O", -70, 4],
      ].map(([t, x, y]) => (
        <text key={t as string} x={x as number} y={y as number} textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="13" fill={ink}>{t}</text>
      ))}
    </g>
  );
}

function Palm({ x, s = 1, ink }: { x: number; s?: number; ink: string }) {
  return (
    <g transform={`translate(${x} 30) scale(${s})`}>
      <path d="M0 0 Q4 -40 -4 -78" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />
      {[[-34, -70], [34, -66], [-26, -96], [28, -98], [2, -104]].map(([dx, dy], i) => (
        <path key={i} d={`M-4 -78 Q${dx / 2} ${dy - 18} ${dx} ${dy}`} stroke={ink} strokeWidth="6" fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
}

function Coqueiral({ ink, accent }: G) {
  return (
    <g>
      <circle cy="-20" r="40" fill={accent} />
      <path d="M-62 30 L62 30" stroke={ink} strokeWidth="3" />
      <path d="M-50 40 L50 40 M-34 49 L34 49" stroke={ink} strokeWidth="2" opacity=".7" />
      <Palm x={-30} s={0.9} ink={ink} />
      <Palm x={8} s={1.1} ink={ink} />
      <Palm x={40} s={0.75} ink={ink} />
      <text y="74" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="2.5" fill={ink}>COQUEIRAL</text>
    </g>
  );
}

function Sol({ ink, accent, uid }: G) {
  return (
    <g>
      <clipPath id={`sc${uid}`}><rect x="-60" y="-60" width="120" height="60" /></clipPath>
      <g clipPath={`url(#sc${uid})`}>
        <circle r="56" fill={accent} />
        {[-44, -32, -21, -11].map((y, i) => (
          <rect key={y} x="-60" y={y} width="120" height={3 + i * 1.6} fill={ink} opacity=".95" />
        ))}
      </g>
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI + (i * Math.PI) / 8;
        return <line key={i} x1={Math.cos(a) * 64} y1={Math.sin(a) * 64} x2={Math.cos(a) * 76} y2={Math.sin(a) * 76} stroke={ink} strokeWidth="3" strokeLinecap="round" />;
      })}
      <rect x="-70" y="4" width="140" height="3" fill={ink} />
      <text y="38" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="900" fontSize="30" letterSpacing="1" fill={ink} style={{ fontStretch: "62.5%" }}>VELIORA</text>
      <text y="56" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="3.2" fill={ink}>SOL DE COSTA</text>
    </g>
  );
}

function Sail({ x, y, s, ink, fill }: { x: number; y: number; s: number; ink: string; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 L0 -56 L34 0 Z" fill={fill} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M-14 4 L40 4 L32 14 L-6 14 Z" fill={ink} />
    </g>
  );
}

function Velas({ ink, accent }: G) {
  return (
    <g>
      <Sail x={-50} y={10} s={0.8} ink={ink} fill="none" />
      <Sail x={-14} y={16} s={1.15} ink={ink} fill={accent} />
      <Sail x={36} y={8} s={0.7} ink={ink} fill="none" />
      <path d="M-66 34 q 11 -8 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0" stroke={ink} strokeWidth="3" fill="none" />
      <text y="64" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="2.5" fill={ink}>VELA LATINA</text>
    </g>
  );
}

export function Fish({ x = 0, y = 0, s = 1, r = 0, fill, ink }: { x?: number; y?: number; s?: number; r?: number; fill: string; ink: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M-20 0 Q-6 -12 12 -2 L22 -10 L20 0 L22 10 L12 2 Q-6 12 -20 0 Z" fill={fill} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="-12" cy="-1.5" r="1.6" fill={ink} />
      <path d="M-4 -6 Q-1 0 -4 6" stroke={ink} strokeWidth="1.2" fill="none" />
    </g>
  );
}

function Fauna({ ink, accent }: G) {
  return (
    <g>
      <Fish s={2.6} fill={accent} ink={ink} />
      <Fish x={-38} y={-40} s={1.1} r={-12} fill="none" ink={ink} />
      <Fish x={42} y={40} s={1.2} r={10} fill="none" ink={ink} />
      <text y="74" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="2.5" fill={ink}>FAUNA ATLÂNTICA</text>
    </g>
  );
}

export function PrintGraphic({ print, ...g }: G & { print: PrintId }) {
  switch (print) {
    case "mare": return <Mare {...g} />;
    case "rosa": return <Rosa {...g} />;
    case "coqueiral": return <Coqueiral {...g} />;
    case "sol": return <Sol {...g} />;
    case "velas": return <Velas {...g} />;
    case "fauna": return <Fauna {...g} />;
  }
}

/* ---------- estampas corridas ---------- */

export function PatternDef({ id, print, base, ink, accent, scale = 1 }: { id: string; print: PrintId; base: string; ink: string; accent: string; scale?: number }) {
  const t = `scale(${scale})`;
  switch (print) {
    case "fauna":
      return (
        <pattern id={id} width="92" height="70" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="92" height="70" fill={base} />
          <Fish x={22} y={18} s={0.9} r={-8} fill={accent} ink={ink} />
          <Fish x={70} y={52} s={0.9} r={170} fill="none" ink={ink} />
          <Fish x={68} y={14} s={0.5} r={12} fill={ink} ink={ink} />
          <circle cx="30" cy="54" r="2" fill={ink} opacity=".5" />
        </pattern>
      );
    case "velas":
      return (
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="56" height="56" fill={base} />
          <path d="M12 34 L12 8 L28 34 Z" fill={accent} stroke={ink} strokeWidth="1.4" />
          <path d="M40 58 L40 34 L54 58 Z" fill="none" stroke={ink} strokeWidth="1.4" transform="translate(0 -4)" />
          <path d="M4 38 L32 38" stroke={ink} strokeWidth="2" />
        </pattern>
      );
    case "coqueiral":
      return (
        <pattern id={id} width="60" height="60" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="60" height="60" fill={base} />
          <circle cx="44" cy="16" r="7" fill={accent} />
          <g transform="translate(20 52) scale(.42)"><Palm x={0} ink={ink} /></g>
        </pattern>
      );
    case "mare":
    default:
      return (
        <pattern id={id} width="48" height="24" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="48" height="24" fill={base} />
          <path d="M0 12 q 12 -9 24 0 t 24 0" fill="none" stroke={ink} strokeWidth="2.4" />
          <path d="M0 22 q 12 -9 24 0 t 24 0" fill="none" stroke={accent} strokeWidth="2" opacity=".9" />
        </pattern>
      );
  }
}

/** Símbolo da marca: duas velas formando um V. */
export function SailMark({ color = "currentColor", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M3 5 L15 28 L15 5 Z" fill={color} />
      <path d="M18 11 L18 28 L29 11 Z" fill={color} opacity=".55" />
    </svg>
  );
}
