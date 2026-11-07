import { useMemo, useState } from "react";
import type { Disease, Field } from "../config/diseases";
import { predict, type Prediction } from "../lib/predict";
import NumberField from "./NumberField";
import ResultCard from "./ResultCard";

type Values = Record<string, string>;
const empty = (d: Disease): Values => Object.fromEntries(d.fields.map((f) => [f.key, ""]));
const fromRow = (d: Disease, row: number[]): Values =>
  Object.fromEntries(d.fields.map((f, i) => [f.key, String(row[i])]));

export default function PredictionForm({ disease }: { disease: Disease }) {
  const [values, setValues] = useState<Values>(() => empty(disease));
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const out: { name: string | undefined; fields: Field[] }[] = [];
    for (const f of disease.fields) {
      const last = out[out.length - 1];
      if (last && last.name === f.group) last.fields.push(f);
      else out.push({ name: f.group, fields: [f] });
    }
    return out;
  }, [disease]);

  const set = (k: string, v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
    setResult(null);
    if (invalid.has(k)) {
      const next = new Set(invalid);
      next.delete(k);
      setInvalid(next);
      if (next.size === 0) setError("");
    }
  };
  const load = (row: number[]) => { setValues(fromRow(disease, row)); setResult(null); setError(""); setInvalid(new Set()); };
  const clear = () => { setValues(empty(disease)); setResult(null); setError(""); setInvalid(new Set()); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const nums = disease.fields.map((f) => {
      const t = values[f.key].trim();
      return t === "" ? NaN : Number(t);
    });
    const bad = disease.fields.filter((_, i) => !Number.isFinite(nums[i]));
    if (bad.length) {
      setResult(null);
      setInvalid(new Set(bad.map((f) => f.key)));
      setError(bad.length === disease.fields.length ? "Enter the measurements first" : `${bad.length} field${bad.length > 1 ? "s" : ""} still empty`);
      return;
    }
    setInvalid(new Set());
    setError("");
    setResult(predict(disease.model, nums));
  };

  const outOfRange = disease.fields.filter((f) => {
    const v = Number(values[f.key]);
    const s = disease.model.stats[f.key];
    return values[f.key] !== "" && !f.options && Number.isFinite(v) && (v < s.min || v > s.max);
  });

  const control = (f: Field) => {
    if (f.options && f.options.length <= 2) {
      return (
        <div className="seg" role="group" aria-label={f.label}>
          {f.options.map((o) => (
            <button type="button" key={o.value} aria-pressed={values[f.key] === String(o.value)} onClick={() => set(f.key, String(o.value))}>
              {o.label}
            </button>
          ))}
        </div>
      );
    }
    if (f.options) {
      return (
        <select value={values[f.key]} aria-label={f.label} onChange={(e) => set(f.key, e.target.value)}>
          <option value="" disabled>Select</option>
          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    const s = disease.model.stats[f.key];
    return (
      <span className="num-wrap">
        <NumberField field={f} value={values[f.key]} min={s.min} placeholder={String(+s.mean.toPrecision(3))} onChange={(v) => set(f.key, v)} />
        {f.unit && <span className="mono unit">{f.unit}</span>}
      </span>
    );
  };

  return (
    <>
      <form className="form-pane" onSubmit={submit} noValidate>
        <div className="intro">
          <h2>{disease.name}</h2>
          <p className="mono meta-line">
            {disease.algorithm} · {disease.dataset} · {disease.metrics.samples} records · {(disease.metrics.testAccuracy * 100).toFixed(1)}% acc.
          </p>
        </div>

        <div className="fields">
          {groups.map((g) => (
            <div className="group" key={g.name ?? "main"}>
              {g.name && <span className="mono group-name">{g.name}</span>}
              <div className="cells">
                {g.fields.map((f) => (
                  <label key={f.key} className={invalid.has(f.key) ? "cell invalid" : "cell"} title={f.hint}>
                    <span className="lbl">{f.label}</span>
                    {control(f)}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bar">
          <div className="samples mono">
            <button type="button" onClick={() => load(disease.examples.negative)}>healthy sample</button>
            <button type="button" onClick={() => load(disease.examples.positive)}>positive sample</button>
            <button type="button" onClick={clear}>clear</button>
          </div>
          {(error || outOfRange.length > 0) && (
            <p className="mono msg" role={error ? "alert" : undefined}>
              {error || `${outOfRange.length} value${outOfRange.length > 1 ? "s" : ""} outside training range`}
            </p>
          )}
          <button type="submit" className="primary">Run test <span aria-hidden>→</span></button>
        </div>
      </form>

      <aside className="result-pane">
        {result ? (
          <ResultCard disease={disease} result={result} />
        ) : (
          <div className="placeholder">
            <span className="mono cap">Result</span>
            <p>Fill in the measurements, or load a sample, then run the test.</p>
          </div>
        )}
      </aside>
    </>
  );
}
