import { describe, expect, it } from "vitest";
import {
  calculateStepDownAmounts,
  formatCurrency,
  normalizePercentageInput,
  parseCurrencyInput
} from "./calculator";

describe("calculator helpers", () => {
  it("parses currency-like inputs", () => {
    expect(parseCurrencyInput("670.30")).toBe(670.3);
    expect(parseCurrencyInput("$1,250.00")).toBe(1250);
    expect(parseCurrencyInput("not money")).toBeNull();
  });

  it("normalizes percentage inputs", () => {
    expect(normalizePercentageInput("30")).toBe(30);
    expect(normalizePercentageInput("30%")).toBe(30);
    expect(normalizePercentageInput("0.30")).toBe(30);
    expect(normalizePercentageInput("0.3")).toBe(30);
    expect(normalizePercentageInput("abc")).toBeNull();
  });

  it("calculates net income and step-down amounts", () => {
    const result = calculateStepDownAmounts(670.3, 30);

    expect(result.netIncome).toBeCloseTo(2234.333333, 5);
    expect(formatCurrency(result.netIncome)).toBe("$2,234.33");
    expect(formatCurrency(result.rows.find((row) => row.percentage === 25)!.amount)).toBe(
      "$558.58"
    );
    expect(formatCurrency(result.rows.find((row) => row.percentage === 20)!.amount)).toBe(
      "$446.87"
    );
    expect(result.rows.find((row) => row.percentage === 30)!.isCurrent).toBe(true);
  });
});
