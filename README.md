# oriz-api-docs-template

Reusable GitHub Actions template + Starlight scaffold for every `oriz-co/oriz-*-api` repo.

## What it gives an API repo

1. **`scrape.yml`** — runs `pnpm run scrape` daily (default 18:00 IST = 12:30 UTC) and
   commits any change in `data/` back to `main`. Manual `workflow_dispatch` too.
2. **`deploy.yml`** — on every push to `main` that touches `README.md` or `data/**`:
   - Clones this template's `starlight-template/` into `_docs/`
   - Drops the API repo's `README.md` into `src/content/docs/index.mdx` (with Starlight frontmatter prepended)
   - Generates `src/content/docs/api.mdx` from `data/latest.json` (shape + first row)
   - Builds with Astro + Starlight, deploys to GitHub Pages

## Wiring an existing API repo

```bash
# inside the API repo
mkdir -p .github/workflows
curl -fsSL https://raw.githubusercontent.com/oriz-co/oriz-api-docs-template/main/.github/workflows/scrape.yml  -o .github/workflows/scrape.yml
curl -fsSL https://raw.githubusercontent.com/oriz-co/oriz-api-docs-template/main/.github/workflows/deploy.yml -o .github/workflows/deploy.yml
git add .github/workflows && git commit -m "chore(ci): adopt oriz-api-docs-template" && git push
```

Then in repo Settings → Pages: source = "GitHub Actions".

## Design

Paper-tone cream + forest-green accents. Self-contained CSS in `starlight-template/src/styles/oriz.css`.
No external dependencies on `astro-shell` / `oriz-ui` (so Starlight installs cleanly without the oriz monorepo).

## License

MIT
