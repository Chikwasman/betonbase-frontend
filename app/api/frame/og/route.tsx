// app/api/frame/og/route.tsx
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  // Generate SVG image (works everywhere, no font issues)
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#grad)"/>
      
      <text x="600" y="280" font-family="sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">
        ⚽ BetOnBase365
      </text>
      
      <text x="600" y="350" font-family="sans-serif" font-size="36" fill="white" fill-opacity="0.9" text-anchor="middle">
        P2P Sports Betting on Base
      </text>
      
      <text x="600" y="420" font-family="sans-serif" font-size="28" fill="white" fill-opacity="0.85" text-anchor="middle">
        🎯 Bet directly against other users
      </text>
      
      <text x="600" y="470" font-family="sans-serif" font-size="28" fill="white" fill-opacity="0.85" text-anchor="middle">
        💰 Zero house edge
      </text>
      
      <text x="600" y="520" font-family="sans-serif" font-size="28" fill="white" fill-opacity="0.85" text-anchor="middle">
        ⚡ Instant settlements
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}