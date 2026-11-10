import { useMemo } from "react";

const W = 320, H = 150, PAD = 14, BASE = 118, BINS = 24;

/** Histogram of every real patient's score, split by true label, with the decision line at 0 and "You" marked. */
export default function ScoreChart({ scores, you }: { scores: [number, number][]; you: number }) {
  const { bins, lo, hi } = useMemo(() => {
    const vals = scores.map(([s]) => s);
    const lo = Math.min(...vals, you) - 0.3, hi = Math.max(...vals, you) + 0.3;
    const bins = Array.from({ length: BINS }, () => [0, 0]);
    for (const [s, y] of scores) bins[Math.min(BINS - 1, Math.floor(((s - lo) / (hi - lo)) * BINS))][y ? 1 : 0]++;
    return { bins, lo, hi };
  }, [scores, you]);

  const x = (v: number) => PAD + ((v - lo) / (hi - lo)) * (W - 2 * PAD);
  const peak = Math.max(...bins.map(([a, b]) => a + b), 1);
  const bw = (W - 2 * PAD) / BINS;
  const h = (n: number) => (n / peak) * 78;
  const youX = x(you);

  return (
    <figure className="chart">
      <span className="mono cap">Where you land among {scores.length} real patients</span>
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Your score is ${you.toFixed(2)}, ${you > 0 ? "on the positive" : "on the negative"} side of the decision line`}>
        {bins.map(([neg, pos], i) => (
          <g key={i}>
            <rect className="b-neg" x={PAD + i * bw + 1} width={bw - 2} y={BASE - h(neg)} height={h(neg)} />
            <rect className="b-pos" x={PAD + i * bw + 1} width={bw - 2} y={BASE - h(neg) - h(pos)} height={h(pos)} />
          </g>
        ))}
        <line className="c-axis" x1={PAD} x2={W - PAD} y1={BASE} y2={BASE} />
        <line className="c-bound" x1={x(0)} x2={x(0)} y1={14} y2={BASE + 6} />
        <text className="c-txt" x={PAD} y={BASE + 20}>← negative</text>
        <text className="c-txt" x={W - PAD} y={BASE + 20} textAnchor="end">positive →</text>
        <line className="c-you" x1={youX} x2={youX} y1={20} y2={BASE} />
        <circle className="c-you-dot" cx={youX} cy={20} r={5} />
        <text className="c-you-txt" x={Math.min(Math.max(youX, 22), W - 22)} y={11} textAnchor="middle">You</text>
      </svg>
      <p className="mono legend"><i className="k down" /> patients without the condition <i className="k up" /> patients with it <span className="dash">┆</span> decision line</p>
    </figure>
  );
}
