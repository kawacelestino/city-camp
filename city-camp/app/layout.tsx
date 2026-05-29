import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'City Camp — Pousada',
  description: 'Reserve seu quarto na Pousada City Camp com facilidade e segurança.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
