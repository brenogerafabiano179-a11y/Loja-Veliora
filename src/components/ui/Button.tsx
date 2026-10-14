import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

type Variant = "primary" | "anil" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bone hover:bg-ink/85",
  anil: "bg-anil text-white hover:bg-anil/90",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-bone",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-bone text-ink hover:bg-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[11px]",
  md: "h-12 px-6 text-[12px]",
  lg: "h-[52px] px-8 text-[12px]",
};

/** Botão da marca: cantos retos, rótulo pequeno espaçado. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, fullWidth, leftIcon, rightIcon, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "group relative inline-flex select-none items-center justify-center gap-2.5 font-medium uppercase tracking-[0.16em]",
        "transition-colors duration-300 active:opacity-80",
        "disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon && <span className="transition-transform duration-300 group-hover:translate-x-1">{rightIcon}</span>}
    </button>
  ),
);
Button.displayName = "Button";
