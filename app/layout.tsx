import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/lib/auth-context'
import { AppShell } from '@/components/app-shell'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'УМПСМ - Социальная сеть для музыкантов',
  description: 'Умная Мобильная Платформа Социальной сети для Музыкантов. Найди партнёров, создай группу, забронируй студию.',
  generator: 'v0.app',
  keywords: ['музыканты', 'социальная сеть', 'группы', 'джем', 'репетиции', 'студии'],
}

export const viewport: Viewport = {
  themeColor: '#4361EE',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
