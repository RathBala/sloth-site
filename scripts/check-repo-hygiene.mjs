import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)
const trackedNodeModules = execFileSync(
  'git',
  ['ls-files', '--', 'node_modules'],
  {
    cwd: projectRoot,
    encoding: 'utf8',
  }
)
  .trim()
  .split('\n')
  .filter(Boolean)

if (trackedNodeModules.length > 0) {
  throw new Error(
    `Repository hygiene check failed: node_modules contains ${trackedNodeModules.length} tracked files. Remove them with git rm -r --cached node_modules.`
  )
}

console.log('Repository hygiene checks passed.')
