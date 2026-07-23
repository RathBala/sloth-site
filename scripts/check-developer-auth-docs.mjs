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
  /security add-generic-password -U -a &quot;\$USER&quot; -s &quot;sloth-money-agent-token&quot; -w/,
  'Developer docs should recommend securely saving the token in macOS Keychain.'
)

assert.match(
  developerPage,
  /security find-generic-password -a &quot;\$USER&quot; -s &quot;sloth-money-agent-token&quot; -w/,
  'Developer docs should show how to load the token from macOS Keychain.'
)

assert.match(
  developerPage,
  /IFS= read -rs SLOTH_AGENT_TOKEN/,
  'Developer docs should include a hidden temporary Bash and Zsh prompt.'
)

assert.match(
  developerPage,
  /Read-Host &quot;Sloth token&quot; -MaskInput/,
  'Developer docs should include a hidden temporary PowerShell prompt.'
)

assert.match(
  developerPage,
  /class="space-y-5 min-w-0"/,
  'The Quickstart code column should shrink within the mobile viewport.'
)

const assignmentSectionStart = developerPage.indexOf('Assignment shape')
const assignmentSection = developerPage.slice(
  assignmentSectionStart,
  developerPage.indexOf('</section>', assignmentSectionStart)
)

assert.match(
  assignmentSection,
  /<div class="min-w-0">\s*<h3[^>]*>Single category<\/h3>/,
  'The single-category example should shrink within the mobile viewport.'
)

assert.match(
  assignmentSection,
  /<div class="min-w-0">\s*<h3[^>]*>Split category<\/h3>/,
  'The split-category example should shrink within the mobile viewport.'
)

console.log('Developer authentication documentation checks passed.')
