import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const developerPage = await readFile(
  path.join(process.cwd(), 'src/developers/index.html'),
  'utf8'
)

assert.equal(
  /(?:export\s+SLOTH_AGENT_TOKEN|\$env:SLOTH_AGENT_TOKEN)\s*=\s*["']?sloth_pat_/i.test(
    developerPage
  ),
  false,
  'Developer docs must not place token-shaped values directly in shell commands.'
)

assert.match(
  developerPage,
  /npm install --global @slothmoney\/agent-cli/,
  'Developer docs should install the public Agent CLI.'
)

assert.match(
  developerPage,
  /sloth-agent auth login/,
  'Developer docs should use the CLI native login.'
)

assert.match(
  developerPage,
  /sloth-agent auth status/,
  'Developer docs should show how to check the active credential.'
)

assert.match(
  developerPage,
  /sloth-agent auth logout/,
  'Developer docs should explain local logout.'
)

assert.match(
  developerPage,
  /class="min-w-0 space-y-4"/,
  'The Quickstart code column should shrink within the mobile viewport.'
)

const assignmentSectionStart = developerPage.indexOf('Assignment shape')
const assignmentSection = developerPage.slice(
  assignmentSectionStart,
  developerPage.indexOf('</section>', assignmentSectionStart)
)

assert.match(
  assignmentSection,
  /<div class="min-w-0">\s*<h3[^>]*>\s*Category and optional line item\s*<\/h3>/,
  'The category and line-item example should shrink within the mobile viewport.'
)

assert.match(
  assignmentSection,
  /<div class="min-w-0">\s*<h3[^>]*>Split category<\/h3>/,
  'The split-category example should shrink within the mobile viewport.'
)

console.log('Developer authentication documentation checks passed.')
