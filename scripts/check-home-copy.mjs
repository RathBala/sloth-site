import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const homePagePath = path.join(projectRoot, 'src/index.html')
const agentInstructionsPath = path.join(projectRoot, 'AGENTS.md')
const visualAssetsDocPath = path.join(projectRoot, 'docs/visual-assets.md')
const packageJsonPath = path.join(projectRoot, 'package.json')
const archetypeFlowJsPath = path.join(
  projectRoot,
  'src/assets/js/archetype-flow.js'
)
const heroBackgroundSvgPath = path.join(
  projectRoot,
  'src/assets/images/sloth-hero-leafy-bg.svg'
)
const heroSideLeafSvgPath = path.join(
  projectRoot,
  'src/assets/images/sloth-side-leaf.svg'
)

const source = await readFile(homePagePath, 'utf8')
const agentInstructions = await readFile(agentInstructionsPath, 'utf8')
const visualAssetsDoc = await readFile(visualAssetsDocPath, 'utf8').catch(
  () => ''
)
const packageJson = await readFile(packageJsonPath, 'utf8')
const archetypeFlowJs = await readFile(archetypeFlowJsPath, 'utf8')
const heroBackgroundSvg = await readFile(heroBackgroundSvgPath, 'utf8').catch(
  () => ''
)
const heroSideLeafSvg = await readFile(heroSideLeafSvgPath, 'utf8').catch(
  () => ''
)
const normalizedSource = source.replace(/\s+/g, ' ')
const normalizedCss = source.replace(/\s+/g, ' ')
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
const archetypeContentOpening =
  source.match(/<div\s+id="archetype-content"[\s\S]*?>/)?.[0] ?? ''
const archetypeText = archetypeSection
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
const roadmapHeroIndex = source.indexOf('assets/images/hero%20asset.png')
const archetypeFlowIndex = source.indexOf('class="sloth-archetype-flow')
const archetypeArtImgRule =
  source.match(/\.sloth-archetype-art img\s*\{[\s\S]*?\n      \}/)?.[0] ?? ''

