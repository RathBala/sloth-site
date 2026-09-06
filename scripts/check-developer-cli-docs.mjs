import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { expectedCliVersion } from './developer-cli-version.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const developerPage = fs.readFileSync(
  path.join(root, 'src', 'developers', 'index.html'),
  'utf8'
)
const privacyPage = fs.readFileSync(
  path.join(root, 'src', 'privacy', 'index.html'),
  'utf8'
)
const llmsText = fs.readFileSync(path.join(root, 'src', 'llms.txt'), 'utf8')

const requiredSnippets = [
  'npm install --global @slothmoney/agent-cli',
  `CLI ${expectedCliVersion} or newer`,
  'sloth-agent accounts',
  'sloth-agent accounts update',
  'sloth-agent accounts remove',
  'sloth-agent investments',
  'sloth-agent portfolio --view household',
  '--partner-visibility holdings',
  'sloth-agent budget --scope personal',
  'sloth-agent budget status',
  'sloth-agent budget status --scope personal --period 2026-07',
  'sloth-agent budget update',
  'sloth-agent budget move',
  'sloth-agent categories',
  'sloth-agent categories create',
  'sloth-agent categories rename',
  'sloth-agent line-items create',
  'sloth-agent line-items rename',
  'sloth-agent transactions',
  'sloth-agent transactions --include-pending',
  'sloth-agent partner status',
  'sloth-agent receipts extract',
  'sloth-agent receipts get',
  'sloth-agent receipts attach',
  'sloth-agent receipts remove',
  'sloth-agent assign',
  'sloth-agent rules list',
  'sloth-agent rules get',
  'sloth-agent rules set',
  'sloth-agent rules delete',
  'sloth-agent rules scan-contract',
  'sloth-agent ask-partner',
  '--assignment-scope joint',
  '/api/agent/v1/accounts',
  '/api/agent/v1/accounts/:accountRef',
  '/api/agent/v1/investments',
  '/api/agent/v1/portfolio',
  '/api/agent/v1/budgets',
  '/api/agent/v1/budget-status',
  '/api/agent/v1/budget-movements',
  '/api/agent/v1/transaction-assignments',
  '/api/agent/v1/partner-status',
  '/api/agent/v1/notification-rules',
  '/api/agent/v1/notification-rules/for-transaction',
  '/api/agent/v1/notification-rules/extract-renewal',
  '/api/agent/v1/transaction-assignments/:operationId',
  '<code>Idempotency-Key</code>',
  '<code>operationId</code>',
  '<code>itemCount</code>',
  '<code>completedCount</code>',
  '<code>failedCount</code>',
  '<code>expiresAt</code>',
  '<code>pollAfterMs</code>',
  '/api/agent/v1/receipts/extract',
  '/api/agent/v1/receipts/confirmed',
  '--shared',
  '--account-ref PASTE_THE_EXACT_ACCOUNT_REF_HERE',
  '<code>sharing.isShared</code>',
  '<code>shareRatio</code>',
  '<code>userExclusiveAmountPence</code>',
  '<code>partnerExclusiveAmountPence</code>',
  '<code>accountRef</code>',
  '<code>counterpartyName</code>',
  '<code>transactionReference</code>',
  '<code>baselinePence</code>',
  '<code>renewalDate</code>',
  '<code>leadDays</code>',
  '<code>remindOn</code>',
  '<code>delivery.email</code>',
  '<code>accountType</code>',
  '<code>asOf</code>',
  '<code>lastBalanceUpdatedAt</code>',
  '<code>connectionState</code>',
  '<code>isGoalFundingAccount</code>',
  '<code>partnerVisibility</code>',
  '<code>periodStatus</code>',
  '<code>plannedPence</code>',
  '<code>moneyInPence</code>',
  '<code>moneyOutPence</code>',
  '<code>netPence</code>',
  '<code>activity.uncategorized</code>',
  'assignmentScope',
  'jointBudgetContribution',
  'A category is the broader parent.',
  'Bills &rarr; Other',
  'Subscriptions &rarr; Other',
  '<code>scope</code>',
  'Joint category and line item',
  'PASTE_THE_EXACT_TRANSACTION_REF_HERE',
  'These are placeholders.',
  'Sloth Money &rarr; Transactions',
  '<code>succeeded</code>',
  '<code>failed</code>',
  'sloth-agent goals',
  'sloth-agent goals create',
  'sloth-agent goals update',
  'sloth-agent goals mark-spent',
  'sloth-agent goals restore',
  '--type keep',
  '--type spend',
  '--priority 2',
  'sloth-agent goals delete',
  '<code>goalType</code>',
  '<code>spentAt</code>',
  '<code>isSpent</code>',
  '/api/agent/v1/goals',
  '/api/agent/v1/goals/preview',
  'sloth-agent scenarios',
  'sloth-agent scenarios create',
  'sloth-agent scenarios update',
  'sloth-agent scenarios activate',
  'sloth-agent scenarios delete',
  '--recurring-amount 100',
  '--one-off-amount',
  '--clear-recurring',
  '/api/agent/v1/scenarios',
  '/api/agent/v1/scenarios/preview',
  '/api/agent/v1/scenarios/:monthKey/activate',
  'Sixteen API resources',
  '<code>fundingAccountRef</code>',
  '<code>forecastMonthKey</code>',
  '<code>forecastBasis</code>',
  '<code>projectionThroughMonthKey</code>',
  '--goal-funding-account',
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

const normalizedDeveloperText = developerPage
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .replace(/\s+([,.;:])/g, '$1')
const requiredCopy = [
  'An assignment can change an owned transaction’s sharing, categorisation, or both.',
  'does not contact Sloth Money',
  'A successful preview does not guarantee that applying the assignment will succeed.',
  'A recurring contribution continues until a later active scenario changes it.',
  'Scenarios change the forecast. They do not move money.',
  'Scenario previews use view-only access and perform zero writes.',
  'Account reads are cache-only and do not contact a bank or refresh balances.',
  'Investment reads are cache-only and do not contact SnapTrade.',
  'Partner accounts appear only when their owner shared a balance or linked holdings.',
  'Sharing does not change ownership, transaction access, Goal funding, or who can move money.',
  'An investment account total and its nested holdings describe the same portfolio, so do not add them together.',
  'Do not add values in different currencies without an explicit conversion.',
  'Manual accounts can change institution, name, currency, and ownership.',
  'DELETE archives an owned manual account without deleting its transaction, import, balance, or categorisation records.',
  'There is no restore command.',
  'Partner personal accounts are excluded.',
  'Provider account IDs, account numbers, sort codes, and IBANs are not returned.',
  'The first transaction read each UTC day may refresh linked bank data.',
  'A quota_exceeded reason means the UTC-day provider refresh allowance is exhausted. Cached booked transactions remain available.',
  'A checkpoint_failed reason means provider work completed, but the Budget balance-audit checkpoint failed. Cached booked transactions remain available, and a same-day read retries only that checkpoint.',
  'A completed eligible refresh updates your Budget balance audit. A same-day cached read does not add another audit checkpoint.',
  "--include-pending reuses the transaction command's normal refresh; it does not force another refresh.",
  'Pending rows appear in a separate pending block',
  'Booked and pending rows include counterpartyName and transactionReference when the bank supplies them.',
  'Provider-native debtor, creditor, and raw remittance fields are not returned.',
  'partner status is read-only.',
  'It does not refresh bank accounts or change partner records.',
  'Budget previews validate the file locally without loading a token or contacting Sloth Money.',
  'Budget status is read-only. Omit --period for the current Sloth budget period, or pass YYYY-MM for a historical period.',
  'Historical budget status is cache-only and returns refresh as null.',
  'Income, Transfer, and explicit None are normal activity rows.',
  'A transaction with no category appears under activity.uncategorized.',
  'budget is null when no trustworthy plan exists, but activity still returns.',
  'A preview does not load a token or contact Sloth Money.',
  'The decimal digits are converted exactly to positive safe-integer pence.',
  'It does not change planned amounts or future budget plans.',
  'Saving X overwrites X and every explicit future plan. A later save from Y overwrites Y and everything after it.',
  'Goal priority is one-based, so 1 is highest. Moving one goal shifts the intervening goals automatically.',
  'Goal creates require a positive target amount, an explicit Keep or Spend type, and one personal Goal-funding account.',
  'Without --apply, goal creation authenticates and asks Sloth to calculate forecastMonthKey without saving the Goal.',
  'targetMonthKey is your optional desired month. forecastMonthKey is Sloth’s calculated month.',
  'Only the active scenario is calculated.',
  'A null forecastMonthKey means Sloth did not find a month within the projection boundary; check projectionThroughMonthKey for the final month tested.',
  'Keep goals cannot be marked spent. Restore a spent goal before changing its type.',
  'Goal results include goalType and nullable spentAt.',
  "Personal and joint category assignments are separate. A personal assignment uses the transaction's top-level categoryId, lineItemId, and categorySplits. A joint-budget assignment uses the corresponding fields under jointBudgetContribution.",
  'A transaction can be uncategorised personally while its joint-budget contribution is already categorised. To assess its categorisation, inspect both locations.',
  "Choose the most specific suitable line item. If none fits, use that category's Other line item. Historical assignments without a line item are not a recommendation to omit one.",
  'Check the result in the same assignment scope that you changed.',
  'Confirm that an existing assignment in the other scope was not changed.',
  'A first share uses your saved couple ratio, falling back to 0.5, and zero exclusive amounts when split fields are omitted.',
  'On an existing share, omitted split fields keep their saved values.',
  'A combined category uses Joint when you have no exclusive amount and Personal when you do, unless you set assignmentScope explicitly.',
  'Every transaction result includes the same accountRef used by sloth-agent accounts.',
  'accountRef is the public account filter for CLI and HTTP transaction reads.',
  'Rules watch future payments that match an existing transaction. They do not create transactions or recurring predictions.',
  'Without --apply, rules set validates the file locally without loading a token or contacting Sloth Money.',
  'Scanning returns a renewalDate and confidence. It does not save a rule.',
  'The PDF is discarded after extraction and is not stored.',
  'leadDays accepts an integer from 1 to 365.',
  'In-app delivery is always on. Set delivery.email to add email delivery.',
  'Returned rules include the computed remindOn date.',
  'renewalDate is null when Sloth cannot find a date in the PDF.',
  'Applying 1 to 100 assignments creates a durable operation and returns a receipt promptly.',
  'POST requires an Idempotency-Key. Retrying the same submission with that key does not create a second operation.',
  'The CLI polls the authenticated status endpoint for you. If the command is interrupted, rerun the same command with the same input file to recover the operation.',
  'The command stays sloth-agent assign --input assignments.json --apply and its final output stays succeeded and failed.',
  'Completed item results stay in the same order as the input file.',
  'The direct POST returns a 202 receipt.',
  'Each completed item has a succeeded or failed status. Failed results include transactionRef and error; succeeded results include the saved assignment fields.',
  'Each transactionRef can appear only once in a file. Duplicate refs reject the whole submission before anything is written.',
  'Sloth Money keeps the minimum assignment instructions, ownership and progress state, and ordered results needed for recovery. The operation record expires after seven days and is then deleted.',
]
const missingCopy = requiredCopy.filter(
  (copy) => !normalizedDeveloperText.includes(copy)
)
if (missingCopy.length > 0) {
  throw new Error(
    `Developer CLI docs are missing copy: ${missingCopy.join(', ')}`
  )
}

const forbiddenLegacyAccountIdCopy = ['--account-id', '<code>accountId</code>']
const retainedLegacyCopy = forbiddenLegacyAccountIdCopy.filter((copy) =>
  developerPage.includes(copy)
)
if (retainedLegacyCopy.length > 0) {
  throw new Error(
    `Developer CLI docs still expose legacy account IDs: ${retainedLegacyCopy.join(', ')}`
  )
}

for (const legacyGoalFundingCopy of [
  'isGoalSavingsSource',
  '--goal-savings-source',
  'owner next opens Forecast',
]) {
  if (developerPage.includes(legacyGoalFundingCopy)) {
    throw new Error(
      `Developer CLI docs still expose legacy Goal-funding behavior: ${legacyGoalFundingCopy}`
    )
  }
}

if (developerPage.includes('"delivery": { "inApp": true')) {
  throw new Error(
    'Developer CLI docs must not expose server-owned delivery.inApp as a write field.'
  )
}

if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes(
      'read your account inventory, investment holdings, booked and recent pending transaction data, categories, budgets, goals, household-planning balances or linked holdings explicitly shared by your partner, and read-only partner settlement balance and recorded payment activity'
    )
) {
  throw new Error(
    'Privacy copy must disclose Agent API access to account inventory, investments, pending transactions, partner settlement data, and budgets.'
  )
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes(
      'manage account details and which owned accounts share planning balances or holdings, archive manual accounts'
    )
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
if (!privacyPage.replace(/\s+/g, ' ').includes('move assigned budget money')) {
  throw new Error(
    'Privacy copy must disclose Agent API assigned-budget movements.'
  )
}
if (!llmsText.includes('assigned-budget movements')) {
  throw new Error(
    'llms.txt must advertise Agent API assigned-budget movements.'
  )
}
if (!llmsText.includes('server-backed goal previews')) {
  throw new Error('llms.txt must advertise server-backed goal previews.')
}
if (!llmsText.includes('server-backed scenario previews')) {
  throw new Error('llms.txt must advertise server-backed scenario previews.')
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes('read forecast scenarios and their account contributions')
) {
  throw new Error('Privacy copy must disclose Agent API scenario reads.')
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes('create, update, activate, or delete forecast scenarios')
) {
  throw new Error('Privacy copy must disclose Agent API scenario changes.')
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes(
      'preview create, update, activate, or delete scenario actions and receive the recalculated Goals without saving changes'
    )
) {
  throw new Error('Privacy copy must disclose view-only scenario previews.')
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes(
      'preview a goal against your private Goal-funding account without saving the goal'
    )
) {
  throw new Error(
    'Privacy copy must disclose private account-backed Goal previews.'
  )
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes('change an owned transaction’s partner-sharing state and split')
) {
  throw new Error(
    'Privacy copy must disclose Agent API transaction-sharing changes.'
  )
}
if (!llmsText.includes('transaction sharing and split changes')) {
  throw new Error('llms.txt must advertise Agent API transaction sharing.')
}
if (!llmsText.includes('transaction filtering by opaque account reference')) {
  throw new Error(
    'llms.txt must advertise Agent API transaction account filtering.'
  )
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes(
      'save transaction notification rules and temporarily send a contract PDF to extract a renewal date without storing the file'
    )
) {
  throw new Error(
    'Privacy copy must disclose notification rules and transient contract extraction.'
  )
}
if (
  !llmsText.includes(
    'transaction notification rules and transient contract renewal-date extraction'
  )
) {
  throw new Error(
    'llms.txt must advertise notification rules and transient contract extraction.'
  )
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes(
      'receipt image is sent to OpenAI for extraction and then discarded by Sloth Money'
    )
) {
  throw new Error(
    'Privacy copy must explain that receipt images are transient.'
  )
}
if (
  !developerPage
    .replace(/\s+/g, ' ')
    .includes(
      'Each receipt item contains only an id, label, and signed amount in pence'
    )
) {
  throw new Error(
    'Developer receipt docs must describe the canonical signed-row contract.'
  )
}
if (
  !privacyPage
    .replace(/\s+/g, ' ')
    .includes('confirmed receipt items with their signed amounts')
) {
  throw new Error(
    'Privacy copy must disclose persisted confirmed receipt evidence.'
  )
}
if (!llmsText.includes('receipt extraction and confirmed receipt items')) {
  throw new Error('llms.txt must advertise receipt evidence support.')
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
if (
  !privacyPage
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .includes(
      'Sloth Money keeps the minimum assignment instructions, ownership and progress state, and ordered results needed for recovery. The operation record expires after seven days and is then deleted.'
    )
) {
  throw new Error(
    'Privacy copy must disclose durable assignment operation data and retention.'
  )
}
if (developerPage.includes('yarn agent')) {
  throw new Error(
    'Developer CLI docs must not rely on the private yarn agent script'
  )
}

for (const unsupportedSnippet of [
  'sloth-agent joint-budget-settings',
  '/api/agent/v1/joint-budget-settings',
  'personalBudgetAmountPence',
  '--achieved',
  'isAchieved',
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
  'sloth-agent transactions --assignment-scope personal --uncategorized --limit 50',
  'PASTE_THE_EXACT_TRANSACTION_REF_HERE',
  '"assignmentScope": "personal"',
  '"lineItemId": "PASTE_A_LINE_ITEM_ID_HERE"',
  'sloth-agent assign --input assignments.json',
  'sloth-agent assign --input assignments.json --apply',
  'Check the result',
  'sloth-agent transactions --assignment-scope personal --limit 50',
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
