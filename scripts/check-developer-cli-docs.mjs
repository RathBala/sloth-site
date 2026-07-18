import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const developerPage = fs.readFileSync(
  path.join(root, 'src', 'developers', 'index.html'),
  'utf8'
)

const requiredSnippets = [
  'npm install --global @slothmoney/agent-cli',
  'sloth-agent categories',
  'sloth-agent transactions',
  'sloth-agent assign',
  'sloth-agent ask-partner',
  'https://github.com/RathBala/sloth-agent-cli',
  'https://www.npmjs.com/package/@slothmoney/agent-cli',
]

const missing = requiredSnippets.filter(
  (snippet) => !developerPage.includes(snippet)
)
if (missing.length > 0) {
  throw new Error(`Developer CLI docs are missing: ${missing.join(', ')}`)
}
if (developerPage.includes('yarn agent')) {
  throw new Error(
    'Developer CLI docs must not rely on the private yarn agent script'
  )
}
