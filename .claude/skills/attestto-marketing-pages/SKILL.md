---
name: attestto-marketing-pages
description: Use ANY time the user asks to review, edit, or audit a page on attestto.org, attestto.com, or any Attestto public marketing site (Ark, Open, downloads, country pages, identity, treasury). Captures file locations, i18n model, canonical sources of truth, and the recurring "narrative drift" failure mode.
triggers:
  - attestto.org
  - attestto.com
  - ark page
  - marketing page
  - landing page
  - public page
  - narrative
  - tech accuracy review
  - country page
---

# Attestto Marketing Pages Skill

**Purpose:** stop re-discovering where pages live, what i18n model they use, and which docs/Jira tickets they MUST stay aligned with. Marketing pages drift from engineering reality constantly — this skill is the alignment checklist.

## File locations

| Site | Repo | Path |
|---|---|---|
| **attestto.org** (Open / Ark / downloads) | `~/Attestto/attestto.org/` | static HTML + vanilla JS |
| **attestto.com** (product marketing) | `~/Attestto/CORTEX/frontend/` | Vue/Astro app, lives in `frontend/src/views/public/` |
| **mobile.attestto.com** | `~/Attestto/attestto-mobile/` | mobile PWA |
| **id.attestto.com** | TBD — may be a route on attestto.com | check before assuming |

## attestto.org structure

```
attestto.org/
├── index.html          ← Open landing
├── ark/index.html      ← Ark architecture page
├── downloads/          ← Downloads page
├── assets/
│   ├── i18n/
│   │   ├── en.json     ← English strings
│   │   └── es.json     ← Spanish strings (DO NOT EDIT — see i18n lock below)
│   ├── css/main.css
│   └── js/i18n.js      ← runtime swap on data-i18n attributes
└── README.md
```

**Pattern:** every translatable string is rendered server-side in EN inside HTML, and tagged with `data-i18n="key.path"`. Runtime JS swaps to ES if the user picks Spanish. **Two consequences:**

1. To change visible English copy you can edit either the HTML (the literal in the tag) OR `en.json` (the override). The HTML literal is the fallback when JS hasn't loaded — both should match.
2. To add a new translatable string: add the literal to HTML with `data-i18n="..."`, AND add the key to `en.json`. Spanish handled separately.

## i18n lock (CLAUDE.md governance)

**CLAUDE.md forbids editing `es.*` files in the CORTEX repo's frontend.** That rule was written for `frontend/src/i18n/locales/es.ts` specifically. For `attestto.org/assets/i18n/es.json`:

- **Treat the same way by default**: edit `en.json` (and the EN literal in HTML) only, leave `es.json` for the user to sync.
- **Exception**: if the user explicitly says "update both" or "the rule doesn't apply here", then edit both.
- **Always ask** before touching `es.json` if there's any doubt.

## Canonical sources of truth (cross-check before editing ANY page)

Marketing pages MUST align with these. If a page contradicts them, the page is wrong.

| Topic | Source |
|---|---|
| CA architecture, SNS TLDs, trust ladder | `attestto-desktop/docs/ca-trust-framework.md` |
| CA key governance, Shamir scheme, ceremony | `attestto-desktop/docs/ca-key-governance.md` |
| Ceremony procedure | `attestto-desktop/docs/ca-ceremony-module.md` |
| Vault crypto (cipher, KDF) | `attestto-desktop/src/main/vault/vault-service.ts` (xsalsa20-poly1305 + scrypt) |
| Mesh architecture | `attestto-mesh/` source + `attestto-desktop/ARCHITECTURE.md` |
| Attestation layers (vLEI / SAS / Memo) | memory: `project_attestation_architecture.md` |
| CA Jira chain | ATT-214 epic + ATT-238/239/240/241/242 |
| Two-tier treasury model | skill: `attestto-treasury/SKILL.md` |
| Trust ladder C/B/A+/A | `ca-trust-framework.md` |

## Canonical SNS portfolio (memorize — pages often get this wrong)

```
vault.attestto.sol      — Root CA signing authority (Squads multisig)
sns.attestto.sol        — did:sns spec anchor

# Costa Rica (independent root TLDs, NOT subdomains under attestto.sol)
fi-cr.sol               — CR Finance / Firma Digital authority
go-cr.sol               — CR Government authority
bccr.sol                — Banco Central de CR (transfer planned)
sinpe.sol               — Payment infrastructure (transfer planned)
firmadigital.sol        — Firma Digital brand (transfer to MICITT planned)
registronacional.sol    — National Registry (transfer to RN planned)

# LATAM expansion
fi-mx.sol, fi-br.sol, fi-cl.sol, fi-ar.sol, fi-pe.sol, fi-ec.sol, fi-uy.sol
```

**Wrong patterns to flag and fix on sight:**
- `ca-cr.attestto.sol`, `ca-mx.attestto.sol`, `ca-xx.attestto.sol` — these are NOT real, never were, and confuse the architecture. Country CAs are root TLDs (`fi-cr.sol`).
- `ca.attestto.sol` — does not exist. The trust root is `vault.attestto.sol`.
- "All anchored under attestto.sol" — false. attestto.sol is the namespace for *Attestto's* governance; country CAs are independent TLDs.

