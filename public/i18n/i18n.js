/**
 * Attestto i18n — lightweight runtime for static sites.
 *
 * How it works:
 *   1. Detects language from URL ?lang=, localStorage, or browser preference.
 *   2. Fetches the matching JSON translation file.
 *   3. Walks every element with [data-i18n] and swaps its textContent.
 *      Elements with [data-i18n-html] get innerHTML instead (for inline markup).
 *   4. Updates <html lang>, og:locale, and meta description.
 *   5. Persists the choice in localStorage.
 *
 * Adding a language:
 *   1. Copy en.json → xx.json, translate values.
 *   2. Add 'xx' to SUPPORTED below.
 *   3. Add the flag/label to the switcher in index.html.
 */

const SUPPORTED = ['en', 'es'];
const FALLBACK = 'en';
const CACHE = {};

function detect() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('lang');
  if (fromUrl && SUPPORTED.includes(fromUrl)) return fromUrl;

  const stored = localStorage.getItem('attestto-lang');
  if (stored && SUPPORTED.includes(stored)) return stored;

  const nav = (navigator.language || '').slice(0, 2);
  if (SUPPORTED.includes(nav)) return nav;

  return FALLBACK;
}

async function load(lang) {
  if (CACHE[lang]) return CACHE[lang];
  const res = await fetch(`/i18n/${lang}.json`);
  if (!res.ok) throw new Error(`i18n: failed to load ${lang}.json`);
  CACHE[lang] = await res.json();
  return CACHE[lang];
}

function apply(translations) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key] != null) el.textContent = translations[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (translations[key] != null) el.innerHTML = translations[key];
  });
}

function updateMeta(lang) {
  document.documentElement.lang = lang;
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.content = lang === 'es' ? 'es_ES' : 'en_US';
  const desc = document.querySelector('meta[name="description"]');
  if (desc && lang === 'es') {
    desc.content = 'Mesh P2P de codigo abierto para identidad soberana. Credenciales verificables, identificadores descentralizados y sincronizacion de estado cifrada anclada en Solana. Sin dependencia de proveedor.';
  } else if (desc) {
    desc.content = 'Open-source P2P mesh for sovereign identity. Verifiable credentials, decentralized identifiers, and encrypted state-sync anchored on Solana. No vendor lock-in. Fork it, deploy it, own it.';
  }
}

function updateSwitcher(lang) {
  document.querySelectorAll('[data-lang-switch]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang-switch') === lang);
  });
}

async function setLang(lang) {
  if (!SUPPORTED.includes(lang)) lang = FALLBACK;
  const t = await load(lang);
  apply(t);
  updateMeta(lang);
  updateSwitcher(lang);
  localStorage.setItem('attestto-lang', lang);

  // Update URL without reload
  const url = new URL(window.location);
  url.searchParams.set('lang', lang);
  history.replaceState(null, '', url);
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  const lang = detect();
  setLang(lang);

  // Bind switcher buttons
  document.querySelectorAll('[data-lang-switch]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      setLang(btn.getAttribute('data-lang-switch'));
    });
  });
});
