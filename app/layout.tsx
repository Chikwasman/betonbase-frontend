import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ClientLayout } from '@/components/ClientLayout';

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
    url: 'https://www.betonbase365.xyz',
    siteName: 'BetOnBase365',
    title: 'BetOnBase365 - Decentralized P2P Betting',
    description: 'Peer-to-peer football betting on Base blockchain',
    images: [
      {
        url: '/images/logo.png',
        width: 512,
        height: 512,
        alt: 'BetOnBase365 Logo',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary',
    title: 'BetOnBase365 - Decentralized P2P Betting',
    description: 'Peer-to-peer football betting on Base blockchain',
    images: ['/images/logo.png'],
  },
  
  // PWA Manifest
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}