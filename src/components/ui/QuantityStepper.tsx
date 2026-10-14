import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/format";

type Props = { value: number; onChange: (v: number) => void; min?: number; max?: number; size?: "sm" | "md" };

export function QuantityStepper({ value, onChange, min = 1, max = 10, size = "md" }: Props) {
  const h = size === "sm" ? "h-8" : "h-12";
  const btn = "flex h-full w-9 items-center justify-center text-graphite transition-colors hover:text-ink disabled:opacity-30";
  return (
    <div className={cn("inline-flex shrink-0 items-center border border-line bg-white", h)}>
      <button type="button" aria-label="Diminuir quantidade" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-6 text-center text-[13px] tabular-nums">{value}</span>
      <button type="button" aria-label="Aumentar quantidade" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
