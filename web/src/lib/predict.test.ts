import { describe, expect, it } from "vitest";
import models from "../data/models.json";
import { predict, type LinearModel } from "./predict";

describe("exported models", () => {
  for (const [key, m] of Object.entries(models) as unknown as [string, LinearModel & { examples: Record<string, number[]> }][]) {
    it(`${key}: bundled example patients are classified as labelled`, () => {
      expect(predict(m, m.examples.positive).positive).toBe(true);
      expect(predict(m, m.examples.negative).positive).toBe(false);
    });
  }
  it("rejects wrong-length input", () => {
    expect(() => predict(models.diabetes as unknown as LinearModel, [1, 2])).toThrow();
  });
  it("logistic model returns a probability in [0,1]", () => {
    const p = predict(models.heart as unknown as LinearModel, (models.heart as any).examples.positive).probability!;
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(1);
  });
});
