// ==========================================================
// CATÁLOGO VELIORA (mock) — substitua por API quando houver backend
// Fotos em /public/img. Produtos sem foto usam o desenho técnico.
// ==========================================================
import type { ArtKind, FontId, ZoneId } from "@/art/ProductArt";
import type { PrintId } from "@/art/prints";

export const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}.webp`;

export type CategoryId = "camisas" | "bermudas" | "bones" | "tenis" | "sapatenis" | "chinelos";
export type Category = { id: CategoryId; name: string; plural: string; blurb: string; cover?: string; flat?: { kind: ArtKind; color: string } };

export const CATEGORIES: Category[] = [
  { id: "camisas", name: "Camisa", plural: "Camisas", blurb: "Algodão pesado e estampas próprias", cover: img("ess-off-1") },
  { id: "bermudas", name: "Bermuda", plural: "Bermudas", blurb: "Jeans lavado à mão", cover: img("cais-1") },
  { id: "tenis", name: "Tênis", plural: "Tênis", blurb: "Couro e sola vulcanizada", cover: img("court-1") },
  { id: "bones", name: "Boné", plural: "Bonés", blurb: "Bordado com o seu nome", flat: { kind: "cap-dad", color: "#E9E4D8" } },
  { id: "sapatenis", name: "Sapatênis", plural: "Sapatênis", blurb: "Couro e camurça", flat: { kind: "sapatenis-couro", color: "#8A5A3C" } },
  { id: "chinelos", name: "Chinelo", plural: "Chinelos", blurb: "Slide e de dedo", flat: { kind: "slide", color: "#2A2A28" } },
];

export type Color = { name: string; hex: string; images?: string[] };
export type Zone = { id: ZoneId; label: string; hint: string; max: number; withNumber?: boolean };
/** Foto de costas onde a personalização é desenhada (valores em % da imagem). */
export type BackShot = { src: string; cx: number; nameY: number; numY: number };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  line: "Masculino" | "Feminino" | "Unissex";
  kind: ArtKind;
  print?: PrintId;
  printStory?: { name: string; story: string };
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  badge?: "Novo" | "Mais vendido" | "Últimas peças" | "Edição limitada";
  colors: Color[];
  sizes: string[];
  soldOut?: string[];
  lowStock?: string[];
  popularity: number;
  fresh: number;
  description: string;
  details: string[];
  fit: string;
  back?: Record<string, BackShot>; // por nome de cor
};

const TOPS = ["P", "M", "G", "GG", "XG"];
const FEM = ["PP", "P", "M", "G", "GG"];
const BOTTOMS = ["38", "40", "42", "44", "46", "48"];
const SHOES = ["37", "38", "39", "40", "41", "42", "43", "44"];
const FLIPS = ["35/36", "37/38", "39/40", "41/42", "43/44"];
const many = (...n: string[]) => n.map(img);

export const PRODUCTS: Product[] = [
  // ---------------- CAMISAS ----------------
  {
    id: "v01", slug: "camiseta-essencial", name: "Camiseta Essencial", category: "camisas", line: "Masculino", kind: "tee",
    price: 149, rating: 4.9, reviews: 312, badge: "Mais vendido",
    colors: [
      { name: "Preto", hex: "#1C1C1B", images: many("ess-preto-1", "ess-preto-2", "ess-preto-3") },
      { name: "Off-white", hex: "#EDEBE3", images: many("ess-off-1", "ess-off-2", "ess-off-3") },
      { name: "Marinho", hex: "#26324F", images: many("ess-marinho-1") },
      { name: "Verde Mata", hex: "#3F4A36", images: many("ess-verde-1") },
    ],
    back: {
      Preto: { src: img("ess-preto-2"), cx: 45, nameY: 63, numY: 77 },
      "Off-white": { src: img("ess-off-2"), cx: 47, nameY: 51, numY: 65 },
    },
    sizes: TOPS, soldOut: ["XG"], popularity: 100, fresh: 6,
    description: "A base de tudo. Algodão penteado de 200 g/m², gola canelada que não laceia e caimento reto levemente solto. Personalize as costas com nome e número.",
    details: ["100% algodão penteado 30.1", "Malha 200 g/m²", "Gola canelada 2 cm com reforço", "Pré-encolhida"],
    fit: "Modelagem reta. O modelo tem 1,82 m e veste M.",
  },
  {
    id: "v02", slug: "camiseta-oversized-verao", name: "Camiseta Oversized Verão", category: "camisas", line: "Masculino", kind: "oversized",
    price: 169, rating: 4.8, reviews: 148, badge: "Novo",
    colors: [
      { name: "Amarelo Sol", hex: "#E9D27A", images: many("ov-amarelo-1", "ov-amarelo-2", "ov-amarelo-3") },
      { name: "Urucum", hex: "#8E2B2E", images: many("ov-vermelho-1", "ov-vermelho-2") },
      { name: "Verde Água", hex: "#7FBFA6", images: many("ov-agua-1") },
      { name: "Céu", hex: "#A9D4E6", images: many("ov-ceu-1") },
    ],
    sizes: TOPS, lowStock: ["P"], popularity: 88, fresh: 11,
    description: "Corte amplo, ombro caído e malha pesada tingida peça a peça. As cores mudam levemente de uma camiseta para outra.",
    details: ["100% algodão 26.1", "Malha 240 g/m²", "Tingimento peça a peça", "Ombro caído"],
    fit: "Corte oversized. Para um caimento mais justo, peça um tamanho abaixo.",
  },
  {
    id: "v03", slug: "camiseta-sol-de-costa", name: "Camiseta Sol de Costa", category: "camisas", line: "Masculino", kind: "oversized",
    print: "sol", printStory: { name: "Sol de Costa", story: "O degradê do fim de tarde em Itaúnas, impresso em sublimação que acompanha o tecido." },
    price: 189, rating: 4.9, reviews: 96, badge: "Edição limitada",
    colors: [
      { name: "Fim de tarde", hex: "#E9A25B", images: many("sol-areia-1", "sol-areia-2") },
      { name: "Noite", hex: "#2B1F4A", images: many("sol-noite-1") },
    ],
    sizes: TOPS, popularity: 94, fresh: 12,
    description: "A estampa que abre o Drop 01. Cada peça sai com um degradê único, do creme ao laranja.",
    details: ["100% algodão 26.1", "Malha 220 g/m²", "Sublimação parcial", "Edição limitada de 300 peças"],
    fit: "Corte oversized.",
  },
  {
    id: "v04", slug: "camiseta-onca-pintada", name: "Camiseta Onça-pintada", category: "camisas", line: "Masculino", kind: "tee",
    print: "rosa", printStory: { name: "Onça-pintada", story: "Ilustração a nanquim da onça do Pantanal, em silk de uma cor." },
    price: 169, rating: 4.7, reviews: 54,
    colors: [{ name: "Off-white", hex: "#EDEBE3", images: many("onca-1") }],
    sizes: TOPS, popularity: 70, fresh: 9,
    description: "Traço fino e uma cor só. A estampa ocupa o peito inteiro e fica melhor com a bermuda clara.",
    details: ["100% algodão penteado", "Malha 200 g/m²", "Silk base d'água", "Etiqueta interna estampada"],
    fit: "Modelagem reta.",
  },
  {
    id: "v05", slug: "camiseta-listrada-farol", name: "Camiseta Listrada Farol", category: "camisas", line: "Masculino", kind: "tee",
    print: "velas", printStory: { name: "Farol", story: "Listras nas cores das boias de sinalização do porto." },
    price: 179, rating: 4.8, reviews: 41, badge: "Novo",
    colors: [{ name: "Listrado", hex: "#D8D3C6", images: many("farol-1") }],
    sizes: TOPS, popularity: 66, fresh: 10,
    description: "Faixa listrada no peito em fio tinto, sem estampa: as listras são tecidas.",
    details: ["100% algodão", "Listras em fio tinto", "Malha 210 g/m²", "Barra com costura dupla"],
    fit: "Modelagem reta.",
  },
  {
    id: "v06", slug: "camiseta-flor-de-restinga", name: "Camiseta Flor de Restinga", category: "camisas", line: "Feminino", kind: "tee",
    print: "coqueiral", printStory: { name: "Flor de Restinga", story: "Flores da vegetação de dunas, pintadas em aquarela e bordadas à mão no centro." },
    price: 179, rating: 4.9, reviews: 132, badge: "Mais vendido",
    colors: [{ name: "Off-white", hex: "#EFEBE1", images: many("flor-1", "flor-2", "flor-3", "flor-4") }],
    sizes: FEM, lowStock: ["M"], popularity: 96, fresh: 8,
    description: "Corte levemente amplo, manga dobrada e a estampa floral que virou assinatura da marca.",
    details: ["100% algodão penteado", "Malha 180 g/m²", "Estampa com miolo bordado", "Manga dobrada costurada"],
    fit: "Corte solto. A modelo tem 1,70 m e veste P.",
  },
  {
    id: "v07", slug: "camiseta-cisne", name: "Camiseta Cisne", category: "camisas", line: "Feminino", kind: "tee",
    print: "fauna", printStory: { name: "Cisne", story: "Um único traço branco, desenhado para parecer recortado em papel." },
    price: 169, rating: 4.8, reviews: 87,
    colors: [
      { name: "Água", hex: "#4E9C9A", images: many("cisne-agua-1", "cisne-agua-2") },
      { name: "Marinho", hex: "#242F48", images: many("cisne-marinho-1", "cisne-marinho-2") },
    ],
    sizes: FEM, popularity: 84, fresh: 7,
    description: "Estampa grande em silk branco sobre malha tingida. Uma das peças mais pedidas para presente.",
    details: ["100% algodão penteado", "Malha 180 g/m²", "Silk base d'água", "Tingimento reativo"],
    fit: "Modelagem regular.",
  },
  {
    id: "v08", slug: "baby-look-essencial", name: "Baby Look Essencial", category: "camisas", line: "Feminino", kind: "tee",
    price: 129, rating: 4.8, reviews: 204,
    colors: [
      { name: "Preto", hex: "#1C1C1B", images: many("baby-preto-1", "baby-preto-2", "baby-preto-3", "baby-preto-4") },
      { name: "Off-white", hex: "#EDEBE3", images: many("baby-off-1", "baby-off-2", "baby-off-3") },
      { name: "Céu", hex: "#A9CDE3", images: many("baby-ceu-1") },
      { name: "Urucum", hex: "#B5302B", images: many("baby-vermelho-1") },
      { name: "Rosa Concha", hex: "#E9B7BE", images: many("baby-rosa-1") },
    ],
    sizes: FEM, soldOut: ["PP"], popularity: 90, fresh: 5,
    description: "A camiseta do dia a dia, um pouco mais curta e solta no corpo.",
    details: ["100% algodão penteado", "Malha 170 g/m²", "Gola careca fina", "Pré-encolhida"],
    fit: "Modelagem regular, comprimento curto.",
  },
  {
    id: "v09", slug: "camiseta-pima-feminina", name: "Camiseta Pima", category: "camisas", line: "Feminino", kind: "tee",
    price: 159, compareAt: 189, rating: 4.7, reviews: 76,
    colors: [
      { name: "Mescla", hex: "#8F9190", images: many("pima-cinza-1", "pima-cinza-2") },
      { name: "Menta", hex: "#9FDCC0", images: many("pima-menta-1") },
      { name: "Terracota", hex: "#B9744F", images: many("pima-terra-1") },
      { name: "Marinho", hex: "#2A3550", images: many("pima-marinho-1", "pima-marinho-2") },
      { name: "Amarelo", hex: "#EDD884", images: many("pima-amarelo-1", "pima-amarelo-2") },
      { name: "Rosa", hex: "#EDB6C3", images: many("pima-rosa-1") },
    ],
    sizes: FEM, popularity: 72, fresh: 4,
    description: "Algodão pima peruano de fio longo: mais macio a cada lavagem.",
    details: ["100% algodão pima", "Malha 160 g/m²", "Toque sedoso", "Costuras reforçadas"],
    fit: "Modelagem ajustada.",
  },
  // ---------------- BERMUDAS ----------------
  {
    id: "v10", slug: "bermuda-jeans-cais", name: "Bermuda Jeans Cais", category: "bermudas", line: "Masculino", kind: "shorts-sarja",
    price: 229, rating: 4.8, reviews: 118, badge: "Mais vendido",
    colors: [{ name: "Azul claro", hex: "#8FAFCB", images: many("cais-1", "cais-2", "cais-3") }],
    sizes: BOTTOMS, soldOut: ["48"], popularity: 92, fresh: 6,
    description: "Lavagem clara feita à mão, barra a fio e comprimento logo acima do joelho.",
    details: ["100% algodão", "Denim 11 oz", "Lavagem stone clara", "Barra desfiada"],
    fit: "Cintura regular, perna reta.",
  },
  {
    id: "v11", slug: "bermuda-jeans-ressaca", name: "Bermuda Jeans Ressaca", category: "bermudas", line: "Masculino", kind: "shorts-sarja",
    price: 229, rating: 4.7, reviews: 64,
    colors: [{ name: "Azul médio", hex: "#5F7FA3", images: many("ressaca-1", "ressaca-2", "ressaca-3") }],
    sizes: BOTTOMS, popularity: 78, fresh: 5,
    description: "Lavagem média com desgaste natural nos bolsos. Combina com tudo.",
    details: ["100% algodão", "Denim 12 oz", "Lavagem média", "Botão de metal gravado"],
    fit: "Perna reta.",
  },
  {
    id: "v12", slug: "bermuda-jeans-larga-mare", name: "Bermuda Jeans Larga Maré", category: "bermudas", line: "Masculino", kind: "shorts-sarja",
    price: 249, rating: 4.9, reviews: 51, badge: "Novo",
    colors: [{ name: "Azul lavado", hex: "#6D8FB1", images: many("mare-1", "mare-2", "mare-3") }],
    sizes: BOTTOMS, lowStock: ["40"], popularity: 86, fresh: 11,
    description: "Modelagem larga, gancho alto e barra no meio da canela. A bermuda do Drop 01.",
    details: ["100% algodão", "Denim 12 oz", "Modelagem larga", "Bolso relógio"],
    fit: "Corte largo. Se prefere justa, peça um número abaixo.",
  },
  {
    id: "v13", slug: "bermuda-jeans-pier", name: "Bermuda Jeans Píer", category: "bermudas", line: "Masculino", kind: "shorts-sarja",
    price: 219, compareAt: 259, rating: 4.6, reviews: 39,
    colors: [{ name: "Azul médio", hex: "#5E7DA0", images: many("pier-1", "pier-2", "pier-3") }],
    sizes: BOTTOMS, popularity: 64, fresh: 3,
    description: "A mais curta da linha. Perfeita para o fim de semana na praia.",
    details: ["98% algodão, 2% elastano", "Denim com elastano", "Barra 15 cm", "Bolsos faca"],
    fit: "Perna reta, mais curta.",
  },
  {
    id: "v14", slug: "bermuda-jeans-dunas", name: "Bermuda Jeans Dunas", category: "bermudas", line: "Masculino", kind: "shorts-sarja",
    price: 229, rating: 4.8, reviews: 47,
    colors: [{ name: "Azul vintage", hex: "#7192B5", images: many("dunas-1", "dunas-2", "dunas-3") }],
    sizes: BOTTOMS, popularity: 70, fresh: 8,
    description: "Lavagem vintage com bigodes marcados e barra virada.",
    details: ["100% algodão", "Denim 11 oz", "Lavagem vintage", "Barra virada costurada"],
    fit: "Perna reta.",
  },
  // ---------------- TÊNIS ----------------
  {
    id: "v15", slug: "tenis-court-branco", name: "Tênis Court Branco", category: "tenis", line: "Unissex", kind: "court",
    price: 449, rating: 4.9, reviews: 167, badge: "Mais vendido",
    colors: [{ name: "Branco", hex: "#F3F2EE", images: many("court-1", "court-2") }],
    sizes: SHOES, soldOut: ["37"], lowStock: ["44"], popularity: 98, fresh: 7,
    description: "Couro napa, sola vulcanizada e forro de algodão. Grave suas iniciais no calcanhar.",
    details: ["Cabedal em couro bovino napa", "Sola de borracha vulcanizada", "Palmilha de látex removível", "Feito em Franca/SP"],
    fit: "Forma regular. Use seu número de sempre.",
  },
  {
    id: "v16", slug: "tenis-runner-mare", name: "Tênis Runner Maré", category: "tenis", line: "Unissex", kind: "runner",
    price: 499, rating: 4.8, reviews: 42, badge: "Novo",
    colors: [{ name: "Areia", hex: "#D9CFBD" }, { name: "Grafite", hex: "#3A3B3D" }],
    sizes: SHOES, popularity: 74, fresh: 12,
    description: "Entressola em EVA, cabedal em tela e camurça. Leve para o dia todo.",
    details: ["Cabedal em tela e camurça", "Entressola EVA injetado", "Solado de borracha", "Peso: 290 g (nº 41)"],
    fit: "Forma levemente justa.",
  },
  // ---------------- BONÉS ----------------
  {
    id: "v17", slug: "bone-dad-hat", name: "Boné Dad Hat", category: "bones", line: "Unissex", kind: "cap-dad",
    price: 139, rating: 4.9, reviews: 221, badge: "Mais vendido",
    colors: [{ name: "Cru", hex: "#E9E4D8" }, { name: "Preto", hex: "#232322" }, { name: "Marinho", hex: "#27324D" }, { name: "Areia", hex: "#C8B796" }],
    sizes: ["Único"], popularity: 95, fresh: 4,
    description: "Sarja lavada, aba curva e copa baixa. Troque o bordado da frente pelo seu nome.",
    details: ["100% algodão sarjado", "Fecho de fivela metálica", "6 gomos com ilhoses bordados", "Bordado 3D"],
    fit: "Tamanho único ajustável (54 a 61 cm).",
  },
  {
    id: "v18", slug: "bone-trucker", name: "Boné Trucker", category: "bones", line: "Unissex", kind: "cap-trucker",
    price: 149, rating: 4.7, reviews: 63,
    colors: [{ name: "Preto", hex: "#232322" }, { name: "Marinho", hex: "#27324D" }],
    sizes: ["Único"], popularity: 68, fresh: 6,
    description: "Frente em espuma para bordado grande e tela respirável atrás.",
    details: ["Frente em espuma", "Traseira em tela", "Fecho snapback", "Aba curva"],
    fit: "Tamanho único ajustável.",
  },
  // ---------------- SAPATÊNIS ----------------
  {
    id: "v19", slug: "sapatenis-couro-porto", name: "Sapatênis Couro Porto", category: "sapatenis", line: "Masculino", kind: "sapatenis-couro",
    price: 389, rating: 4.8, reviews: 73,
    colors: [{ name: "Caramelo", hex: "#8A5A3C" }, { name: "Preto", hex: "#262422" }],
    sizes: SHOES, lowStock: ["39"], popularity: 76, fresh: 5,
    description: "Couro liso com costura mocassim na biqueira. Monograma gravado no calcanhar.",
    details: ["Couro bovino liso", "Costura mocassim aparente", "Sola de borracha 2 cm", "Palmilha acolchoada"],
    fit: "Forma regular.",
  },
  {
    id: "v20", slug: "sapatenis-camurca-brisa", name: "Sapatênis Camurça Brisa", category: "sapatenis", line: "Masculino", kind: "sapatenis-camurca",
    price: 349, compareAt: 399, rating: 4.7, reviews: 41, badge: "Últimas peças",
    colors: [{ name: "Areia", hex: "#BBA889" }, { name: "Cinza", hex: "#8B8984" }],
    sizes: SHOES, soldOut: ["38", "43"], popularity: 62, fresh: 3,
    description: "Camurça macia, sola clara e dois ilhoses.",
    details: ["Camurça bovina", "Sola de borracha natural", "Cadarço encerado", "Forro em couro"],
    fit: "Forma regular.",
  },
  // ---------------- CHINELOS ----------------
  {
    id: "v21", slug: "chinelo-slide", name: "Chinelo Slide", category: "chinelos", line: "Unissex", kind: "slide",
    price: 119, rating: 4.9, reviews: 188, badge: "Mais vendido",
    colors: [{ name: "Preto", hex: "#2A2A28" }, { name: "Cru", hex: "#E6E1D5" }],
    sizes: FLIPS, popularity: 91, fresh: 7,
    description: "Palmilha anatômica e tira larga com o seu nome em relevo.",
    details: ["EVA injetado", "Palmilha anatômica", "Tira em relevo", "Solado antiderrapante"],
    fit: "Numeração dupla. Na dúvida, pegue a maior.",
  },
  {
    id: "v22", slug: "chinelo-de-dedo-mare", name: "Chinelo de Dedo Maré", category: "chinelos", line: "Unissex", kind: "flipflop", print: "mare",
    price: 89, rating: 4.7, reviews: 95,
    colors: [{ name: "Areia", hex: "#CDBB98" }, { name: "Marinho", hex: "#27324D" }],
    sizes: FLIPS, popularity: 66, fresh: 9,
    description: "Palmilha com a onda do Drop 01 e tiras de borracha macia.",
    details: ["Borracha natural", "Palmilha estampada", "Tiras macias", "Solado com textura"],
    fit: "Numeração dupla.",
  },
];

// ---- personalização ----
export const PERSONALIZATION_PRICE = 29;

export const ZONES_BY_KIND: Record<ArtKind, Zone[]> = {
  tee: [
    { id: "costas", label: "Costas", hint: "Nome e número", max: 12, withNumber: true },
    { id: "peito", label: "Peito", hint: "Iniciais bordadas", max: 4 },
  ],
  oversized: [
    { id: "costas", label: "Costas", hint: "Nome e número", max: 12, withNumber: true },
    { id: "peito", label: "Peito", hint: "Iniciais bordadas", max: 4 },
  ],
  resort: [{ id: "bolso", label: "Bolso", hint: "Iniciais bordadas", max: 3 }],
  "shorts-sarja": [{ id: "perna", label: "Perna", hint: "Bordado", max: 10 }],
  "shorts-moletom": [{ id: "perna", label: "Perna", hint: "Bordado", max: 10 }],
  "shorts-tactel": [{ id: "perna", label: "Perna", hint: "Estampado", max: 10 }],
  "cap-dad": [
    { id: "frente", label: "Frente", hint: "Bordado 3D", max: 10 },
    { id: "lateral", label: "Lateral", hint: "Iniciais", max: 3 },
  ],
  "cap-trucker": [
    { id: "frente", label: "Frente", hint: "Bordado 3D", max: 10 },
    { id: "lateral", label: "Lateral", hint: "Iniciais", max: 3 },
  ],
  "cap-5panel": [{ id: "frente", label: "Frente", hint: "Bordado", max: 8 }],
  court: [
    { id: "calcanhar", label: "Calcanhar", hint: "Iniciais gravadas", max: 3 },
    { id: "lateral", label: "Lateral", hint: "Gravação", max: 8 },
  ],
  runner: [
    { id: "calcanhar", label: "Calcanhar", hint: "Iniciais", max: 3 },
    { id: "lateral", label: "Lateral", hint: "Gravação", max: 8 },
  ],
  "sapatenis-couro": [
    { id: "calcanhar", label: "Calcanhar", hint: "Monograma", max: 3 },
    { id: "lateral", label: "Lateral", hint: "Gravação", max: 8 },
  ],
  "sapatenis-camurca": [
    { id: "calcanhar", label: "Calcanhar", hint: "Monograma", max: 3 },
    { id: "lateral", label: "Lateral", hint: "Gravação", max: 8 },
  ],
  slide: [{ id: "tira", label: "Tira", hint: "Nome em relevo", max: 10 }],
  flipflop: [{ id: "palmilha", label: "Palmilha", hint: "Nome no calcanhar", max: 10 }],
};

export const FONTS: { id: FontId; label: string; sample: string }[] = [
  { id: "bloco", label: "Bloco", sample: "font-sans font-black uppercase [font-stretch:62.5%]" },
  { id: "varsity", label: "Varsity", sample: "font-slab uppercase" },
  { id: "assinatura", label: "Assinatura", sample: "font-script" },
];

export const INK_COLORS: Color[] = [
  { name: "Branco", hex: "#F4F2EC" },
  { name: "Preto", hex: "#161616" },
  { name: "Azul-maré", hex: "#1F3A5C" },
  { name: "Areia", hex: "#CDB990" },
  { name: "Urucum", hex: "#A8392B" },
];

// ---- regras da loja ----
export const FREE_SHIPPING = 399;
export const PIX_OFF = 0.05;
export const COUPONS: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {
  VELIORA10: { type: "percent", value: 10, label: "10% na primeira compra" },
  MARE20: { type: "fixed", value: 20, label: "R$ 20 de desconto" },
};

// ---- consultas ----
export const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const byId = (id: string) => PRODUCTS.find((p) => p.id === id);
export const byCategory = (c: CategoryId) => PRODUCTS.filter((p) => p.category === c);
export const categoryOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;
const withPhotos = PRODUCTS.filter((p) => p.colors[0].images?.length);
export const bestSellers = [...withPhotos].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
export const newArrivals = [...withPhotos].sort((a, b) => b.fresh - a.fresh).slice(0, 8);
export const hasPhotos = (p: Product) => !!p.colors[0].images?.length;
export const PRINTED = PRODUCTS.filter((p) => p.printStory);

/** "Monte o look" — conjuntos com 10% de desconto. */
export const LOOKS = [
  { id: "look-cais", name: "Look Cais", note: "Fim de tarde no píer", cover: img("cais-2"), items: ["v01", "v10", "v17", "v21"] },
  { id: "look-sol", name: "Look Sol de Costa", note: "Para o pôr do sol", cover: img("sol-areia-2"), items: ["v03", "v12", "v15"] },
];
export const LOOK_OFF = 0.1;

export const SIZE_GUIDE: Record<string, { cols: string[]; rows: (string | number)[][] }> = {
  camisas: { cols: ["Tam.", "Peito (cm)", "Compr. (cm)", "Ombro (cm)"], rows: [["PP", 48, 66, 42], ["P", 52, 70, 45], ["M", 54, 72, 47], ["G", 57, 74, 49], ["GG", 60, 76, 51], ["XG", 63, 78, 53]] },
  bermudas: { cols: ["Tam.", "Cintura (cm)", "Quadril (cm)", "Compr. (cm)"], rows: [["38", 76, 98, 48], ["40", 80, 102, 49], ["42", 84, 106, 50], ["44", 88, 110, 51], ["46", 92, 114, 52], ["48", 96, 118, 53]] },
  calcados: { cols: ["Nº", "Palmilha (cm)", "US", "EU"], rows: [["37", 24.5, 5.5, 38], ["38", 25.2, 6.5, 39], ["39", 25.8, 7, 40], ["40", 26.5, 7.5, 41], ["41", 27.2, 8.5, 42], ["42", 27.8, 9, 43], ["43", 28.5, 10, 44], ["44", 29.2, 11, 45]] },
};
export const sizeGuideFor = (c: CategoryId) =>
  c === "camisas" ? SIZE_GUIDE.camisas : c === "bermudas" ? SIZE_GUIDE.bermudas : c === "tenis" || c === "sapatenis" ? SIZE_GUIDE.calcados : null;
