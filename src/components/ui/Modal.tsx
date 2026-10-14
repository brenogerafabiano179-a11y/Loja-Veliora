import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-label={title}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-xl overflow-y-auto bg-bone p-6 sm:p-8"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl">{title}</h2>
              <button aria-label="Fechar" onClick={onClose} className="-mr-2 p-2 text-graphite hover:text-ink"><X className="h-5 w-5" strokeWidth={1.5} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Accordion({ title, children, defaultOpen }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group border-b border-line" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[13px] font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <span className="relative h-2.5 w-2.5">
          <span className="absolute left-0 top-1/2 h-px w-2.5 bg-ink" />
          <span className="absolute left-1/2 top-0 h-2.5 w-px bg-ink transition-transform duration-300 group-open:scale-0" />
        </span>
      </summary>
      <div className="pb-5 text-[14px] leading-relaxed text-graphite">{children}</div>
    </details>
  );
}
