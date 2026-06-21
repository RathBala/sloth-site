import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const homePagePath = path.join(projectRoot, 'src/index.html')
const heroBackgroundSvgPath = path.join(
  projectRoot,
  'src/assets/images/sloth-hero-leafy-bg.svg'
)
const heroSideLeafSvgPath = path.join(
  projectRoot,
  'src/assets/images/sloth-side-leaf.svg'
)

const source = await readFile(homePagePath, 'utf8')
const heroBackgroundSvg = await readFile(heroBackgroundSvgPath, 'utf8').catch(
  () => ''
)
const heroSideLeafSvg = await readFile(heroSideLeafSvgPath, 'utf8').catch(
  () => ''
)
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
const archetypeFlowIndex = source.indexOf('class="sloth-archetype-flow')

const checks = [
  {
    passes: normalizedText.includes('Couple finances actually made fun.'),
    message:
      'Home hero headline should lead with the agreed couple-finances-made-fun value prop.',
  },
  {
    passes:
      heroHeadline.includes('Couple finances actually') &&
      heroHeadline.includes('made') &&
      heroHeadline.includes('mint-line') &&
      heroHeadline.includes('fun.') &&
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
      archetypeSection.includes('sloth-archetype-card') &&
      archetypeSection.includes(
        'assets/images/sloth-archetype-goal-art.webp'
      ) &&
      archetypeSection.includes('assets/images/sloth-archetype-zen-art.webp') &&
      !archetypeSection.includes('assets/images/sloth-archetype-flow.webp'),
    message:
      'Home archetype cards should render text, borders, and paths in code instead of using the old composite image.',
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
      source.includes("url('assets/images/sloth-hero-leafy-bg.svg')") &&
      !source.includes('assets/images/sloth-hero-leafy-bg.webp') &&
      !source.includes('assets/images/sloth-hero-leafy-bg@2x.webp'),
    message:
      'Home hero leafy background should use the crisp SVG asset instead of the raster WebP background.',
  },
  {
    passes:
      heroBackgroundSvg.includes('<svg') &&
      heroBackgroundSvg.includes('<polygon') &&
      heroBackgroundSvg.includes('<linearGradient') &&
      heroBackgroundSvg.includes('viewBox="0 0 2048 1600"') &&
      heroBackgroundSvg.includes('id="medium-left-leaf"') &&
      heroBackgroundSvg.includes('id="medium-right-leaf"'),
    message:
      'Home hero leafy SVG background should be authored vector artwork with medium-crop side leaves.',
  },
  {
    passes:
      source.includes('assets/images/sloth-side-leaf.svg') &&
      source.includes('sloth-hero-side-leaf-left') &&
      source.includes('sloth-hero-side-leaf-right') &&
      heroSideLeafSvg.includes('<polygon') &&
      heroSideLeafSvg.includes('<linearGradient'),
    message:
      'Home hero should place crisp SVG side leaves independently of the background crop.',
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
