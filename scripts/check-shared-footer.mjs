import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const srcDir = path.join(projectRoot, 'src')
const sharedFooterScript = path.join(srcDir, 'assets/js/shared-footer.js')

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
