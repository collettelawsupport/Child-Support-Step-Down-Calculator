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

export type DateParts = {
  year: number;
  month: number;
  day: number;
  date: Date;
};

export type IncomeProjectionResult = {
  projectedIncome: number;
  elapsedDays: number;
  daysInYear: number;
  paystubYear: number;
  paystubDate: DateParts;
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

export function parseDateInput(input: string): DateParts | null {
  const cleaned = input.trim();
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const numericMatch = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/);

  if (!isoMatch && !slashMatch && !numericMatch) {
    return null;
  }

  const year = Number(isoMatch ? isoMatch[1] : slashMatch ? slashMatch[3] : numericMatch?.[3]);
  const month = Number(isoMatch ? isoMatch[2] : slashMatch ? slashMatch[1] : numericMatch?.[1]);
  const day = Number(isoMatch ? isoMatch[3] : slashMatch ? slashMatch[2] : numericMatch?.[2]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day, date };
}

export function formatPaystubDateInput(input: string): string {
  const parsedIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(input.trim()) ? parseDateInput(input) : null;

  if (parsedIsoDate) {
    const month = String(parsedIsoDate.month).padStart(2, "0");
    const day = String(parsedIsoDate.day).padStart(2, "0");

    return `${month}/${day}/${parsedIsoDate.year}`;
  }

  const digits = input.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function getDayOfYear(dateParts: DateParts): number {
  const startOfYear = Date.UTC(dateParts.year, 0, 1);
  const currentDate = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day);

  return Math.floor((currentDate - startOfYear) / 86_400_000) + 1;
}

export function calculateProjectedAnnualIncome(
  ytdIncome: number,
  paystubDateInput: string
): IncomeProjectionResult | null {
  const paystubDate = parseDateInput(paystubDateInput);

  if (!paystubDate) {
    return null;
  }

  const daysInYear = isLeapYear(paystubDate.year) ? 366 : 365;
  const elapsedDays = getDayOfYear(paystubDate);

  return {
    projectedIncome: ytdIncome * (daysInYear / elapsedDays),
    elapsedDays,
    daysInYear,
    paystubYear: paystubDate.year,
    paystubDate
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

export function formatDateParts(dateParts: DateParts): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(dateParts.date);
}
