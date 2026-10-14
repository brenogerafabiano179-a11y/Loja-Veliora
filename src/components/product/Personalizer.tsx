import { useId } from "react";
import type { ArtKind, Custom } from "@/art/ProductArt";
import { FONTS, INK_COLORS, ZONES_BY_KIND } from "@/data/catalog";
import { cn } from "@/lib/format";

type Props = { kind: ArtKind; value: Custom; onChange: (c: Custom) => void; dark?: boolean };

/** Painel de personalização: local, texto, número, letra e cor. */
export function Personalizer({ kind, value, onChange, dark }: Props) {
  const zones = ZONES_BY_KIND[kind];
  const zone = zones.find((z) => z.id === value.zone) ?? zones[0];
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const set = (patch: Partial<Custom>) => onChange({ ...value, ...patch });
  const clean = (t: string) => t.replace(/[^\p{L}\p{N} .&'-]/gu, "");
  const muted = dark ? "text-bone/60" : "text-graphite";
  const field = cn("h-12 w-full border bg-transparent px-3.5 text-[15px] outline-none transition-colors", dark ? "border-bone/30 focus:border-bone" : "border-line bg-white focus:border-ink");

  return (
    <div className="space-y-5">
      {zones.length > 1 && (
        <div>
          <p className={cn("mb-2 text-[12px]", muted)}>Onde vai</p>
          <div className="flex gap-2">
            {zones.map((z) => {
              const on = value.zone === z.id;
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => set({ zone: z.id, text: value.text.slice(0, z.max), number: z.withNumber ? value.number : undefined })}
                  className={cn(
                    "flex-1 border px-3 py-2.5 text-left transition-colors",
                    on ? (dark ? "border-bone bg-bone text-ink" : "border-ink bg-ink text-bone") : dark ? "border-bone/25 hover:border-bone/60" : "border-line hover:border-ink",
                  )}
                >
                  <span className="block text-[13px]">{z.label}</span>
                  <span className={cn("block text-[11px]", on ? "opacity-70" : muted)}>{z.hint}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={cn("grid gap-2", zone.withNumber ? "grid-cols-[1fr_84px]" : "grid-cols-1")}>
        <div className="min-w-0">
          <label htmlFor={`txt${id}`} className={cn("mb-2 flex justify-between text-[12px]", muted)}>
            <span>{zone.withNumber ? "Nome" : "Texto"}</span>
            <span className="tabular-nums">{value.text.length}/{zone.max}</span>
          </label>
          <input id={`txt${id}`} value={value.text} maxLength={zone.max} onChange={(e) => set({ text: clean(e.target.value).slice(0, zone.max) })} placeholder={zone.max <= 4 ? "Ex.: BGF" : "Ex.: Breno"} className={field} />
        </div>
        {zone.withNumber && (
          <div>
            <label htmlFor={`num${id}`} className={cn("mb-2 block text-[12px]", muted)}>Número</label>
            <input id={`num${id}`} inputMode="numeric" value={value.number ?? ""} onChange={(e) => set({ number: e.target.value.replace(/\D/g, "").slice(0, 2) })} placeholder="10" className={cn(field, "text-center tabular-nums")} />
          </div>
        )}
      </div>

      <div>
        <p className={cn("mb-2 text-[12px]", muted)}>Letra</p>
        <div className="grid grid-cols-3 gap-2">
          {FONTS.map((f) => {
            const on = value.font === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => set({ font: f.id })}
                className={cn("h-14 overflow-hidden border px-1 transition-colors", on ? (dark ? "border-bone" : "border-ink") : dark ? "border-bone/25 hover:border-bone/60" : "border-line hover:border-ink")}
              >
                <span className={cn("block truncate text-[20px] leading-none", f.sample)}>{(value.text || "Veliora").slice(0, 8)}</span>
                <span className={cn("mt-1 block text-[10px] uppercase tracking-[0.12em]", muted)}>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={cn("mb-2 text-[12px]", muted)}>Cor: <span className={dark ? "text-bone" : "text-ink"}>{INK_COLORS.find((c) => c.hex === value.color)?.name}</span></p>
        <div className="flex gap-2.5">
          {INK_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              aria-label={c.name}
              onClick={() => set({ color: c.hex })}
              className={cn("h-7 w-7 rounded-full border transition-shadow", dark ? "border-bone/30" : "border-ink/15", value.color === c.hex && (dark ? "shadow-[0_0_0_2px_rgb(20_20_19),0_0_0_3px_rgb(250_250_248)]" : "shadow-[0_0_0_2px_rgb(var(--bone)),0_0_0_3px_rgb(var(--ink))]"))}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
