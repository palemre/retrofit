// src/app/layout.tsx
import './globals.css'
import { Web3Provider } from '@/context/Web3Context'

export const metadata = {
  title: 'RetroFit - Green Investment Platform',
  description: 'Invest in sustainable building upgrades and earn returns',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}