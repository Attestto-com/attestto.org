# Attestto Open

**Open digital public infrastructure for verifiable data.**

Sovereign, interoperable, privacy-preserving. No vendor lock-in. No single point of failure.

## What

Attestto Open builds the foundational layers for verifiable digital systems. Open schemas, decentralized identifiers, and cryptographic verification that any government, institution, or developer can deploy and extend without depending on a single vendor.

- **Open schemas** — Machine-readable data models for verifiable information. Domain-agnostic, extensible by design.
- **Decentralized trust** — No central authority. Trust is cryptographic, distributed across institutions, verifiable by anyone.
- **Privacy by construction** — Selective disclosure, zero-knowledge proofs, and minimal data exposure built into the protocol.

## Principles

- **Sovereignty** — Institutions and individuals control their own data and infrastructure.
- **Interoperability** — Built on W3C, IETF, and ISO standards.
- **Privacy by design** — Data minimization at every layer. Consent is cryptographically enforced.
- **No vendor lock-in** — Every component is open source, every format is open standard. Fork it, replace it, run it yourself.
- **Reversibility** — Any deployment can export its data in open formats and migrate to another implementation.
- **Transparency** — Governance decisions, technical choices, and roadmap priorities are public.
- **Technological neutrality** — The infrastructure does not prescribe specific technologies.
- **Public good** — Infrastructure for society, not a product for sale.

## Architecture

Every piece of verifiable data can be checked at three independent layers. Any two of three is sufficient.

| Layer | What | How |
|-------|------|-----|
| **01 — Institutional** | Issuer resolves via DID document | Hosted at issuer's domain |
| **02 — Registry** | Schema and status on neutral registry | CDN, IPFS |
| **03 — Ledger** | Cryptographic proof on public ledger | Solana, any immutable chain |

## Open Source

| Repo | Description |
|------|-------------|
| [vc-sdk](https://github.com/Attestto-com/vc-sdk) | Universal verifiable credentials SDK. Any schema, any DID method. Ed25519/P-256. Schema plugin system. |
| [cr-vc-schemas](https://github.com/Attestto-com/cr-vc-schemas) | JSON-LD schemas for verifiable credentials. W3C VDL and ISO 18013-5 interop. |
| [cr-vc-sdk](https://github.com/Attestto-com/cr-vc-sdk) | Typed SDK for jurisdiction-specific credentials. |
| [did-sns-spec](https://github.com/Attestto-com/did-sns-spec) | DID method specification for Solana Name Service domains. |
| [did-method-checklist](https://github.com/Attestto-com/did-method-checklist) | Evaluation framework for DID methods. |

## DID

This domain hosts a W3C DID document at `/.well-known/did.json`:

```
did:web:attestto.org
```

Governed by a Squads v4 multisig (2-of-3) on Solana mainnet-beta. See `/.well-known/governance.json` for the full governance manifest.

## Governance

Attestto Open is stewarded, not owned. No single entity — including Attestto — can unilaterally control the infrastructure, the standards, or the roadmap.

- **Open governance** — Proposals, discussions, and decisions are public.
- **Contributor model** — Institutions, governments, and developers can propose schemas, DID methods, and protocol extensions.
- **No single owner** — Forkable, portable, governed by its community.

## License

MIT
