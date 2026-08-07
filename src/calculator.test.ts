import { describe, expect, it } from "vitest";
import {
  calculateProjectedAnnualIncome,
  calculateStepDownAmounts,
  formatCurrency,
  formatPaystubDateInput,
  normalizePercentageInput,
  parseDateInput,
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

  it("parses valid date inputs and rejects invalid dates", () => {
    expect(parseDateInput("2026-07-01")).toMatchObject({
      year: 2026,
      month: 7,
      day: 1
    });
    expect(parseDateInput("7/1/2026")).toMatchObject({
      year: 2026,
      month: 7,
      day: 1
    });
    expect(parseDateInput("07012026")).toMatchObject({
      year: 2026,
      month: 7,
      day: 1
    });
    expect(parseDateInput("2026-02-31")).toBeNull();
    expect(parseDateInput("13/01/2026")).toBeNull();
  });

  it("formats paystub date entry with slashes for numeric mobile input", () => {
    expect(formatPaystubDateInput("0")).toBe("0");
    expect(formatPaystubDateInput("07")).toBe("07");
    expect(formatPaystubDateInput("0701")).toBe("07/01");
    expect(formatPaystubDateInput("07012026")).toBe("07/01/2026");
    expect(formatPaystubDateInput("07/01/2026")).toBe("07/01/2026");
    expect(formatPaystubDateInput("2026-07-01")).toBe("07/01/2026");
  });

  it("projects year-to-date income linearly through the paystub date", () => {
    const result = calculateProjectedAnnualIncome(50000, "2026-07-01");

    expect(result).not.toBeNull();
    expect(result!.elapsedDays).toBe(182);
    expect(result!.daysInYear).toBe(365);
    expect(result!.projectedIncome).toBeCloseTo(100274.725, 3);
  });

  it("uses leap-year day counts for income projections", () => {
    const result = calculateProjectedAnnualIncome(10000, "2024-02-29");

    expect(result).not.toBeNull();
    expect(result!.elapsedDays).toBe(60);
    expect(result!.daysInYear).toBe(366);
    expect(formatCurrency(result!.projectedIncome)).toBe("$61,000.00");
  });
});
