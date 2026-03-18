import { Client } from '@upstash/qstash'

if (!process.env.QSTASH_TOKEN) {
  throw new Error('Missing QSTASH_TOKEN environment variable')
}

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
})

export async function enqueueDelivery(payload: unknown, baseUrl: string) {
  await qstash.publishJSON({
    url: `${baseUrl}/api/qstash/deliver`,
    body: payload,
    retries: 3,
  })
}