## Recurring narrative-drift failure modes

When auditing a marketing page, check for these specific lies that creep in:

1. **Wrong TLDs** — see above. Always cross-check against `ca-trust-framework.md`.
2. **Vault cipher claim** — pages often say "AES-256-GCM" because it sounds standard. The actual cipher is **xsalsa20-poly1305** (NaCl secretbox). Fix on sight.
3. **PKCS#11 / smartcard signing** — pages often imply this is shipped. It is NOT. Per the architect review it's 10-14 days of work, deferred post-hackathon.
4. **MICITT/BCCR governance seats filled** — they are NOT. No conversation has been initiated. Pages must say "Phase 1A founder-only, reserved seats for institutional partners" and never name MICITT or BCCR as current shareholders. ATT-238 rewrite captures this.
5. **OCSP / live revocation checking** — NOT shipped. Validator is parse-only until Session 2 wires OCSP. Pages must not claim live revocation works today.
6. **On-chain cert anchoring (ATT-240)** — `To Do`. Pages saying "every CA signature → Solana tx" should mark as planned, not live.
7. **Browser extension "intercepts TLS"** — Chrome extension API does not allow TLS interception. Best the extension can do is validate cert client-side and surface a trust score (ATT-215). Reword aggressively.
8. **vLEI / SolanaAttestationService** — per memory `project_attestation_architecture.md`, `SolanaAttestationService` is misnamed (it's the vLEI client, not the official SAS). Pages conflating these are wrong. Three real layers: vLEI / SAS / Memo.
9. **"~120 KB per citizen" mesh number** — appears in Ark page, source unverified. Either delete or measure before claiming.
10. **Mobile PWA URL `mobile.attestto.com`** — verify it's live before pages claim it.
11. **"Every installation is a network node"** — mesh node is opt-in, not automatic. Soften.
12. **Hardcoded `faceMatchScore = 0.94`** — no real face embedding comparison exists. Pages claiming "face match" must either say "(planned)" or be removed entirely.
13. **Phase numbers / shareholder counts** — `ca-key-governance.md` is the source. Pages inventing "5-of-9" or "7-of-12" without doc backing are fabricating.
14. **Time horizons in TLS roadmap** — "6 months / 12 months / 2-5 years" — these drift. Cross-check with current Jira (ATT-214 chain) before publishing.

## Audit checklist (run on EVERY page review)

1. **TLDs** — grep page for `.sol`, validate every match against the portfolio above.
2. **Cipher claims** — grep for `AES`, `GCM`, `chacha`, `xsalsa` — must match vault-service.ts.
3. **PKCS#11 / smartcard** — grep, soften any claim of shipped.
4. **MICITT / BCCR / SINPE / Auditor as seats** — grep, soften to "Phase 2 reserved" unless we have a real MOU.
5. **OCSP / revocation / "live"** — grep, mark as planned unless ATT-240 / OCSP wiring has shipped.
6. **TLS interception** — grep, reword to client-side validation.
7. **vLEI vs SAS conflation** — search for "SAS", "Solana Attestation Service", "attestation service" — verify mapping.
8. **Trust ladder C/B/A+/A** — if the page mentions identity tiers, must use these exact names.
9. **Phase numbers** — cross-check with ATT-238/239/240/241/242 + `ca-key-governance.md`.
10. **External URLs** — verify each one resolves before publishing claims.
11. **Spanish parity** — list which strings need ES sync, surface to user; do NOT edit `es.json` without permission.

## What NOT to do

1. **Do not edit `es.json` / `es.ts`** without explicit permission per CLAUDE.md i18n lock.
2. **Do not invent governance seats** — naming MICITT/BCCR/SINPE as shareholders before a signed MOU is reputational damage waiting to happen. Always honor the Phase 1A founder-only reality.
3. **Do not fabricate measurements** ("~120 KB", "~5 seconds", "98% accuracy") — only use numbers anchored in real benchmarks or code. If you can't source it, delete it.
4. **Do not promise PKCS#11 / smartcard signing in current tense** — it's not shipped. Always "(planned)" or remove.
5. **Do not ship narrative drift quietly** — every audit must produce a P0/P1/P2 list before any edits.
6. **Do not duplicate canonical doc content into the marketing page** — link to it. Marketing copy is a summary, not a copy-paste of the spec. When the spec changes, the marketing page must be re-audited.

## Output format for an audit

When asked to audit a marketing page, produce:

```
## P0 — Tech accuracy errors (must fix)
| # | Location | Wrong | Correct | Source |

## P1 — Narrative drift
| # | Location | Issue |

## P2 — Structure / future suggestions
| # | Location | Suggestion |

## Decisions needed before edit
- i18n: edit en.json only? or both?
- scope: P0 only, P0+P1, or full restructure?
- specific open questions
```

Then wait for user direction. Do NOT proactively edit until scope is confirmed.
