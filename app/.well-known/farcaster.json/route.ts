// app/.well-known/farcaster.json/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    "version": "1",
    "name": "BetOnBase365",
    "iconUrl": "https://betonbase365.xyz/api/frame/og",
    "homeUrl": "https://betonbase365.xyz",
    "subtitle": "P2P Sports Betting on Base",
    "description": "Decentralized peer-to-peer football betting platform on Base blockchain. Bet directly against other users with zero house edge, instant settlements, and transparent smart contracts.",
    "primaryCategory": "games",
    "screenshotUrls": [
      "https://betonbase365.xyz/api/frame/og"
    ],
    "imageUrl": "https://betonbase365.xyz/api/frame/og",
    "heroImageUrl": "https://betonbase365.xyz/api/frame/og",
    "splashImageUrl": "https://betonbase365.xyz/api/frame/og",
    "splashBackgroundColor": "#0f0f1e",
    "tags": [
      "sports",
      "betting",
      "football",
      "soccer",
      "blockchain",
      "base",
      "p2p",
      "crypto",
      "web3",
      "defi"
    ],
    "tagline": "Bet on football matches. P2P. Zero house edge.",
    "buttonTitle": "Place Bet",
    "ogTitle": "BetOnBase365 - P2P Sports Betting",
    "ogDescription": "Bet directly against other users on football matches. Built on Base blockchain.",
    "ogImageUrl": "https://betonbase365.xyz/api/frame/og",
    "castShareUrl": "https://betonbase365.xyz",
    "webhookUrl": "https://betonbase365.xyz/api/webhook",
    "accountAssociation": {
      "header": "eyJmaWQiOjE4OTgwMjcsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg3NjFkQmI2NjBjNjZGNDg4RWMwRWYzREI1Nzg1Zjc2NTZEQzhjRjc2In0",
      "payload": "eyJkb21haW4iOiJiZXRvbmJhc2UzNjUueHl6In0",
      "signature": "Dm365RcbTGXRkHL1ASR2Aq0D/765m+njXQeWeKb6ehMuzXto9SkDXzMgQm6ogqYgjCGZ3LMsVyoaB+hNTTLEShw="
    }
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}