/**
 * Attestto i18n — lightweight translation engine for static pages.
 *
 * Usage:
 *   <span data-i18n="hero.title">Default text</span>
 *   <img data-i18n-alt="hero.logo_alt" alt="Default alt">
 *   <a data-i18n-href="nav.com_url" data-i18n="nav.com" href="...">Link</a>
 *   <meta data-i18n-content="meta.description" content="...">
 *
 * Detects language from: URL ?lang=, localStorage, navigator.language
 * Persists choice to localStorage.
 */
(function () {
  'use strict';

  const SUPPORTED = ['en', 'es'];
  const DEFAULT = 'en';
  const STORAGE_KEY = 'attestto_lang';

  let translations = {};
  let currentLang = DEFAULT;

  // ── Detect language ──
  function detectLang() {
    // 1. URL param
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang && SUPPORTED.includes(urlLang)) return urlLang;

    // 2. localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    // 3. Browser language
    const nav = (navigator.language || '').slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(nav)) return nav;

    return DEFAULT;
  }

  // ── Resolve nested key: "hero.title" → translations.hero.title ──
  function resolve(key) {
    return key.split('.').reduce(function (obj, k) {
      return obj && obj[k];
    }, translations);
  }

  // ── Apply translations to DOM ──
  function applyTranslations() {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var val = resolve(el.getAttribute('data-i18n'));
      if (val) el.textContent = val;
    });

    // innerHTML (for strings with markup)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var val = resolve(el.getAttribute('data-i18n-html'));
      if (val) el.innerHTML = val;
    });

    // Attributes
    ['alt', 'href', 'content', 'title', 'placeholder'].forEach(function (attr) {
      document.querySelectorAll('[data-i18n-' + attr + ']').forEach(function (el) {
        var val = resolve(el.getAttribute('data-i18n-' + attr));
        if (val) el.setAttribute(attr, val);
      });
    });

    // Update html lang
    document.documentElement.setAttribute('lang', currentLang);

    // Update switcher active state
    document.querySelectorAll('[data-lang-switch]').forEach(function (el) {
      var isActive = el.getAttribute('data-lang-switch') === currentLang;
      el.classList.toggle('lang-active', isActive);
    });
  }

  // ── Load translations ──
  function loadTranslations(lang, callback) {
    // Resolve path relative to site root
    var basePath = '/assets/i18n/';
    // Cache-bust on each session so copy edits propagate without users
    // having to hard-refresh. Tradeoff: re-fetches the JSON per page load.
    var url = basePath + lang + '.json?v=' + Date.now();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            translations = JSON.parse(xhr.responseText);
          } catch (e) {
            console.warn('[i18n] Failed to parse', url, e);
            translations = {};
          }
        } else {
          console.warn('[i18n] Failed to load', url, xhr.status);
          translations = {};
        }
        callback();
      }
    };
    xhr.send();
  }

  // ── Switch language ──
  function switchLang(lang) {
    if (!SUPPORTED.includes(lang) || lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Update the URL so that "copy link" carries the language and
    // recipients land in the same language as the sharer. Uses
    // history.replaceState so the back button isn't polluted.
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // Older browsers without URL constructor — non-fatal
    }

    loadTranslations(lang, applyTranslations);
  }

  // ── Build switcher UI ──
  function injectSwitcher() {
    var nav = document.querySelector('.nav-links');
    if (!nav) return;

    var li = document.createElement('li');
    li.className = 'lang-switcher';

    SUPPORTED.forEach(function (lang, i) {
      var btn = document.createElement('button');
      btn.textContent = lang.toUpperCase();
      btn.setAttribute('data-lang-switch', lang);
      btn.className = 'lang-btn' + (lang === currentLang ? ' lang-active' : '');
      btn.addEventListener('click', function () { switchLang(lang); });
      li.appendChild(btn);

      if (i < SUPPORTED.length - 1) {
        var sep = document.createElement('span');
        sep.textContent = '|';
        sep.className = 'lang-sep';
        li.appendChild(sep);
      }
    });

    nav.appendChild(li);

    // Mobile: also add to nav brand area for when nav-links is hidden
    var mobileSwitch = li.cloneNode(true);
    mobileSwitch.className = 'lang-switcher lang-switcher-mobile';
    mobileSwitch.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchLang(btn.getAttribute('data-lang-switch'));
      });
    });
    var navContainer = document.querySelector('nav .container');
    if (navContainer) {
      navContainer.insertBefore(mobileSwitch, navContainer.querySelector('.nav-links'));
    }
  }

  // ── Init ──
  function init() {
    currentLang = detectLang();
    localStorage.setItem(STORAGE_KEY, currentLang);
    // Stamp current lang into URL so shared links carry it even without
    // the user clicking the switcher.
    try {
      var initUrl = new URL(window.location.href);
      if (initUrl.searchParams.get('lang') !== currentLang) {
        initUrl.searchParams.set('lang', currentLang);
        window.history.replaceState({}, '', initUrl.toString());
      }
    } catch (e) { /* non-fatal */ }
    injectSwitcher();
    loadTranslations(currentLang, applyTranslations);
  }

  // Expose for programmatic use
  window.attesttoI18n = {
    switchLang: switchLang,
    getCurrentLang: function () { return currentLang; },
    SUPPORTED: SUPPORTED
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
