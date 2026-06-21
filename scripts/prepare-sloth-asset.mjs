#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const args = process.argv.slice(2)

const readArg = (name, fallback) => {
  const index = args.indexOf(name)
  if (index === -1) return fallback
  const value = args[index + 1]
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${name}`)
  }
  return value
}

const hasArg = (name) => args.includes(name)

const usage = () => {
  console.error(`Usage: yarn asset:prepare-sloth --input <source> --png <out.png> --webp <out.webp> --width <px> --height <px> [options]

Options:
  --key <color|none>  Chroma key to remove before resizing. Default: #ff00ff
  --fuzz <percent>    ImageMagick key color fuzz. Default: 24
  --erode <pixels>    Contract alpha edge after key removal. Default: 1
  --quality <1-100>   WebP quality. Default: 82
  --help              Show this help
`)
}

if (hasArg('--help')) {
  usage()
  process.exit(0)
}

const required = ['--input', '--png', '--webp', '--width', '--height']
for (const name of required) {
  if (!hasArg(name)) {
    usage()
    throw new Error(`Missing required argument ${name}`)
  }
}

const input = readArg('--input')
const pngOut = readArg('--png')
const webpOut = readArg('--webp')
const width = Number.parseInt(readArg('--width'), 10)
const height = Number.parseInt(readArg('--height'), 10)
const key = readArg('--key', '#ff00ff')
const fuzz = Number.parseInt(readArg('--fuzz', '24'), 10)
const erode = Number.parseInt(readArg('--erode', '1'), 10)
const quality = Number.parseInt(readArg('--quality', '82'), 10)

for (const [name, value] of [
  ['--width', width],
  ['--height', height],
  ['--fuzz', fuzz],
  ['--erode', erode],
  ['--quality', quality],
]) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number`)
  }
}

const run = (command, commandArgs) => {
  const result = spawnSync(command, commandArgs, {
    encoding: 'utf8',
    stdio: 'pipe',
  })

  if (result.error) {
    throw new Error(`Failed to run ${command}: ${result.error.message}`)
  }

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n')
    throw new Error(`${command} failed:\n${output}`)
  }

  return result
}

const requireCommand = (command) => {
  const result = spawnSync('which', [command], { encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error(
      `${command} is required. Install it before preparing assets.`
    )
  }
}

requireCommand('magick')
requireCommand('cwebp')

const size = `${width}x${height}`
const magickArgs = [input, '-alpha', 'set']

if (key !== 'none') {
  magickArgs.push('-fuzz', `${fuzz}%`, '-transparent', key)
}

if (erode > 0) {
  magickArgs.push(
    '-channel',
    'A',
    '-morphology',
    'Erode',
    `Disk:${erode}`,
    '+channel'
  )
}

magickArgs.push(
  '-resize',
  size,
  '-background',
  'none',
  '-gravity',
  'center',
  '-extent',
  size,
  pngOut
)

run('magick', magickArgs)
run('cwebp', ['-q', String(quality), pngOut, '-o', webpOut])

const relativePng = path.relative(process.cwd(), pngOut)
const relativeWebp = path.relative(process.cwd(), webpOut)
console.log(`Prepared ${relativePng} and ${relativeWebp}`)
