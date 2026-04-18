/**
 * i18n parity check — ensures every EN page has an ES counterpart and vice versa.
 *
 * Catches:
 * 1. Pages missing their /es/ counterpart (or orphaned /es/ pages with no EN root)
 * 2. Wrong lang attribute on built pages
 *
 * Excludes: /docs/ (EN-only for now), /for/ (EN-only), /404, /revisor-pliegos (ES-only tool)
 */

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join, relative } from 'path'

const PAGES_DIR = join(import.meta.dirname, 'pages')

// Pages that are intentionally single-language (no counterpart needed)
const SKIP_PATTERNS = [
  /^docs\//, // docs are EN-only
  /^for\//, // /for/developers is EN-only
  /^404\.astro$/, // error page
  /^revisor-pliegos\.astro$/, // ES-only tool
]

function collectAstroPages(dir: string, base = ''): string[] {
  const pages: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory() && entry.name !== 'es') {
      pages.push(...collectAstroPages(join(dir, entry.name), rel))
    } else if (entry.isFile() && entry.name.endsWith('.astro')) {
      pages.push(rel)
    }
  }
  return pages
}

function shouldSkip(page: string): boolean {
  return SKIP_PATTERNS.some((p) => p.test(page))
}

describe('i18n parity', () => {
  const enPages = collectAstroPages(PAGES_DIR).filter((p) => !shouldSkip(p))
  const esDir = join(PAGES_DIR, 'es')

  it('every EN page has an ES counterpart', () => {
    const missing: string[] = []
    for (const page of enPages) {
      const esPath = join(esDir, page)
      if (!existsSync(esPath)) {
        missing.push(page)
      }
    }
    expect(missing, `EN pages missing ES counterpart:\n  ${missing.join('\n  ')}`).toEqual([])
  })

  it('every ES page has an EN counterpart', () => {
    if (!existsSync(esDir)) return
    const esPages = collectAstroPages(esDir)
    const missing: string[] = []
    for (const page of esPages) {
      const enPath = join(PAGES_DIR, page)
      if (!existsSync(enPath)) {
        missing.push(`es/${page}`)
      }
    }
    expect(missing, `ES pages missing EN counterpart:\n  ${missing.join('\n  ')}`).toEqual([])
  })

  it('EN pages do not have lang="es"', () => {
    const wrong: string[] = []
    for (const page of enPages) {
      const content = readFileSync(join(PAGES_DIR, page), 'utf-8')
      if (/lang\s*=\s*"es"/.test(content)) {
        wrong.push(page)
      }
    }
    expect(wrong, `EN pages with lang="es":\n  ${wrong.join('\n  ')}`).toEqual([])
  })

  it('ES pages have lang="es"', () => {
    if (!existsSync(esDir)) return
    const esPages = collectAstroPages(esDir)
    const wrong: string[] = []
    for (const page of esPages) {
      const content = readFileSync(join(esDir, page), 'utf-8')
      if (!/lang\s*=\s*"es"/.test(content)) {
        wrong.push(`es/${page}`)
      }
    }
    expect(wrong, `ES pages missing lang="es":\n  ${wrong.join('\n  ')}`).toEqual([])
  })
})
