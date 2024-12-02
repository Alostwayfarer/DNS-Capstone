import './globals.css'
import { Inter } from 'next/font/google'
import { NavBar } from '@/components/nav-bar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DNS Hosting',
  description: 'A simple DNS hosting platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // You'll need to get the userId from your auth context/session

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        {/* <NavBar userId={userId} /> */}
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