const checks = [
  {
    passes: normalizedText.includes('Couple finances actually made fun.'),
    message:
      'Home hero headline should lead with the agreed couple-finances-made-fun value prop.',
  },
  {
    passes:
      heroHeadline.includes(
        '<span class="block sm:inline">Couple finances</span>'
      ) &&
      heroHeadline.includes('<span class="block sm:inline">actually</span>') &&
      heroHeadline.includes('made') &&
      heroHeadline.includes('mint-line') &&
      heroHeadline.includes('fun.') &&
      !heroHeadline.includes('mt-2') &&
      heroLeadIn.includes('assets/images/sloth-guide-sidekick.webp') &&
      heroLeadIn.includes('sloth-hero-mascot') &&
      !heroHeadline.includes('assets/images/sloth-guide-sidekick.webp') &&
      !heroCtaRow.includes('assets/images/sloth-guide-sidekick.webp'),
    message:
      'Home hero guide sidekick should sit centered above the headline, and the headline should stack actually on mobile while keeping it on the first line at desktop sizes.',
  },
  {
    passes:
      heroHeadline.includes('leading-[.9]') &&
      heroHeadline.includes('sm:leading-[0.98]'),
    message:
      'Home hero headline should use tighter mobile line-height to avoid awkward wrapped-line spacing.',
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
        'assets/images/sloth-archetype-solo-art.webp'
      ) &&
      archetypeSection.includes(
        'assets/images/sloth-archetype-couple-art.webp'
      ) &&
      !archetypeSection.includes(
        'assets/images/sloth-archetype-goal-art.webp'
      ) &&
      !archetypeSection.includes(
        'assets/images/sloth-archetype-zen-art.webp'
      ) &&
      !archetypeSection.includes('assets/images/sloth-archetype-flow.webp'),
    message:
      'Home archetype cards should use the Solo and Couple sloth assets instead of the old archetype art or composite image.',
  },
  {
    passes:
      archetypeSection.includes('What kind of saver are you?') &&
      !archetypeSection.includes('Or begin with your money archetype'),
    message:
      'Home archetype heading should ask what kind of saver the visitor is.',
  },
  {
    passes:
      archetypeText.includes(' Solo ') &&
      archetypeText.includes(' Couple ') &&
      !archetypeSection.includes('Goal-Chaser') &&
      !archetypeSection.includes('Zen<br />Sloth'),
    message: 'Home archetype cards should offer Solo and Couple only.',
  },
  {
    passes:
      archetypeSection.includes('href="#couple-archetypes"') &&
      archetypeSection.includes('id="couple-archetypes"') &&
      archetypeSection.includes('Planner + Free Spirit') &&
      archetypeSection.includes('Planner + Planner') &&
      archetypeSection.includes('Free Spirit + Free Spirit') &&
      archetypeSection.includes(
        'assets/images/sloth-couple-planner-free-spirit-art.webp'
      ) &&
      archetypeSection.includes(
        'assets/images/sloth-couple-planner-planner-art.webp'
      ) &&
      archetypeSection.includes(
        'assets/images/sloth-couple-free-spirit-free-spirit-art.webp'
      ) &&
      archetypeSection.includes(
        'data-analytics-cta="couple-planner-free-spirit"'
      ) &&
      archetypeSection.includes(
        'data-analytics-cta="couple-planner-planner"'
      ) &&
      archetypeSection.includes(
        'data-analytics-cta="couple-free-spirit-free-spirit"'
      ),
    message:
      'Home Couple saver card should scroll to the three tracked couple archetype branches.',
  },
  {
    passes:
      archetypeSection.includes('href="#planner-free-spirit-content"') &&
      archetypeSection.includes(
        'data-couple-archetype-trigger="planner-free-spirit"'
      ) &&
      archetypeContentOpening.includes('data-archetype-content') &&
      archetypeContentOpening.includes('is-preview') &&
      !archetypeContentOpening.includes('hidden') &&
      !archetypeContentOpening.includes('inert') &&
      source.includes('.sloth-archetype-results') &&
      source.includes('.sloth-archetype-results.is-preview') &&
      source.includes('background: #013d29') &&
      source.includes('.sloth-archetype-results.is-preview > section') &&
      source.includes('opacity: 0.42') &&
      source.includes('saturate(0.48) brightness(0.62) contrast(0.82)') &&
      source.includes('.sloth-archetype-results.is-preview::before') &&
      source.includes('#013d29') &&
      source.includes('inset: 0') &&
      !source.includes(
        '.sloth-archetype-results.is-preview {\n        opacity:'
      ) &&
      source.includes('.sloth-archetype-results.is-revealed') &&
      archetypeFlowJs.includes('data-couple-archetype-trigger') &&
      archetypeFlowJs.includes('showArchetypeContent') &&
      archetypeFlowJs.includes("classList.add('is-preview')") &&
      archetypeFlowJs.includes("classList.remove('is-preview')") &&
      !archetypeFlowJs.includes('archetypeContent.hidden') &&
      archetypeFlowJs.includes('const nextHash = `#${archetype}-content`') &&
      archetypeFlowJs.includes('dataset.currentArchetype = archetype'),
    message:
      'Home Planner + Free Spirit branch should select an in-page archetype state and undim the already-present lower homepage content instead of hiding it from the page flow.',
  },
  {
    passes:
      archetypeSection.includes('data-archetype-reveal="couple"') &&
      archetypeSection.includes('data-couple-branch-grid') &&
      source.includes('assets/js/archetype-flow.js'),
    message:
      'Home Couple saver card should reveal the dimmed couple branches before the user can choose a branch.',
  },
  {
    passes:
      source.includes(
        '.sloth-couple-branches:not(.is-revealed):not(:target)'
      ) &&
      source.includes('.sloth-couple-branches.is-revealed') &&
      source.includes('.sloth-couple-branch-grid[inert]'),
    message:
      'Home couple branches should start visually dimmed and interaction-locked until revealed.',
  },
  {
    passes:
      archetypeSection.includes('sloth-couple-connector') &&
      archetypeSection.includes('M75 0 V32 C75 55 50 50 50 76 V100') &&
      source.includes('.sloth-archetype-path.couple::before') &&
      source.includes('.sloth-couple-connector path') &&
      source.includes('vector-effect: non-scaling-stroke') &&
      source.includes('display: none') &&
      !source.includes('left: 75%'),
    message:
      'Home Couple connector should be one centered merging line instead of a disconnected right-side branch line.',
  },
  {
    passes:
      source.includes('.sloth-archetype-flow') &&
      source.includes('max-width: 42rem') &&
      source.includes('aspect-ratio: 0.78') &&
      source.includes('height: clamp(4.4rem, 9vw, 6.2rem)') &&
      !source.includes('min-height: clamp(22.25rem, 62vw, 35rem)'),
    message:
      'Home saver cards should keep compact component-owned sizing so they do not bleed off screen.',
  },
  {
    passes:
      source.includes('.sloth-archetype-art {') &&
      archetypeArtImgRule.includes('object-fit: cover') &&
      archetypeArtImgRule.includes('object-position: center 48%') &&
      !archetypeArtImgRule.includes('-webkit-mask-image') &&
      !archetypeArtImgRule.includes('mask-image') &&
      archetypeSection.includes('loading="eager"') &&
      archetypeSection.includes('fetchpriority="high"'),
    message:
      'Home saver-card sloth art should render eagerly with unmasked, cropped images so Solo and Couple stay visible on mobile browsers.',
  },
  {
    passes:
      normalizedCss.includes('.sloth-archetype-grid, .sloth-archetype-paths') &&
      normalizedCss.includes('max-width: 42rem') &&
      normalizedCss.includes('max-width: 66rem') &&
      normalizedCss.includes(
        '.sloth-couple-branch-card { display: flex; aspect-ratio: 0.78'
      ) &&
      normalizedCss.includes(
        'grid-template-columns: repeat(3, minmax(0, 1fr))'
      ) &&
      normalizedCss.includes(
        '.sloth-couple-branch-art { display: grid; flex: 1'
      ),
    message:
      'Home couple branch cards should use a wider desktop grid and the same card/art proportions as the Solo and Couple saver cards.',
  },
  {
    passes:
      archetypeFlowJs.includes('event.preventDefault()') &&
      archetypeFlowJs.includes(
        "window.history.pushState(null, '', '#couple-archetypes')"
      ) &&
      archetypeFlowJs.includes('coupleBranches.scrollIntoView') &&
      archetypeFlowJs.includes("behavior: 'smooth'") &&
      archetypeFlowJs.includes("block: 'start'"),
    message:
      'Home Couple saver card should reveal and start smooth scrolling immediately from the click handler.',
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
  {
    passes:
      agentInstructions.includes('warm tan and caramel-brown') &&
      agentInstructions.includes('green sloths') &&
      agentInstructions.includes('logo, mascot, hero, archetype') &&
      agentInstructions.includes('docs/visual-assets.md'),
    message:
      'AGENTS.md should document and link the warm brown sloth asset direction for future generated sloth assets.',
  },
  {
    passes:
      visualAssetsDoc.includes('Actual page context beats isolated pixels') &&
      visualAssetsDoc.includes('two post-processing attempts') &&
      visualAssetsDoc.includes('Cache-bust browser checks') &&
      visualAssetsDoc.includes('warm tan and caramel-brown'),
    message:
      'docs/visual-assets.md should capture the repeatable visual asset workflow and loop-prevention rules.',
  },
  {
    passes:
      packageJson.includes('"asset:prepare-sloth"') &&
      packageJson.includes('scripts/prepare-sloth-asset.mjs'),
    message:
      'package.json should expose the repeatable Sloth asset preparation script.',
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
