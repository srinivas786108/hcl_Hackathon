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
npm run test:ui:headed
npm run test:api

# Run tests tagged @smoke
npm run test:smoke

# TypeScript compile check
npm run typecheck

# Open the most recent HTML report
npm run report
```

Playwright creates `playwright-report/` after a test run. Screenshots, traces, and video are retained for failures in `test-results/`; both directories are excluded from Git.

## GitHub Actions

The workflow in `.github/workflows/playwright.yml` runs TypeScript validation, API tests, and UI tests on pushes and pull requests targeting `main`, and on manual runs from the Actions tab. The three jobs run separately so failures are easy to attribute. Amazon may restrict hosted CI traffic or show region-dependent offers; in that case the UI job may fail or report skipped cases. The API and UI jobs each upload their HTML report and test artifacts for 14 days; download `playwright-api-*` or `playwright-ui-*` from the workflow run's Artifacts section.

Amazon can return an anti-automation challenge to hosted CI runners. In that case the UI tests are marked skipped by the suite's challenge guard; review the run summary and report rather than treating skipped scenarios as passed. The Petstore API tests run independently.

## Structure

- `pages/`: Amazon Page Object Model classes and locators
- `tests/ui/`: seven independent Amazon UI scenarios tagged `@ui`
- `tests/api/`: three Petstore API tests tagged `@api`
- `config/`: target URL defaults and `.env.example`
- `playwright.config.ts`: Chromium project, timeouts, retries, and reporting

## UI skips and diagnostics

Each UI test gets a fresh Playwright browser context. The tests do not reuse the open browser tab, its cookies, delivery address, or cart contents.

The shared homepage helper looks for Amazon's normal storefront logo or the heading "Click the button below to continue shopping." If Amazon returns that challenge page, the test is marked **skipped** before its scenario runs. This is not a login failure. If all seven UI tests are skipped, none of the Amazon UI assertions ran; the API tests are independent and can still pass.

The product-detail scenario also skips when Amazon explicitly says the selected item cannot ship to the current delivery location. Other product and cart scenarios require a product with an available offer, so results can vary with Amazon's inventory and delivery region. The configured `en-IN` locale and `Asia/Kolkata` timezone do not set the Amazon delivery PIN.

Check the terminal summary and HTML report for skipped tests and their reasons. A skipped test is not a passing test. To run the UI assertions, use an Amazon or organizer-approved test setup that serves the storefront and has an available product; do not attempt to bypass Amazon's challenge.

## Notes

Amazon is a live storefront and can vary by region, inventory, consent state, or bot-protection response. The UI suite does not use a saved account or place an order. The Petstore service is a shared public sandbox; its data can be reset and response latency depends on the network. The available-pets check intentionally enforces the brief's non-empty response and sub-2000 ms response-time requirements.
