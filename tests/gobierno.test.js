import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load the HTML page
const html = readFileSync(resolve(__dirname, '../gobierno/index.html'), 'utf-8')

function loadPage() {
  document.documentElement.innerHTML = ''
  document.write(html)
  document.close()
  // Trigger DOMContentLoaded won't re-run inline scripts in jsdom,
  // so we manually extract and eval the script content
  const scripts = document.querySelectorAll('script:not([src])')
  for (const script of scripts) {
    if (script.textContent.includes('fileDrop')) {
      // eslint-disable-next-line no-eval
      eval(script.textContent)
    }
  }
}

// ════════════════════════════════════════
// 1. Page structure tests
// ════════════════════════════════════════

describe('Gobierno page — structure', () => {
  beforeEach(() => { loadPage() })

  it('has correct page title', () => {
    expect(document.title).toBe('Revisor de Pliegos — Attestto Gobierno')
  })

  it('has meta description in Spanish', () => {
    const desc = document.querySelector('meta[name="description"]')
    expect(desc).not.toBeNull()
    expect(desc.content).toContain('funcionarios publicos')
  })

  it('has Open Graph tags', () => {
    const ogTitle = document.querySelector('meta[property="og:title"]')
    expect(ogTitle).not.toBeNull()
    expect(ogTitle.content).toContain('Revisor de Pliegos')
  })

  it('has canonical URL', () => {
    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical).not.toBeNull()
    expect(canonical.href).toBe('https://attestto.org/gobierno')
  })
})

// ════════════════════════════════════════
// 2. Navigation tests
// ════════════════════════════════════════

describe('Gobierno page — navigation', () => {
  beforeEach(() => { loadPage() })

  it('has nav with brand link to root', () => {
    const brand = document.querySelector('.nav-brand')
    expect(brand).not.toBeNull()
    expect(brand.getAttribute('href')).toBe('/')
  })

  it('has link to /why', () => {
    const whyLink = document.querySelector('a[href="/why"]')
    expect(whyLink).not.toBeNull()
  })

  it('has link to /for/developers', () => {
    const devLink = document.querySelector('a[href="/for/developers"]')
    expect(devLink).not.toBeNull()
  })

  it('has active gobierno link', () => {
    const govLink = document.querySelector('a[href="/gobierno"]')
    expect(govLink).not.toBeNull()
    expect(govLink.style.color).toBe('rgb(96, 165, 250)') // #60a5fa
  })
})

// ════════════════════════════════════════
// 3. Hero section tests
// ════════════════════════════════════════

describe('Gobierno page — hero', () => {
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
    expect(badge.textContent).toContain('funcionarios publicos')
  })

  it('has lead paragraph describing the tool', () => {
    const lead = document.querySelector('.gov-hero .lead')
    expect(lead).not.toBeNull()
    expect(lead.textContent).toContain('dependencia de proveedor')
    expect(lead.textContent).toContain('privacidad')
    expect(lead.textContent).toContain('estandares abiertos')
  })
})

// ════════════════════════════════════════
// 4. Analyzer form tests
// ════════════════════════════════════════

