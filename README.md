# BML People & ER Platform

Internal HR platform built from the *Master Product & Technical Blueprint* (Sept 2026).
This repository is **v0.1 – Sprint 1 foundation + first vertical slice** (HR Action Centre "My Work" and ER Case Management intake).

> **DEV uses synthetic data only.** No real employee data may be loaded outside an approved UAT/PROD environment. CI fails on NID-like values.

## RBAC Architecture (Sept 2026 Refactoring)

This platform implements **proper Role-Based Access Control (RBAC)** with granular permissions, data scopes, and configurable access grants. All access is determined **server-side** and **at the database level** (Row-Level Security). UI hiding is never relied upon for security.

**Key security principles:**
- User → Assigned Role(s) → Permission Set → Data Scope (configurable, no code changes needed)
- All authorization checked on every request: role/permission → org scope → resource-level → RLS/DB policy
- Sensitive fields (salary, NID, passport) are always masked; reveals are audited with user/time/session
- ER cases visible only to authorized case team members (+ database RLS)
- Temporary access with expiry dates; revocation is immediate
- All sensitive actions audited: login, logout, case access, field reveals, role assignments, access revocation

## Stack

| Layer | Choice |
|---|---|
| Web | Next.js 15 (App Router) + React 19, **plain CSS design system** (`apps/web/src/styles/globals.css`) |
| API | NestJS 10 (TypeScript), modular monolith |
| Worker | Node (TypeScript) – transactional-outbox → audit relay |
| Database | PostgreSQL 16 (+ pgvector image), plain SQL migrations, Row-Level Security on ER |
| Auth | Microsoft Entra ID token validation (config-driven) + DEV-only mock IdP personas |
| Tests | Vitest (unit), matrix-driven security suite (Node), Playwright (e2e) |

Provisional per DR-02 (stack) – approved for build by the product owner on 2026-09-29.

## Run it locally

Prerequisites: **Node 22**, **pnpm 10** (`corepack enable`), **Docker** (or a local PostgreSQL 16).

```bash
cp .env.example .env            # DEV values; never commit .env
pnpm install
pnpm infra:up                   # Postgres (+pgvector), Azurite, Mailpit
pnpm db:migrate                 # applies packages/schemas/migrations/*.sql + grants
pnpm db:seed                    # synthetic org, 1,200 employees, 10 main + legacy personas, sample config
pnpm dev                        # web :3000 · api :4000 · worker
```

Open http://localhost:3000 and pick a persona to test (10 new personas: Azwa, Maiz, Shai, Rayya, Humaam, Anj, Arif, Ish, Azwa #2, Bishwajit).

Without Docker: create database `bml_people_er` owned by a superuser called `app_migrator` (password `app_migrator_dev`), then continue from `pnpm db:migrate`. The migration creates the restricted `app_runtime` role itself.

Useful commands:

| Command | What it does |
|---|---|
| `pnpm db:reset` | DEV only – drop all platform schemas, migrate, seed |
| `pnpm test` | Unit tests (policy, crypto, synthetic data, log redaction) |
| `pnpm test:security` | 135 permission-matrix, record/field, workflow, audit-tamper and env-safety checks (needs api + worker running) |
| `pnpm test:e2e` | Playwright browser tests (needs web running) |
| `pnpm scan:pii` | Fails on real-looking NIDs or secrets |
| `pnpm test:all` | All of the above |
| `pnpm build` | Build packages, API, worker and web |

## Try these journeys

| Persona | Try |
|---|---|
| **Azwa Moosa** – Platform Owner / Super Admin | Full application and data access across all modules, audit logs, user management, configuration |
| **Maiz** – People & Culture Director | P&C executive visibility: ER cases, analytics, engagement, Total Rewards, sensitive data access |
| **Shai** – Head – Total Rewards & Employee Relations | Full TR + ER leadership: case management, compensation oversight, analytics, team management |
| **Rayya** – Manager – ER, Engagement & Analytics | Full ER case management, engagement administration, analytics dashboards within scope |
| **Humaam** – Manager – Total Rewards | Total Rewards administration: salary/compensation data, benefits, reports, manager oversight |
| **Anj** – Officer – Total Rewards | Operational TR access: salary/compensation information, sensitive field reveals (audited), case-restricted |
| **Arif** – Officer – Total Rewards | Operational TR access: same as Anj, salary/compensation data, case-restricted |
| **Ish** – Officer – Employee Relations | ER case-scoped access: assigned cases, authorized case team membership only (not all ER cases) |
| **Azwa Moosa Number 2** – Restricted ER Test User | ER Officer with no case assignment → tests RLS/403 access denial (security testing) |
| **Bishwajit** – Reviewer – Audit & Compliance | Read-only audit access: audit log, hash-chain verification, compliance review (no data editing) |

## Repository layout

```
apps/
  web/        Next.js shell + pages; BFF proxy keeps the token in an httpOnly cookie
  api/        NestJS: auth, policy guard, audit, employees, org, config, actions, er
  worker/     Outbox → audit relay (pg-boss jobs arrive in Phase 2)
packages/
  policy/          Permission catalogue, R1–R16 role bundles, PolicyService, masking, state machine, business calendar
  schemas/         SQL migrations, grants, migrate/seed runners
  synthetic-data/  Deterministic generator (seeded; hash-stable)
  crypto/          AES-256-GCM field encryption for ER narrative
infra/docker/      DEV compose file          infra/pipelines/  CI definitions
tests/security/    matrix.platform.yaml + runner, PII scan
tests/e2e/         Playwright specs
docs/              Planning pack (00-planning), requirements/RTM, architecture, security, audit catalogue, Phase 0 templates
```

## Core rules (BP §24)

- DEV synthetic · UAT approved masked · PROD live controlled.
- No new Employee Master – EmployeeService provider interface; synthetic HRIS stub is DEV/UAT only and the API refuses to start in PROD without a real provider (DR-04).
- Sensitive permissions are enforced server-side; the UI never decides access.
- AI is assistive and evidence-grounded (no AI in this build).
- No public links to dashboards, attachments or documents.
- Every material workflow is audited and versioned.
- Anything marked **SAMPLE** is a placeholder pending a BML decision – see `docs/00-planning/L-decisions-register.md`.

See `docs/architecture.md` for the as-built design and deviations from the plan, and `CHANGELOG.md` for what changed.
