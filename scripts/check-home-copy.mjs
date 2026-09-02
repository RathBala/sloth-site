import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const [
  home,
  wedding,
  developers,
  agentInstructions,
  visualAssets,
  packageJson,
] = await Promise.all([
  readFile(path.join(projectRoot, 'src/index.html'), 'utf8'),
  readFile(path.join(projectRoot, 'src/wedding-fund/index.html'), 'utf8'),
  readFile(path.join(projectRoot, 'src/developers/index.html'), 'utf8'),
  readFile(path.join(projectRoot, 'AGENTS.md'), 'utf8'),
  readFile(path.join(projectRoot, 'docs/visual-assets.md'), 'utf8'),
  readFile(path.join(projectRoot, 'package.json'), 'utf8'),
])

const text = (source) =>
  source
    .replace(/<[^>]*>/g, ' ')
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ')
const normalizedHome = home.replace(/\s+/g, ' ')
const homeText = text(home)
const weddingText = text(wedding)
const developerText = text(developers)

const heroStart = home.indexOf('<!-- Hero Section -->')
const heroEnd = home.indexOf('<!-- Features Section -->', heroStart)
const hero =
  heroStart === -1 || heroEnd === -1 ? '' : home.slice(heroStart, heroEnd)

const checks = [
  {
    passes:
      homeText.includes('Join the free beta') &&
      homeText.includes('full access is yours free forever') &&
      homeText.includes(
        'One connected partner included while you are linked'
      ) &&
      !homeText.includes('Full access for 14 days') &&
      !homeText.includes('One subscription') &&
      !homeText.includes('£4.99') &&
      !home.includes('pricing-toggle.js'),
    message:
      'Home access copy should preserve the permanent free-beta promise.',
  },
  {
    passes:
      weddingText.includes('Join the free beta') &&
      weddingText.includes('full access is yours free forever') &&
      weddingText.includes(
        'One connected partner included while you are linked'
      ) &&
      !weddingText.includes('Full access for 14 days') &&
      !weddingText.includes('One subscription') &&
      !weddingText.includes('£4.99') &&
      !wedding.includes('pricing-toggle.js'),
    message:
      'Wedding access copy should preserve the permanent free-beta promise.',
  },
  {
    passes:
      developerText.includes('Free beta included') &&
      developerText.includes('Agent API access is included') &&
      !developerText.includes('Paid access required'),
    message: 'Developer docs should preserve free-beta Agent API access copy.',
  },
  {
    passes: homeText.includes('Take the work out of money'),
    message: 'Home hero should use the approved headline.',
  },
  {
    passes: homeText.includes(
      'Sloth Money keeps your budget organised, your goals moving and the routine admin off your plate.'
    ),
    message: 'Home hero should use the approved support copy.',
  },
  {
    passes: [
      'Automated transaction categorisation',
      'Budget suggestions',
      'Savings goal scenarios',
      'CLI & Agent API',
    ].every((feature) => homeText.includes(feature)),
    message: 'Home hero should show all four approved feature callouts.',
  },
  {
    passes:
      hero.includes('assets/images/sloth-money-garden-hero.webp') &&
      hero.includes('assets/images/hero%20asset.png') &&
      hero.includes('data-analytics-cta="hero-start"') &&
      hero.includes('data-analytics-cta="hero-sign-in"'),
    message:
      'Home hero should use the garden art, dashboard preview, and existing CTA tracking.',
  },
  {
    passes:
      !normalizedHome.includes('What kind of saver are you?') &&
      !normalizedHome.includes('Pick Solo or Couple') &&
      !home.includes('data-archetype-lock') &&
      !home.includes('data-archetype-reveal') &&
      !home.includes('assets/js/archetype-flow.js') &&
      !home.includes('is-preview'),
    message: 'Home should remove the Solo/Couple selector and visibility gate.',
  },
  {
    passes:
      home.includes('<!-- Features Section -->') &&
      homeText.includes(
        'Map out your financial future from emergencies to nest eggs'
      ) &&
      homeText.includes('Built for shared finances'),
    message:
      'Home should keep the existing lower-page content in the initial HTML.',
  },
  {
    passes:
      !homeText.includes('Couple finances actually made fun.') &&
      !home.includes('Shared money plans for couples'),
    message:
      'Home metadata and hero should no longer use the couples-first positioning.',
  },
  {
    passes:
      agentInstructions.includes('warm tan and caramel-brown') &&
      agentInstructions.includes('green sloths') &&
      agentInstructions.includes('docs/visual-assets.md') &&
      visualAssets.includes('Actual page context beats isolated pixels') &&
      visualAssets.includes('two post-processing attempts') &&
      visualAssets.includes('Cache-bust browser checks') &&
      packageJson.includes('"asset:prepare-sloth"'),
    message:
      'The Sloth visual asset workflow should remain documented and executable.',
  },
]

const failures = checks.filter(({ passes }) => !passes)

for (const { message } of failures) {
  console.error(`[home-copy] ${message}`)
}

if (failures.length > 0) process.exit(1)

console.log('[home-copy] Homepage copy and visibility contract passed.')
