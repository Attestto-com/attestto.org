import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load the built HTML page
const html = readFileSync(resolve(__dirname, '../dist/revisor-pliegos/index.html'), 'utf-8')

function loadPage() {
  document.documentElement.innerHTML = ''
  document.write(html)
  document.close()
  const scripts = document.querySelectorAll('script:not([src])')
  for (const script of scripts) {
    if (script.textContent.includes('fileDrop')) {
      // eslint-disable-next-line no-eval
      eval(script.textContent)
    }
  }
}

// ════════════════════════════════════════
// 1. Page structure
// ════════════════════════════════════════

describe('Revisor de Pliegos — structure', () => {
  beforeEach(() => { loadPage() })

  it('has correct page title', () => {
    expect(document.title).toBe('Revisor de Pliegos — Attestto')
  })

  it('has meta description referencing marco legal', () => {
    const desc = document.querySelector('meta[name="description"]')
    expect(desc).not.toBeNull()
    expect(desc.content).toContain('cumplimiento del marco legal')
    expect(desc.content).toContain('funcionarios publicos')
  })

  it('has Open Graph tags', () => {
    const ogTitle = document.querySelector('meta[property="og:title"]')
    expect(ogTitle).not.toBeNull()
    expect(ogTitle.content).toContain('Revisor de Pliegos')
  })

  it('has canonical URL at /revisor-pliegos', () => {
    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical).not.toBeNull()
    expect(canonical.href).toBe('https://attestto.org/revisor-pliegos')
  })

  it('has page-revisor body class', () => {
    expect(document.body.classList.contains('page-revisor')).toBe(true)
  })
})

// ════════════════════════════════════════
// 2. Navigation
// ════════════════════════════════════════

describe('Revisor de Pliegos — navigation', () => {
  beforeEach(() => { loadPage() })

  it('has nav with brand link to root', () => {
    const brand = document.querySelector('.nav-brand')
    expect(brand).not.toBeNull()
    expect(brand.getAttribute('href')).toBe('/')
  })

  it('has brand text containing Revisor de Pliegos', () => {
    const brand = document.querySelector('.nav-brand')
    expect(brand.textContent).toContain('Revisor de Pliegos')
  })
})

// ════════════════════════════════════════
// 3. Hero
// ════════════════════════════════════════

describe('Revisor de Pliegos — hero', () => {
  beforeEach(() => { loadPage() })

  it('has hero with title', () => {
    const h1 = document.querySelector('.gov-hero h1')
    expect(h1).not.toBeNull()
    expect(h1.textContent).toBe('Revisor de Pliegos')
  })

  it('has badge indicating free tool', () => {
    const badge = document.querySelector('.badge')
    expect(badge).not.toBeNull()
    expect(badge.textContent).toContain('gratuita')
  })

  it('has lead paragraph referencing legal framework', () => {
    const lead = document.querySelector('.gov-hero .lead')
    expect(lead).not.toBeNull()
    expect(lead.textContent).toContain('marco legal costarricense')
    expect(lead.textContent).toContain('Ley 8968')
    expect(lead.textContent).toContain('Ley 8642')
  })
})

// ════════════════════════════════════════
// 4. Analyzer form
// ════════════════════════════════════════

describe('Revisor de Pliegos — analyzer form', () => {
  beforeEach(() => { loadPage() })

  it('has file upload area', () => {
    const fileDrop = document.getElementById('fileDrop')
    expect(fileDrop).not.toBeNull()
    const fileInput = document.getElementById('fileInput')
    expect(fileInput).not.toBeNull()
    expect(fileInput.type).toBe('file')
    expect(fileInput.accept).toContain('.pdf')
    expect(fileInput.accept).toContain('.docx')
  })

  it('has analyze button initially disabled', () => {
    const btn = document.getElementById('analyzeBtn')
    expect(btn).not.toBeNull()
    expect(btn.disabled).toBe(true)
    expect(btn.textContent).toBe('Analizar pliego')
  })

  it('has status text area', () => {
    const status = document.getElementById('statusText')
    expect(status).not.toBeNull()
    expect(status.textContent).toBe('')
  })

  it('has results section hidden initially', () => {
    const results = document.getElementById('results')
    expect(results).not.toBeNull()
    expect(results.classList.contains('visible')).toBe(false)
  })

  it('has privacy statement mentioning Anthropic', () => {
    const analyzer = document.querySelector('.analyzer')
    expect(analyzer.textContent).toContain('Anthropic')
    expect(analyzer.textContent).toContain('No se almacena')
  })
})

