// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { readFileSync, existsSync } from "node:fs";

// Read site config produced by deploy.yml (title + repo + homepage).
const cfgPath = new URL("./oriz.config.json", import.meta.url);
const cfg = existsSync(cfgPath)
  ? JSON.parse(readFileSync(cfgPath, "utf8"))
  : { title: "Oriz API", repo: "oriz-co/oriz-api-docs-template", homepage: "https://oriz.in" };

export default defineConfig({
  site: cfg.homepage,
  integrations: [
    starlight({
      title: `${cfg.title} · oriz`,
      description: `${cfg.title} — daily-refreshed open data API by oriz.in`,
      logo: { src: "./src/assets/logo.svg", replacesTitle: false },
      favicon: "/favicon.svg",
      social: {
        github: `https://github.com/${cfg.repo}`,
      },
      editLink: {
        baseUrl: `https://github.com/${cfg.repo}/edit/main/`,
      },
      customCss: ["./src/styles/oriz.css"],
      components: {
        // Default Starlight components - override only if needed.
      },
      sidebar: [
        { label: "Overview", link: "/" },
        { label: "API Reference", link: "/api/" },
      ],
      lastUpdated: true,
      pagination: false,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      credits: false,
    }),
  ],
});
