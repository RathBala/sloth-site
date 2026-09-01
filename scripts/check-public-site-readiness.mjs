import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const srcDir = path.join(projectRoot, 'src')
const functionsDir = path.join(projectRoot, 'netlify/functions')

async function readSource(relativePath) {
  return readFile(path.join(srcDir, relativePath), 'utf8').catch(() => '')
}

async function collectHtmlFiles(directoryPath, relativePath = '') {
  const entries = await readdir(directoryPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryRelativePath = path.join(relativePath, entry.name)

    if (entry.isDirectory()) {
      files.push(
        ...(await collectHtmlFiles(
          path.join(directoryPath, entry.name),
          entryRelativePath
        ))
      )
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(entryRelativePath)
    }
  }

  return files
}

const [
  packageSource,
  netlifyConfig,
  home,
  developers,
  privacy,
  weddingFund,
  homePlanner,
  markMe,
  robots,
  sitemap,
  llms,
  homeSocialImage,
  developerSocialImage,
] = await Promise.all([
  readFile(path.join(projectRoot, 'package.json'), 'utf8'),
  readFile(path.join(projectRoot, 'netlify.toml'), 'utf8'),
  readSource('index.html'),
  readSource('developers/index.html'),
  readSource('privacy/index.html'),
  readSource('wedding-fund/index.html'),
  readSource('home-planner/index.html'),
  readSource('mark-me.html'),
  readSource('robots.txt'),
  readSource('sitemap.xml'),
  readSource('llms.txt'),
  readSource('assets/images/sloth-money-logo-icon.png'),
  readSource('assets/images/sloth logo black.png'),
])

const failures = []

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function requireText(source, expected, location) {
  if (!source.includes(expected)) {
    failures.push(`${location} must include ${expected}.`)
  }
}

function requireMeta(source, attribute, name, content, location) {
  const pattern = new RegExp(
    `<meta\\s+(?=[^>]*${attribute}="${escapeRegExp(name)}")(?=[^>]*content="${escapeRegExp(content)}")[^>]*>`
  )

  if (!pattern.test(source)) {
    failures.push(
      `${location} must include ${attribute}="${name}" with content="${content}".`
    )
  }
}

if (!JSON.parse(packageSource).scripts.build.includes('check:public-site')) {
  failures.push('The production build must run check:public-site.')
}

for (const [page, canonical] of [
  [home, 'https://slothmoney.app/'],
  [developers, 'https://slothmoney.app/developers/'],
  [privacy, 'https://slothmoney.app/privacy/'],
  [weddingFund, 'https://slothmoney.app/wedding-fund/'],
  [homePlanner, 'https://slothmoney.app/home-planner/'],
]) {
  const canonicalTag = `<link rel="canonical" href="${canonical}"`
  requireText(page, canonicalTag, canonical)

  if (page.split(canonicalTag).length - 1 !== 1) {
    failures.push(`${canonical} must declare exactly one canonical URL.`)
  }

  if (page.includes('name="robots" content="noindex')) {
    failures.push(`${canonical} must remain indexable.`)
  }
}

for (const metadata of [
  {
    page: home,
    location: 'src/index.html',
    title: 'Sloth Money - Shared money plans for couples',
    openGraphDescription:
      'Turn awkward money admin into a shared system. Build goals, contributions, and progress together - without spreadsheet chaos.',
    twitterDescription:
      'Turn awkward money admin into a shared system. Build goals, contributions, and progress together - without spreadsheet chaos.',
    url: 'https://slothmoney.app/',
    image: 'https://slothmoney.app/assets/images/sloth-money-logo-icon.png',
  },
  {
    page: developers,
    location: 'src/developers/index.html',
    title: 'Sloth Agent API - Developer access for Sloth Money',
    openGraphDescription:
      'Inspect accounts, investments, and budgets, update planned amounts, manage goals and forecast scenarios, and categorize your Sloth Money data.',
    twitterDescription:
      'Use your own agent to inspect budgets, accounts, and investments, update plans, and categorize Sloth Money transactions.',
    url: 'https://slothmoney.app/developers/',
    image: 'https://slothmoney.app/assets/images/sloth%20logo%20black.png',
  },
  {
    page: homePlanner,
    location: 'src/home-planner/index.html',
    title: 'Can you afford your dream home? | Sloth Money',
    openGraphDescription:
      'Explore your deposit timeline, mortgage scenarios, and the costs people miss when planning to own a home.',
    twitterDescription:
      'Explore your deposit timeline, mortgage scenarios, and the costs people miss when planning to own a home.',
    url: 'https://slothmoney.app/home-planner/',
    image: 'https://slothmoney.app/assets/images/sloth-money-logo-icon.png',
  },
]) {
  requireMeta(
    metadata.page,
    'property',
    'og:title',
    metadata.title,
    metadata.location
  )
  requireMeta(
    metadata.page,
    'property',
    'og:description',
    metadata.openGraphDescription,
    metadata.location
  )
  requireMeta(
    metadata.page,
    'property',
    'og:url',
    metadata.url,
    metadata.location
  )
  requireMeta(
    metadata.page,
    'property',
    'og:image',
    metadata.image,
    metadata.location
  )
  requireMeta(
    metadata.page,
    'name',
    'twitter:card',
    'summary_large_image',
    metadata.location
  )
  requireMeta(
    metadata.page,
    'name',
    'twitter:title',
    metadata.title,
    metadata.location
  )
  requireMeta(
    metadata.page,
    'name',
    'twitter:description',
    metadata.twitterDescription,
    metadata.location
  )
  requireMeta(
    metadata.page,
    'name',
    'twitter:image',
    metadata.image,
    metadata.location
  )
}

