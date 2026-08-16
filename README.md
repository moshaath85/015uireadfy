# Gallery 015 — LOCKED VERSION

> **STATUS: LOCKED** — This directory is the ONLY version being run for the Gallery 015 platform. Do not run any other `015` copy on this machine. All work, fixes, and deployments continue from here.

---

## 1. Locked Build

| Field | Value |
|---|---|
| Project | Gallery 015 institutional art platform |
| Directory | `/Users/apple/Downloads/015_Gallery_GitHub_Ready_Sprint_01` |
| package.json name | `gallery-015` |
| Version | `159.0.0` |
| Release version | `v159` |
| Framework | Next.js `16.2.10` (Turbopack), React `18.3.1` |
| Prisma | `^5.22.0` (PostgreSQL) |
| Node.js | `v26.5.0` |
| npm | `11.17.0` |

## 2. Source Control

| Field | Value |
|---|---|
| Branch | `main` (canonical production branch) |
| Latest commit | `b2bff68` — "feat(import): xlsx support, master templates, content readiness" |
| Remote origin | `https://github.com/moshaath85/015uireadfy.git` (canonical) |
| Recovery tag | `gallery015-pre-canonicalization` |
| Prior commits | `aece409` (migrate legacy content to PostgreSQL), `e80b5c1` (museum fixes) |

## 3. Run Instructions

```bash
cd /Users/apple/Downloads/015_Gallery_GitHub_Ready_Sprint_01
npm run dev        # starts on http://localhost:3000, or :3001 if 3000 is busy
```

Other useful scripts:

```bash
npm run typecheck        # TypeScript check (also the lint target)
npm run prisma:validate  # validate Prisma schema
npm run prisma:generate  # regenerate Prisma client
npm run build            # prisma generate + next build
npm run start            # serve production build
```

## 4. Currently Running Instance

| Field | Value |
|---|---|
| URL | `http://localhost:3000` |
| Health check | HTTP `200` |
| Server process | `next dev` (Turbopack) |

## 5. Lock Rules

1. This directory is the single source of truth for Gallery 015.
2. Do NOT run, edit, or deploy from any other `015` copy (`015_Gallery_UI_Phase1_Patch16_Final`, zips, or `.html` snapshots in `~/Downloads`).
3. Always confirm you are inside this directory before starting the server, committing, or deploying.
4. Update this README whenever the locked version, branch, or commit changes.
