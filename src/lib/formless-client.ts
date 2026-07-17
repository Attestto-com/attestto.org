/**
 * Form-less trámite client — the "form-less form" concept, isolated.
 *
 * Framework-free and DOM-free on purpose: the UI (wallet inbox, claim review,
 * terminal) is injected by the caller. That keeps this portable so it lifts,
 * mostly as-is, into `@attestto/id-wallet-adapter`. The Astro demo page is only
 * UI wiring around this API.
 *
 * The exchange is SIMULATED (no network, no real extension) but shaped like the
 * real presentation flow — request → review/consent → sign → present → receipt
 * — so the dev-facing terminal shows what a real integration would emit.
 */

export type LogLevel =
  | 'info'
  | 'request'
  | 'consent'
  | 'sign'
  | 'submit'
  | 'success'
  | 'error'

export interface LogEvent {
  level: LogLevel
  message: string
  detail?: string
}

/**
 * Where a claim comes from. A property trámite is composed of person-held and
 * property-held (Asset Passport) credentials — the distinction plain-VC wallets
 * miss, and the reason a form like "Uso de Suelo" is not a flat claim list.
 */
export type ClaimProvenance = 'persona' | 'propiedad'

/** Display grouping for composed (e.g. property) trámites. */
export type ClaimGroup = 'identidad' | 'propiedad' | 'autoridad'

/**
 * One credential/claim a verifier asks the wallet to present.
 *
 * Shape deliberately mirrors an ACF field (name/label/type/required + optional
 * conditional_logic) so an existing form config can be *imported* into a request
 * — `vcType` is the mapping we add (which credential satisfies the field). The
 * canonical wire format remains DIF Presentation Exchange; this is the authoring
 * view.
 */
export interface RequestedClaim {
  key: string
  /** Human label, e.g. "Carné de Topógrafo". */
  label: string
  /** The credential type that satisfies it, e.g. "IdentityCredential". */
  vcType: string
  required: boolean
  /**
   * Already held in the wallet (auto-fulfilled), or must be added by the user
   * by picking the credential. Optional claims start unselected regardless.
   */
  held: boolean
  /** Example value shown in the demo — never real PII. */
  sample: string
  /** Grouping + provenance for composed trámites (property flows). */
  group?: ClaimGroup
  provenance?: ClaimProvenance
  /** ACF-style conditional requirement: only required when another claim matches. */
  conditionalOn?: { key: string; equals: string }
}

/** A verifier's presentation request (what the site asks for). */
export interface PresentationRequest {
  verifier: string
  /** What the presentation is for, e.g. "Registro — Visado municipal". */
  purpose: string
  claims: RequestedClaim[]
  /** Things a legacy form demanded that this request does NOT — the pitch. */
  notRequested: string[]
}

export interface PresentHandlers {
  onLog: (event: LogEvent) => void
  delay?: (ms: number) => Promise<void>
  /** Deterministic outcome for demos/tests (defaults to success). */
  forceOutcome?: 'success' | 'error'
}

export interface PresentResult {
  ok: boolean
  receipt?: string
  error?: string
}

const defaultDelay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** Stable pseudo-id from a seed — no randomness, so demos never surprise. */
function receiptId(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return `AT-${h.toString(36).toUpperCase().padStart(6, '0').slice(0, 6)}`
}

/** Required claims that still need to be added before a request can be presented. */
export function missingRequired(
  req: PresentationRequest,
  selectedKeys: readonly string[],
): RequestedClaim[] {
  const chosen = new Set(selectedKeys)
  return req.claims.filter((c) => c.required && !chosen.has(c.key))
}

/**
 * Sign and present the selected claims. Assumes the caller has already gathered
 * consent by having the user review/select in the wallet UI. Never throws for
 * expected paths — a simulated failure is returned, not thrown.
 */
export async function presentRequest(
  req: PresentationRequest,
  selectedKeys: readonly string[],
  handlers: PresentHandlers,
): Promise<PresentResult> {
  const { onLog, forceOutcome } = handlers
  const delay = handlers.delay ?? defaultDelay

  const still = missingRequired(req, selectedKeys)
  if (still.length) {
    onLog({
      level: 'error',
      message: 'Missing required credentials.',
      detail: still.map((c) => c.label).join(', '),
    })
    return { ok: false, error: 'missing_required' }
  }

  const selected = req.claims.filter((c) => selectedKeys.includes(c.key))
  onLog({
    level: 'consent',
    message: 'Consent granted in the wallet.',
    detail: `presenta=[${selected.map((c) => c.key).join(', ')}]  ·  no solicitado=[${req.notRequested.join(', ')}]`,
  })
  await delay(300)

  onLog({ level: 'sign', message: "Signing the presentation with the holder's key (Ed25519)…" })
  await delay(450)

  onLog({
    level: 'submit',
    message: `Sending to ${req.verifier} over an encrypted channel…`,
    detail: 'transport=https · payload=VerifiablePresentation',
  })
  await delay(600)

  if (forceOutcome === 'error') {
    onLog({ level: 'error', message: 'The verifier rejected the presentation (simulated).' })
    return { ok: false, error: 'verifier_rejected' }
  }

  const receipt = receiptId(`${req.verifier}:${req.purpose}`)
  onLog({
    level: 'success',
    message: `Presentation accepted. Receipt ${receipt}.`,
    detail: 'No retyping, no password created, nothing over-shared.',
  })
  return { ok: true, receipt }
}
