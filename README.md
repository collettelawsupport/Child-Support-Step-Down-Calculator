# Child Support Step Down Calculator

Child Support Step Down Calculator is a small client-side React application for Collette Law. It estimates the net income behind a current child support amount, shows support amounts at common step-down percentages, and projects annual income from year-to-date paystub income.

## Formula

The calculator normalizes the entered percentage, then uses:

```text
netIncome = childSupportAmount / percentageDecimal
newSupportAmount = netIncome * targetPercentageDecimal
```

Accepted percentage inputs include `30`, `30%`, and `0.30`.

The year-to-date income projection is separate from the support calculator and uses:

```text
projectedAnnualIncome = ytdIncome * (daysInYear / elapsedDays)
```

The paystub date determines the calendar year, elapsed day count, and whether the year has 365 or 366 days.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Netlify Deployment

This app is fully client-side and can be deployed as a static Netlify site. The included `netlify.toml` uses:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Connect the GitHub repository in Netlify, keep the default build command and publish directory from `netlify.toml`, and deploy. No backend services, databases, authentication, environment variables, or serverless functions are required.