requireText(home, 'href="/developers/"', 'src/index.html')
requireText(home, 'href="/home-planner/"', 'src/index.html')
requireText(markMe, 'name="robots" content="noindex', 'src/mark-me.html')

for (const [page, location] of [
  [home, 'src/index.html'],
  [weddingFund, 'src/wedding-fund/index.html'],
  [developers, 'src/developers/index.html'],
]) {
  requireText(page, 'data-tools-menu', location)
  requireText(page, '>Tools<', location)
  requireText(page, 'href="/home-planner/"', location)
  requireText(page, '>Home planner<', location)
}

requireText(
  homePlanner,
  'Can you afford your dream home?',
  'src/home-planner/index.html'
)
requireText(
  homePlanner,
  'data-analytics-cta="home-planner-start"',
  'src/home-planner/index.html'
)
requireText(homePlanner, 'Move the levers', 'src/home-planner/index.html')
requireText(
  homePlanner,
  'Sources and assumptions',
  'src/home-planner/index.html'
)

if (/Free home ownership planner/i.test(homePlanner)) {
  failures.push(
    'src/home-planner/index.html must not restore the removed planner eyebrow.'
  )
}

if (!homeSocialImage || !developerSocialImage) {
  failures.push('Social preview images must exist in the deploy artifact.')
}

for (const directive of [
  'User-agent: *',
  'User-agent: OAI-SearchBot',
  'User-agent: ChatGPT-User',
  'User-agent: GPTBot',
  'User-agent: Claude-SearchBot',
  'User-agent: Claude-User',
  'User-agent: ClaudeBot',
  'Sitemap: https://slothmoney.app/sitemap.xml',
]) {
  requireText(robots, directive, 'src/robots.txt')
}

for (const pageUrl of [
  'https://slothmoney.app/',
  'https://slothmoney.app/developers/',
  'https://slothmoney.app/privacy/',
  'https://slothmoney.app/wedding-fund/',
  'https://slothmoney.app/home-planner/',
]) {
  requireText(sitemap, `<loc>${pageUrl}</loc>`, 'src/sitemap.xml')
}

if (sitemap.includes('mark-me')) {
  failures.push('src/sitemap.xml must exclude the owner utility page.')
}

for (const [expected, location] of [
  ['from = "/wedding-fund"', 'netlify.toml'],
  ['to = "/wedding-fund/"', 'netlify.toml'],
  ['status = 301', 'netlify.toml'],
  ['from = "/home-planner"', 'netlify.toml'],
  ['to = "/home-planner/"', 'netlify.toml'],
]) {
  requireText(netlifyConfig, expected, location)
}

const functionFiles = (await readdir(functionsDir))
  .filter((file) => file.endsWith('.js'))
  .sort()
const classifiedFunctionFiles = ['mark-me.js', 'track-visit.js']

if (JSON.stringify(functionFiles) !== JSON.stringify(classifiedFunctionFiles)) {
  failures.push(
    `Every hosted function route needs an explicit non-indexable classification. Found: ${functionFiles.join(', ')}.`
  )
}

if (sitemap.includes('/.netlify/functions/')) {
  failures.push('src/sitemap.xml must exclude service function routes.')
}

const htmlFiles = (await collectHtmlFiles(srcDir)).sort()
const classifiedHtmlFiles = [
  'developers/index.html',
  'home-planner/index.html',
  'index.html',
  'mark-me.html',
  'privacy/index.html',
  'wedding-fund/index.html',
]

if (JSON.stringify(htmlFiles) !== JSON.stringify(classifiedHtmlFiles)) {
  failures.push(
    `Every HTML route needs an explicit indexability classification. Found: ${htmlFiles.join(', ')}.`
  )
}

for (const resource of [
  '# Sloth Money',
  'https://slothmoney.app/developers/',
  'https://www.npmjs.com/package/@slothmoney/agent-cli',
  'https://github.com/RathBala/sloth-agent-cli',
  'https://slothmoney.app/privacy/',
  'goal priority ordering',
]) {
  requireText(llms, resource, 'src/llms.txt')
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[public-site] ${failure}`)
  }

  process.exit(1)
}
