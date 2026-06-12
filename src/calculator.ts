export const TARGET_PERCENTAGES = [50, 45, 40, 35, 30, 25, 20, 15, 10] as const;

export type TargetPercentage = (typeof TARGET_PERCENTAGES)[number];

export type SupportRow = {
  percentage: TargetPercentage;
  amount: number;
  isCurrent: boolean;
};

export type CalculationResult = {
  netIncome: number;
  rows: SupportRow[];
};

const numberPattern = /^[-+]?(?:\d+\.?\d*|\.\d+)$/;

export function parseCurrencyInput(input: string): number | null {
  const cleaned = input.trim().replace(/[$,\s]/g, "");

  if (!cleaned || !numberPattern.test(cleaned)) {
    return null;
  }

  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : null;
}

export function normalizePercentageInput(input: string): number | null {
  const cleaned = input.trim().replace(/\s/g, "");

  if (!cleaned) {
    return null;
  }

  const hasPercentSymbol = cleaned.endsWith("%");
  const numericText = hasPercentSymbol ? cleaned.slice(0, -1) : cleaned;

  if (!numericText || !numberPattern.test(numericText)) {
    return null;
  }

  const value = Number(numericText);

  if (!Number.isFinite(value)) {
    return null;
  }

  if (!hasPercentSymbol && value > 0 && value < 1) {
    return value * 100;
  }

  return value;
}

export function calculateStepDownAmounts(
  childSupportAmount: number,
  currentPercentage: number
): CalculationResult {
  const netIncome = childSupportAmount / (currentPercentage / 100);

  return {
    netIncome,
    rows: TARGET_PERCENTAGES.map((percentage) => ({
      percentage,
      amount: netIncome * (percentage / 100),
      isCurrent: Math.abs(percentage - currentPercentage) < 0.005
    }))
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}
