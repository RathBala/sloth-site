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

const featuresStart = home.indexOf('<!-- Features Section -->')
const featuresEnd =
  featuresStart === -1 ? -1 : home.indexOf('<!-- Web app -->', featuresStart)
const featuresSection =
  featuresStart === -1 || featuresEnd === -1
    ? ''
    : home.slice(featuresStart, featuresEnd)
const featuresText = text(featuresSection)
const featureOneStart = featuresSection.indexOf(
  '<!-- Feature 1: Automated transaction categorisation -->'
)
const featureTwoStart = featuresSection.indexOf(
  '<!-- Feature 2: Budget suggestions -->'
)
const featureThreeStart = featuresSection.indexOf(
  '<!-- Feature 3: Savings goal scenarios -->'
)
const featureFourStart = featuresSection.indexOf(
  '<!-- Feature 4: CLI and Agent API -->'
)
const featureOneSection = featuresSection.slice(
  featureOneStart,
  featureTwoStart
)
const featureTwoSection = featuresSection.slice(
  featureTwoStart,
  featureThreeStart
)
const featureThreeSection = featuresSection.slice(
  featureThreeStart,
  featureFourStart
)
const featureFourSection = featuresSection.slice(featureFourStart)

const everydayStart = home.indexOf('<!-- Everyday features -->')
const everydaySection =
  everydayStart === -1 ? '' : home.slice(everydayStart, featuresStart)
const everydayText = text(everydaySection)
const everydayGroups = [
  [
    'tracking',
    'Track every purchase',
    'Connect banks or import CSVs',
    'Scan and review receipt items',
  ],
  [
    'budgeting',
    'Budget your way',
    'Plan budgets for future months',
    'Set price-change alerts and renewal reminders',
  ],
  [
    'sharing',
    'Share fairly',
    'See who owes what',
    'Ask your partner about a purchase',
  ],
  [
    'planning',
    'Plan what’s next',
    'Goals linked to savings accounts',
    'Track savings and investments',
  ],
]

const goalsSection = home.slice(
  home.indexOf('<!-- Goals Section -->'),
  home.indexOf('<!-- Free beta access section -->')
)

const checks = [
  {
    passes:
      text(goalsSection).includes('flights, stays, and spending money') &&
      text(goalsSection).includes('how much to save each month') &&
      /<a\s[^>]*href="\/home-planner\/"[^>]*data-analytics-cta="goals-home-planner"[^>]*>\s*Can you afford your dream home\?/.test(
        goalsSection
      ),
    message:
      'Goal cards should describe holiday saving and offer a tracked, contextual home-planner link.',
  },
  {
    passes:
      text(goalsSection).includes('Make room for your goals') &&
      text(goalsSection).includes('on your own or with a partner') &&
      text(goalsSection).includes('Saving for a home') &&
      !goalsSection.includes('data-archetype-') &&
      !home.includes('Built for couples planning a future together'),
    message:
      'The goals section should welcome individual and shared plans without retired archetype copy.',
  },
  {
    passes:
      everydayStart > home.indexOf('class="sloth-hero-dashboard-frame') &&
      everydayStart < featuresStart &&
      everydaySection.includes('aria-labelledby="everyday-features-heading"') &&
      everydayText.includes('Track, budget and save together') &&
      everydayText.includes(
        'From daily spending to shared goals, keep your money organised in one place.'
      ),
    message:
      'Everyday capabilities should be readable in initial HTML between the dashboard and the four advanced features.',
  },
  {
    passes:
      everydayGroups.every(([slug, ...copy]) => {
        const group =
          everydaySection.match(
            new RegExp(
              `<article[^>]*data-everyday-feature="${slug}"[\\s\\S]*?<\\/article>`
            )
          )?.[0] ?? ''
        return (
          copy.every((line) => text(group).includes(line)) &&
          (group.match(/<li\b/g) ?? []).length === 4 &&
          (group.match(/data-lucide="diamond"/g) ?? []).length === 4
        )
      }) && (everydaySection.match(/<li\b/g) ?? []).length === 16,
    message:
      'All sixteen everyday feature bullets should live in their four task groups, with the existing diamond style and no separate extras row.',
  },
  {
    passes:
      !/<(?:button|input|select|a)\b/.test(everydaySection) &&
      !everydaySection.includes('data-analytics-cta') &&
      !everydaySection.includes('fetchpriority="high"'),
    message:
      'The everyday overview should remain static illustration and copy, without fake controls, duplicate CTAs or high-priority image downloads.',
  },
  {
    passes:
      !featuresText.includes('Put your money admin on autopilot') &&
      featuresText.includes('Automated transaction categorisation') &&
      featuresText.includes('Budget suggestions') &&
      featuresText.includes('Savings goal scenarios') &&
      featuresText.includes('CLI & Agent API'),
    message:
      'Home features should open directly with the four capabilities, without a competing introduction.',
  },
  {
    passes:
      !featuresSection.includes('data-archetype-text') &&
      !featuresText.includes('Your plan, in one place') &&
      !featuresText.includes(
        'Map out your financial future from emergencies to nest eggs'
      ) &&
      !featuresText.includes('Plan together with your significant other') &&
      !featuresText.includes('Budget for the now') &&
      !featuresText.includes('Model the future before it happens'),
    message:
      'Home feature copy should stay aligned with the automation positioning instead of reverting to archetype-specific legacy copy.',
  },
  {
    passes:
      featuresText.includes(
        'Sloth suggests practical changes, and you choose what to adjust.'
      ) &&
      featuresText.includes('MCP support is coming soon.') &&
      featuresText.includes('Categorise new transactions every day') &&
      featuresText.includes(
        'Reallocate budgets to maximise your savings goals'
      ) &&
      featuresText.includes('Check “Can I afford this?” before you buy') &&
      !featuresText.includes('three completed budget cycles') &&
      !featuresText.includes('last three completed cycles'),
    message:
      'Home budget and Agent API copy should stay outcome-focused, label MCP as coming soon, and show concrete personal AI skill examples.',
  },
  {
    passes:
      featureOneSection.includes(
        'assets/images/feature-auto-categorisation-desktop.webp'
      ) &&
      featureOneSection.includes(
        'assets/images/feature-auto-categorisation-mobile.webp'
      ) &&
      featureTwoSection.includes(
        'assets/images/feature-budget-suggestions-desktop.webp'
      ) &&
      featureTwoSection.includes(
        'assets/images/feature-budget-suggestions-mobile.webp'
      ) &&
      featureThreeSection.includes(
        'assets/images/feature-scenarios-desktop.webp'
      ) &&
      featureThreeSection.includes(
        'assets/images/feature-scenarios-mobile.webp'
      ) &&
      featureFourSection.includes('data-cli-example') &&
      featureFourSection.includes('sloth-agent budget move') &&
      featureFourSection.includes('&quot;dryRun&quot;: true'),
    message:
      'Each home capability should use its matching desktop and mobile product visual.',
  },
  {
    passes:
      featureFourSection.includes('href="/developers/"') &&
      featuresText.includes('Explore the developer tools'),
    message:
      'The CLI and Agent API feature should offer a quiet route into the developer documentation.',
  },
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
      homeText.includes('Automated transaction categorisation') &&
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
