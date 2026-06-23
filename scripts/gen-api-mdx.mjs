#!/usr/bin/env node
/**
 * gen-api-mdx.mjs — produce src/content/docs/api.mdx from data/latest.json.
 *
 * Usage: node gen-api-mdx.mjs <latestJsonPath> <outMdxPath> <siteTitle> <repoName>
 *
 * Strategy: don't try to be clever; show:
 *   1. The endpoint URL (derived from CNAME or gh-pages URL)
 *   2. The top-level keys of latest.json with their types
 *   3. A pretty-printed sample (truncated arrays to first 3 entries)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const [, , latestPath, outPath, siteTitle, repoName] = process.argv;
if (!latestPath || !outPath) {
  console.error("Usage: gen-api-mdx.mjs <latestJsonPath> <outMdxPath> <siteTitle> <repoName>");
  process.exit(2);
}
if (!existsSync(latestPath)) {
  console.error(`No data file at ${latestPath} — skipping.`);
  process.exit(0);
}

const raw = readFileSync(latestPath, "utf8");
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error(`latest.json is not valid JSON: ${e.message}`);
  process.exit(0);
}

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return `array<${v.length}>`;
  return typeof v;
}

function truncate(v, depth = 0) {
  if (depth > 3) return "…";
  if (Array.isArray(v)) return v.slice(0, 3).map((x) => truncate(x, depth + 1));
  if (v && typeof v === "object") {
    const out = {};
    let i = 0;
    for (const [k, val] of Object.entries(v)) {
      if (i++ >= 30) {
        out["…"] = `(+${Object.keys(v).length - 30} more)`;
        break;
      }
      out[k] = truncate(val, depth + 1);
    }
    return out;
  }
  return v;
}

const keys = Array.isArray(data) ? ["(array)"] : Object.keys(data);
const shapeRows = Array.isArray(data)
  ? `| (root) | array<${data.length}> | first element shown below |`
  : keys
      .map((k) => `| \`${k}\` | \`${typeOf(data[k])}\` | |`)
      .join("\n");

const sample = JSON.stringify(truncate(data), null, 2);

const mdx = `---
title: API Reference
description: ${siteTitle} — endpoint shape, schema, and a sample response.
template: doc
---

## Endpoint

\`\`\`
GET /data/latest.json
GET /data/<snapshot>.json   # daily snapshots in data/
\`\`\`

Served as static JSON from GitHub Pages. No auth, no rate limit, MIT-licensed.

## Top-level shape

| Field | Type | Notes |
|---|---|---|
${shapeRows}

## Sample response

The latest snapshot, truncated for readability (arrays cut to first 3, objects cut to 30 keys):

\`\`\`json
${sample}
\`\`\`

## Schedule

Refreshed daily by GitHub Actions (\`.github/workflows/scrape.yml\`). Each refresh commits
to \`data/\` and triggers a docs rebuild.

## Source

[\`${repoName}\`](https://github.com/oriz-co/${repoName}) — MIT.
`;

writeFileSync(outPath, mdx);
console.log(`Wrote ${outPath} (${mdx.length} bytes)`);
