// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Handle Farcaster events
    console.log('Farcaster webhook event:', body)
    
    // You can handle:
    // - User opened app
    // - User shared app
    // - User installed app
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook received' 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid webhook' }, 
      { status: 400 }
    )
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'BetOnBase365 webhook endpoint',
    status: 'active'
  })
}