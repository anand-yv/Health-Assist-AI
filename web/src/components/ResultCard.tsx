import type { Disease } from "../config/diseases";
import type { Prediction } from "../lib/predict";
import ScoreChart from "./ScoreChart";

export default function ResultCard({ disease, result }: { disease: Disease; result: Prediction }) {
  const top = result.contributions.slice(0, 5);
  const max = Math.max(...top.map((c) => Math.abs(c.value)), 1e-9);
  const label = (k: string) => disease.fields.find((f) => f.key === k)?.label ?? k;

  return (
    <section className={`result ${result.positive ? "pos" : "neg"}`} aria-live="polite">
      <span className="mono cap">Result</span>
      <p className="verdict">
        <em>{result.positive ? "Positive." : "Negative."}</em>{" "}
        {result.positive ? disease.positiveText : disease.negativeText}
      </p>
      <p className="mono meta-line">
        {result.probability !== null
          ? `Probability ${(result.probability * 100).toFixed(1)}%`
          : `Score ${result.score >= 0 ? "+" : ""}${result.score.toFixed(2)} · above 0 = positive`}
      </p>

      {disease.model.scores && <ScoreChart scores={disease.model.scores} you={result.score} />}

      <span className="mono cap drivers">Biggest drivers vs. average patient</span>
      <ul className="bars">
        {top.map((c) => (
          <li key={c.name}>
            <span className="bar-label" title={label(c.name)}>{label(c.name)}</span>
            <span className="axis" aria-hidden>
              <span className={`fill ${c.value >= 0 ? "up" : "down"}`} style={{ width: `${(Math.abs(c.value) / max) * 50}%` }} />
            </span>
          </li>
        ))}
      </ul>
      <p className="mono legend"><i className="k up" /> raises risk <i className="k down" /> lowers risk</p>
    </section>
  );
}
