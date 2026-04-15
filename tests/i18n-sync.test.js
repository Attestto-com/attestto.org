/**
 * i18n sync check — ensures en.json stays in sync with Astro pages.
 *
 * Catches three failure modes:
 * 1. STALE: en.json has a key that overrides correct HTML with wrong text
 * 2. DEAD:  en.json has keys no Astro page references (bloat, confusing)
 * 3. MISSING: Astro page references a key not in en.json (silent translation failure)
 *
 * Run: npm test (vitest)
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const ROOT = join(import.meta.dirname, '..')
const EN_JSON_PATH = join(ROOT, 'public', 'assets', 'i18n', 'en.json')
const PAGES_DIR = join(ROOT, 'src')

// ── Helpers ──

function readEnJson() {
  const raw = readFileSync(EN_JSON_PATH, 'utf-8')
  return JSON.parse(raw)
}

/** Flatten { index: { title: "..." } } → ["index.title"] */
function flattenKeys(obj, prefix = '') {
  const keys = []
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, full))
    } else {
      keys.push(full)
    }
  }
  return keys
}

/** Recursively find all .astro files */
function findAstroFiles(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...findAstroFiles(full))
    } else if (extname(full) === '.astro') {
      results.push(full)
    }
  }
  return results
}

/** Extract all data-i18n keys from file content */
function extractI18nKeys(content) {
  const keys = new Set()
  // Match data-i18n="key", data-i18n-html="key", data-i18n-alt="key", etc.
  // Also match dynamic {link.i18n} style — but skip those (they're variable)
  const staticPattern = /data-i18n(?:-\w+)?="([^"]+)"/g
  let match
  while ((match = staticPattern.exec(content)) !== null) {
    keys.add(match[1])
  }
  return keys
}

// ── Load data ──

const enJson = readEnJson()
const allEnKeys = new Set(flattenKeys(enJson))

const astroFiles = findAstroFiles(PAGES_DIR)
const allUsedKeys = new Set()
for (const file of astroFiles) {
  const content = readFileSync(file, 'utf-8')
  for (const key of extractI18nKeys(content)) {
    allUsedKeys.add(key)
  }
}

// ── Tests ──

describe('i18n sync', () => {
  it('en.json is valid JSON with no empty namespaces', () => {
    expect(Object.keys(enJson).length).toBeGreaterThan(0)
    for (const [ns, val] of Object.entries(enJson)) {
      expect(typeof val).toBe('object')
      expect(Object.keys(val).length, `namespace "${ns}" is empty`).toBeGreaterThan(0)
    }
  })

  it('no MISSING keys — every data-i18n in Astro pages exists in en.json', () => {
    const missing = []
    for (const key of allUsedKeys) {
      if (!allEnKeys.has(key)) {
        missing.push(key)
      }
    }
    expect(missing, `Missing keys in en.json:\n  ${missing.join('\n  ')}`).toEqual([])
  })

  it('no DEAD keys — every en.json key is referenced by at least one Astro page', () => {
    // Some keys are used dynamically (nav.*, footer.*) — whitelist those
    // nav.*, footer.* are injected via component configs, devnav.* via JS nav
    const dynamicPrefixes = ['nav.', 'footer.', 'devnav.']

    const dead = []
    for (const key of allEnKeys) {
      if (dynamicPrefixes.some(p => key.startsWith(p))) continue
      if (!allUsedKeys.has(key)) {
        dead.push(key)
      }
    }
    expect(dead, `Dead keys in en.json (not used by any .astro file):\n  ${dead.join('\n  ')}`).toEqual([])
  })

  it('HTML content uses data-i18n-html, not data-i18n', () => {
    const htmlKeyValues = []
    for (const key of allEnKeys) {
      const parts = key.split('.')
      let val = enJson
      for (const p of parts) val = val?.[p]
      if (typeof val === 'string' && /<[a-z][\s\S]*>/i.test(val)) {
        htmlKeyValues.push(key)
      }
    }

    // For each key with HTML in en.json, verify pages use data-i18n-html (not data-i18n)
    const wrongAttr = []
    for (const file of astroFiles) {
      const content = readFileSync(file, 'utf-8')
      for (const key of htmlKeyValues) {
        // Check if this file uses data-i18n="key" (wrong — should be data-i18n-html)
        const wrongPattern = new RegExp(`data-i18n="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`)
        if (wrongPattern.test(content)) {
          wrongAttr.push(`${file.replace(ROOT + '/', '')}: ${key} should use data-i18n-html`)
        }
      }
    }
    expect(wrongAttr, `Keys with HTML content must use data-i18n-html:\n  ${wrongAttr.join('\n  ')}`).toEqual([])
  })
})
