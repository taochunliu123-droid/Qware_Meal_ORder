import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '應用開發部點餐系統',
  description: '簡化團隊點餐流程',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
