# Amazon Playwright UI and API Automation

Playwright Test automation for the October 2026 hackathon brief. The UI suite covers public Amazon shopping flows and stops at the sign-in checkpoint; it never submits a purchase. The API suite exercises the public Swagger Petstore sandbox.

## Requirements

- Node.js 20 or newer
- npm
- Network access to `amazon.com` and `petstore.swagger.io`

## Install

```powershell
npm install
Copy-Item config/.env.example config/.env
npm run install:browsers
```

Edit `config/.env` only when overriding the public target URLs. No credentials are required or stored by this project.

## Run

```powershell
# All UI and API tests
npm test

# Run either suite independently
npm run test:ui
npm run test:api

# Run tests tagged @smoke
npm run test:smoke

# TypeScript compile check
npm run typecheck

# Open the most recent HTML report
npm run report
```

Playwright creates `playwright-report/` after a test run. Screenshots, traces, and video are retained for failures in `test-results/`; both directories are excluded from Git.

## Structure

- `pages/`: Amazon Page Object Model classes and locators
- `tests/ui/`: seven independent Amazon UI scenarios tagged `@ui`
- `tests/api/`: three Petstore API tests tagged `@api`
- `config/`: target URL defaults and `.env.example`
- `playwright.config.ts`: Chromium project, timeouts, retries, and reporting

## Notes

Amazon is a live storefront and can vary by region, inventory, consent state, or bot-protection response. The UI suite does not use a saved account or place an order. The Petstore service is a shared public sandbox; its data can be reset and response latency depends on the network. The available-pets check intentionally enforces the brief's non-empty response and sub-2000 ms response-time requirements.
