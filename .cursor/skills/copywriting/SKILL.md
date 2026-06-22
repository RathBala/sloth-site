---
name: copywriting
description: >-
  Sloth marketing and UX copy conventions for the static site (landing pages,
  CTAs, headings, body): concise, specific, scannable copy, punchy headings,
  punctuation rules. Use whenever writing or editing user-facing copy in this
  repo, or when the user mentions website text, headlines, card titles,
  messaging, tone of voice, tightening copy, or vague wording.
---

# Sloth site copywriting

## Mandatory: read before writing copy

When adding or changing **any** user-facing strings in `src/` (HTML, meta descriptions, button labels, etc.), follow this skill end-to-end. Do not rely on general punctuation habits.

## Punctuation

### Sentence bridges (not em dashes)

Use a **spaced hyphen** (a hyphen with one space on each side) to connect two related clauses or add an aside. **Do not** use an em dash for this pattern.

**Preferred:** `Saving can happen without a shared view of the goal - so one person often tracks…`

**Avoid:** `…goal—so one person…`

Apply consistently in marketing and product-adjacent copy unless a proper name or third-party quote requires an exception.

## Concision

**Default to tight copy.** Marketing lines should be easy to scan in one pass.

- **Headlines and card titles:** see **Headlines** below - not a loose sentence.
- **Supporting lines:** prefer **one or two short sentences** in cards, bullets, and subheads. If a paragraph runs long, split the idea or remove a clause.
- **Cut filler** unless it adds clarity: stacked hedges ("before you know it"), redundant pairs ("day-to-day spending drifts" when the next phrase already shows drift), and repeating the same point in different words.
- **One idea per sentence** where possible; combine only when it stays clear.

## Headlines (section titles, card titles, h2/h3)

**Sharp and punchy.** A reader should get the pain or promise in a **glance** - usually **three to six words**, concrete, no throat-clearing.

- **Do not** write headings as long hedged sentences (e.g. "X is happening, but not Y", "One person ends up carrying the…"). Put contrast and detail in the **body**, not the title.
- **Do** use a strong image, stark contrast, or crisp noun phrase: **"Savings split across places"**, **"One person holds the plan"** - short, makes sense alone, body explains.
- **Standalone sense:** if someone only reads the heading, it should still land - no missing referent, no filler ("the planning load" can shrink to **the plan** when the section is about shared wedding planning).

## Specificity

Concise copy must still name **what** is at stake. Readers should not have to guess the referent.

- **Avoid dangling recovery phrases** - e.g. "catch up", "make it up", "fix it next month" - without saying **catch up on what** (saving, your planned contribution, the monthly amount, etc.). Same for "ease off" - ease off **on saving** (or spending), not a vague "ease off" alone if it could mean anything.
- **Tie abstract habits to the goal** on goal-focused pages: e.g. saving and the wedding fund in the same line, so "next month" clearly means topping up **savings**, not generic life admin.
- **Prefer one concrete noun + verb** over a vague idiom when space allows.

## Tone

- Prefer **clear, plain language** over long sentences.
- Match the voice of nearby sections and [`src/index.html`](../../src/index.html) / campaign pages.
- Write like one sharp, warm friend naming the money dynamic to another. Sloth copy can be human, specific, and a little cheeky.
- Prefer concrete emotional contrast over feature explanation. Let the product stay implied when the benefit is obvious.
- Approved examples: `One of you loves to plan. The other loves to daydream.`, `You both want the deets. All the deets.`, `You both gush about the future - just without spreadsheets.`
- Avoid generic SaaS or AI-sounding phrases such as `shared version of the plan`, `progress without spreadsheet energy`, and `become the money person` when a more human line can carry the idea.

## Checklist before finishing

- [ ] No em dashes used where a spaced hyphen bridge was intended
- [ ] Copy is scannable (short paragraphs, strong headings)
- [ ] Section and card headings are punchy (short, standalone, not long hedged sentences)
- [ ] Card and bullet copy is concise - no filler or duplicate ideas
- [ ] No vague "catch up" / "make it up" / "fix it" without naming what (e.g. saving, contributions)
