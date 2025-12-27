// components/FarcasterProvider.tsx
'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    sdk?: {
      actions: {
        ready: () => void
        openUrl: (url: string) => void
      }
      context?: {
        user?: {
          fid: number
          username: string
        }
      }
    }
  }
}

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if running in Farcaster Mini App context
    if (typeof window !== 'undefined' && window.sdk) {
      // Signal that the app is ready
      window.sdk.actions.ready()
      console.log('Farcaster SDK: App ready')
    }
  }, [])

  return <>{children}</>
}