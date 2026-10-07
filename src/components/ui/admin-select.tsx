"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

export type AdminSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

/**
 * Select kustom panel admin (R13c): bukan `<select>` native. Trigger setinggi
 * kontrol form (44px) membuka panel yang meluncur turun dengan halus
 * (opacity + translateY), item aktif tersorot, tanda centang untuk pilihan
 * aktif, dan keyboard penuh — Enter/Space/Panah membuka, Panah/Home/End
 * berpindah, Enter memilih, Esc/Tab menutup, ketik huruf untuk melompat.
 *
 * Nilai tetap terkirim ke Server Action lewat input tersembunyi, jadi
 * formulir admin tidak perlu tahu apa pun soal komponen ini.
 */
export function AdminSelect({
  name,
  defaultValue,
  value: controlledValue,
  onChange,
  options,
  placeholder,
  disabled = false,
  className,
  id,
  ariaLabel,
}: {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  const [internal, setInternal] = useState(controlledValue ?? defaultValue ?? "");
  const value = controlledValue !== undefined ? controlledValue : internal;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listId = useId();

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  const choose = (option: AdminSelectOption) => {
    if (option.disabled) return;
    if (controlledValue === undefined) setInternal(option.value);
    onChange?.(option.value);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  // Tutup saat pointer menekan di luar komponen.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const openList = () => {
    if (disabled) return;
    const index = options.findIndex((option) => option.value === value);
    setActive(index >= 0 ? index : 0);
    setOpen(true);
  };

  const onTriggerKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      let next = active;
      for (let i = 0; i < options.length; i += 1) {
        next = (next + direction + options.length) % options.length;
        if (!options[next]?.disabled) break;
      }
      setActive(next);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActive(options.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[active];
      if (option) choose(option);
      return;
    }
    // Ketik huruf: lompat ke opsi pertama yang berawalan huruf itu.
    if (event.key.length === 1 && /\S/.test(event.key)) {
      const char = event.key.toLowerCase();
      const index = options.findIndex(
        (option) => !option.disabled && option.label.toLowerCase().startsWith(char)
      );
      if (index >= 0) setActive(index);
    }
  };

  return (
    <div
      ref={rootRef}
      data-admin-select
      data-name={name ?? undefined}
      className={cn("relative", className)}
    >
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        data-admin-select-trigger
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-opt-${active}` : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onTriggerKey}
        className={cn(
          "focus-ring flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-sm border border-line-strong bg-canvas px-3 text-left text-sm text-ink transition-colors",
          "hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        <span className={cn("min-w-0 truncate", !selected && "text-ink-3")}>
          {selected ? selected.label : (placeholder ?? "")}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "size-4 shrink-0 text-ink-3 transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        id={listId}
        role="listbox"
        aria-label={ariaLabel}
        data-open={open || undefined}
        className={cn(
          "absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-auto rounded-md border border-line bg-surface p-1 shadow-lg",
          "origin-top transition-[opacity,translate,transform] duration-200 ease-out motion-reduce:transition-none",
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1 opacity-0"
        )}
      >
        {options.map((option, index) => (
          <div
            key={option.value || `kosong-${index}`}
            id={`${listId}-opt-${index}`}
            role="option"
            aria-selected={option.value === value}
            aria-disabled={option.disabled || undefined}
            data-active={index === active || undefined}
            onPointerEnter={() => setActive(index)}
            onClick={() => choose(option)}
            className={cn(
              "flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-sm px-3 text-left text-sm text-ink",
              index === active && "bg-hover-surface",
              option.disabled && "cursor-default opacity-50"
            )}
          >
            <span className="min-w-0 truncate">{option.label}</span>
            {option.value === value ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 shrink-0 text-primary"
              >
                <path d="m5 12 5 5 9-9" />
              </svg>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
