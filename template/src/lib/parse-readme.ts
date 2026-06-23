/**
 * Parse a README.md string into hero parts + body.
 *
 * Convention (no enforced schema — just inference):
 * - First H1 (`# Title`) becomes the hero title
 * - The first paragraph AFTER the H1 becomes the description
 * - Everything else (sections, code blocks, lists, etc.) becomes the body
 * - If no H1 is found, falls back to the package name passed in.
 */
export interface ParsedReadme {
	title: string
	description: string
	body: string
}

export function parseReadme(markdown: string, fallbackTitle: string): ParsedReadme {
	const lines = markdown.split(/\r?\n/)

	let title = ''
	let description = ''
	let bodyStart = 0

	// Find first H1
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] ?? ''
		const h1Match = /^#\s+(.+)$/.exec(line)
		if (h1Match?.[1]) {
			title = h1Match[1].trim()
			bodyStart = i + 1
			break
		}
	}

	if (!title) {
		title = fallbackTitle
	}

	// Find first non-empty paragraph after the H1 → description
	const descLines: string[] = []
	let descEnd = bodyStart
	let inDesc = false
	for (let i = bodyStart; i < lines.length; i++) {
		const line = lines[i] ?? ''
		const trimmed = line.trim()

		// Skip leading blank lines
		if (!inDesc && trimmed === '') continue

		// Stop at a heading or fenced code block
		if (trimmed.startsWith('#') || trimmed.startsWith('```')) {
			descEnd = i
			break
		}

		// Stop at first blank line after we've started
		if (inDesc && trimmed === '') {
			descEnd = i
			break
		}

		descLines.push(line)
		inDesc = true
		descEnd = i + 1
	}

	description = descLines.join(' ').replace(/\s+/g, ' ').trim()

	// Body = everything after the description
	const body = lines.slice(descEnd).join('\n').trim()

	return { title, description, body }
}
