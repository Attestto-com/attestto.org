export interface DocSection {
  id: string
  label: string
  basePath: string
  items: DocItem[]
}

export interface DocItem {
  label: string
  href: string
  badge?: string
}

export const docsNav: DocSection[] = [
  {
    id: 'quickstart',
    label: 'Quickstart',
    basePath: '/docs/quickstart',
    items: [
      { label: 'Verify a Document', href: '/docs/quickstart/verify-a-document/' },
      { label: 'Issue a Credential', href: '/docs/quickstart/issue-a-credential/' },
      { label: 'Add DID Login', href: '/docs/quickstart/add-did-login/' },
    ],
  },
  {
    id: 'verify',
    label: 'Verify & Sign',
    basePath: '/docs/verify',
    items: [
      { label: 'Overview', href: '/docs/verify/' },
      { label: 'Installation', href: '/docs/verify/installation/' },
      { label: '<attestto-verify>', href: '/docs/verify/verify-component/' },
      { label: '<attestto-sign>', href: '/docs/verify/sign-component/' },
      { label: 'Composables', href: '/docs/verify/composables/' },
      { label: 'Theming', href: '/docs/verify/theming/' },
      { label: 'Plugins', href: '/docs/verify/plugins/' },
      { label: 'Playground', href: '/docs/verify/playground/', badge: 'LIVE' },
    ],
  },
  {
    id: 'credentials',
    label: 'Credentials',
    basePath: '/docs/credentials',
    items: [
      { label: 'Overview', href: '/docs/credentials/' },
      { label: 'Issuing', href: '/docs/credentials/issuing/' },
      { label: 'Verifying', href: '/docs/credentials/verifying/' },
      { label: 'Key Management', href: '/docs/credentials/key-management/' },
      { label: 'Schemas & Plugins', href: '/docs/credentials/schemas/' },
      { label: 'Costa Rica', href: '/docs/credentials/costa-rica/' },
    ],
  },
  {
    id: 'wallets',
    label: 'Wallets',
    basePath: '/docs/wallets',
    items: [
      { label: 'Overview', href: '/docs/wallets/' },
      { label: 'Wallet Picker', href: '/docs/wallets/picker/' },
      { label: 'Verification', href: '/docs/wallets/verification/' },
      { label: 'Signing', href: '/docs/wallets/signing/' },
      { label: 'Credential Offers', href: '/docs/wallets/credential-offers/' },
    ],
  },
  {
    id: 'identity',
    label: 'Identity',
    basePath: '/docs/identity',
    items: [
      { label: 'did:sns', href: '/docs/identity/did-sns/' },
      { label: 'did:pki', href: '/docs/identity/did-pki/' },
      { label: 'Resolution', href: '/docs/identity/resolution/' },
    ],
  },
  {
    id: 'integration',
    label: 'Integration Guides',
    basePath: '/docs/integration',
    items: [
      { label: 'JavaScript', href: '/docs/integration/javascript/' },
      { label: 'Form Validation', href: '/docs/integration/forms/' },
      { label: 'WordPress', href: '/docs/integration/wordpress/' },
      { label: 'Joomla', href: '/docs/integration/joomla/' },
    ],
  },
]
