# Terms of Service

`src/terms/index.html` is the canonical Sloth-wide terms page. It covers the app,
Agent API, CLI and plugin. Operator: Ratheepan Balasubramaniam, sole trader
trading as Sloth Money. The full-access-free-forever beta promise is preserved.

## Public-site contract

- `/terms/` is indexable, with canonical and social URLs on https://slothmoney.app.
- The homepage, developer guide and privacy page expose ordinary terms links in
  initial HTML. All existing shared footers expose Terms after enhancement too.
- Sitemap and llms.txt include the page. Existing robots policy is unchanged.
- The terms page reuses the privacy page's Tailwind 3, shared typography, document
  layout and footer. No new styling system, images, animations or dependencies.
- Privacy now identifies the confirmed legal operator and public support email.
- The terms page adds no analytics scripts. Existing shared-footer links have no
  click instrumentation. Logging and product analytics remain unchanged.

## Verification

Run `yarn build`, `yarn check:footer`, `yarn check:tracking`, `yarn lint` and
`yarn typecheck`. Public-site checks cover canonical/social metadata, real social
assets, route classification, sitemap, static legal discovery and core terms.
Inspect `/terms/`, footer links and the privacy contact section at 1440x1000 and
390x844. Links must work with JavaScript disabled; no sign-in is needed.

## Publication boundary

On 13 October 2026 the owner authorised publication while deferring the
business address until the proposed £100 monthly recurring revenue milestone.
This is an accepted unresolved compliance risk, not a legal exemption or a
claim that the disclosure requirement is satisfied. Revisit sooner before
charging, substantial public expansion, or a complaint or regulatory enquiry.
No home address, invented address or placeholder was added. A generic
mail-forwarding address is not automatically sufficient. The published version
is dated 13 October 2026; software checks do not establish legal compliance.

Publish this site and verify `https://slothmoney.app/terms/` returns the terms
before releasing the budget app's new sign-up notice or plugin listing. The
paired app implementation and persistence decision are documented in
`sloth-budget/docs/features/terms-and-signup.md`.

Paid legal review is not an automatic release prerequisite. A focused free or
paid consultation can resolve specific uncertainty, including address disclosure.

## Requirement closure

| Requirement                        | Status                      | Evidence                           |
| ---------------------------------- | --------------------------- | ---------------------------------- |
| One Sloth-wide terms page          | Implemented locally         | src/terms/index.html               |
| Public discovery and shared footer | Implemented locally         | check:public-site and check:footer |
| Signup notice for email and Google | Implemented in sloth-budget | terms-signup-preview.spec.ts       |
| Plugin points to same terms        | Implemented in sloth-budget | plugin.json                        |
| Geographic address                 | Intentionally deferred      | Owner decision, 13 October 2026    |
| Public deployment                  | Outstanding                 | Publish terms before app notice    |
