// Utilidades de cor usadas pelas ilustrações
function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

export function mix(hex: string, target: string, t: number) {
  const a = parse(hex), b = parse(target);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

export const darken = (h: string, t = 0.22) => mix(h, "#000000", t);
export const lighten = (h: string, t = 0.22) => mix(h, "#ffffff", t);

export const luminance = (h: string) => {
  const [r, g, b] = parse(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

/** Cor de tinta que aparece bem sobre o tecido. */
export const inkOn = (h: string) => (luminance(h) > 0.55 ? "#141618" : "#EFECE6");
/** Cor de destaque da estampa sobre o tecido. */
export const accentOn = (h: string) => {
  const l = luminance(h);
  if (l > 0.55) return "#16324F";
  return h.toLowerCase() === "#16324f" || h.toLowerCase() === "#23306e" ? "#B9A47E" : "#B9A47E";
};
/** Contorno visível mesmo em peças muito claras. */
export const edgeOf = (h: string) => (luminance(h) > 0.8 ? mix(h, "#7c7468", 0.5) : darken(h, 0.32));
