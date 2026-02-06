import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zip BI Agent',
  description: 'Business intelligence analytics assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
