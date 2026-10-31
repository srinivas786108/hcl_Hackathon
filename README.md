# Amazon Playwright UI and API Automation

Playwright Test automation for the October 2026 hackathon brief. The UI suite covers public Amazon shopping flows and stops at the sign-in checkpoint; it never submits a purchase. The API suite exercises the public Swagger Petstore sandbox.

## Requirements

- Node.js 20 or newer
- npm
- Network access to `amazon.com` and `petstore.swagger.io`

## Install

From the project root in PowerShell:

```powershell
npm install
Copy-Item config/.env.example config/.env
npm run install:browsers
```

Edit `config/.env` only to override the public target URLs. No credentials are required or stored by this project.

## Run Tests

Run all UI and API tests:

```powershell
npm test
```

Run either suite independently:

```powershell
# All Amazon UI tests in the default browser mode
npm run test:ui

# Amazon UI tests with a visible Chromium window
npm run test:ui:headed

# All Swagger Petstore API tests
npm run test:api
```

Run selected tests by tag or title:

```powershell
# All tests tagged @ui or @api
npx playwright test --grep "@ui"
npx playwright test --grep "@api"

# Smoke tests across the UI and API suites
npm run test:smoke

# A single test by title
npx playwright test tests/ui/shopping.spec.ts --grep "homepage loads"
npx playwright test tests/api/petstore.spec.ts --grep "GET available pets"

# A single UI test with a visible browser
npm run test:ui:headed -- --grep "search returns relevant"
```

Useful Playwright commands:

```powershell
# List discovered tests without running them
npx playwright test --list

# Open Playwright's interactive test runner
npx playwright test --ui

# Debug one test with the Playwright Inspector
npx playwright test tests/ui/shopping.spec.ts --grep "homepage loads" --debug

# Compile-check the TypeScript project without running tests
npm run typecheck

# Open the latest HTML report
npm run report
```

Headed mode, Playwright UI mode, and Inspector require a graphical desktop session; use them locally, not on a headless GitHub Actions runner. Playwright writes the HTML report to `playwright-report/`. Screenshots, traces, and video are retained on test failure in `test-results/`; both directories are excluded from Git.

## GitHub Actions

The workflow in `.github/workflows/playwright.yml` runs TypeScript validation, API tests, and UI tests on pushes and pull requests targeting `main`, and on manual runs from the Actions tab. The three jobs run separately so failures are easy to attribute. The API and UI jobs each upload their HTML report and test artifacts for 14 days; download `playwright-api-*` or `playwright-ui-*` from the workflow run's Artifacts section.

Amazon is a live storefront and may restrict hosted CI traffic or show region-dependent offers. In that case the UI job may fail or report skipped cases. A skipped case did not validate its scenario and must not be reported as a pass. Petstore API tests run independently of Amazon.

## Project Structure

- `pages/`: Amazon Page Object Model classes, locators, and actions
- `test-data/`: typed Petstore request payload builders and shared test values
- `tests/ui/`: seven Amazon UI scenarios tagged `@ui`
- `tests/api/`: three Petstore API cases tagged `@api`
- `config/`: target URL defaults and `.env.example`
- `playwright.config.ts`: Chromium project, timeouts, retries, locale, timezone, and reporting
- `.github/workflows/playwright.yml`: CI jobs for typecheck, API, and UI tests

## UI Skips and Diagnostics

Each UI test gets a fresh Playwright browser context. Tests do not reuse an open browser tab, its cookies, delivery address, or cart contents.

The homepage helper recognizes Amazon's normal storefront and known challenge pages. When a recognized anti-automation challenge is returned, the UI case is skipped before its scenario assertions run; this is not a login failure. Product-dependent cases also skip when Amazon explicitly reports that the selected item cannot ship to the active delivery location. Inventory and availability can vary by region.

The configured `en-IN` locale and `Asia/Kolkata` timezone affect browser language and local time; they do not set Amazon's delivery PIN. Review the terminal summary and HTML report for skip reasons. To validate the live UI flow, run against an approved setup where Amazon serves the storefront and the selected product is available. Do not attempt to bypass Amazon's challenge.

## Notes

The API target is the shared public sandbox `https://petstore.swagger.io/v2`; its data may be reset and response latency depends on the network. The available-pets test enforces the brief's non-empty response and under-2,000-ms response-time requirements.