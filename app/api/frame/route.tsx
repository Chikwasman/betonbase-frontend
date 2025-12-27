// app/api/frame/route.tsx
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  // Return HTML with Frame meta tags
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://betonbase365.xyz/api/frame/og" />
        <meta property="fc:frame:button:1" content="View Matches 🔥" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content="https://betonbase365.xyz/api/frame/matches" />
        <meta property="fc:frame:button:2" content="Open App" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="https://betonbase365.xyz" />
        <meta property="fc:frame:post_url" content="https://betonbase365.xyz/api/frame" />
        <title>BetOnBase365 - Farcaster Frame</title>
      </head>
      <body>
        <h1>BetOnBase365</h1>
        <p>P2P Sports Betting on Base</p>
      </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { buttonIndex, fid } = body

    // Handle button clicks
    if (buttonIndex === 1) {
      // "View Matches" clicked - return matches frame
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="https://betonbase365.xyz/api/frame/og?view=matches" />
            <meta property="fc:frame:button:1" content="Create Bet" />
            <meta property="fc:frame:button:1:action" content="post" />
            <meta property="fc:frame:button:2" content="Next Match" />
            <meta property="fc:frame:button:2:action" content="post" />
            <meta property="fc:frame:button:3" content="Open App" />
            <meta property="fc:frame:button:3:action" content="link" />
            <meta property="fc:frame:button:3:target" content="https://betonbase365.xyz" />
            <meta property="fc:frame:post_url" content="https://betonbase365.xyz/api/frame/matches" />
          </head>
        </html>
      `
      
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      })
    }

    // Default response
    return NextResponse.json({ 
      message: 'Frame interaction received',
      buttonIndex,
      fid 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}