export interface LinearModel {
  featureNames: string[];
  weights: number[];
  intercept: number;
  kind: "svm" | "logistic";
  stats: Record<string, { min: number; max: number; mean: number; std: number }>;
}

export interface Prediction {
  score: number; // w·x + b  (signed distance-like score)
  positive: boolean;
  probability: number | null; // only meaningful for logistic regression
  contributions: { name: string; value: number }[]; // w_i * (x_i - mean_i), sorted by |value|
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Same maths as sklearn's SVC(kernel="linear").predict / LogisticRegression.predict. */
export function predict(model: LinearModel, x: number[]): Prediction {
  if (x.length !== model.weights.length) throw new Error("Wrong number of features");
  const score = x.reduce((s, v, i) => s + v * model.weights[i], model.intercept);
  const contributions = model.featureNames
    .map((name, i) => ({ name, value: model.weights[i] * (x[i] - model.stats[name].mean) }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  return {
    score,
    positive: score > 0,
    probability: model.kind === "logistic" ? sigmoid(score) : null,
    contributions,
  };
}
