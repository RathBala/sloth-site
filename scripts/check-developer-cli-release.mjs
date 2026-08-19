import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import path from 'node:path'

const packageName = '@slothmoney/agent-cli'
const expectedVersion = '0.13.0'
const npmCache =
  process.env.npm_config_cache ??
  path.join(os.tmpdir(), 'sloth-developer-docs-npm-cache')

const readPublishedVersion = () => {
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

  return JSON.parse(output)
}

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

export async function verifyPublishedVersion({
  fetchVersion,
  version,
  attempts = 5,
  retryDelayMs = 5000,
  delay = wait,
}) {
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const publishedVersion = fetchVersion()
      if (publishedVersion !== version) {
        throw new Error(
          `Expected ${packageName}@${version}, received ${String(
            publishedVersion
          )}`
        )
      }

      return publishedVersion
    } catch (error) {
      lastError = error
      if (attempt < attempts) {
        console.warn(
          `Published package check attempt ${attempt} failed; retrying`
        )
        await delay(retryDelayMs)
      }
    }
  }

  throw new Error(
    `Developer CLI docs require published package ${packageName}@${version}`,
    { cause: lastError }
  )
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isDirectRun) {
  await verifyPublishedVersion({
    fetchVersion: readPublishedVersion,
    version: expectedVersion,
  })

  console.log(`Verified published package ${packageName}@${expectedVersion}`)
}
