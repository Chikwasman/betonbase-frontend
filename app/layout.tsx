import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ClientLayout } from '@/components/ClientLayout';
import { FarcasterProvider } from '@/components/FarcasterProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BetOnBase365 - Decentralized P2P Betting',
  description: 'Peer-to-peer football betting on Base blockchain. Bet directly with other users, no house edge.',
  
  // Favicon configurations
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  // Open Graph for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://betonbase365.xyz',
    siteName: 'BetOnBase365',
    title: 'BetOnBase365 - Decentralized P2P Betting',
    description: 'Peer-to-peer football betting on Base blockchain',
    images: [
      {
        url: 'https://betonbase365.xyz/api/frame/og',
        width: 1200,
        height: 630,
        alt: 'BetOnBase365',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'BetOnBase365 - Decentralized P2P Betting',
    description: 'Peer-to-peer football betting on Base blockchain',
    images: ['https://betonbase365.xyz/api/frame/og'],
  },
  
  // ✅ Farcaster Frame metadata
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://betonbase365.xyz/api/frame/og',
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': 'View Matches 🔥',
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:2': 'Open App',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': 'https://betonbase365.xyz',
    'fc:frame:post_url': 'https://betonbase365.xyz/api/frame',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Farcaster SDK */}
        <script src="https://sdk.farcaster.xyz/v0.0.2/farcaster.js" defer></script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <FarcasterProvider>
          <Providers>
            <ClientLayout>
              {children}
            </ClientLayout>
          </Providers>
        </FarcasterProvider>
      </body>
    </html>
  );
}