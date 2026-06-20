import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const homePagePath = path.join(projectRoot, 'src/index.html')

const source = await readFile(homePagePath, 'utf8')
const normalizedSource = source.replace(/\s+/g, ' ')
const normalizedText = source.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')

const checks = [
  {
    passes: normalizedText.includes('Couple finances, actually fun.'),
    message:
      'Home hero headline should lead with the agreed couple-finances value prop.',
  },
  {
    passes: !normalizedSource.includes('Pick your money mode.'),
    message: 'Home hero headline should not lead with vague money mode copy.',
  },
  {
    passes: !normalizedSource.includes('Budget together. Save together.'),
    message:
      'Home hero headline should avoid the old two-sentence headline wrap.',
  },
  {
    passes: normalizedSource.includes(
      'Budget and save your shared money, without the awkwardness.'
    ),
    message:
      'Home hero support copy should name budgeting, saving, shared money, and awkwardness.',
  },
]

const failures = checks
  .filter((check) => !check.passes)
  .map((check) => check.message)

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[home-copy] ${failure}`)
  }

  process.exit(1)
}
