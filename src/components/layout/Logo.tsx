import { cn } from "@/lib/format";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return <span className={cn("wordmark text-[17px] leading-none sm:text-[19px]", light ? "text-bone" : "text-ink", className)}>Veliora</span>;
}
