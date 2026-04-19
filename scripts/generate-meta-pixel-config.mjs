import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(projectRoot, '.env') })

const pixelId = (process.env.META_PIXEL_ID ?? '').trim()

const outPath = path.join(
  projectRoot,
  'src',
  'assets',
  'js',
  'meta-pixel-config.js'
)

const contents = `;(function () {
  window.__SLOTH_META_PIXEL__ = {
    pixelId: ${JSON.stringify(pixelId)},
  }
})()
`

fs.writeFileSync(outPath, contents, 'utf8')
console.log('[meta:config] wrote', outPath)
