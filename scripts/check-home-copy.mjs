import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const homePagePath = path.join(projectRoot, 'src/index.html')
const heroBackground2xPath = path.join(
  projectRoot,
  'src/assets/images/sloth-hero-leafy-bg@2x.webp'
)

const source = await readFile(homePagePath, 'utf8')
const heroBackground2x = await readFile(heroBackground2xPath).catch(() => null)
const normalizedSource = source.replace(/\s+/g, ' ')
const normalizedText = source.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
const heroBackgroundStart = source.indexOf('<div class="sloth-hero')
const heroStart = source.indexOf('<!-- Hero Section -->')
const heroEnd = heroStart === -1 ? -1 : source.indexOf('</section>', heroStart)
const headlineStart = source.indexOf('<h1', heroStart)
const headlineEnd =
  headlineStart === -1 ? -1 : source.indexOf('</h1>', headlineStart)
const heroHeadline =
  headlineStart === -1 || headlineEnd === -1
    ? ''
    : source.slice(headlineStart, headlineEnd)
const heroLeadIn =
  heroStart === -1 || headlineStart === -1
    ? ''
    : source.slice(heroStart, headlineStart)
const ctaRowStart = source.indexOf('class="sloth-cta-row', heroStart)
const dashboardPreviewStart = source.indexOf(
  'class="relative z-10 min-w-0 reveal"',
  ctaRowStart
)
const ctaRowEnd =
  ctaRowStart === -1 || dashboardPreviewStart === -1
    ? -1
    : dashboardPreviewStart
const heroCtaRow =
  ctaRowStart === -1 || ctaRowEnd === -1
    ? ''
    : source.slice(ctaRowStart, ctaRowEnd)
const heroBackgroundEnd =
  heroBackgroundStart === -1
    ? -1
    : source.indexOf('<!-- Features Section -->', heroBackgroundStart)
const archetypeStart = source.indexOf('<!-- Archetype Section -->')
const archetypeEnd =
  archetypeStart === -1 ? -1 : source.indexOf('</section>', archetypeStart)
const archetypeSection =
  archetypeStart === -1 || archetypeEnd === -1
    ? ''
    : source.slice(archetypeStart, archetypeEnd)
const roadmapHeroIndex = source.indexOf('assets/images/hero%20asset.png')
const archetypeFlowIndex = source.indexOf(
  'assets/images/sloth-archetype-flow.webp'
)

function readWebpDimensions(buffer) {
  if (!buffer || buffer.toString('ascii', 0, 4) !== 'RIFF') {
    return null
  }

  let offset = 12
  while (offset + 8 <= buffer.length) {
    const chunkType = buffer.toString('ascii', offset, offset + 4)
    const chunkSize = buffer.readUInt32LE(offset + 4)
    const chunkStart = offset + 8

    if (chunkType === 'VP8X' && chunkStart + 10 <= buffer.length) {
      return {
        width: 1 + buffer.readUIntLE(chunkStart + 4, 3),
        height: 1 + buffer.readUIntLE(chunkStart + 7, 3),
      }
    }

    if (
      chunkType === 'VP8 ' &&
      chunkStart + 10 <= buffer.length &&
      buffer[chunkStart + 3] === 0x9d &&
      buffer[chunkStart + 4] === 0x01 &&
      buffer[chunkStart + 5] === 0x2a
    ) {
      return {
        width: buffer.readUInt16LE(chunkStart + 6) & 0x3fff,
        height: buffer.readUInt16LE(chunkStart + 8) & 0x3fff,
      }
    }

    offset = chunkStart + chunkSize + (chunkSize % 2)
  }

  return null
}

const heroBackground2xDimensions = readWebpDimensions(heroBackground2x)

const checks = [
  {
    passes: normalizedText.includes('Couple finances, actually fun.'),
    message:
      'Home hero headline should lead with the agreed couple-finances value prop.',
  },
  {
    passes:
      heroHeadline.includes('actually fun.') &&
      heroLeadIn.includes('assets/images/sloth-guide-sidekick.webp') &&
      heroLeadIn.includes('sloth-hero-mascot') &&
      !heroHeadline.includes('assets/images/sloth-guide-sidekick.webp') &&
      !heroCtaRow.includes('assets/images/sloth-guide-sidekick.webp'),
    message:
      'Home hero guide sidekick should sit centered above the headline instead of inside the headline or CTA row.',
  },
  {
    passes:
      heroCtaRow.includes('max-w-[21.5rem]') &&
      heroCtaRow.includes('sm:flex-row') &&
      heroCtaRow.includes('sm:w-auto') &&
      !heroCtaRow.includes('max-w-2xl') &&
      !heroCtaRow.includes('sloth-cta-actions'),
    message:
      'Home hero CTAs should use a compact Attio-style button pair on desktop with a narrower mobile stack.',
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
      '<span class="block"> <strong class="sloth-subhead-keyword">Budget</strong> and <strong class="sloth-subhead-keyword">save</strong> your way to shared wealth. </span> <span class="block"> More celebration, less awkwardness. </span>'
    ),
    message:
      'Home hero support copy should emphasize Budget/save and use separate lines for shared wealth and celebration/awkwardness.',
  },
  {
    passes:
      heroStart !== -1 &&
      heroEnd !== -1 &&
      roadmapHeroIndex > heroStart &&
      roadmapHeroIndex < heroEnd,
    message:
      'Home hero should use the Sloth Money roadmap dashboard image as the primary visual.',
  },
  {
    passes: heroEnd !== -1 && archetypeFlowIndex > heroEnd,
    message:
      'Home archetype flow should sit below the hero instead of inside the hero grid.',
  },
  {
    passes:
      heroBackgroundStart !== -1 &&
      heroBackgroundEnd !== -1 &&
      heroStart > heroBackgroundStart &&
      archetypeFlowIndex > heroBackgroundStart &&
      archetypeFlowIndex < heroBackgroundEnd,
    message:
      'Home hero and archetype sections should share one continuous hero background.',
  },
  {
    passes:
      archetypeSection.length > 0 &&
      !archetypeSection.includes('absolute inset-0 opacity-70') &&
      !archetypeSection.includes('background-image: linear-gradient') &&
      !archetypeSection.includes('bg-[#013d29]'),
    message:
      'Home archetype section should not add a separate background layer that creates a divider below the hero.',
  },
  {
    passes:
      source.includes('image-set(') &&
      source.includes('assets/images/sloth-hero-leafy-bg.webp') &&
      source.includes('assets/images/sloth-hero-leafy-bg@2x.webp') &&
      source.includes('2x'),
    message:
      'Home hero leafy background should use image-set with a 2x asset for high-density displays.',
  },
  {
    passes:
      heroBackground2xDimensions !== null &&
      heroBackground2xDimensions.width >= 2880 &&
      heroBackground2xDimensions.height >= 3200,
    message: 'Home hero leafy 2x background should be at least 2880x3200px.',
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
