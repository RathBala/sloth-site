import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const srcDir = path.join(projectRoot, 'src')
const sharedFooterScript = path.join(srcDir, 'assets/js/shared-footer.js')
const privacyPolicyPage = path.join(srcDir, 'privacy', 'index.html')

async function collectHtmlFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(entryPath)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(entryPath)
    }
  }

  return files
}

function relativeToProject(filePath) {
  return path.relative(projectRoot, filePath)
}

const failures = []
const sharedFooterSource = await readFile(sharedFooterScript, 'utf8').catch(
  () => ''
)

if (!sharedFooterSource.includes('href="/developers/"')) {
  failures.push('src/assets/js/shared-footer.js must include /developers/.')
}

if (!sharedFooterSource.includes('href="/privacy/"')) {
  failures.push('src/assets/js/shared-footer.js must include /privacy/.')
}

const privacyPolicySource = await readFile(privacyPolicyPage, 'utf8').catch(
  () => ''
)
const privacyPolicyText = privacyPolicySource
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

for (const expectedCopy of [
  'Google Analytics',
  'PostHog',
  'Meta Pixel',
  'visit notification',
  'budget.slothmoney.app',
  'GoCardless Bank Account Data',
  'SnapTrade',
  'Stripe',
  'AI and evaluation providers',
  'Hosting, authentication, database, backend, and deployment providers',
  'Email delivery and internal notification providers',
  'Banking and investment data',
  'Lawful bases',
  'Contract',
  'Consent',
  'Legitimate interests',
  'International transfers',
  'standard contractual clauses',
  'Cookies and similar technologies',
  'consent-management',
  'Your UK and EU rights',
  'Information Commissioner',
  'automated means',
]) {
  if (!privacyPolicyText.includes(expectedCopy)) {
    failures.push(`src/privacy/index.html must mention ${expectedCopy}.`)
  }
}

const htmlFiles = await collectHtmlFiles(srcDir)

for (const filePath of htmlFiles) {
  const source = await readFile(filePath, 'utf8')
  const hasFooter = source.includes('<footer')
  const hasSharedMount = source.includes('data-shared-footer')

  if (!hasFooter && !hasSharedMount) continue

  const displayPath = relativeToProject(filePath)

  if (!hasSharedMount) {
    failures.push(`${displayPath} must mount the shared footer.`)
  }

  if (!source.includes('shared-footer.js')) {
    failures.push(`${displayPath} must load shared-footer.js.`)
  }

  if (hasFooter) {
    failures.push(`${displayPath} must not define inline footer markup.`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[shared-footer] ${failure}`)
  }

  process.exit(1)
}
