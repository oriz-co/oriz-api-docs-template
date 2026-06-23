# oriz-api-docs-template

The shared template that powers every `*.api.oriz.in` landing page in the
[oriz family](https://oriz.in).

## How it works

Each API repo (e.g. `oriz-currency-rates-api`) keeps:

- `README.md` — the API's docs, the single source of truth you edit
- `data/latest.json` — the live data the scraper writes
- `CNAME` — the custom subdomain
- `.github/workflows/scrape.yml` — daily 18:00 IST cron that refreshes `data/`
- `.github/workflows/deploy.yml` — the workflow that runs **this** template

On each push to `main` (or when `scrape.yml` updates `data/`), `deploy.yml`:

1. Checks out the host API repo
2. Checks out this template repo
3. Runs `bootstrap.mjs` which copies the host's `README.md` + `data/` into the
   template, builds a one-page Astro site, and outputs `dist/`
4. Deploys `dist/` to GitHub Pages

## The page layout

Every `*.api.oriz.in` looks like:

```
┌──────────────────────────────────────────┐
│  oriz header (home, account, status)     │
├──────────────────────────────────────────┤
│  HERO                                    │
│    <h1 from README>                      │
│    <description from README first para>  │
│    curl https://<sub>.api.oriz.in/data/  │
│    [Try it ↓]  [GitHub →]                │
├──────────────────────────────────────────┤
│  LIVE DATA PREVIEW (pretty-printed JSON) │
├──────────────────────────────────────────┤
│  README CONTENT (rendered markdown)      │
├──────────────────────────────────────────┤
│  oriz footer                             │
└──────────────────────────────────────────┘
```

## Tech stack (2026-06-23 latest stable)

- Astro 7 (static, no JS framework)
- Biome 2 (formatter + linter — replaces Prettier + ESLint)
- TypeScript 6
- Shiki 4 (code highlighting)
- marked 18 (README parsing)
- pnpm 11.8

## Local dev

```bash
cd template
pnpm install
# Drop a sample README.md + data/latest.json into src/content/ + public/data/
pnpm dev
```

## License

MIT. Part of the oriz family — https://oriz.in
