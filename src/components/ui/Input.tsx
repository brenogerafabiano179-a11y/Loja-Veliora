import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/format";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

/** Campo com rótulo flutuante e linha inferior. */
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className, id, ...rest }, ref) => {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className={cn("relative", error && "animate-shake")}>
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          aria-invalid={!!error}
          className={cn(
            "peer h-14 w-full border bg-white px-4 pb-2 pt-6 text-[15px] text-ink outline-none transition-colors",
            "focus:border-ink",
            error ? "border-coral" : "border-line",
          )}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-graphite transition-all duration-200 peer-focus:top-4 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px]"
        >
          {label}
        </label>
      </div>
      {(error || hint) && <p className={cn("mt-1.5 text-xs", error ? "text-coral" : "text-graphite")}>{error ?? hint}</p>}
    </div>
  );
});
Input.displayName = "Input";
