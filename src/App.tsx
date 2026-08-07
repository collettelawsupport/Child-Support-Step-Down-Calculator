import { useMemo, useState } from "react";
import logoUrl from "./assets/collette-law-logo.png";
import {
  calculateProjectedAnnualIncome,
  calculateStepDownAmounts,
  formatDateParts,
  formatPaystubDateInput,
  formatCurrency,
  formatPercentage,
  normalizePercentageInput,
  parseCurrencyInput,
  type CalculationResult,
  type IncomeProjectionResult
} from "./calculator";

type ValidationState = {
  amount: number | null;
  percentage: number | null;
  amountError: string;
  percentageError: string;
  result: CalculationResult | null;
};

type ProjectionValidationState = {
  ytdIncome: number | null;
  ytdIncomeError: string;
  paystubDateError: string;
  result: IncomeProjectionResult | null;
};

function validateInputs(amountInput: string, percentageInput: string): ValidationState {
  const amount = parseCurrencyInput(amountInput);
  const percentage = normalizePercentageInput(percentageInput);
  let amountError = "";
  let percentageError = "";

  if (!amountInput.trim()) {
    amountError = "Enter the current child support amount.";
  } else if (amount === null || amount <= 0) {
    amountError = "Enter a valid amount greater than $0.00.";
  }

  if (!percentageInput.trim()) {
    percentageError = "Enter the current percentage of net income.";
  } else if (percentage === null || percentage <= 0) {
    percentageError = "Enter a percentage greater than 0.";
  } else if (percentage > 100) {
    percentageError = "Enter a percentage no greater than 100%.";
  }

  const result =
    !amountError && !percentageError && amount !== null && percentage !== null
      ? calculateStepDownAmounts(amount, percentage)
      : null;

  return {
    amount,
    percentage,
    amountError,
    percentageError,
    result
  };
}

function validateProjectionInputs(
  ytdIncomeInput: string,
  paystubDateInput: string
): ProjectionValidationState {
  const ytdIncome = parseCurrencyInput(ytdIncomeInput);
  let ytdIncomeError = "";
  let paystubDateError = "";

  if (!ytdIncomeInput.trim()) {
    ytdIncomeError = "Enter the year-to-date income.";
  } else if (ytdIncome === null || ytdIncome <= 0) {
    ytdIncomeError = "Enter a valid income greater than $0.00.";
  }

  if (!paystubDateInput.trim()) {
    paystubDateError = "Enter the date as of the paystub.";
  }

  const result =
    !ytdIncomeError && !paystubDateError && ytdIncome !== null
      ? calculateProjectedAnnualIncome(ytdIncome, paystubDateInput)
      : null;

  if (!paystubDateError && !result) {
    paystubDateError = "Enter a valid paystub date.";
  }

  return {
    ytdIncome,
    ytdIncomeError,
    paystubDateError,
    result
  };
}

function buildCopyText(
  amount: number,
  percentage: number,
  result: CalculationResult
): string {
  const rows = result.rows
    .map((row) => `${formatPercentage(row.percentage)}: ${formatCurrency(row.amount)}`)
    .join("\n");

  return [
    "Child Support Step Down Calculator",
    `Current child support: ${formatCurrency(amount)}`,
    `Current percentage of net income: ${formatPercentage(percentage)}`,
    `Net income: ${formatCurrency(result.netIncome)}`,
    "",
    "Support amounts:",
    rows,
    "",
    "This calculator is for estimation only and does not provide legal advice."
  ].join("\n");
}

