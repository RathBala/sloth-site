import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
for (const page of [
  'src/index.html',
  'src/developers/index.html',
  'src/privacy/index.html',
  'src/terms/index.html',
  'src/llms.txt',
]) {
  const text = readFileSync(page, 'utf8')
  assert(
    !/SnapTrade|sloth-agent investments|api\/agent\/v1\/investments|--partner-visibility holdings/.test(
      text
    ),
    `${page}: retired integration remains`
  )
}
assert(
  readFileSync('src/developers/index.html', 'utf8').includes(
    'manual investment balances'
  )
)
assert(
  readFileSync('src/privacy/index.html', 'utf8').includes(
    'manual investment balances'
  )
)
console.log('Investment retirement copy passed')
