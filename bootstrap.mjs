#!/usr/bin/env node
/**
 * bootstrap.mjs — invoked from each API repo's deploy.yml.
 *
 * Copies the host API repo's README.md + data/ + meta info into the
 * template/, then builds the Astro site to dist/.
 *
 * Usage:
 *   node bootstrap.mjs --src=<host-repo-root> --dest=<output-dist-dir>
 *
 * Or via env vars: BOOTSTRAP_SRC, BOOTSTRAP_DEST.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const argv = Object.fromEntries(
	process.argv.slice(2).map((a) => {
		const [k, ...v] = a.replace(/^--/, '').split('=')
		return [k, v.join('=') || true]
	}),
)

const SRC = resolve(argv.src ?? process.env.BOOTSTRAP_SRC ?? process.cwd())
const DEST = resolve(argv.dest ?? process.env.BOOTSTRAP_DEST ?? join(SRC, 'dist'))
const TEMPLATE = join(__dirname, 'template')

console.log(`[bootstrap] src=${SRC}`)
console.log(`[bootstrap] dest=${DEST}`)
console.log(`[bootstrap] template=${TEMPLATE}`)

// 1. Stage a fresh copy of the template into a sibling dir
const STAGE = join(SRC, '.api-docs-stage')
if (existsSync(STAGE)) rmSync(STAGE, { recursive: true, force: true })
cpSync(TEMPLATE, STAGE, { recursive: true })

// 2. Copy host README → STAGE/src/content/readme.md
const readme = join(SRC, 'README.md')
const contentDir = join(STAGE, 'src', 'content')
mkdirSync(contentDir, { recursive: true })
if (existsSync(readme)) {
	cpSync(readme, join(contentDir, 'readme.md'))
	console.log('[bootstrap] copied README.md')
} else {
	writeFileSync(join(contentDir, 'readme.md'), '# API\n\nNo README found.\n')
	console.log('[bootstrap] WARN: no README.md found in host repo')
}

// 3. Copy host data/ → STAGE/public/data/
const data = join(SRC, 'data')
if (existsSync(data)) {
	cpSync(data, join(STAGE, 'public', 'data'), { recursive: true })
	console.log('[bootstrap] copied data/')
} else {
	console.log('[bootstrap] WARN: no data/ folder')
}

// 4. Write meta.json: slug, subdomain, repo
const cnameFile = join(SRC, 'CNAME')
const subdomain = existsSync(cnameFile) ? readFileSync(cnameFile, 'utf8').trim() : ''
const pkgPath = join(SRC, 'package.json')
const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : {}
const meta = {
	slug: pkg.name ?? subdomain.split('.')[0] ?? 'api',
	subdomain,
	repo: pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') ?? '',
}
writeFileSync(join(contentDir, 'meta.json'), JSON.stringify(meta, null, 2))
console.log('[bootstrap] meta:', meta)

// 5. Install + build
const run = (cmd, args) => {
	const r = spawnSync(cmd, args, { cwd: STAGE, stdio: 'inherit', shell: process.platform === 'win32' })
	if (r.status !== 0) {
		console.error(`[bootstrap] ${cmd} ${args.join(' ')} failed (${r.status})`)
		process.exit(r.status ?? 1)
	}
}

console.log('[bootstrap] pnpm install...')
run('pnpm', ['install', '--prefer-offline'])

console.log('[bootstrap] pnpm build...')
run('pnpm', ['run', 'build'])

// 6. Move dist to destination
const builtDist = join(STAGE, 'dist')
if (!existsSync(builtDist)) {
	console.error('[bootstrap] no dist/ after build')
	process.exit(1)
}
if (existsSync(DEST)) rmSync(DEST, { recursive: true, force: true })
cpSync(builtDist, DEST, { recursive: true })
console.log(`[bootstrap] DONE → ${DEST}`)

// 7. Cleanup stage
rmSync(STAGE, { recursive: true, force: true })
