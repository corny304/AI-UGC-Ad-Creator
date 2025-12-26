import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AdSpark AI - UGC Ad Creator',
  description: 'Erstelle automatisch professionelle UGC-Videoanzeigen für TikTok, Reels und Shorts',
  keywords: ['UGC', 'Ad Creator', 'TikTok', 'Reels', 'Shorts', 'Video Ads', 'AI'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
