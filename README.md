# Child Support Step Down Calculator

Child Support Step Down Calculator is a small client-side React application for Collette Law. It estimates the net income behind a current child support amount and shows support amounts at common step-down percentages.

## Formula

The calculator normalizes the entered percentage, then uses:

```text
netIncome = childSupportAmount / percentageDecimal
newSupportAmount = netIncome * targetPercentageDecimal
```

Accepted percentage inputs include `30`, `30%`, and `0.30`.

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
