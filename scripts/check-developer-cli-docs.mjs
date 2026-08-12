import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const developerPage = fs.readFileSync(
  path.join(root, 'src', 'developers', 'index.html'),
  'utf8'
)
const privacyPage = fs.readFileSync(
  path.join(root, 'src', 'privacy', 'index.html'),
  'utf8'
)

const requiredSnippets = [
  'npm install --global @slothmoney/agent-cli',
  'sloth-agent accounts',
  'sloth-agent accounts update',
  'sloth-agent accounts remove',
  'sloth-agent investments',
  'sloth-agent budget --scope personal',
  'sloth-agent budget update',
  'sloth-agent categories',
  'sloth-agent categories create',
  'sloth-agent categories rename',
  'sloth-agent line-items create',
  'sloth-agent line-items rename',
  'sloth-agent transactions',
  'sloth-agent assign',
  'sloth-agent ask-partner',
  '--assignment-scope joint',
  '/api/agent/v1/accounts',
  '/api/agent/v1/accounts/:accountRef',
  '/api/agent/v1/investments',
  '/api/agent/v1/budgets',
  '/api/agent/v1/joint-budget-settings',
  '<code>accountRef</code>',
  '<code>accountType</code>',
  '<code>asOf</code>',
  '<code>lastBalanceUpdatedAt</code>',
  '<code>connectionState</code>',
  '<code>isGoalSavingsSource</code>',
  '<code>periodStatus</code>',
  '<code>plannedPence</code>',
  'assignmentScope',
  'A category is the broader parent.',
  'Bills &rarr; Other',
  'Subscriptions &rarr; Other',
  '<code>scope</code>',
  'Category and optional line item',
  'PASTE_THE_EXACT_TRANSACTION_REF_HERE',
  'These are placeholders.',
  'Sloth Money &rarr; Transactions',
  '<code>succeeded</code>',
  '<code>failed</code>',
  'sloth-agent goals',
  'sloth-agent goals create',
  'sloth-agent goals update',
  '--priority 2',
  'sloth-agent goals delete',
  '/api/agent/v1/goals',
  '/api/agent/v1/categories/:categoryId',
  '/api/agent/v1/line-items/:lineItemId',
  '--line-item-id',
  'https://github.com/RathBala/sloth-agent-cli',
  'https://www.npmjs.com/package/@slothmoney/agent-cli',
]

const missing = requiredSnippets.filter(
  (snippet) => !developerPage.includes(snippet)
)
if (missing.length > 0) {
  throw new Error(`Developer CLI docs are missing: ${missing.join(', ')}`)
}

const normalizedDeveloperPage = developerPage.replace(/\s+/g, ' ')
const requiredCopy = [
  'An assignment categorises an existing transaction e.g. assigning category Groceries to a transaction.',
  'does not contact Sloth Money',
  'A successful preview does not guarantee that applying the assignment will succeed.',
  'Account reads are cache-only and do not contact a bank or refresh balances.',
  'Investment reads are cache-only and do not contact SnapTrade.',
  'Holding values stay in their provider-native currencies and may not reconcile to a converted account total.',
  'Manual accounts can change institution, name, currency, and ownership.',
  'DELETE archives an owned manual account without deleting its transaction, import, balance, or categorisation records.',
  'There is no restore command.',
  'Partner personal accounts are excluded.',
  'Provider account IDs, account numbers, sort codes, and IBANs are not returned.',
  'The first transaction read each UTC day may refresh linked bank data.',
  'The CLI does not wrap this setting.',
  'Budget previews validate the file locally without loading a token or contacting Sloth Money.',
  'Saving X overwrites X and every explicit future plan. A later save from Y overwrites Y and everything after it.',
  'Goal priority is one-based, so 1 is highest. Set priority on its own. Moving one goal shifts the intervening goals automatically.',
]
const missingCopy = requiredCopy.filter(
  (copy) => !normalizedDeveloperPage.includes(copy)
)
if (missingCopy.length > 0) {
  throw new Error(
    `Developer CLI docs are missing copy: ${missingCopy.join(', ')}`
  )
}

if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes(
      'read your account inventory, investment holdings, transaction data, categories, budgets, and goals'
    )
) {
  throw new Error(
    'Privacy copy must disclose Agent API access to account inventory, investments, and budgets.'
  )
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes('manage account details and archive manual accounts')
) {
  throw new Error(
    'Privacy copy must disclose Agent API account changes and archival.'
  )
}
if (
  !privacyPage.replace(/\s+/g, ' ').includes('update planned budget amounts')
) {
  throw new Error(
    'Privacy copy must disclose Agent API planned-budget updates.'
  )
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes('manage custom categories and scoped budget line items')
) {
  throw new Error(
    'Privacy copy must disclose Agent API category and line-item management.'
  )
}
if (developerPage.includes('yarn agent')) {
  throw new Error(
    'Developer CLI docs must not rely on the private yarn agent script'
  )
}

for (const unsupportedSnippet of [
  'sloth-agent joint-budget-settings',
  'personalBudgetAmountPence',
]) {
  if (developerPage.includes(unsupportedSnippet)) {
    throw new Error(
      `Developer CLI docs must not advertise unsupported surface: ${unsupportedSnippet}`
    )
  }
}

const quickstartStart = developerPage.indexOf('<section id="quickstart"')
const quickstartEnd = developerPage.indexOf(
  '<section class="py-16 sm:py-20 bg-white">',
  quickstartStart
)
const quickstart = developerPage.slice(quickstartStart, quickstartEnd)
const workflowSnippets = [
  'sloth-agent categories',
  'sloth-agent transactions --uncategorized --limit 50',
  'PASTE_THE_EXACT_TRANSACTION_REF_HERE',
  'sloth-agent assign --input assignments.json',
  'sloth-agent assign --input assignments.json --apply',
  'Check the result',
  'sloth-agent transactions --limit 50',
]
let workflowPosition = -1
for (const snippet of workflowSnippets) {
  const nextPosition = quickstart.indexOf(snippet, workflowPosition + 1)
  if (nextPosition === -1) {
    throw new Error(
      `Developer CLI quickstart is missing or misorders: ${snippet}`
    )
  }
  workflowPosition = nextPosition
}

if (
  !developerPage.includes(
    '<link rel="canonical" href="https://slothmoney.app/developers/" />'
  )
) {
  throw new Error('Developer docs must declare their canonical public URL')
}

for (const property of ['og:image', 'twitter:image']) {
  const pattern = new RegExp(
    `${property}"\\s+content="https://slothmoney\\.app/assets/images/`
  )
  if (!pattern.test(developerPage)) {
    throw new Error(`${property} must use an absolute public asset URL`)
  }
}
