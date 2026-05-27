# Fake Store API — Playwright API Test Suite

REST API tests for [fakestoreapi.com](https://fakestoreapi.com). Covers cart CRUD, authentication, schema validation, and a snapshot-based contract test.

Submitted as part of the SDET assignment for Shopflo.

---

## Why Playwright (Test) + TypeScript

I picked Playwright Test even though it's better known as a UI tool. A few reasons:

- **`request` fixture is built in.** No Axios, Supertest, or Got — Playwright ships an HTTP client that's API-test-ready out of the box.
- **Same framework as my UI suite.** Consistency in tooling, scripts, reporters, and CI patterns between Assignment 1 and Assignment 2 — the reviewer sees one set of patterns, not two.
- **Auto-retries, base URL config, parallel workers.** All the boring infrastructure problems are already solved.
- **First-class TypeScript.** Schemas are typed objects, payloads are typed, and you can't accidentally PUT a string where a number belongs.

For schema validation I added **Ajv** (the industry-standard JSON Schema validator). Schemas live as plain TypeScript objects in `schemas/` and are reused across the dedicated schema-validation suite and inline assertions in other tests.

---

## Project Layout
.
├── tests/
│   ├── cart-crud.test.ts           # POST, GET, PUT, DELETE + negative cases
│   ├── auth.test.ts                # /auth/login positive + negative
│   ├── schema-validation.test.ts   # Ajv-based response shape checks
│   ├── data-driven.test.ts         # POST /carts across 5 product IDs
│   ├── contract.test.ts            # Snapshot-based contract test
│   └── contract.test.ts-snapshots/ # Saved response shapes (committed to repo)
├── schemas/
│   └── cart.schema.ts              # Cart JSON Schema definitions
├── helpers/
│   └── schema-validator.ts         # Ajv wrapper (validateSchema, assertSchema)
├── fixtures/
│   └── test-data.ts                # Endpoints, credentials, payloads
├── tests/                          # Local-run screenshots
├── playwright.config.ts
└── .github/workflows/playwright.yml

---

## What's Tested

All tests focus on **Cart CRUD** (the assignment's specified design target), plus the required Authentication and Schema validation areas.

| Suite | Tests | What it covers |
|---|---|---|
| Cart CRUD — Positive | 5 | GET list, GET by id, POST, PUT, DELETE |
| Cart CRUD — Negative | 6 | Non-existent IDs, non-numeric IDs, empty body, malformed body |
| Authentication | 5 | Valid login, invalid creds, missing username/password, empty body |
| Schema validation | 6 | All cart responses checked against JSON Schema via Ajv |
| Data-driven | 5 | POST /carts parameterised across 5 product IDs |
| Contract (snapshot) | 3 | GET /carts/1, POST /carts, GET /carts — saved shapes detect drift |
| **Total** | **30** | |

### A note on fakestoreapi's leniency

fakestoreapi is a fake/practice backend. POSTs with empty bodies are sometimes accepted, non-existent IDs may return 200 with empty bodies instead of 404, and so on. My negative tests are written **defensively** — they accept either the lenient response or the strict 4xx response a real API should give. This documents the contract we'd expect from a properly-validated API; if fakestoreapi ever tightens its semantics, the tests pass without changes.

### About the snapshot contract test

The contract suite captures the *shape* (field names + value types) of cart responses and compares every future run against the saved snapshot. Data values (price, dates) aren't part of the contract — only structure is. If the API team renames `userId` to `user_id`, removes a field, or changes a type, the test fails with a readable diff. To intentionally update snapshots after a known change:

```bash
npx playwright test --update-snapshots tests/contract.test.ts
```

---

## ⚠️ A Note on CI — Cloudflare Block

**Tests pass locally. CI runs return HTTP 403 for every API call.**

Screenshots of a successful local run are in [`tests/`](tests/).

### Why CI fails

`fakestoreapi.com` is hosted behind Cloudflare bot protection. Cloudflare automatically blocks requests originating from datacenter IP ranges, which includes all GitHub Actions runners (AWS / Azure / GCP). Every request from CI returns:
HTTP/2 403 Forbidden
content-type: text/html

The response body is the standard Cloudflare HTML challenge page, not JSON — which is also why TEST_004 and TEST_005 in cart-crud.test.ts fail with `SyntaxError: Unexpected token '<'`. They tried to parse HTML as JSON.

**This is bot-protection on the third-party API's side. It is not a defect in this test suite.**

For this assignment I chose to **document the limitation** rather than mock the API. The assignment specifically asks for tests against `fakestoreapi.com` — mocking would defeat the purpose. In a real role I'd build a hybrid: mocks for fast PR validation, real-API tests nightly from a non-blocked source.

### Verifying locally

To confirm the suite is functionally correct, clone the repo and run:

```bash
npm ci
npm test
npm run report
```

All 30 tests pass against the live API from a non-datacenter IP. Local screenshots in [`tests/`](tests/).

---

## Running Locally

```bash
# First time
npm ci

# Run all tests
npm test

# Open the last HTML report
npm run report
```

No browser install required — this is an API suite.

---

## CI on GitHub Actions

The workflow at `.github/workflows/playwright.yml` runs on every push, every PR, and **nightly at 6 AM UTC**.

Why nightly? Because this suite tests an upstream API I don't control. A nightly run is meant to catch the day fakestoreapi changes a field, retires an endpoint, or changes status codes — without anyone pushing code. In practice, CI hits the Cloudflare block described above and the nightly value is realised only against a non-datacenter source (see the "How real teams solve this" section).
push / PR / nightly cron  ──►  npm ci  ──►  npx playwright test  ──►  HTML report artifact

- 30 tests, 4 parallel workers, ~1 minute locally
- HTML report uploaded as artifact (14-day retention)
- No secrets needed — fakestoreapi is public

---

## What I'd Build Next

### Faster runs and broader coverage

| What | How |
|---|---|
| Per-environment config | `.env`-driven base URL so the same suite runs against dev/staging/prod with one flag |
| MSW mock layer for CI | Local recordings of real API responses replayed in CI, eliminating the Cloudflare block |
| Authenticated CRUD | Chain `/auth/login` → use the returned token for cart endpoints once the API enforces auth |
| Performance baseline | Wrap each request with timing, fail tests where p95 latency exceeds an SLO |
| Pact contract tests | For a real consumer/provider setup, swap snapshot for [Pact](https://docs.pact.io/) — production-grade contract testing |

### Better reporting

| Tool | Why |
|---|---|
| **Allure** | History, trend, flakiness graphs over time |
| **GitHub Pages** | Auto-deploy the HTML report on every `main` merge |
| **Slack webhook** | Notify a channel when nightly cron detects a contract break |
| **PR comments** | Post test summary back to the PR via the GitHub API |

### Additional API coverage

- **Users endpoint** — GET, POST, PUT, DELETE with the same CRUD discipline
- **Cart filtering** — `?limit=N`, `?sort=desc`, date range filters
- **Edge data** — products with very long titles, special characters, unicode
- **Rate limiting** — assert the API responds gracefully under burst load

---

## How AI Helped

The assignment asked us to lean on AI. I used Claude to:

- Sketch the schema definitions and the Ajv helper from a single description of fakestoreapi's response shapes
- Think through what a "fake" API's negative tests should defensively assert
- Draft the snapshot-based contract approach instead of pulling in a heavier library like Pact for a small assignment
- Diagnose the Cloudflare 403 issue when CI failed against a passing local run

The whole suite came together in about 60 minutes that way. By hand, it'd have been most of an afternoon.

---

## Author

**Sai Saran Chandu** — SDET candidate for Shopflo