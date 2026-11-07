import type { Field } from "../config/diseases";

interface Props {
  field: Field;
  value: string;
  min: number;
  placeholder: string;
  onChange: (v: string) => void;
}

/**
 * Text input that only accepts numeric characters: no spinner arrows, no
 * scroll-wheel changes. Integer fields reject ".", negatives only where the
 * training data has negative values.
 */
export default function NumberField({ field, value, min, placeholder, onChange }: Props) {
  const integer = field.step === 1;
  const negative = min < 0;
  const pattern = new RegExp(`^${negative ? "-?" : ""}${integer ? "\\d*" : "\\d*\\.?\\d*"}$`);

  return (
    <input
      type="text"
      inputMode={integer && !negative ? "numeric" : "decimal"}
      autoComplete="off"
      spellCheck={false}
      value={value}
      placeholder={placeholder}
      aria-label={field.label}
      onChange={(e) => {
        const v = e.target.value.replace(",", ".");
        if (pattern.test(v)) onChange(v);
      }}
    />
  );
}
