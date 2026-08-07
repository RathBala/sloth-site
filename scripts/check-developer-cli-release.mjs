import { execFileSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

const packageName = '@slothmoney/agent-cli'
const expectedVersion = '0.5.0'
const npmCache =
  process.env.npm_config_cache ??
  path.join(os.tmpdir(), 'sloth-developer-docs-npm-cache')

let publishedVersion
try {
  const output = execFileSync(
    'npm',
    ['view', `${packageName}@${expectedVersion}`, 'version', '--json'],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        npm_config_cache: npmCache,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  )
  publishedVersion = JSON.parse(output)
} catch {
  throw new Error(
    `Developer CLI docs require published package ${packageName}@${expectedVersion}`
  )
}

if (publishedVersion !== expectedVersion) {
  throw new Error(
    `Expected ${packageName}@${expectedVersion}, received ${String(
      publishedVersion
    )}`
  )
}

console.log(`Verified published package ${packageName}@${expectedVersion}`)