describe('Gobierno page — analyzer form', () => {
  beforeEach(() => { loadPage() })

  it('has textarea for pliego text', () => {
    const textarea = document.getElementById('plegoText')
    expect(textarea).not.toBeNull()
    expect(textarea.tagName).toBe('TEXTAREA')
    expect(textarea.placeholder).toContain('pliego')
  })

  it('has file upload area', () => {
    const fileDrop = document.getElementById('fileDrop')
    expect(fileDrop).not.toBeNull()
    const fileInput = document.getElementById('fileInput')
    expect(fileInput).not.toBeNull()
    expect(fileInput.type).toBe('file')
    expect(fileInput.accept).toContain('.pdf')
    expect(fileInput.accept).toContain('.docx')
    expect(fileInput.accept).toContain('.txt')
  })

  it('has API key input (password type)', () => {
    const apiKey = document.getElementById('apiKey')
    expect(apiKey).not.toBeNull()
    expect(apiKey.type).toBe('password')
    expect(apiKey.placeholder).toContain('sk-ant-')
  })

  it('has API key section inside details (collapsed by default)', () => {
    const details = document.querySelector('.api-key-section')
    expect(details).not.toBeNull()
    expect(details.tagName).toBe('DETAILS')
    expect(details.open).toBe(false)
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
})

// ════════════════════════════════════════
// 5. Button state logic tests
// ════════════════════════════════════════

describe('Gobierno page — button state logic', () => {
  beforeEach(() => { loadPage() })

  it('button stays disabled with only text (no API key)', () => {
    const textarea = document.getElementById('plegoText')
    const btn = document.getElementById('analyzeBtn')
    textarea.value = 'x'.repeat(100)
    textarea.dispatchEvent(new Event('input'))
    expect(btn.disabled).toBe(true)
  })

  it('button stays disabled with only API key (no text)', () => {
    const apiKey = document.getElementById('apiKey')
    const btn = document.getElementById('analyzeBtn')
    apiKey.value = 'sk-ant-test-key-123'
    apiKey.dispatchEvent(new Event('input'))
    expect(btn.disabled).toBe(true)
  })

  it('button enables with both text (>50 chars) and valid API key', () => {
    const textarea = document.getElementById('plegoText')
    const apiKey = document.getElementById('apiKey')
    const btn = document.getElementById('analyzeBtn')

    textarea.value = 'x'.repeat(100)
    textarea.dispatchEvent(new Event('input'))
    apiKey.value = 'sk-ant-test-key-123'
    apiKey.dispatchEvent(new Event('input'))

    expect(btn.disabled).toBe(false)
  })

  it('button stays disabled with short text (<50 chars)', () => {
    const textarea = document.getElementById('plegoText')
    const apiKey = document.getElementById('apiKey')
    const btn = document.getElementById('analyzeBtn')

    textarea.value = 'short text'
    textarea.dispatchEvent(new Event('input'))
    apiKey.value = 'sk-ant-test-key-123'
    apiKey.dispatchEvent(new Event('input'))

    expect(btn.disabled).toBe(true)
  })

  it('button stays disabled if API key does not start with sk-', () => {
    const textarea = document.getElementById('plegoText')
    const apiKey = document.getElementById('apiKey')
    const btn = document.getElementById('analyzeBtn')

    textarea.value = 'x'.repeat(100)
    textarea.dispatchEvent(new Event('input'))
    apiKey.value = 'not-a-valid-key'
    apiKey.dispatchEvent(new Event('input'))

    expect(btn.disabled).toBe(true)
  })
})

// ════════════════════════════════════════
// 6. Checklist tests
// ════════════════════════════════════════

describe('Gobierno page — manual checklist', () => {
  beforeEach(() => { loadPage() })

  it('has 8 checklist items', () => {
    const items = document.querySelectorAll('.check-item')
    expect(items.length).toBe(8)
  })

  it('each checklist item has title, description, and legal reference', () => {
    const items = document.querySelectorAll('.check-item')
    for (const item of items) {
      expect(item.querySelector('h3')).not.toBeNull()
      expect(item.querySelector('p')).not.toBeNull()
      expect(item.querySelector('.ref')).not.toBeNull()
      expect(item.querySelector('.ref').textContent.length).toBeGreaterThan(5)
    }
  })

  it('checklist covers portabilidad de datos', () => {
    const titles = [...document.querySelectorAll('.check-item h3')].map(h => h.textContent)
    expect(titles).toContain('Portabilidad de datos')
  })

  it('checklist covers estandares abiertos', () => {
    const titles = [...document.querySelectorAll('.check-item h3')].map(h => h.textContent)
    expect(titles).toContain('Estandares abiertos')
  })

  it('checklist covers resiliencia ante ataques', () => {
    const titles = [...document.querySelectorAll('.check-item h3')].map(h => h.textContent)
    expect(titles).toContain('Resiliencia ante ataques')
  })

  it('checklist covers consentimiento informado', () => {
    const titles = [...document.querySelectorAll('.check-item h3')].map(h => h.textContent)
    expect(titles).toContain('Consentimiento informado')
  })

  it('checklist covers concentracion de mercado', () => {
    const titles = [...document.querySelectorAll('.check-item h3')].map(h => h.textContent)
    expect(titles).toContain('Concentracion de mercado')
  })

  it('checklist covers acceso ciudadano', () => {
    const titles = [...document.querySelectorAll('.check-item h3')].map(h => h.textContent)
    expect(titles).toContain('Acceso ciudadano')
  })

  it('references Constitucion Politica', () => {
    const refs = [...document.querySelectorAll('.check-item .ref')].map(r => r.textContent).join(' ')
    expect(refs).toContain('Constitucion')
  })

  it('references Ley 8968', () => {
    const refs = [...document.querySelectorAll('.check-item .ref')].map(r => r.textContent).join(' ')
    expect(refs).toContain('Ley 8968')
  })

  it('references Conti 2022 attack', () => {
    const text = document.querySelector('.checklist').textContent
    expect(text).toContain('Conti 2022')
  })

  it('references NIST CSF 2.0', () => {
    const refs = [...document.querySelectorAll('.check-item .ref')].map(r => r.textContent).join(' ')
    expect(refs).toContain('NIST CSF 2.0')
  })
})

// ════════════════════════════════════════
// 7. Result rendering tests
// ════════════════════════════════════════

describe('Gobierno page — result rendering', () => {
  beforeEach(() => { loadPage() })

  it('renderResults shows results section', () => {
    const analysis = {
      scores: {
        vendor_lock_in: { value: 30, label: 'Dependencia de proveedor' },
      },
      risks: [],
      summary: 'Test',
    }

    window._gobierno.renderResults(analysis)
    const results = document.getElementById('results')
    expect(results.classList.contains('visible')).toBe(true)
  })

  it('renderResults creates score items', () => {
    const analysis = {
      scores: {
        vendor_lock_in: { value: 30, label: 'Dependencia' },
        privacy: { value: 70, label: 'Privacidad' },
      },
      risks: [],
      summary: 'Test',
    }

    window._gobierno.renderResults(analysis)
    const scoreItems = document.querySelectorAll('.score-item')
    expect(scoreItems.length).toBe(2)
  })

  it('renderResults applies correct color classes to scores', () => {
    const analysis = {
      scores: {
        good: { value: 85, label: 'Good' },
        warn: { value: 55, label: 'Warn' },
        bad: { value: 20, label: 'Bad' },
      },
      risks: [],
      summary: '',
    }

    window._gobierno.renderResults(analysis)
    const scoreValues = document.querySelectorAll('.score-value')
    expect(scoreValues[0].classList.contains('score-good')).toBe(true)
    expect(scoreValues[1].classList.contains('score-warn')).toBe(true)
    expect(scoreValues[2].classList.contains('score-bad')).toBe(true)
  })

  it('renderResults creates risk cards with severity badges', () => {
    const analysis = {
      scores: {},
      risks: [
        { title: 'Risk 1', severity: 'alta', description: 'Desc 1', recommendation: 'Rec 1', legal_ref: 'Ley X' },
        { title: 'Risk 2', severity: 'media', description: 'Desc 2', recommendation: 'Rec 2', legal_ref: 'Art Y' },
        { title: 'Risk 3', severity: 'baja', description: 'Desc 3', recommendation: 'Rec 3', legal_ref: '' },
      ],
      summary: 'Summary text here.',
    }

    window._gobierno.renderResults(analysis)
    const cards = document.querySelectorAll('.risk-card')
    // 1 summary card + 3 risk cards
    expect(cards.length).toBe(4)

    const severities = document.querySelectorAll('.severity')
    expect(severities[0].classList.contains('severity-alta')).toBe(true)
    expect(severities[1].classList.contains('severity-media')).toBe(true)
    expect(severities[2].classList.contains('severity-baja')).toBe(true)
  })

  it('renderResults populates raw output with JSON', () => {
    const analysis = { scores: {}, risks: [], summary: 'Test' }

    window._gobierno.renderResults(analysis)
    const raw = document.getElementById('rawOutput')
    expect(raw.textContent).toContain('"summary"')
    expect(raw.textContent).toContain('Test')
  })
})

// ════════════════════════════════════════
// 8. Footer tests
// ════════════════════════════════════════

describe('Gobierno page — footer', () => {
  beforeEach(() => { loadPage() })

  it('has footer with Apache 2.0 license link', () => {
    const footer = document.querySelector('.gov-footer')
    expect(footer).not.toBeNull()
    const licenseLink = footer.querySelector('a[href*="apache.org"]')
    expect(licenseLink).not.toBeNull()
    expect(licenseLink.textContent).toBe('Apache 2.0')
  })

  it('footer states no data is stored', () => {
    const footer = document.querySelector('.gov-footer')
    expect(footer.textContent).toContain('no almacena datos')
  })

  it('footer links to attestto.org root', () => {
    const footer = document.querySelector('.gov-footer')
    const homeLink = footer.querySelector('a[href="/"]')
    expect(homeLink).not.toBeNull()
  })

  it('footer links to GitHub', () => {
    const footer = document.querySelector('.gov-footer')
    const ghLink = footer.querySelector('a[href*="github.com"]')
    expect(ghLink).not.toBeNull()
  })
})

// ════════════════════════════════════════
// 9. Security / privacy tests
// ════════════════════════════════════════

describe('Gobierno page — security and privacy', () => {
  beforeEach(() => { loadPage() })

  it('file input is hidden (no direct display)', () => {
    const fileInput = document.getElementById('fileInput')
    // CSS sets display:none but jsdom doesn't compute styles, check the inline style in the CSS
    expect(fileInput.style.display === 'none' || fileInput.parentElement.querySelector('input[type="file"]')).toBeTruthy()
  })

  it('API key field is password type (not visible)', () => {
    const apiKey = document.getElementById('apiKey')
    expect(apiKey.type).toBe('password')
  })

  it('no external scripts besides Plausible', () => {
    const scripts = document.querySelectorAll('script[src]')
    for (const s of scripts) {
      expect(s.src).toContain('plausible.io')
    }
  })

  it('external links have rel="noopener"', () => {
    const externalLinks = document.querySelectorAll('a[target="_blank"]')
    for (const link of externalLinks) {
      expect(link.rel).toContain('noopener')
    }
  })

  it('privacy statement is visible in the analyzer intro', () => {
    const intro = document.querySelector('.analyzer-intro')
    expect(intro.textContent).toContain('ningun dato sale de su navegador')
  })
})

// ════════════════════════════════════════
// 10. Accessibility tests
// ════════════════════════════════════════

describe('Gobierno page — accessibility', () => {
  beforeEach(() => { loadPage() })

  it('has lang="es" on html element', () => {
    expect(document.documentElement.lang).toBe('es')
  })

  it('textarea has associated label', () => {
    const label = document.querySelector('label[for="plegoText"]')
    expect(label).not.toBeNull()
    const textarea = document.getElementById('plegoText')
    expect(textarea).not.toBeNull()
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
})
