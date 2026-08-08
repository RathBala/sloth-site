import assert from 'node:assert/strict'
import test from 'node:test'

import { verifyPublishedVersion } from './check-developer-cli-release.mjs'

test('retries registry propagation before accepting the published version', async () => {
  let attempts = 0
  const delays = []

  const publishedVersion = await verifyPublishedVersion({
    fetchVersion: () => {
      attempts += 1
      if (attempts < 3) {
        throw new Error('not propagated')
      }
      return '0.6.0'
    },
    version: '0.6.0',
    attempts: 3,
    retryDelayMs: 25,
    delay: async (milliseconds) => delays.push(milliseconds),
  })

  assert.equal(publishedVersion, '0.6.0')
  assert.equal(attempts, 3)
  assert.deepEqual(delays, [25, 25])
})

test('fails after the bounded number of attempts', async () => {
  let attempts = 0

  await assert.rejects(
    verifyPublishedVersion({
      fetchVersion: () => {
        attempts += 1
        throw new Error('not propagated')
      },
      version: '0.6.0',
      attempts: 2,
      retryDelayMs: 0,
      delay: async () => {},
    }),
    /Developer CLI docs require published package/
  )

  assert.equal(attempts, 2)
})
