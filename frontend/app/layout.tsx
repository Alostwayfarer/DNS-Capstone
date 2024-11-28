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
  // This is a placeholder for user authentication status
  const isLoggedIn = true // You should replace this with actual authentication logic
  const userId = 'user-id' // Replace with actual user ID when authenticated

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        {isLoggedIn && <NavBar userId={userId} />}
        {children}
      </body>
    </html>
  )
}

