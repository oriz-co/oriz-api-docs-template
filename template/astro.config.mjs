// @ts-check
import { defineConfig } from 'astro/config'

// Path D — Stripe/Linear-style hero + live data + README content
// Bootstrap script copies README.md + data/ from the host API repo before build.
export default defineConfig({
	output: 'static',
	build: { format: 'directory' },
	markdown: {
		shikiConfig: {
			theme: 'github-light',
			wrap: true,
		},
		gfm: true,
		smartypants: true,
	},
	vite: {
		build: {
			cssMinify: 'lightningcss',
			minify: 'esbuild',
		},
	},
})