export default function App() {
  const [amountInput, setAmountInput] = useState("");
  const [percentageInput, setPercentageInput] = useState("");
  const [ytdIncomeInput, setYtdIncomeInput] = useState("");
  const [paystubDateInput, setPaystubDateInput] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const validation = useMemo(
    () => validateInputs(amountInput, percentageInput),
    [amountInput, percentageInput]
  );
  const projectionValidation = useMemo(
    () => validateProjectionInputs(ytdIncomeInput, paystubDateInput),
    [ytdIncomeInput, paystubDateInput]
  );

  const hasEnteredData = amountInput.trim() || percentageInput.trim();
  const hasEnteredProjectionData = ytdIncomeInput.trim() || paystubDateInput.trim();
  const showAmountError = Boolean(hasEnteredData && validation.amountError);
  const showPercentageError = Boolean(hasEnteredData && validation.percentageError);
  const showYtdIncomeError = Boolean(
    hasEnteredProjectionData && projectionValidation.ytdIncomeError
  );
  const showPaystubDateError = Boolean(
    hasEnteredProjectionData && projectionValidation.paystubDateError
  );
  const canCopy =
    validation.result !== null && validation.amount !== null && validation.percentage !== null;

  async function handleCopy() {
    if (!canCopy || !validation.result || validation.amount === null || validation.percentage === null) {
      return;
    }

    const summary = buildCopyText(validation.amount, validation.percentage, validation.result);

    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("Results copied.");
    } catch {
      setCopyStatus("Copy failed. Select the results and copy them manually.");
    }
  }

  function handleClear() {
    setAmountInput("");
    setPercentageInput("");
    setCopyStatus("");
  }

  function handleClearProjection() {
    setYtdIncomeInput("");
    setPaystubDateInput("");
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <img className="brand-logo" src={logoUrl} alt="Collette Law PLLC logo" />
          <div className="header-copy">
            <p className="brand-label">Collette Law</p>
            <h1>Child Support Step Down Calculator</h1>
            <p className="header-subtitle">
              Calculate net income and child support amounts at common step-down percentages.
            </p>
          </div>
        </div>
      </header>

      <main className="page-shell">
        <form className="calculator-layout" noValidate>
          <fieldset className="card input-card">
            <legend>Current support information</legend>

            <div className="field-grid">
              <div className="form-field">
                <label htmlFor="support-amount">Current child support amount</label>
                <div className={`input-wrap ${showAmountError ? "input-error" : ""}`}>
                  <span aria-hidden="true">$</span>
                  <input
                    id="support-amount"
                    name="support-amount"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Enter Starting Child Support Amount"
                    value={amountInput}
                    onChange={(event) => {
                      setAmountInput(event.target.value);
                      setCopyStatus("");
                    }}
                    aria-invalid={showAmountError}
                    aria-describedby={showAmountError ? "support-amount-error" : undefined}
                  />
                </div>
                {showAmountError ? (
                  <p className="field-error" id="support-amount-error">
                    {validation.amountError}
                  </p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="support-percentage">Current percentage of net income</label>
                <div className={`input-wrap percent-wrap ${showPercentageError ? "input-error" : ""}`}>
                  <input
                    id="support-percentage"
                    name="support-percentage"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Starting Percentage"
                    value={percentageInput}
                    onChange={(event) => {
                      setPercentageInput(event.target.value);
                      setCopyStatus("");
                    }}
                    aria-invalid={showPercentageError}
                    aria-describedby={
                      showPercentageError ? "support-percentage-error" : undefined
                    }
                  />
                </div>
                {showPercentageError ? (
                  <p className="field-error" id="support-percentage-error">
                    {validation.percentageError}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="actions">
              <button type="button" className="primary-button" onClick={handleCopy} disabled={!canCopy}>
                Copy results
              </button>
              <button type="button" className="secondary-button" onClick={handleClear}>
                Clear
              </button>
            </div>

            <p className="copy-status" role="status" aria-live="polite">
              {copyStatus}
            </p>
          </fieldset>

          <section className="card net-income-card" aria-labelledby="net-income-heading">
            <p className="section-kicker">Calculated basis</p>
            <h2 id="net-income-heading">Net income</h2>
            {validation.result ? (
              <>
                <p className="net-income-value">{formatCurrency(validation.result.netIncome)}</p>
                <p className="muted">
                  Based on {formatCurrency(validation.amount ?? 0)} at{" "}
                  {formatPercentage(validation.percentage ?? 0)}.
                </p>
              </>
            ) : (
              <p className="empty-state">
                {hasEnteredData
                  ? "Fix the highlighted fields to calculate net income."
                  : "Enter the current support amount and percentage to begin."}
              </p>
            )}
          </section>
        </form>

        <section className="card results-card" aria-labelledby="results-heading">
          <div className="results-header">
            <div>
              <p className="section-kicker">Step-down amounts</p>
              <h2 id="results-heading">Support by percentage</h2>
            </div>
            <p className="legal-note">
              This calculator is for estimation only and does not provide legal advice.
            </p>
          </div>

          {validation.result ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Percentage</th>
                    <th scope="col">Support amount</th>
                  </tr>
                </thead>
                <tbody>
                  {validation.result.rows.map((row) => (
                    <tr key={row.percentage} className={row.isCurrent ? "current-row" : undefined}>
                      <th scope="row">
                        <span>{formatPercentage(row.percentage)}</span>
                        {row.isCurrent ? <em>Current</em> : null}
                      </th>
                      <td>{formatCurrency(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="results-empty" aria-live="polite">
              Valid results will appear here automatically.
            </div>
          )}
        </section>

        <section className="card projection-card" aria-labelledby="projection-heading">
          <div className="results-header projection-header">
            <div>
              <p className="section-kicker">Income projection</p>
              <h2 id="projection-heading">Year-to-date income projection</h2>
            </div>
            <p className="legal-note">
              Assumes income is earned evenly from January 1 through the paystub date.
            </p>
          </div>

          <form className="projection-body" noValidate>
            <fieldset className="projection-fieldset">
              <legend className="sr-only">Year-to-date income information</legend>

              <div className="field-grid projection-field-grid">
                <div className="form-field">
                  <label htmlFor="ytd-income">Year-to-date income</label>
                  <div className={`input-wrap ${showYtdIncomeError ? "input-error" : ""}`}>
                    <span aria-hidden="true">$</span>
                    <input
                      id="ytd-income"
                      name="ytd-income"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="Enter Year to Date Income"
                      value={ytdIncomeInput}
                      onChange={(event) => setYtdIncomeInput(event.target.value)}
                      aria-invalid={showYtdIncomeError}
                      aria-describedby={showYtdIncomeError ? "ytd-income-error" : undefined}
                    />
                  </div>
                  {showYtdIncomeError ? (
                    <p className="field-error" id="ytd-income-error">
                      {projectionValidation.ytdIncomeError}
                    </p>
                  ) : null}
                </div>

                <div className="form-field">
                  <label htmlFor="paystub-date">Date as of paystub</label>
                  <div className={`input-wrap ${showPaystubDateError ? "input-error" : ""}`}>
                    <input
                      id="paystub-date"
                      name="paystub-date"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="MM/DD/YYYY"
                      maxLength={10}
                      value={paystubDateInput}
                      onChange={(event) =>
                        setPaystubDateInput(formatPaystubDateInput(event.target.value))
                      }
                      aria-invalid={showPaystubDateError}
                      aria-describedby={
                        showPaystubDateError ? "paystub-date-error" : undefined
                      }
                    />
                  </div>
                  {showPaystubDateError ? (
                    <p className="field-error" id="paystub-date-error">
                      {projectionValidation.paystubDateError}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="actions">
                <button type="button" className="secondary-button" onClick={handleClearProjection}>
                  Clear projection
                </button>
              </div>
            </fieldset>

            <section className="projection-output" aria-labelledby="projected-income-heading">
              <p className="section-kicker">Projected income</p>
              <h3 id="projected-income-heading">Annualized income</h3>
              {projectionValidation.result ? (
                <>
                  <p className="projection-value">
                    {formatCurrency(projectionValidation.result.projectedIncome)}
                  </p>
                  <p className="muted">
                    Based on {formatCurrency(projectionValidation.ytdIncome ?? 0)} through{" "}
                    {formatDateParts(projectionValidation.result.paystubDate)}.
                  </p>
                  <p className="projection-detail">
                    Day {projectionValidation.result.elapsedDays} of{" "}
                    {projectionValidation.result.daysInYear} in{" "}
                    {projectionValidation.result.paystubYear}.
                  </p>
                </>
              ) : (
                <p className="empty-state">
                  {hasEnteredProjectionData
                    ? "Fix the highlighted fields to project annual income."
                    : "Enter year-to-date income and a paystub date to project annual income."}
                </p>
              )}
            </section>
          </form>
        </section>
      </main>
    </>
  );
}
