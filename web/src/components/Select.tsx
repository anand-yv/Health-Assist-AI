import { useEffect, useRef, useState } from "react";

interface Option { value: number; label: string }

/** Custom dropdown: styled list, keyboard support (↑ ↓ Enter Esc), closes on outside click. */
export default function Select({ options, value, label, onChange }: {
  options: Option[]; value: string; label: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const selected = options.findIndex((o) => String(o.value) === value);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const show = () => { setActive(Math.max(selected, 0)); setOpen(true); };
  const pick = (i: number) => { onChange(String(options[i].value)); setOpen(false); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return show();
      setActive((a) => Math.min(options.length - 1, Math.max(0, a + (e.key === "ArrowDown" ? 1 : -1))));
    } else if ((e.key === "Enter" || e.key === " ") && open) {
      e.preventDefault();
      pick(active);
    }
  };

  return (
    <div className="dd" ref={root} onKeyDown={onKey}>
      <button type="button" className="dd-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        onClick={() => (open ? setOpen(false) : show())}>
        <span className={selected < 0 ? "dd-ph" : ""}>{selected < 0 ? "Select" : options[selected].label}</span>
        <svg viewBox="0 0 10 6" aria-hidden><path d="M1 1l4 4 4-4" /></svg>
      </button>
      {open && (
        <ul className="dd-list" role="listbox" aria-label={label}>
          {options.map((o, i) => (
            <li key={o.value} role="option" aria-selected={i === selected} className={i === active ? "act" : ""}
              onPointerEnter={() => setActive(i)} onClick={() => pick(i)}>
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