// ════════════════════════════════════════
// 5. Marco legal section
// ════════════════════════════════════════

describe('Revisor de Pliegos — marco legal', () => {
  beforeEach(() => { loadPage() })

  it('has 8 legal rows', () => {
    const rows = document.querySelectorAll('.legal-row')
    expect(rows.length).toBe(8)
  })

  it('each row has requirement and resolution', () => {
    const rows = document.querySelectorAll('.legal-row')
    for (const row of rows) {
      expect(row.querySelector('.legal-req h3')).not.toBeNull()
      expect(row.querySelector('.legal-req p')).not.toBeNull()
      expect(row.querySelector('.legal-fix p')).not.toBeNull()
    }
  })

  it('covers key laws', () => {
    const text = [...document.querySelectorAll('.legal-req h3')].map(h => h.textContent).join(' ')
    expect(text).toContain('Ley 8968')
    expect(text).toContain('Ley 8642')
    expect(text).toContain('Ley 7494')
    expect(text).toContain('Ley 8292')
    expect(text).toContain('Art. 24 Constitucion')
  })
})

// ════════════════════════════════════════
// 6. Tender checklist
// ════════════════════════════════════════

describe('Revisor de Pliegos — tender checklist', () => {
  beforeEach(() => { loadPage() })

  it('has 12 checkbox items', () => {
    const checks = document.querySelectorAll('#tenderChecklist input[type="checkbox"]')
    expect(checks.length).toBe(12)
  })

  it('has 4 categories', () => {
    const cats = document.querySelectorAll('.tender-category')
    expect(cats.length).toBe(4)
  })

  it('each item has text and law reference', () => {
    const items = document.querySelectorAll('.tender-item')
    for (const item of items) {
      expect(item.querySelector('.tender-text')).not.toBeNull()
      expect(item.querySelector('.tender-law')).not.toBeNull()
      expect(item.querySelector('.tender-law').textContent.length).toBeGreaterThan(3)
    }
  })

  it('has progress counter', () => {
    const count = document.getElementById('checkCount')
    const total = document.getElementById('checkTotal')
    expect(count).not.toBeNull()
    expect(total).not.toBeNull()
    expect(total.textContent).toBe('12')
  })

  it('has print button', () => {
    const btn = document.getElementById('printChecklist')
    expect(btn).not.toBeNull()
    expect(btn.textContent).toContain('Imprimir')
  })

  it('references key laws in checklist items', () => {
    const laws = [...document.querySelectorAll('.tender-law')].map(l => l.textContent).join(' ')
    expect(laws).toContain('Ley 8968')
    expect(laws).toContain('Ley 8642')
    expect(laws).toContain('Ley 7494')
    expect(laws).toContain('Ley 8292')
    expect(laws).toContain('MICITT')
  })
})

// ════════════════════════════════════════
// 7. Security / privacy
// ════════════════════════════════════════

describe('Revisor de Pliegos — security', () => {
  beforeEach(() => { loadPage() })

  it('external links have rel="noopener"', () => {
    const externalLinks = document.querySelectorAll('a[target="_blank"]')
    for (const link of externalLinks) {
      expect(link.rel).toContain('noopener')
    }
  })

  it('links to open source code', () => {
    const ghLink = document.querySelector('a[href*="attestto-pliego-reviewer"]')
    expect(ghLink).not.toBeNull()
  })
})

// ════════════════════════════════════════
// 8. Accessibility
// ════════════════════════════════════════

describe('Revisor de Pliegos — accessibility', () => {
  beforeEach(() => { loadPage() })

  it('has lang="es" on html element', () => {
    expect(document.documentElement.lang).toBe('es')
  })

  it('images have alt text', () => {
    const images = document.querySelectorAll('img')
    for (const img of images) {
      expect(img.alt.length).toBeGreaterThan(0)
    }
  })

  it('button has visible text', () => {
    const btn = document.getElementById('analyzeBtn')
    expect(btn.textContent.trim().length).toBeGreaterThan(0)
  })

  it('does not reference /gobierno anywhere', () => {
    const bodyText = document.body.innerHTML
    expect(bodyText).not.toContain('/gobierno')
  })
})
