import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(projectRoot, '.env') })

const apiKey = process.env.POSTHOG_API_KEY ?? ''
const apiHost = process.env.POSTHOG_API_HOST ?? 'https://eu.i.posthog.com'

const outPath = path.join(
  projectRoot,
  'src',
  'assets',
  'js',
  'posthog-config.js'
)

const contents = `;(function () {
  window.__SLOTH_POSTHOG__ = {
    apiKey: ${JSON.stringify(apiKey)},
    apiHost: ${JSON.stringify(apiHost)},
  }
})()
`

fs.writeFileSync(outPath, contents, 'utf8')
console.log('[posthog:config] wrote', outPath)
